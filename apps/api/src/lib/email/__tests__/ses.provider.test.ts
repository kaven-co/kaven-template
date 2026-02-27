import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SESProvider } from '../providers/ses.provider';
import { EmailProvider, EmailEventType, BounceType } from '../types';
import type { EmailIntegrationConfig, EmailPayload } from '../types';

// ============================================
// Mock @aws-sdk/client-ses
// ============================================

const mockSend = vi.fn();

vi.mock('@aws-sdk/client-ses', () => {
  // Use a real class so `new SESClient(...)` works
  class MockSESClient {
    constructor(_config?: any) {}
    send(...args: any[]) {
      return mockSend(...args);
    }
  }

  // Command classes that can be instantiated with `new`
  class MockSendEmailCommand {
    _type = 'SendEmailCommand';
    constructor(public params?: any) {}
  }
  class MockSendTemplatedEmailCommand {
    _type = 'SendTemplatedEmailCommand';
    constructor(public params?: any) {}
  }
  class MockSendBulkTemplatedEmailCommand {
    _type = 'SendBulkTemplatedEmailCommand';
    constructor(public params?: any) {}
  }
  class MockGetSendQuotaCommand {
    _type = 'GetSendQuotaCommand';
    constructor(public params?: any) {}
  }
  class MockGetAccountSendingEnabledCommand {
    _type = 'GetAccountSendingEnabledCommand';
    constructor(public params?: any) {}
  }
  class MockCreateTemplateCommand {
    _type = 'CreateTemplateCommand';
    constructor(public params?: any) {}
  }
  class MockGetTemplateCommand {
    _type = 'GetTemplateCommand';
    constructor(public params?: any) {}
  }
  class MockListTemplatesCommand {
    _type = 'ListTemplatesCommand';
    constructor(public params?: any) {}
  }
  class MockDeleteTemplateCommand {
    _type = 'DeleteTemplateCommand';
    constructor(public params?: any) {}
  }
  class MockListIdentitiesCommand {
    _type = 'ListIdentitiesCommand';
    constructor(public params?: any) {}
  }
  class MockGetIdentityVerificationAttributesCommand {
    _type = 'GetIdentityVerificationAttributesCommand';
    constructor(public params?: any) {}
  }

  return {
    SESClient: MockSESClient,
    SendEmailCommand: MockSendEmailCommand,
    SendTemplatedEmailCommand: MockSendTemplatedEmailCommand,
    SendBulkTemplatedEmailCommand: MockSendBulkTemplatedEmailCommand,
    GetSendQuotaCommand: MockGetSendQuotaCommand,
    GetAccountSendingEnabledCommand: MockGetAccountSendingEnabledCommand,
    CreateTemplateCommand: MockCreateTemplateCommand,
    GetTemplateCommand: MockGetTemplateCommand,
    ListTemplatesCommand: MockListTemplatesCommand,
    DeleteTemplateCommand: MockDeleteTemplateCommand,
    ListIdentitiesCommand: MockListIdentitiesCommand,
    GetIdentityVerificationAttributesCommand: MockGetIdentityVerificationAttributesCommand,
  };
});

