import axios from 'axios';
import { EmailProvider } from './types';

export interface ProviderEmailResult {
  email: string;
  source: 'verified' | 'configured' | 'sandbox' | 'fallback';
  isVerified: boolean;
  providerMessage?: string;
}

export interface EmailIntegrationForDetection {
  id: string;
  provider: EmailProvider;
  apiKey?: string | null;
  apiSecret?: string | null;
  fromEmail?: string | null;
  testEmail?: string | null; // Email para testes (Resend)
  region?: string | null;
}

export class ProviderEmailDetector {
  /**
   * Detecta o email apropriado para envio de teste baseado no provider
   */
  async detectEmail(
    integration: EmailIntegrationForDetection,
    mode: 'sandbox' | 'custom',
    fallbackEmail: string
  ): Promise<ProviderEmailResult> {
    try {
      switch (integration.provider) {
        case EmailProvider.RESEND:
          return await this.detectResendEmail(integration, mode, fallbackEmail);
        
        case EmailProvider.POSTMARK:
          return await this.detectPostmarkEmail(integration, fallbackEmail);
        
        case EmailProvider.AWS_SES:
          return await this.detectAWSSESEmail(integration, fallbackEmail);
        
        case EmailProvider.SMTP:
          return this.detectSMTPEmail(integration, fallbackEmail);
        
        default:
          return {
            email: fallbackEmail,
            source: 'fallback',
            isVerified: false,
            providerMessage: 'Provider não suportado'
          };
      }
    } catch (error) {
      console.error('[ProviderEmailDetector] Erro ao detectar email:', error);
      return {
        email: fallbackEmail,
        source: 'fallback',
        isVerified: false,
        providerMessage: 'Erro ao detectar email do provider'
      };
    }
  }

  /**
   * Resend: Não tem API para buscar email da conta
   * Estratégia: testEmail configurado, sandbox ou fromEmail
   */
  private async detectResendEmail(
    integration: EmailIntegrationForDetection,
    mode: 'sandbox' | 'custom',
    fallbackEmail: string
  ): Promise<ProviderEmailResult> {
    // Se tem testEmail configurado, usar (prioridade máxima)
    if (integration.testEmail) {
      return {
        email: integration.testEmail,
        source: 'verified',
        isVerified: true,
        providerMessage: 'Usando email de teste configurado'
      };
    }

    // Modo sandbox: usar email de fallback (admin)
    if (mode === 'sandbox') {
      return {
        email: fallbackEmail,
        source: 'sandbox',
        isVerified: true,
        providerMessage: 'Usando modo sandbox - apenas seu email é permitido'
      };
    }

    // Modo custom: usar fromEmail configurado
    if (integration.fromEmail) {
      return {
        email: fallbackEmail,
        source: 'configured',
        isVerified: false,
        providerMessage: 'Usando email configurado - verifique seu domínio no Resend'
      };
    }

    // Fallback
    return {
      email: fallbackEmail,
      source: 'fallback',
      isVerified: false,
      providerMessage: 'Configure testEmail ou fromEmail na integração'
    };
  }

  /**
   * Postmark: Tem API /senders para listar emails verificados
   */
  private async detectPostmarkEmail(
    integration: EmailIntegrationForDetection,
    fallbackEmail: string
  ): Promise<ProviderEmailResult> {
    if (!integration.apiKey) {
      return {
        email: fallbackEmail,
        source: 'fallback',
        isVerified: false,
        providerMessage: 'API Key não configurada'
      };
    }

    try {
      // Chamar API do Postmark para listar sender signatures
      const response = await axios.get('https://api.postmarkapp.com/senders', {
        headers: {
          'Accept': 'application/json',
          'X-Postmark-Account-Token': integration.apiKey
        },
        timeout: 5000
      });

      const senders = response.data.SenderSignatures || [];
      
      // Buscar primeiro email confirmado
      const confirmedSender = senders.find((s: any) => s.Confirmed === true);
      
      if (confirmedSender) {
        return {
          email: confirmedSender.EmailAddress,
          source: 'verified',
          isVerified: true,
          providerMessage: 'Email verificado encontrado no Postmark'
        };
      }

      // Se não encontrou confirmado, usar fromEmail ou fallback
      if (integration.fromEmail) {
        return {
          email: fallbackEmail,
          source: 'configured',
          isVerified: false,
          providerMessage: 'Nenhum email verificado encontrado - usando configurado'
        };
      }

      return {
        email: fallbackEmail,
        source: 'fallback',
        isVerified: false,
        providerMessage: 'Nenhum email verificado no Postmark'
      };
    } catch (error: any) {
      console.error('[ProviderEmailDetector] Erro ao buscar senders do Postmark:', error.message);
      
      // Fallback para fromEmail ou email do admin
      if (integration.fromEmail) {
        return {
          email: fallbackEmail,
          source: 'configured',
          isVerified: false,
          providerMessage: 'Erro ao verificar Postmark - usando email configurado'
        };
      }

      return {
        email: fallbackEmail,
        source: 'fallback',
        isVerified: false,
        providerMessage: 'Erro ao conectar com Postmark'
      };
    }
  }

