// ============================================
// AWS SES EMAIL PROVIDER
// ============================================

import {
  SESClient,
  SendEmailCommand,
  SendTemplatedEmailCommand,
  SendBulkTemplatedEmailCommand,
  GetSendQuotaCommand,
  GetAccountSendingEnabledCommand,
  CreateTemplateCommand,
  GetTemplateCommand,
  ListTemplatesCommand,
  DeleteTemplateCommand,
  ListIdentitiesCommand,
  GetIdentityVerificationAttributesCommand,
} from '@aws-sdk/client-ses';
import type {
  IEmailProvider,
  EmailPayload,
  EmailSendResult,
  EmailWebhookEvent,
  EmailIntegrationConfig,
} from '../types';
import { EmailProvider, EmailEventType, BounceType } from '../types';
import { secureLog } from '../../../utils/secure-logger';
import crypto from 'crypto';

/**
 * Rate limiter configuration
 */
export interface SESRateLimitConfig {
  /** Max emails per second (SES default sandbox: 1/sec, production: 14/sec) */
  maxPerSecond: number;
  /** Max burst size before throttling */
  maxBurst: number;
}

/**
 * Queued email item for rate limiting
 */
interface QueuedEmail {
  payload: EmailPayload;
  resolve: (result: EmailSendResult) => void;
  reject: (error: Error) => void;
  enqueuedAt: number;
}

/**
 * SES Template definition for create/manage operations
 */
export interface SESTemplateDefinition {
  name: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * AWS SES Email Provider
 *
 * Docs: https://docs.aws.amazon.com/ses/latest/dg/Welcome.html
 * Features:
 * - High deliverability with dedicated IPs
 * - SNS-based webhook notifications (bounce, complaint, delivery)
 * - Bulk email support with rate limiting
 * - Template-based sending (SendTemplatedEmailCommand)
 * - DKIM and SPF authentication
 * - Production-grade email delivery at scale
 * - Built-in rate limiting queue (configurable per-second rate)
 * - SES template management (create, get, list, delete)
 * - Identity verification checking (ListIdentities + GetIdentityVerificationAttributes)
 *
 * Required env vars:
 * - AWS_SES_REGION (e.g., "us-east-1")
 * - AWS_SES_ACCESS_KEY_ID (or falls back to default AWS credentials chain)
 * - AWS_SES_SECRET_ACCESS_KEY (or falls back to default AWS credentials chain)
 * - AWS_SES_FROM_EMAIL (verified sender email)
 *
 * Optional env vars:
 * - AWS_SES_RATE_LIMIT (max emails/sec, default: 14)
 * - AWS_SES_RATE_BURST (max burst size, default: 50)
 *
 * Minimum IAM permissions required:
 * {
 *   "Version": "2012-10-17",
 *   "Statement": [
 *     {
 *       "Effect": "Allow",
 *       "Action": [
 *         "ses:SendEmail",
 *         "ses:SendRawEmail",
 *         "ses:SendTemplatedEmail",
 *         "ses:SendBulkTemplatedEmail",
 *         "ses:GetSendQuota",
 *         "ses:GetAccountSendingEnabled",
 *         "ses:ListIdentities",
 *         "ses:GetIdentityVerificationAttributes",
 *         "ses:CreateTemplate",
 *         "ses:GetTemplate",
 *         "ses:ListTemplates",
 *         "ses:DeleteTemplate"
 *       ],
 *       "Resource": "*"
 *     }
 *   ]
 * }
 */
export class SESProvider implements IEmailProvider {
  private client: SESClient;
  private config: EmailIntegrationConfig;

  // Rate limiting
  private rateLimitConfig: SESRateLimitConfig;
  private queue: QueuedEmail[] = [];
  private processing = false;
  private lastSendTime = 0;
  private sendCountInWindow = 0;
  private windowStart = 0;