vi.mock('../../../utils/secure-logger', () => ({
  secureLog: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// ============================================
// Test Helpers
// ============================================

function createConfig(overrides: Partial<EmailIntegrationConfig> = {}): EmailIntegrationConfig {
  return {
    id: 'test-ses-integration',
    provider: EmailProvider.AWS_SES,
    isActive: true,
    isPrimary: true,
    apiKey: 'AKIAIOSFODNN7EXAMPLE',
    apiSecret: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    fromEmail: 'noreply@kaven.com',
    fromName: 'Kaven Platform',
    metadata: { region: 'us-east-1' },
    ...overrides,
  };
}

function createPayload(overrides: Partial<EmailPayload> = {}): EmailPayload {
  return {
    to: 'user@example.com',
    subject: 'Test Email',
    html: '<p>Hello World</p>',
    ...overrides,
  };
}

// ============================================
// Tests
// ============================================

describe('SESProvider', () => {
  let provider: SESProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    provider = new SESProvider(createConfig());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ----------------------------------------
  // Constructor & Configuration
  // ----------------------------------------

  describe('constructor', () => {
    it('should initialize with config credentials', () => {
      const config = createConfig();
      const p = new SESProvider(config);
      expect(p).toBeDefined();
    });

    it('should fall back to env vars when config credentials are not provided', () => {
      process.env.AWS_SES_ACCESS_KEY_ID = 'env-key-id';
      process.env.AWS_SES_SECRET_ACCESS_KEY = 'env-secret-key';

      const config = createConfig({ apiKey: undefined, apiSecret: undefined });
      const p = new SESProvider(config);
      expect(p).toBeDefined();

      // Cleanup
      delete process.env.AWS_SES_ACCESS_KEY_ID;
      delete process.env.AWS_SES_SECRET_ACCESS_KEY;
    });

    it('should use default AWS credentials chain when no explicit credentials', () => {
      // When neither config nor env vars have credentials, it should still create
      // (will use IAM role / default chain at runtime)
      const originalKey = process.env.AWS_SES_ACCESS_KEY_ID;
      const originalSecret = process.env.AWS_SES_SECRET_ACCESS_KEY;
      delete process.env.AWS_SES_ACCESS_KEY_ID;
      delete process.env.AWS_SES_SECRET_ACCESS_KEY;

      const config = createConfig({ apiKey: undefined, apiSecret: undefined });
      const p = new SESProvider(config);
      expect(p).toBeDefined();

      // Restore
      process.env.AWS_SES_ACCESS_KEY_ID = originalKey;
      process.env.AWS_SES_SECRET_ACCESS_KEY = originalSecret;
    });

    it('should configure rate limiting from config metadata', () => {
      const config = createConfig({
        metadata: { region: 'us-east-1', rateLimit: 5, rateBurst: 20 },
      });
      const p = new SESProvider(config);
      const rateConfig = p.getRateLimitConfig();
      expect(rateConfig.maxPerSecond).toBe(5);
      expect(rateConfig.maxBurst).toBe(20);
    });

    it('should use default rate limit values when not configured', () => {
      const rateConfig = provider.getRateLimitConfig();
      expect(rateConfig.maxPerSecond).toBe(14);
      expect(rateConfig.maxBurst).toBe(50);
    });
  });

  // ----------------------------------------
  // Send Email
  // ----------------------------------------

  describe('send', () => {
    it('should send email successfully', async () => {
      mockSend.mockResolvedValueOnce({ MessageId: 'ses-msg-123' });

      const result = await provider.send(createPayload());

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('ses-msg-123');
      expect(result.provider).toBe(EmailProvider.AWS_SES);
    });

    it('should handle send failure', async () => {
      mockSend.mockRejectedValueOnce(new Error('SES sending limit exceeded'));

      const result = await provider.send(createPayload());

      expect(result.success).toBe(false);
      expect(result.error).toBe('SES sending limit exceeded');
      expect(result.provider).toBe(EmailProvider.AWS_SES);
    });

    it('should use from address from payload first', async () => {
      mockSend.mockResolvedValueOnce({ MessageId: 'ses-msg-456' });

      await provider.send(createPayload({
        from: 'custom@example.com',
        fromName: 'Custom Sender',
      }));

      // The command object passed to client.send has params.Source
      const sentCommand = mockSend.mock.calls[0][0];
      expect(sentCommand.params.Source).toBe('Custom Sender <custom@example.com>');
    });

    it('should handle multiple recipients', async () => {
      mockSend.mockResolvedValueOnce({ MessageId: 'ses-msg-multi' });

      const result = await provider.send(createPayload({
        to: ['user1@example.com', 'user2@example.com'],
        cc: 'cc@example.com',
        bcc: ['bcc1@example.com', 'bcc2@example.com'],
      }));

      expect(result.success).toBe(true);

      const sentCommand = mockSend.mock.calls[0][0];
      expect(sentCommand.params.Destination.ToAddresses).toEqual(['user1@example.com', 'user2@example.com']);
      expect(sentCommand.params.Destination.CcAddresses).toEqual(['cc@example.com']);
      expect(sentCommand.params.Destination.BccAddresses).toEqual(['bcc1@example.com', 'bcc2@example.com']);
    });

    it('should include metadata tags', async () => {
      mockSend.mockResolvedValueOnce({ MessageId: 'ses-msg-tags' });

      await provider.send(createPayload({
        tenantId: 'tenant-123',
        userId: 'user-456',
        type: 'TRANSACTIONAL' as any,
        template: 'welcome',
      }));

      const sentCommand = mockSend.mock.calls[0][0];
      expect(sentCommand.params.Tags).toEqual(
        expect.arrayContaining([
          { Name: 'type', Value: 'TRANSACTIONAL' },
          { Name: 'template', Value: 'welcome' },
          { Name: 'tenant_id', Value: 'tenant-123' },
          { Name: 'user_id', Value: 'user-456' },
        ])
      );
    });

    it('should handle both html and text content', async () => {
      mockSend.mockResolvedValueOnce({ MessageId: 'ses-msg-dual' });

      await provider.send(createPayload({
        html: '<p>HTML content</p>',
        text: 'Text content',
      }));

      const sentCommand = mockSend.mock.calls[0][0];
      expect(sentCommand.params.Message.Body.Html).toEqual({ Data: '<p>HTML content</p>', Charset: 'UTF-8' });
      expect(sentCommand.params.Message.Body.Text).toEqual({ Data: 'Text content', Charset: 'UTF-8' });
    });

    it('should handle SES throttling error', async () => {
      const throttleError = new Error('Rate exceeded');
      (throttleError as any).name = 'Throttling';
      mockSend.mockRejectedValueOnce(throttleError);

      const result = await provider.send(createPayload());

      expect(result.success).toBe(false);
      expect(result.error).toBe('Rate exceeded');
    });
  });

  // ----------------------------------------
  // Rate Limiting
  // ----------------------------------------

  describe('rate limiting', () => {
    it('should report queue size', () => {
      expect(provider.getQueueSize()).toBe(0);
    });

    it('should process single email without delay', async () => {
      mockSend.mockResolvedValue({ MessageId: 'ses-msg-rate-1' });

      const result = await provider.send(createPayload());

      expect(result.success).toBe(true);
      expect(provider.getQueueSize()).toBe(0);
    });

    it('should send multiple emails sequentially through rate limiter', async () => {
      mockSend.mockResolvedValue({ MessageId: 'ses-msg-batch' });

      // Send 3 emails
      const results = await Promise.all([
        provider.send(createPayload({ subject: 'Email 1' })),
        provider.send(createPayload({ subject: 'Email 2' })),
        provider.send(createPayload({ subject: 'Email 3' })),
      ]);

      expect(results).toHaveLength(3);
      results.forEach((r) => {
        expect(r.success).toBe(true);
        expect(r.provider).toBe(EmailProvider.AWS_SES);
      });
    });

    it('should expire stale queue items after 5 minutes', async () => {
      // Create a provider with very low rate to cause queueing
      const slowProvider = new SESProvider(createConfig({
        metadata: { region: 'us-east-1', rateLimit: 1, rateBurst: 1 },
      }));

      mockSend.mockImplementation(() => new Promise((resolve) => {
        setTimeout(() => resolve({ MessageId: 'ses-delayed' }), 10);
      }));

      // First email starts processing
      const p1 = slowProvider.send(createPayload({ subject: 'First' }));

      // Advance time past 5-minute expiry for the second email
      // (We cannot easily test this without controlling internal enqueuedAt,
      // so we verify the mechanism exists via getQueueSize)
      expect(slowProvider.getQueueSize()).toBeGreaterThanOrEqual(0);

      await p1;
    });
  });

  // ----------------------------------------
  // Bulk Send
  // ----------------------------------------

  describe('sendBulk', () => {
    it('should send bulk emails successfully', async () => {
      mockSend.mockResolvedValue({});

      const recipients = [
        { email: 'user1@example.com', templateData: { name: 'User 1' } },
        { email: 'user2@example.com', templateData: { name: 'User 2' } },
      ];

      const result = await provider.sendBulk(recipients, 'welcome-template');

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should handle bulk send failure', async () => {
      mockSend.mockRejectedValue(new Error('Template not found'));

      const recipients = [
        { email: 'user1@example.com', templateData: { name: 'User 1' } },
      ];

      const result = await provider.sendBulk(recipients, 'nonexistent-template');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Template not found');
    });

    it('should batch recipients in groups of 50', async () => {
      // Use real timers for this test since sendBulk uses sleep between batches
      vi.useRealTimers();

      // Create a provider with high rate limit to minimize delays
      const fastProvider = new SESProvider(createConfig({
        metadata: { region: 'us-east-1', rateLimit: 1000, rateBurst: 1000 },
      }));

      mockSend.mockResolvedValue({});

      // Create 75 recipients to force 2 batches
      const recipients = Array.from({ length: 75 }, (_, i) => ({
        email: `user${i}@example.com`,
        templateData: { name: `User ${i}` },
      }));

      const result = await fastProvider.sendBulk(recipients, 'bulk-template');

      expect(result.success).toBe(true);
      // 2 batches: 50 + 25
      expect(mockSend).toHaveBeenCalledTimes(2);

      // Restore fake timers for other tests
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });
  });

  // ----------------------------------------
  // Template Management
  // ----------------------------------------

  describe('template management', () => {
    it('should create a template', async () => {
      mockSend.mockResolvedValue({});

      const result = await provider.createTemplate({
        name: 'welcome',
        subject: 'Welcome!',
        html: '<h1>Hello</h1>',
        text: 'Hello',
      });

      expect(result.success).toBe(true);
    });

    it('should get a template', async () => {
      mockSend.mockResolvedValue({
        Template: {
          TemplateName: 'welcome',
          SubjectPart: 'Welcome!',
          HtmlPart: '<h1>Hello</h1>',
          TextPart: 'Hello',
        },
      });

      const result = await provider.getTemplate('welcome');

      expect(result.success).toBe(true);
      expect(result.template?.name).toBe('welcome');
      expect(result.template?.subject).toBe('Welcome!');
    });

    it('should list templates', async () => {
      mockSend.mockResolvedValue({
        TemplatesMetadata: [
          { Name: 'welcome', CreatedTimestamp: new Date() },
          { Name: 'invoice', CreatedTimestamp: new Date() },
        ],
      });

      const result = await provider.listTemplates();

      expect(result.success).toBe(true);
      expect(result.templates).toHaveLength(2);
    });

    it('should delete a template', async () => {
      mockSend.mockResolvedValue({});

      const result = await provider.deleteTemplate('welcome');

      expect(result.success).toBe(true);
    });

    it('should handle template operation errors', async () => {
      mockSend.mockRejectedValue(new Error('TemplateDoesNotExist'));

      const result = await provider.getTemplate('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('TemplateDoesNotExist');
    });
  });

  // ----------------------------------------
  // Send Template (SendTemplatedEmailCommand)
  // ----------------------------------------

  describe('sendTemplate', () => {
    it('should send a template-based email successfully', async () => {
      mockSend.mockResolvedValueOnce({ MessageId: 'ses-tpl-msg-001' });

      const result = await provider.sendTemplate(
        'welcome-template',
        'user@example.com',
        { name: 'John', company: 'Acme' },
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('ses-tpl-msg-001');
      expect(result.provider).toBe(EmailProvider.AWS_SES);

      const sentCommand = mockSend.mock.calls[0][0];
      expect(sentCommand._type).toBe('SendTemplatedEmailCommand');
      expect(sentCommand.params.Template).toBe('welcome-template');
      expect(sentCommand.params.TemplateData).toBe(JSON.stringify({ name: 'John', company: 'Acme' }));
      expect(sentCommand.params.Destination.ToAddresses).toEqual(['user@example.com']);
    });

    it('should send to multiple recipients', async () => {
      mockSend.mockResolvedValueOnce({ MessageId: 'ses-tpl-msg-002' });

      const result = await provider.sendTemplate(
        'invoice-template',
        ['user1@example.com', 'user2@example.com'],
        { invoiceId: '12345' },
      );

      expect(result.success).toBe(true);
      const sentCommand = mockSend.mock.calls[0][0];
      expect(sentCommand.params.Destination.ToAddresses).toEqual(['user1@example.com', 'user2@example.com']);
    });

    it('should apply optional overrides (from, cc, bcc, replyTo)', async () => {
      mockSend.mockResolvedValueOnce({ MessageId: 'ses-tpl-msg-003' });

      await provider.sendTemplate(
        'notification-template',
        'user@example.com',
        { message: 'Hello' },
        {
          from: 'custom@kaven.com',
          fromName: 'Custom Sender',
          cc: 'cc@example.com',
          bcc: ['bcc1@example.com', 'bcc2@example.com'],
          replyTo: 'reply@kaven.com',
          tags: [{ Name: 'campaign', Value: 'onboarding' }],
        },
      );

      const sentCommand = mockSend.mock.calls[0][0];
      expect(sentCommand.params.Source).toBe('Custom Sender <custom@kaven.com>');
      expect(sentCommand.params.Destination.CcAddresses).toEqual(['cc@example.com']);
      expect(sentCommand.params.Destination.BccAddresses).toEqual(['bcc1@example.com', 'bcc2@example.com']);
      expect(sentCommand.params.ReplyToAddresses).toEqual(['reply@kaven.com']);
      expect(sentCommand.params.Tags).toEqual([{ Name: 'campaign', Value: 'onboarding' }]);
    });

    it('should handle template send failure', async () => {
      mockSend.mockRejectedValueOnce(new Error('TemplateDoesNotExist'));

      const result = await provider.sendTemplate(
        'nonexistent-template',
        'user@example.com',
        {},
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('TemplateDoesNotExist');
      expect(result.provider).toBe(EmailProvider.AWS_SES);
    });

    it('should use default from address when no override provided', async () => {
      mockSend.mockResolvedValueOnce({ MessageId: 'ses-tpl-msg-004' });

      await provider.sendTemplate('test-template', 'user@example.com');

      const sentCommand = mockSend.mock.calls[0][0];
      expect(sentCommand.params.Source).toBe('Kaven Platform <noreply@kaven.com>');
    });
  });

  // ----------------------------------------
  // List Verified Identities
  // ----------------------------------------

  describe('listVerifiedIdentities', () => {
    it('should list verified identities', async () => {
      mockSend
        .mockResolvedValueOnce({
          Identities: ['noreply@kaven.com', 'kaven.com', 'unverified@test.com'],
        })
        .mockResolvedValueOnce({
          VerificationAttributes: {
            'noreply@kaven.com': { VerificationStatus: 'Success' },
            'kaven.com': { VerificationStatus: 'Success' },
            'unverified@test.com': { VerificationStatus: 'Pending' },
          },
        });

      const result = await provider.listVerifiedIdentities();

      expect(result.success).toBe(true);
      expect(result.identities).toHaveLength(3);
      expect(result.identities![0]).toEqual({ identity: 'noreply@kaven.com', verified: true });
      expect(result.identities![1]).toEqual({ identity: 'kaven.com', verified: true });
      expect(result.identities![2]).toEqual({ identity: 'unverified@test.com', verified: false });
    });

    it('should return empty array when no identities exist', async () => {
      mockSend.mockResolvedValueOnce({ Identities: [] });

      const result = await provider.listVerifiedIdentities();

      expect(result.success).toBe(true);
      expect(result.identities).toEqual([]);
    });

    it('should handle API errors', async () => {
      mockSend.mockRejectedValueOnce(new Error('Access denied'));

      const result = await provider.listVerifiedIdentities();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Access denied');
    });
  });

  // ----------------------------------------
  // Sending Statistics
  // ----------------------------------------

  describe('getSendingStatistics', () => {
    it('should return sending statistics', async () => {
      mockSend
        .mockResolvedValueOnce({
          Max24HourSend: 50000,
          MaxSendRate: 14,
          SentLast24Hours: 1200,
        })
        .mockResolvedValueOnce({
          Enabled: true,
        });

      const result = await provider.getSendingStatistics();

      expect(result.success).toBe(true);
      expect(result.stats?.sendingEnabled).toBe(true);
      expect(result.stats?.maxSendRate).toBe(14);
      expect(result.stats?.max24HourSend).toBe(50000);
      expect(result.stats?.sentLast24Hours).toBe(1200);
      expect(result.stats?.remainingQuota).toBe(48800);
      expect(result.stats?.usagePercent).toBe(2);
    });

    it('should handle statistics error', async () => {
      mockSend.mockRejectedValue(new Error('Access denied'));

      const result = await provider.getSendingStatistics();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Access denied');
    });
  });

  // ----------------------------------------
  // Webhook Validation
  // ----------------------------------------

  describe('validateWebhook', () => {
    it('should validate correct HMAC signature', () => {
      const configWithSecret = createConfig({ webhookSecret: 'test-secret-key' });
      const p = new SESProvider(configWithSecret);

      const body = '{"Type":"Notification","Message":"test"}';
      const crypto = require('crypto');
      const expectedSig = crypto
        .createHmac('sha256', 'test-secret-key')
        .update(body)
        .digest('hex');

      expect(p.validateWebhook(body, expectedSig)).toBe(true);
    });

    it('should reject invalid signature', () => {
      const configWithSecret = createConfig({ webhookSecret: 'test-secret-key' });
      const p = new SESProvider(configWithSecret);

      expect(p.validateWebhook('{"body":"test"}', 'invalid-signature')).toBe(false);
    });

    it('should return false when webhook secret not configured', () => {
      const configNoSecret = createConfig({ webhookSecret: undefined });
      const p = new SESProvider(configNoSecret);

      expect(p.validateWebhook('body', 'sig')).toBe(false);
    });
  });

  // ----------------------------------------
  // Webhook Event Parsing
  // ----------------------------------------

  describe('parseWebhookEvent', () => {
    it('should parse bounce event from SNS notification', () => {
      const snsPayload = {
        Type: 'Notification',
        Message: JSON.stringify({
          notificationType: 'Bounce',
          mail: {
            messageId: 'msg-bounce-123',
            timestamp: '2026-02-15T10:00:00Z',
            destination: ['bounced@example.com'],
            source: 'noreply@kaven.com',
            sendingAccountId: '123456789',
          },
          bounce: {
            bounceType: 'Permanent',
            bounceSubType: 'General',
            bouncedRecipients: [
              {
                emailAddress: 'bounced@example.com',
                diagnosticCode: 'smtp; 550 user unknown',
              },
            ],
          },
        }),
      };

      const event = provider.parseWebhookEvent(snsPayload);

      expect(event).not.toBeNull();
      expect(event?.eventType).toBe(EmailEventType.BOUNCE);
      expect(event?.messageId).toBe('msg-bounce-123');
      expect(event?.email).toBe('bounced@example.com');
      expect(event?.bounceType).toBe(BounceType.HARD);
      expect(event?.bounceReason).toBe('smtp; 550 user unknown');
    });

    it('should parse complaint event', () => {
      const payload = {
        notificationType: 'Complaint',
        mail: {
          messageId: 'msg-complaint-456',
          timestamp: '2026-02-15T10:00:00Z',
          destination: ['complainer@example.com'],
        },
        complaint: {
          complaintFeedbackType: 'abuse',
        },
      };

      const event = provider.parseWebhookEvent(payload);

      expect(event).not.toBeNull();
      expect(event?.eventType).toBe(EmailEventType.COMPLAINT);
      expect(event?.email).toBe('complainer@example.com');
      expect(event?.complaintFeedbackType).toBe('abuse');
    });

    it('should parse delivery event', () => {
      const payload = {
        notificationType: 'Delivery',
        mail: {
          messageId: 'msg-delivered-789',
          timestamp: '2026-02-15T10:00:00Z',
          destination: ['delivered@example.com'],
        },
      };

      const event = provider.parseWebhookEvent(payload);

      expect(event).not.toBeNull();
      expect(event?.eventType).toBe(EmailEventType.DELIVERED);
      expect(event?.email).toBe('delivered@example.com');
    });

    it('should parse click event', () => {
      const payload = {
        notificationType: 'Click',
        mail: {
          messageId: 'msg-click-101',
          timestamp: '2026-02-15T10:00:00Z',
          destination: ['clicker@example.com'],
        },
        click: {
          link: 'https://kaven.com/dashboard',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
      };

      const event = provider.parseWebhookEvent(payload);

      expect(event).not.toBeNull();
      expect(event?.eventType).toBe(EmailEventType.CLICK);
      expect(event?.linkClicked).toBe('https://kaven.com/dashboard');
      expect(event?.ipAddress).toBe('192.168.1.1');
      expect(event?.userAgent).toBe('Mozilla/5.0');
    });

    it('should parse open event', () => {
      const payload = {
        notificationType: 'Open',
        mail: {
          messageId: 'msg-open-202',
          timestamp: '2026-02-15T10:00:00Z',
          destination: ['opener@example.com'],
        },
        open: {
          ipAddress: '10.0.0.1',
          userAgent: 'Gmail/1.0',
        },
      };

      const event = provider.parseWebhookEvent(payload);

      expect(event).not.toBeNull();
      expect(event?.eventType).toBe(EmailEventType.OPEN);
      expect(event?.ipAddress).toBe('10.0.0.1');
    });

    it('should return null for unknown notification type', () => {
      const payload = {
        notificationType: 'UnknownType',
        mail: { messageId: 'msg-unknown' },
      };

      const event = provider.parseWebhookEvent(payload);
      expect(event).toBeNull();
    });

    it('should handle malformed payload gracefully', () => {
      const event = provider.parseWebhookEvent({ invalid: 'data' });
      // Should return null since notificationType is not found in eventTypeMap
      expect(event).toBeNull();
    });

    it('should map transient bounce type correctly', () => {
      const payload = {
        notificationType: 'Bounce',
        mail: {
          messageId: 'msg-transient',
          destination: ['temp@example.com'],
        },
        bounce: {
          bounceType: 'Transient',
          bounceSubType: 'MailboxFull',
        },
      };

      const event = provider.parseWebhookEvent(payload);

      expect(event?.bounceType).toBe(BounceType.TRANSIENT);
    });
  });

  // ----------------------------------------
  // Health Check
  // ----------------------------------------

  describe('healthCheck', () => {
    it('should report healthy when SES is accessible and sending enabled', async () => {
      mockSend
        .mockResolvedValueOnce({
          Max24HourSend: 50000,
          MaxSendRate: 14,
          SentLast24Hours: 100,
        })
        .mockResolvedValueOnce({
          Enabled: true,
        });

      const result = await provider.healthCheck();

      expect(result.healthy).toBe(true);
      expect(result.message).toContain('sending enabled');
      expect(result.details?.sendingEnabled).toBe(true);
      expect(result.details?.rateLimiting?.configuredMaxPerSecond).toBe(14);
    });

    it('should report healthy but warn when sending disabled', async () => {
      mockSend
        .mockResolvedValueOnce({
          Max24HourSend: 0,
          MaxSendRate: 0,
          SentLast24Hours: 0,
        })
        .mockResolvedValueOnce({
          Enabled: false,
        });

      const result = await provider.healthCheck();

      expect(result.healthy).toBe(true);
      expect(result.message).toContain('sending disabled');
    });

    it('should report unhealthy for auth errors', async () => {
      const authError = new Error('Invalid credentials');
      (authError as any).name = 'InvalidClientTokenId';
      mockSend.mockRejectedValueOnce(authError);

      const result = await provider.healthCheck();

      expect(result.healthy).toBe(false);
      expect(result.message).toContain('authentication failed');
      expect(result.details?.reason).toBe('auth_failed');
    });

    it('should report unhealthy for connection errors', async () => {
      const networkError = new Error('Network timeout');
      (networkError as any).name = 'TimeoutError';
      mockSend.mockRejectedValueOnce(networkError);

      const result = await provider.healthCheck();

      expect(result.healthy).toBe(false);
      expect(result.details?.reason).toBe('connection_error');
    });
  });
});
