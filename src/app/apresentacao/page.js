import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

const recursos = [
  {
    icon: "📅",
    title: "Agenda inteligente",
    text: "Organize horários, profissionais e serviços e mantenha a rotina de atendimento em um só fluxo.",
  },
  {
    icon: "👥",
    title: "Clientes e relacionamento",
    text: "Centralize cadastro, histórico e informações importantes para acompanhar cada cliente.",
  },
  {
    icon: "🧾",
    title: "Comandas e pagamentos",
    text: "Acompanhe serviços, produtos e pagamentos do atendimento até o fechamento.",
  },
  {
    icon: "📦",
    title: "Produtos e estoque",
    text: "Controle produtos, quantidades e movimentações para reduzir faltas e perdas.",
  },
  {
    icon: "💰",
    title: "Financeiro e caixa",
    text: "Reúna entradas, saídas, contas e movimentações financeiras da operação.",
  },
  {
    icon: "💳",
    title: "Planos e assinaturas",
    text: "Gerencie planos de clientes, cobranças recorrentes e acompanhamento de assinaturas.",
  },
];

const solucoes = [
  {
    eyebrow: "ATENDIMENTO",
    title: "Do agendamento ao fechamento sem perder o histórico.",
    text: "Agenda, clientes, comandas e Portal do Cliente trabalham conectados para reduzir retrabalho e facilitar o acompanhamento da rotina.",
    items: [
      "Agenda e profissionais organizados",
      "Cadastro e histórico do cliente",
      "Comanda conectada ao atendimento",
      "Portal do Cliente para acompanhamento",
    ],
    accent: "blue",
  },
  {
    eyebrow: "OPERAÇÃO",
    title: "Produtos, equipe e assinaturas no mesmo ambiente.",
    text: "A operação fica centralizada para que o gestor saiba o que está acontecendo sem depender de várias planilhas ou controles paralelos.",
    items: [
      "Produtos e movimentações de estoque",
      "Usuários e profissionais com perfis separados",
      "Planos e assinaturas de clientes",
      "Dados isolados por barbearia",
    ],
    accent: "cyan",
  },
  {
    eyebrow: "GESTÃO",
    title: "Informações financeiras para decidir com mais segurança.",
    text: "Caixa, contas e informações consolidadas ajudam a acompanhar o movimento da barbearia e identificar o que precisa de atenção.",
    items: [
      "Caixa e movimentações financeiras",
      "Contas a pagar e a receber",
      "Relatórios operacionais",
      "Visão integrada do negócio",
    ],
    accent: "violet",
  },
];

const perfis = [
  {
    icon: "✂️",
    title: "Barbeiro independente",
    text: "Para quem precisa profissionalizar agenda, clientes, comandas e financeiro sem complicação.",
  },
  {
    icon: "👥",
    title: "Pequenas equipes",
    text: "Para organizar profissionais, responsabilidades, estoque e atendimento conforme a equipe cresce.",
  },
  {
    icon: "📈",
    title: "Barbearias em crescimento",
    text: "Para quem quer ganhar controle da operação antes que o volume de clientes e movimentações aumente.",
  },
];

const planos = [
  {
    name: "Solo",
    capacity: "1 barbeiro",
    price: "19,90",
    features: ["Agenda e clientes", "Comandas e pagamentos", "Produtos e estoque", "Financeiro integrado"],
  },
  {
    name: "Dupla",
    capacity: "Até 2 barbeiros",
    price: "29,90",
    features: ["Tudo do Solo", "Até 2 profissionais", "Controle de equipe", "Portal do Cliente"],
  },
  {
    name: "Equipe",
    capacity: "Até 5 barbeiros",
    price: "49,90",
    popular: true,
    features: ["Tudo do Dupla", "Até 5 profissionais", "Comissões", "Relatórios e indicadores"],
  },
  {
    name: "Profissional",
    capacity: "Até 10 barbeiros",
    price: "79,90",
    features: ["Tudo do Equipe", "Até 10 profissionais", "Mais capacidade", "Recursos da plataforma"],
  },
];