  /**
   * AWS SES: Uses SES SDK to check verified identities
   *
   * Checks if the configured fromEmail (or its domain) is verified in SES.
   * Falls back to configured email if SDK call fails.
   *
   * Required IAM permissions:
   * - ses:ListIdentities
   * - ses:GetIdentityVerificationAttributes
   */
  private async detectAWSSESEmail(
    integration: EmailIntegrationForDetection,
    fallbackEmail: string
  ): Promise<ProviderEmailResult> {
    if (!integration.fromEmail) {
      return {
        email: fallbackEmail,
        source: 'fallback',
        isVerified: false,
        providerMessage: 'Configure fromEmail para AWS SES'
      };
    }

    // Try to verify via SES SDK
    try {
      const { SESClient, ListIdentitiesCommand, GetIdentityVerificationAttributesCommand } = await import('@aws-sdk/client-ses');

      const region = integration.region
        || process.env.AWS_SES_REGION
        || 'us-east-1';
      const accessKeyId = integration.apiKey || process.env.AWS_SES_ACCESS_KEY_ID;
      const secretAccessKey = integration.apiSecret || process.env.AWS_SES_SECRET_ACCESS_KEY;

      const clientOptions: ConstructorParameters<typeof SESClient>[0] = { region };
      if (accessKeyId && secretAccessKey) {
        clientOptions.credentials = { accessKeyId, secretAccessKey };
      }

      const client = new SESClient(clientOptions);

      // List identities and check verification status
      const listResponse = await client.send(new ListIdentitiesCommand({}));
      const identities = listResponse.Identities || [];

      if (identities.length === 0) {
        return {
          email: fallbackEmail,
          source: 'configured',
          isVerified: false,
          providerMessage: 'Nenhuma identidade encontrada no SES - verifique seu email/domínio'
        };
      }

      // Check if fromEmail or its domain is verified
      const verifyResponse = await client.send(
        new GetIdentityVerificationAttributesCommand({ Identities: identities })
      );
      const attributes = verifyResponse.VerificationAttributes || {};

      // Check exact email match
      if (attributes[integration.fromEmail]?.VerificationStatus === 'Success') {
        return {
          email: integration.fromEmail,
          source: 'verified',
          isVerified: true,
          providerMessage: 'Email verificado no AWS SES'
        };
      }

      // Check domain match
      const domain = integration.fromEmail.split('@')[1];
      if (domain && attributes[domain]?.VerificationStatus === 'Success') {
        return {
          email: integration.fromEmail,
          source: 'verified',
          isVerified: true,
          providerMessage: 'Domínio verificado no AWS SES'
        };
      }

      // fromEmail exists but not verified
      return {
        email: fallbackEmail,
        source: 'configured',
        isVerified: false,
        providerMessage: 'Email/domínio não verificado no SES - verifique no AWS SES Console'
      };
    } catch (error: any) {
      console.error('[ProviderEmailDetector] Erro ao verificar SES identities:', error.message);

      // Fall back to configured email
      return {
        email: fallbackEmail,
        source: 'configured',
        isVerified: false,
        providerMessage: 'Erro ao conectar com AWS SES - usando email configurado'
      };
    }
  }

  /**
   * SMTP: Não tem API, usar fromEmail configurado
   */
  private detectSMTPEmail(
    integration: EmailIntegrationForDetection,
    fallbackEmail: string
  ): ProviderEmailResult {
    if (integration.fromEmail) {
      return {
        email: fallbackEmail,
        source: 'configured',
        isVerified: false,
        providerMessage: 'Usando email configurado do SMTP'
      };
    }

    return {
      email: fallbackEmail,
      source: 'fallback',
      isVerified: false,
      providerMessage: 'Configure fromEmail para SMTP'
    };
  }
}

export const providerEmailDetector = new ProviderEmailDetector();