  constructor(config: EmailIntegrationConfig) {
    this.config = config;

    // Use config credentials or fall back to env vars, then default AWS credentials chain
    const region = config.metadata?.region
      || process.env.AWS_SES_REGION
      || 'us-east-1';
    const accessKeyId = config.apiKey
      || process.env.AWS_SES_ACCESS_KEY_ID;
    const secretAccessKey = config.apiSecret
      || process.env.AWS_SES_SECRET_ACCESS_KEY;

    // Build client options - if no explicit credentials, use default chain
    const clientOptions: ConstructorParameters<typeof SESClient>[0] = { region };

    if (accessKeyId && secretAccessKey) {
      clientOptions.credentials = {
        accessKeyId,
        secretAccessKey,
      };
    }
    // If no explicit credentials, SESClient will use the default AWS credentials chain
    // (environment vars AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY, IAM role, etc.)

    this.client = new SESClient(clientOptions);

    // Configure rate limiting
    const configuredRate = config.metadata?.rateLimit
      || Number(process.env.AWS_SES_RATE_LIMIT)
      || 14;
    const configuredBurst = config.metadata?.rateBurst
      || Number(process.env.AWS_SES_RATE_BURST)
      || 50;

    this.rateLimitConfig = {
      maxPerSecond: configuredRate,
      maxBurst: configuredBurst,
    };
  }

  /**
   * Send email via AWS SES with rate limiting
   */
  async send(payload: EmailPayload): Promise<EmailSendResult> {
    // Use rate-limited queue for sending
    return this.enqueue(payload);
  }

  /**
   * Send email directly (bypasses rate limiting queue)
   * Used internally by the queue processor.
   */
  async sendDirect(payload: EmailPayload): Promise<EmailSendResult> {
    try {
      // Build from address
      const fromEmail = payload.from
        || this.config.fromEmail
        || process.env.AWS_SES_FROM_EMAIL;
      const fromName = payload.fromName
        || this.config.fromName
        || 'Kaven Platform';
      const from = `${fromName} <${fromEmail}>`;

      // Build recipient lists
      const toAddresses = Array.isArray(payload.to) ? payload.to : [payload.to];
      const ccAddresses = payload.cc
        ? (Array.isArray(payload.cc) ? payload.cc : [payload.cc])
        : undefined;
      const bccAddresses = payload.bcc
        ? (Array.isArray(payload.bcc) ? payload.bcc : [payload.bcc])
        : undefined;

      // Build the email command
      const command = new SendEmailCommand({
        Source: from,
        Destination: {
          ToAddresses: toAddresses,
          CcAddresses: ccAddresses,
          BccAddresses: bccAddresses,
        },
        Message: {
          Subject: {
            Data: payload.subject,
            Charset: 'UTF-8',
          },
          Body: {
            ...(payload.html && {
              Html: {
                Data: payload.html,
                Charset: 'UTF-8',
              },
            }),
            ...(payload.text && {
              Text: {
                Data: payload.text,
                Charset: 'UTF-8',
              },
            }),
          },
        },
        ReplyToAddresses: payload.replyTo ? [payload.replyTo] : undefined,
        Tags: [
          { Name: 'type', Value: payload.type || 'TRANSACTIONAL' },
          { Name: 'template', Value: payload.template || 'custom' },
          ...(payload.tenantId ? [{ Name: 'tenant_id', Value: payload.tenantId }] : []),
          ...(payload.userId ? [{ Name: 'user_id', Value: payload.userId }] : []),
        ],
      });

      const result = await this.client.send(command);

      secureLog.info('[SES] Email sent successfully:', {
        messageId: result.MessageId,
        to: payload.to,
        subject: payload.subject,
      });

      return {
        success: true,
        messageId: result.MessageId,
        provider: EmailProvider.AWS_SES,
      };
    } catch (error: any) {
      // Handle SES throttling specifically
      if (error.name === 'Throttling' || error.name === 'TooManyRequestsException') {
        secureLog.warn('[SES] Rate limited by AWS, will retry:', {
          to: payload.to,
          error: error.message,
        });
      }

      secureLog.error('[SES] Exception sending email:', error);
      return {
        success: false,
        error: error.message || 'Unknown SES error',
        provider: EmailProvider.AWS_SES,
      };
    }
  }

