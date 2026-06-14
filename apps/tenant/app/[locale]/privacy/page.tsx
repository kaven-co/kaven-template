import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Como coletamos, usamos e protegemos seus dados pessoais.',
};

const POLICY_VERSION = '2026-01';
const LAST_UPDATED = '01 de janeiro de 2026';

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME ?? 'Kaven';
const COMPANY_CNPJ = process.env.NEXT_PUBLIC_COMPANY_CNPJ ?? '';
const COMPANY_ADDRESS = process.env.NEXT_PUBLIC_COMPANY_ADDRESS ?? '';
const DPO_EMAIL = process.env.NEXT_PUBLIC_DPO_EMAIL ?? 'dpo@kaven.site';

export default function PrivacyPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10 space-y-2">
          <p className="text-sm text-muted-foreground">Versão {POLICY_VERSION}</p>
          <h1 className="text-3xl font-bold tracking-tight">Política de Privacidade</h1>
          <p className="text-muted-foreground">Última atualização: {LAST_UPDATED}</p>
          <p className="text-sm bg-muted/40 rounded px-3 py-2">
            Em conformidade com a Lei Geral de Proteção de Dados — LGPD (Lei nº 13.709/2018)
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          {/* Índice */}
          <nav className="bg-muted/40 rounded-lg p-5 text-sm space-y-1">
            <p className="font-semibold mb-2">Nesta página</p>
            {[
              ['#controlador', '1. Controlador dos Dados'],
              ['#dados-coletados', '2. Dados que Coletamos'],
              ['#finalidades', '3. Finalidades e Bases Legais'],
              ['#compartilhamento', '4. Compartilhamento de Dados'],
              ['#retencao', '5. Retenção dos Dados'],
              ['#direitos', '6. Seus Direitos (LGPD Art. 18)'],
              ['#seguranca', '7. Segurança'],
              ['#cookies', '8. Cookies'],
              ['#alteracoes', '9. Alterações nesta Política'],
              ['#dpo', '10. Encarregado (DPO)'],
            ].map(([href, label]) => (
              <a key={href} href={href} className="block text-primary hover:underline">
                {label}
              </a>
            ))}
          </nav>

          <section id="controlador">
            <h2 className="text-xl font-semibold mb-3">1. Controlador dos Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              O controlador responsável pelo tratamento dos seus dados pessoais é a empresa
              operadora desta plataforma. Para fins de LGPD, o controlador é quem determina as
              finalidades e os meios do tratamento de dados pessoais.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              <strong className="text-foreground">Razão Social:</strong>{' '}
              <span className="text-muted-foreground">{COMPANY_NAME}</span>
              <br />
              <strong className="text-foreground">CNPJ:</strong>{' '}
              <span className="text-muted-foreground">{COMPANY_CNPJ}</span>
              <br />
              <strong className="text-foreground">Endereço:</strong>{' '}
              <span className="text-muted-foreground">{COMPANY_ADDRESS}</span>
            </p>
          </section>

          <section id="dados-coletados">
            <h2 className="text-xl font-semibold mb-3">2. Dados que Coletamos</h2>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-foreground mb-1">Dados de cadastro</p>
                <p className="text-muted-foreground">
                  Nome, e-mail, senha (armazenada como hash bcrypt), telefone e foto de perfil.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Dados de uso</p>
                <p className="text-muted-foreground">
                  Logs de acesso, endereço IP, user-agent do navegador, data e hora de login e
                  ações realizadas na plataforma (audit logs).
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Dados de pagamento</p>
                <p className="text-muted-foreground">
                  Processados pelo provedor de pagamento (Stripe). Não armazenamos dados de
                  cartão de crédito em nossos servidores.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Dados de consentimento</p>
                <p className="text-muted-foreground">
                  Registros de quando e quais versões das políticas foram aceitas, e para quais
                  finalidades você consentiu com o tratamento.
                </p>
              </div>
            </div>
          </section>

          <section id="finalidades">
            <h2 className="text-xl font-semibold mb-3">3. Finalidades e Bases Legais</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-medium">Finalidade</th>
                    <th className="text-left py-2 font-medium">Base Legal (LGPD)</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground divide-y divide-border">
                  {[
                    ['Prestação do serviço contratado', 'Art. 7, V — execução de contrato'],
                    ['Segurança e prevenção a fraudes', 'Art. 7, IX — legítimo interesse'],
                    ['Comunicações sobre o serviço', 'Art. 7, V — execução de contrato'],
                    ['Marketing e novidades (opt-in)', 'Art. 7, I — consentimento'],
                    ['Análise de uso e melhoria do produto', 'Art. 7, IX — legítimo interesse'],
                    ['Cumprimento de obrigações legais', 'Art. 7, II — obrigação legal'],
                  ].map(([finalidade, base]) => (
                    <tr key={finalidade}>
                      <td className="py-2 pr-4">{finalidade}</td>
                      <td className="py-2">{base}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="compartilhamento">
            <h2 className="text-xl font-semibold mb-3">4. Compartilhamento de Dados</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Compartilhamos dados apenas com terceiros necessários à operação do serviço:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>
                <strong className="text-foreground">Stripe</strong> — processamento de pagamentos
              </li>
              <li>
                <strong className="text-foreground">Resend</strong> — envio de e-mails
                transacionais
              </li>
              <li>
                <strong className="text-foreground">Neon (PostgreSQL)</strong> — armazenamento de
                dados
              </li>
              <li>
                <strong className="text-foreground">Autoridades competentes</strong> — quando
                exigido por lei ou ordem judicial
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Não vendemos seus dados pessoais a terceiros.
            </p>
          </section>

          <section id="retencao">
            <h2 className="text-xl font-semibold mb-3">5. Retenção dos Dados</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Dados de conta: enquanto a conta estiver ativa + 30 dias após cancelamento</li>
              <li>Logs de auditoria de segurança: 2 anos (LGPD Art. 15-16)</li>
              <li>Dados fiscais (notas fiscais): 5 anos (obrigação legal)</li>
              <li>Logs de exportação de dados: 5 anos (LGPD Art. 37)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Após o prazo de retenção, os dados são anonimizados ou excluídos permanentemente.
            </p>
          </section>

          <section id="direitos">
            <h2 className="text-xl font-semibold mb-3">6. Seus Direitos (LGPD Art. 18)</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Como titular de dados, você tem os seguintes direitos:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>
                <strong className="text-foreground">Confirmação e acesso</strong> — saber quais
                dados temos sobre você
              </li>
              <li>
                <strong className="text-foreground">Correção</strong> — atualizar dados
                incompletos ou desatualizados
              </li>
              <li>
                <strong className="text-foreground">Portabilidade</strong> — exportar seus dados
                via{' '}
                <span className="font-mono text-xs bg-muted px-1 rounded">
                  GET /api/users/me/export
                </span>
              </li>
              <li>
                <strong className="text-foreground">Eliminação</strong> — solicitar exclusão dos
                dados tratados com base em consentimento
              </li>
              <li>
                <strong className="text-foreground">Revogação de consentimento</strong> — retirar
                consentimento para finalidades específicas a qualquer momento
              </li>
              <li>
                <strong className="text-foreground">Oposição</strong> — opor-se a tratamento em
                desconformidade com a LGPD
              </li>
              <li>
                <strong className="text-foreground">Informação</strong> — saber com quem
                compartilhamos seus dados
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Para exercer seus direitos, acesse as configurações da sua conta ou contate nosso
              DPO no endereço indicado na seção 10.
            </p>
          </section>

          <section id="seguranca">
            <h2 className="text-xl font-semibold mb-3">7. Segurança</h2>
            <p className="text-muted-foreground leading-relaxed">
              Adotamos medidas técnicas e organizacionais para proteger seus dados: senhas
              armazenadas como hash bcrypt (12 rounds), comunicações via TLS/HTTPS, isolamento de
              dados por tenant (row-level security), autenticação de dois fatores opcional e
              monitoramento de acessos suspeitos via logs de segurança.
            </p>
          </section>

          <section id="cookies">
            <h2 className="text-xl font-semibold mb-3">8. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos cookies estritamente necessários para funcionamento da sessão
              (autenticação) e cookies de preferências (idioma, tema). Não utilizamos cookies de
              rastreamento de terceiros sem seu consentimento expresso.
            </p>
          </section>

          <section id="alteracoes">
            <h2 className="text-xl font-semibold mb-3">9. Alterações nesta Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              Quando houver alterações materiais nesta política, notificaremos por e-mail e via
              aviso na plataforma com pelo menos 30 dias de antecedência. Mudanças de versão
              (campo <span className="font-mono text-xs bg-muted px-1 rounded">privacyPolicyVersion</span>)
              exigem novo aceite ao fazer login.
            </p>
          </section>

          <section id="dpo">
            <h2 className="text-xl font-semibold mb-3">10. Encarregado (DPO)</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conforme LGPD Art. 41, nosso Encarregado pelo Tratamento de Dados Pessoais (DPO)
              pode ser contatado em:
            </p>
            <p className="mt-2 text-muted-foreground">
              <strong className="text-foreground">Nome:</strong>{' '}
              <span className="text-muted-foreground">{COMPANY_NAME}</span>
              <br />
              <strong className="text-foreground">E-mail:</strong>{' '}
              <a href={`mailto:${DPO_EMAIL}`} className="text-primary hover:underline">
                {DPO_EMAIL}
              </a>
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Você também pode registrar reclamações junto à Autoridade Nacional de Proteção de
              Dados (ANPD) em{' '}
              <a
                href="https://www.gov.br/anpd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                www.gov.br/anpd
              </a>
              .
            </p>
          </section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <span>Versão {POLICY_VERSION}</span>
          <Link href={`/${locale}/terms`} className="text-primary hover:underline">
            ← Termos de Uso
          </Link>
        </div>
      </div>
    </div>
  );
}