export default function ApresentacaoPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/apresentacao" className={styles.brand} aria-label="BarbSist - início">
            <span className={styles.brandIcon}>✂</span>
            <span>Barb<span>Sist</span></span>
          </Link>

          <nav className={styles.nav} aria-label="Navegação principal">
            <a href="#recursos">Recursos</a>
            <a href="#solucoes">Soluções</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#planos">Planos</a>
            <Link href="/contato">Contato</Link>
          </nav>

          <div className={styles.headerActions}>
            <Link href="/login" className={styles.loginButton}>Entrar</Link>
            <Link href="/cadastro" className={styles.primaryButton}>Criar conta</Link>
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrowLine}>
              <span />
              GESTÃO COMPLETA PARA BARBEARIAS
            </div>

            <h1>
              Sua barbearia mais organizada,
              <strong> do agendamento ao caixa.</strong>
            </h1>

            <p className={styles.heroLead}>
              O BarbSist conecta agenda, clientes, comandas, produtos, estoque,
              financeiro, equipe, planos e pagamentos em um único sistema.
            </p>

            <div className={styles.heroActions}>
              <Link href="/cadastro" className={styles.heroPrimary}>
                Testar grátis por 40 dias
                <span>→</span>
              </Link>
              <Link href="/recursos" className={styles.heroSecondary}>
                Conhecer recursos
              </Link>
            </div>

            <div className={styles.heroTrust}>
              <span>✓ Sem compromisso</span>
              <span>✓ Acesso pelo navegador</span>
              <span>✓ Comece em poucos minutos</span>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <Image
              src="/barbsist-hero-v13.jpg"
              alt="Barbeiro atendendo um cliente com uma visão do sistema BarbSist"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 58vw"
            />
            <div className={styles.heroGlow} />
          </div>
        </div>
      </section>

      <section className={styles.proofBar} aria-label="Diferenciais BarbSist">
        <div>
          <strong>40 dias grátis</strong>
          <span>Conheça antes de contratar</span>
        </div>
        <div>
          <strong>Operação conectada</strong>
          <span>Da agenda ao financeiro</span>
        </div>
        <div>
          <strong>Perfis separados</strong>
          <span>Administração e equipe</span>
        </div>
        <div>
          <strong>Dados por barbearia</strong>
          <span>Organização e isolamento</span>
        </div>
      </section>

      <section className={styles.resources} id="recursos">
        <div className={styles.sectionIntro}>
          <div>
            <span className={styles.kicker}>RECURSOS</span>
            <h2>Tudo que sua barbearia precisa, em um só lugar.</h2>
          </div>
          <div className={styles.sectionAside}>
            <p>Uma visão clara da rotina para organizar melhor atendimento, operação e gestão.</p>
            <Link href="/recursos">Ver todos os recursos →</Link>
          </div>
        </div>

        <div className={styles.resourceGrid}>
          {recursos.map((recurso) => (
            <article className={styles.resourceCard} key={recurso.title}>
              <div className={styles.resourceIcon} aria-hidden="true">{recurso.icon}</div>
              <h3>{recurso.title}</h3>
              <p>{recurso.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.solutions} id="solucoes">
        <div className={styles.solutionsIntro}>
          <span className={styles.kicker}>UMA PLATAFORMA, TRÊS FRENTES</span>
          <h2>Organize o que acontece antes, durante e depois de cada atendimento.</h2>
          <p>
            Em vez de espalhar informações em aplicativos, cadernos e planilhas,
            o BarbSist reúne os processos centrais da barbearia.
          </p>
        </div>

        <div className={styles.solutionStack}>
          {solucoes.map((solucao, index) => (
            <article
              className={`${styles.solutionCard} ${styles[`accent_${solucao.accent}`]}`}
              key={solucao.title}
            >
              <div className={styles.solutionNumber}>0{index + 1}</div>
              <div className={styles.solutionCopy}>
                <span>{solucao.eyebrow}</span>
                <h3>{solucao.title}</h3>
                <p>{solucao.text}</p>
              </div>
              <ul>
                {solucao.items.map((item) => <li key={item}>✓ {item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.audience}>
        <div className={styles.audienceVisual}>
          <Image
            src="/images/barbsist-auth-diversidade.jpg"
            alt="Profissionais de barbearia e beleza representando diferentes perfis de negócio"
            fill
            sizes="(max-width: 900px) 100vw, 44vw"
          />
        </div>

        <div className={styles.audienceCopy}>
          <span className={styles.kicker}>PARA QUEM É</span>
          <h2>Um sistema que acompanha o tamanho da sua operação.</h2>
          <p className={styles.audienceLead}>
            Comece simples e evolua a organização conforme sua equipe e sua rotina crescem.
          </p>

          <div className={styles.audienceCards}>
            {perfis.map((perfil) => (
              <article key={perfil.title}>
                <span aria-hidden="true">{perfil.icon}</span>
                <div>
                  <h3>{perfil.title}</h3>
                  <p>{perfil.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.steps} id="como-funciona">
        <div className={styles.stepsHeader}>
          <div>
            <span className={styles.kicker}>COMO FUNCIONA</span>
            <h2>Comece em poucos minutos.</h2>
          </div>
          <p>Você testa primeiro, organiza sua operação e só depois escolhe o plano adequado à equipe.</p>
        </div>

        <div className={styles.stepsGrid}>
          <article>
            <span>01</span>
            <div className={styles.stepIcon}>🏪</div>
            <h3>Crie sua barbearia</h3>
            <p>Informe os dados principais e inicie seu período gratuito de 40 dias.</p>
          </article>
          <article>
            <span>02</span>
            <div className={styles.stepIcon}>⚙️</div>
            <h3>Configure a operação</h3>
            <p>Cadastre serviços, profissionais, produtos e informações essenciais.</p>
          </article>
          <article>
            <span>03</span>
            <div className={styles.stepIcon}>✂️</div>
            <h3>Use no dia a dia</h3>
            <p>Registre agenda, clientes, comandas, estoque e financeiro no mesmo sistema.</p>
          </article>
          <article>
            <span>04</span>
            <div className={styles.stepIcon}>📈</div>
            <h3>Escolha o plano</h3>
            <p>Ao final do teste, escolha a opção compatível com a quantidade de profissionais.</p>
          </article>
        </div>
      </section>

      <section className={styles.plans} id="planos">
        <div className={styles.plansHeader}>
          <div>
            <span className={styles.kicker}>PLANOS</span>
            <h2>Escolha o plano ideal para sua barbearia.</h2>
          </div>
          <div className={styles.trialCallout}>
            <strong>40 dias grátis</strong>
            <span>antes da contratação</span>
          </div>
        </div>

        <div className={styles.planGrid}>
          {planos.map((plano) => (
            <article
              key={plano.name}
              className={`${styles.planCard} ${plano.popular ? styles.planPopular : ""}`}
            >
              {plano.popular && <div className={styles.popularBadge}>MAIS ESCOLHIDO</div>}
              <div className={styles.planTop}>
                <div>
                  <h3>{plano.name}</h3>
                  <p>{plano.capacity}</p>
                </div>
                <span className={styles.planIcon}>✂</span>
              </div>

              <div className={styles.price}>
                <span>R$</span>
                <strong>{plano.price}</strong>
                <small>/mês</small>
              </div>

              <ul>
                {plano.features.map((feature) => <li key={feature}>✓ {feature}</li>)}
              </ul>

              <Link href="/cadastro" className={styles.planButton}>
                Começar agora
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.finalCta} id="contato">
        <div>
          <span className={styles.kicker}>40 DIAS GRÁTIS</span>
          <h2>Modernize sua barbearia sem mudar tudo de uma vez.</h2>
          <p>
            Teste a rotina no seu ritmo, organize os módulos essenciais e decida depois qual plano faz sentido para sua equipe.
          </p>
        </div>

        <div className={styles.finalActions}>
          <Link href="/cadastro" className={styles.finalPrimary}>Criar minha barbearia →</Link>
          <Link href="/contato" className={styles.finalSecondary}>Falar com o BarbSist</Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <span>✂</span>
          <strong>Barb<span>Sist</span></strong>
        </div>
        <p>Gestão para barbearias • RMR Soluções de Sistemas</p>
        <div>
          <Link href="/login">Entrar</Link>
          <Link href="/cadastro">Criar conta</Link>
        </div>
      </footer>
    </main>
  );
}