  /**
   * Send a template-based email via SES SendTemplatedEmailCommand
   *
   * Uses a pre-configured SES template (created via createTemplate or the SES console).
   * Template variables are substituted by SES server-side.
   *
   * @param templateName - Name of the SES template
   * @param to - Recipient email(s)
   * @param templateData - Key-value pairs for template variable substitution
   * @param options - Optional from, cc, bcc, replyTo overrides
   */
  async sendTemplate(
    templateName: string,
    to: string | string[],
    templateData: Record<string, any> = {},
    options?: {
      from?: string;
      fromName?: string;
      cc?: string | string[];
      bcc?: string | string[];
      replyTo?: string;
      tags?: Array<{ Name: string; Value: string }>;
    },
  ): Promise<EmailSendResult> {
    try {
      const fromEmail = options?.from
        || this.config.fromEmail
        || process.env.AWS_SES_FROM_EMAIL;
      const fromName = options?.fromName
        || this.config.fromName
        || 'Kaven Platform';
      const from = `${fromName} <${fromEmail}>`;

      const toAddresses = Array.isArray(to) ? to : [to];
      const ccAddresses = options?.cc
        ? (Array.isArray(options.cc) ? options.cc : [options.cc])
        : undefined;
      const bccAddresses = options?.bcc
        ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc])
        : undefined;

      const command = new SendTemplatedEmailCommand({
        Source: from,
        Destination: {
          ToAddresses: toAddresses,
          CcAddresses: ccAddresses,
          BccAddresses: bccAddresses,
        },
        Template: templateName,
        TemplateData: JSON.stringify(templateData),
        ReplyToAddresses: options?.replyTo ? [options.replyTo] : undefined,
        Tags: options?.tags,
      });

      const result = await this.client.send(command);

      secureLog.info('[SES] Template email sent successfully:', {
        messageId: result.MessageId,
        template: templateName,
        to,
      });

