import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Termos e condições de uso da plataforma.',
};

const TERMS_VERSION = '2026-01';
const LAST_UPDATED = '01 de janeiro de 2026';

const LEGAL_EMAIL = process.env.NEXT_PUBLIC_LEGAL_EMAIL ?? 'legal@kaven.site';

export default function TermsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10 space-y-2">
          <p className="text-sm text-muted-foreground">Versão {TERMS_VERSION}</p>
          <h1 className="text-3xl font-bold tracking-tight">Termos de Uso</h1>
          <p className="text-muted-foreground">Última atualização: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          {/* Índice */}
          <nav className="bg-muted/40 rounded-lg p-5 text-sm space-y-1">
            <p className="font-semibold mb-2">Nesta página</p>
            {[
              ['#aceitacao', '1. Aceitação dos Termos'],
              ['#servico', '2. Descrição do Serviço'],
              ['#uso-aceitavel', '3. Uso Aceitável'],
              ['#propriedade-intelectual', '4. Propriedade Intelectual'],
              ['#dados-pessoais', '5. Dados Pessoais'],
              ['#responsabilidade', '6. Limitação de Responsabilidade'],
              ['#cancelamento', '7. Cancelamento e Rescisão'],
              ['#alteracoes', '8. Alterações nos Termos'],
              ['#contato', '9. Contato'],
            ].map(([href, label]) => (
              <a key={href} href={href} className="block text-primary hover:underline">
                {label}
              </a>
            ))}
          </nav>

          <section id="aceitacao">
            <h2 className="text-xl font-semibold mb-3">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao acessar ou usar esta plataforma, você concorda com estes Termos de Uso. Se você
              não concordar com qualquer parte destes termos, não poderá acessar o serviço. O uso
              continuado da plataforma após alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section id="servico">
            <h2 className="text-xl font-semibold mb-3">2. Descrição do Serviço</h2>
            <p className="text-muted-foreground leading-relaxed">
              A plataforma oferece ferramentas de gestão, colaboração e automação para empresas e
              equipes. O serviço é fornecido &quot;no estado em que se encontra&quot; e está sujeito a
              disponibilidade e manutenções programadas.
            </p>
          </section>

          <section id="uso-aceitavel">
            <h2 className="text-xl font-semibold mb-3">3. Uso Aceitável</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">Você concorda em não:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Usar a plataforma para atividades ilegais ou fraudulentas;</li>
              <li>Tentar acessar dados de outros usuários sem autorização;</li>
              <li>Interferir no funcionamento da plataforma ou de seus servidores;</li>
              <li>Transmitir malware, vírus ou qualquer código malicioso;</li>
              <li>Realizar engenharia reversa ou tentar extrair o código-fonte.</li>
            </ul>
          </section>

          <section id="propriedade-intelectual">
            <h2 className="text-xl font-semibold mb-3">4. Propriedade Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed">
              Todo o conteúdo da plataforma — incluindo software, design, textos e marcas — é de
              propriedade exclusiva ou licenciado para o titular do serviço. Nenhuma parte pode ser
              reproduzida sem autorização expressa por escrito.
            </p>
          </section>

          <section id="dados-pessoais">
            <h2 className="text-xl font-semibold mb-3">5. Dados Pessoais</h2>
            <p className="text-muted-foreground leading-relaxed">
              O tratamento dos seus dados pessoais é regido pela nossa{' '}
              <Link href={`/${locale}/privacy`} className="text-primary hover:underline">
                Política de Privacidade
              </Link>
              , em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
              Ao usar a plataforma, você concorda com o tratamento descrito na política.
            </p>
          </section>

          <section id="responsabilidade">
            <h2 className="text-xl font-semibold mb-3">6. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed">
              Na máxima extensão permitida por lei, o provedor do serviço não será responsável por
              danos indiretos, incidentais, especiais ou consequenciais decorrentes do uso ou
              impossibilidade de uso da plataforma. A responsabilidade total não excederá o valor
              pago pelo serviço nos últimos 12 meses.
            </p>
          </section>

          <section id="cancelamento">
            <h2 className="text-xl font-semibold mb-3">7. Cancelamento e Rescisão</h2>
            <p className="text-muted-foreground leading-relaxed">
              Você pode cancelar sua conta a qualquer momento através das configurações da
              plataforma. O provedor reserva-se o direito de suspender ou encerrar contas que
              violem estes termos, com ou sem aviso prévio, dependendo da gravidade da violação.
            </p>
          </section>

          <section id="alteracoes">
            <h2 className="text-xl font-semibold mb-3">8. Alterações nos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações
              materiais serão notificadas com pelo menos 30 dias de antecedência por e-mail ou
              aviso na plataforma. O uso continuado após a data de vigência constitui aceitação.
            </p>
          </section>

          <section id="contato">
            <h2 className="text-xl font-semibold mb-3">9. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para dúvidas sobre estes termos, entre em contato:{' '}
              <a href={`mailto:${LEGAL_EMAIL}`} className="text-primary hover:underline">
                {LEGAL_EMAIL}
              </a>
              . Para solicitações relacionadas a dados pessoais, consulte nossa{' '}
              <Link href={`/${locale}/privacy`} className="text-primary hover:underline">
                Política de Privacidade
              </Link>
              .
            </p>
          </section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <span>Versão {TERMS_VERSION}</span>
          <Link href={`/${locale}/privacy`} className="text-primary hover:underline">
            Política de Privacidade →
          </Link>
        </div>
      </div>
    </div>
  );
}