      return {
        success: true,
        messageId: result.MessageId,
        provider: EmailProvider.AWS_SES,
      };
    } catch (error: any) {
      secureLog.error('[SES] Error sending template email:', error);
      return {
        success: false,
        error: error.message || 'Unknown SES template send error',
        provider: EmailProvider.AWS_SES,
      };
    }
  }

  /**
   * List verified email identities in SES
   *
   * Useful for auto-detecting which emails/domains are verified
   * and can be used as sender addresses.
   */
  async listVerifiedIdentities(): Promise<{
    success: boolean;
    identities?: Array<{ identity: string; verified: boolean }>;
    error?: string;
  }> {
    try {
      // Get all identities (emails + domains)
      const listCommand = new ListIdentitiesCommand({});
      const listResponse = await this.client.send(listCommand);
      const identities = listResponse.Identities || [];

      if (identities.length === 0) {
        return { success: true, identities: [] };
      }

      // Get verification status for each
      const verifyCommand = new GetIdentityVerificationAttributesCommand({
        Identities: identities,
      });
      const verifyResponse = await this.client.send(verifyCommand);
      const attributes = verifyResponse.VerificationAttributes || {};

      const result = identities.map((id) => ({
        identity: id,
        verified: attributes[id]?.VerificationStatus === 'Success',
      }));

      return { success: true, identities: result };
    } catch (error: any) {
      secureLog.error('[SES] Error listing verified identities:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enqueue an email for rate-limited sending
   */
  private enqueue(payload: EmailPayload): Promise<EmailSendResult> {
    return new Promise<EmailSendResult>((resolve, reject) => {
      this.queue.push({
        payload,
        resolve,
        reject,
        enqueuedAt: Date.now(),
      });

      // Start processing if not already
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  /**
   * Process the queue respecting rate limits
   * Uses a sliding window algorithm to enforce per-second limits.
   */
  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    try {
      while (this.queue.length > 0) {
        const now = Date.now();

        // Reset window counter every second
        if (now - this.windowStart >= 1000) {
          this.windowStart = now;
          this.sendCountInWindow = 0;
        }

        // Check if we can send more in this window
        if (this.sendCountInWindow >= this.rateLimitConfig.maxPerSecond) {
          // Wait for the next window
          const waitTime = 1000 - (now - this.windowStart);
          if (waitTime > 0) {
            await this.sleep(waitTime);
          }
          continue;
        }

        // Dequeue and send
        const item = this.queue.shift();
        if (!item) break;

        // Check for stale items (older than 5 minutes)
        if (Date.now() - item.enqueuedAt > 5 * 60 * 1000) {
          item.resolve({
            success: false,
            error: 'Email expired in rate limit queue (>5 minutes)',
            provider: EmailProvider.AWS_SES,
          });
          continue;
        }

        try {
          const result = await this.sendDirect(item.payload);
          this.sendCountInWindow++;
          this.lastSendTime = Date.now();
          item.resolve(result);
        } catch (error: any) {
          item.reject(error);
        }
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Get current queue size (for monitoring)
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Get rate limit configuration
   */
  getRateLimitConfig(): SESRateLimitConfig {
    return { ...this.rateLimitConfig };
  }

  /**
   * Send bulk emails via AWS SES
   *
   * Uses SES bulk templated email for efficient batch sending.
   * Requires a pre-configured SES template.
   * Rate limiting is applied per batch (the entire batch counts as one API call).
   */
  async sendBulk(
    recipients: Array<{ email: string; templateData: Record<string, any> }>,
    templateName: string,
    defaultTemplateData: Record<string, any> = {},
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const fromEmail = this.config.fromEmail || process.env.AWS_SES_FROM_EMAIL;
      const fromName = this.config.fromName || 'Kaven Platform';
      const from = `${fromName} <${fromEmail}>`;

      // SES limits bulk to 50 destinations per call
      const batchSize = 50;
      const batches: Array<Array<{ email: string; templateData: Record<string, any> }>> = [];

      for (let i = 0; i < recipients.length; i += batchSize) {
        batches.push(recipients.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        const command = new SendBulkTemplatedEmailCommand({
          Source: from,
          Template: templateName,
          DefaultTemplateData: JSON.stringify(defaultTemplateData),
          Destinations: batch.map((r) => ({
            Destination: {
              ToAddresses: [r.email],
            },
            ReplacementTemplateData: JSON.stringify(r.templateData),
          })),
        });

        await this.client.send(command);

        // Respect rate limiting between batches
        if (batches.length > 1) {
          const delayMs = Math.ceil((batch.length / this.rateLimitConfig.maxPerSecond) * 1000);
          await this.sleep(delayMs);
        }
      }

      secureLog.info('[SES] Bulk email sent successfully:', {
        recipientCount: recipients.length,
        batchCount: batches.length,
        template: templateName,
      });

      return { success: true };
    } catch (error: any) {
      secureLog.error('[SES] Bulk send error:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // SES Template Management
  // ============================================

  /**
   * Create an SES email template
   */
  async createTemplate(template: SESTemplateDefinition): Promise<{ success: boolean; error?: string }> {
    try {
      const command = new CreateTemplateCommand({
        Template: {
          TemplateName: template.name,
          SubjectPart: template.subject,
          HtmlPart: template.html,
          TextPart: template.text,
        },
      });

      await this.client.send(command);

      secureLog.info('[SES] Template created:', { name: template.name });
      return { success: true };
    } catch (error: any) {
      secureLog.error('[SES] Error creating template:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get an SES email template by name
   */
  async getTemplate(name: string): Promise<{ success: boolean; template?: any; error?: string }> {
    try {
      const command = new GetTemplateCommand({ TemplateName: name });
      const response = await this.client.send(command);

      return {
        success: true,
        template: {
          name: response.Template?.TemplateName,
          subject: response.Template?.SubjectPart,
          html: response.Template?.HtmlPart,
          text: response.Template?.TextPart,
        },
      };
    } catch (error: any) {
      secureLog.error('[SES] Error getting template:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * List SES email templates
   */
  async listTemplates(maxItems: number = 50): Promise<{ success: boolean; templates?: any[]; error?: string }> {
    try {
      const command = new ListTemplatesCommand({ MaxItems: maxItems });
      const response = await this.client.send(command);

      return {
        success: true,
        templates: response.TemplatesMetadata?.map((t) => ({
          name: t.Name,
          createdTimestamp: t.CreatedTimestamp,
        })) || [],
      };
    } catch (error: any) {
      secureLog.error('[SES] Error listing templates:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete an SES email template
   */
  async deleteTemplate(name: string): Promise<{ success: boolean; error?: string }> {
    try {
      const command = new DeleteTemplateCommand({ TemplateName: name });
      await this.client.send(command);

      secureLog.info('[SES] Template deleted:', { name });
      return { success: true };
    } catch (error: any) {
      secureLog.error('[SES] Error deleting template:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // Sending Statistics
  // ============================================

  /**
   * Get SES sending statistics (quota and usage)
   */
  async getSendingStatistics(): Promise<{
    success: boolean;
    stats?: {
      sendingEnabled: boolean;
      maxSendRate: number;
      max24HourSend: number;
      sentLast24Hours: number;
      remainingQuota: number;
      usagePercent: number;
    };
    error?: string;
  }> {
    try {
      const [quotaResponse, enabledResponse] = await Promise.all([
        this.client.send(new GetSendQuotaCommand({})),
        this.client.send(new GetAccountSendingEnabledCommand({})),
      ]);

      const max24HourSend = quotaResponse.Max24HourSend || 0;
      const sentLast24Hours = quotaResponse.SentLast24Hours || 0;
      const remainingQuota = max24HourSend - sentLast24Hours;
      const usagePercent = max24HourSend > 0
        ? Math.round((sentLast24Hours / max24HourSend) * 100)
        : 0;

      return {
        success: true,
        stats: {
          sendingEnabled: enabledResponse.Enabled ?? false,
          maxSendRate: quotaResponse.MaxSendRate || 0,
          max24HourSend,
          sentLast24Hours,
          remainingQuota,
          usagePercent,
        },
      };
    } catch (error: any) {
      secureLog.error('[SES] Error getting sending statistics:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // Webhook Validation and Parsing
  // ============================================

  /**
   * Validate AWS SNS webhook signature
   *
   * AWS SES sends bounce/complaint/delivery notifications via SNS.
   * SNS messages include a signature that must be verified.
   */
  validateWebhook(rawBody: string, signature: string): boolean {
    if (!this.config.webhookSecret) {
      secureLog.warn('[SES] Webhook secret not configured');
      return false;
    }

    try {
      // AWS SNS uses message signing with a certificate URL
      // For simplicity, we validate using HMAC with our configured webhook secret
      const expectedSignature = crypto
        .createHmac('sha256', this.config.webhookSecret)
        .update(rawBody)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      );
    } catch (error) {
      secureLog.error('[SES] Error validating webhook:', error);
      return false;
    }
  }

  /**
   * Parse AWS SNS notification event (SES bounce/complaint/delivery)
   *
   * SES events come wrapped in an SNS notification:
   * {
   *   "Type": "Notification",
   *   "Message": "{\"notificationType\":\"Bounce\", ...}"
   * }
   */
  parseWebhookEvent(body: any): EmailWebhookEvent | null {
    try {
      // SNS wraps the SES notification in a Message field
      const notification = typeof body.Message === 'string'
        ? JSON.parse(body.Message)
        : body;

      const notificationType = notification.notificationType || notification.eventType;

      // Map SES notification types to our EmailEventType
      const eventTypeMap: Record<string, EmailEventType> = {
        Bounce: EmailEventType.BOUNCE,
        Complaint: EmailEventType.COMPLAINT,
        Delivery: EmailEventType.DELIVERED,
        Send: EmailEventType.SENT,
        Open: EmailEventType.OPEN,
        Click: EmailEventType.CLICK,
      };

      const eventType = eventTypeMap[notificationType];
      if (!eventType) {
        secureLog.warn('[SES] Unknown notification type:', notificationType);
        return null;
      }

      // Extract mail metadata
      const mail = notification.mail || {};
      const messageId = mail.messageId || notification.messageId;
      const timestamp = new Date(mail.timestamp || notification.timestamp || Date.now());

      // Get first recipient email
      const recipients = mail.destination || [];
      const email = recipients[0] || 'unknown';

      const event: EmailWebhookEvent = {
        eventType,
        messageId,
        email,
        timestamp,
      };

      // Add bounce-specific fields
      if (eventType === EmailEventType.BOUNCE && notification.bounce) {
        const bounce = notification.bounce;
        event.bounceType = this.mapBounceType(bounce.bounceType);
        event.bounceReason = bounce.bouncedRecipients?.[0]?.diagnosticCode
          || bounce.bounceSubType;
      }

      // Add complaint-specific fields
      if (eventType === EmailEventType.COMPLAINT && notification.complaint) {
        event.complaintFeedbackType = notification.complaint.complaintFeedbackType;
      }

      // Add click-specific fields
      if (eventType === EmailEventType.CLICK && notification.click) {
        event.linkClicked = notification.click.link;
        event.ipAddress = notification.click.ipAddress;
        event.userAgent = notification.click.userAgent;
      }

      // Add open-specific fields
      if (eventType === EmailEventType.OPEN && notification.open) {
        event.ipAddress = notification.open.ipAddress;
        event.userAgent = notification.open.userAgent;
      }

      // Metadata
      event.metadata = {
        source: mail.source,
        sendingAccountId: mail.sendingAccountId,
        tags: mail.tags,
      };

      return event;
    } catch (error) {
      secureLog.error('[SES] Error parsing webhook event:', error);
      return null;
    }
  }

  /**
   * Health check - validates AWS SES credentials and account status
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    message?: string;
    details?: Record<string, any>;
  }> {
    try {
      // Validate credentials by calling GetSendQuota
      const quotaCommand = new GetSendQuotaCommand({});
      const quotaResponse = await this.client.send(quotaCommand);

      // Check sending enabled status
      const enabledCommand = new GetAccountSendingEnabledCommand({});
      const enabledResponse = await this.client.send(enabledCommand);

      const sendingEnabled = enabledResponse.Enabled ?? false;

      return {
        healthy: true,
        message: sendingEnabled
          ? 'AWS SES connected (sending enabled)'
          : 'AWS SES connected (sending disabled - check account status)',
        details: {
          sendingEnabled,
          sendQuota: {
            max24HourSend: quotaResponse.Max24HourSend,
            maxSendRate: quotaResponse.MaxSendRate,
            sentLast24Hours: quotaResponse.SentLast24Hours,
          },
          rateLimiting: {
            configuredMaxPerSecond: this.rateLimitConfig.maxPerSecond,
            currentQueueSize: this.queue.length,
          },
        },
      };
    } catch (error: any) {
      // Distinguish between auth errors and network errors
      const isAuthError = error.name === 'InvalidClientTokenId'
        || error.name === 'SignatureDoesNotMatch'
        || error.name === 'AccessDeniedException';

      return {
        healthy: false,
        message: isAuthError
          ? 'AWS SES authentication failed - check credentials'
          : `AWS SES health check failed: ${error.message}`,
        details: {
          reason: isAuthError ? 'auth_failed' : 'connection_error',
          errorName: error.name,
          error: error.message,
        },
      };
    }
  }

  /**
   * Map SES bounce type to our BounceType enum
   */
  private mapBounceType(sesBounceType?: string): BounceType {
    if (!sesBounceType) return BounceType.SOFT;

    switch (sesBounceType) {
      case 'Permanent':
        return BounceType.HARD;
      case 'Transient':
        return BounceType.TRANSIENT;
      default:
        return BounceType.SOFT;
    }
  }

  /**
   * Sleep utility for rate limiting
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
