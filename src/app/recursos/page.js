import Link from "next/link";
import styles from "./page.module.css";

const grupos = [
  {
    titulo: "Atendimento e relacionamento",
    subtitulo: "Tudo que participa diretamente da experiência do cliente.",
    itens: [
      {
        icone: "📅",
        titulo: "Agenda",
        texto: "Organize horários, serviços e profissionais em uma rotina centralizada.",
        detalhe: "Menos conflito de horários e mais visão do dia.",
        tipo: "Atendimento",
      },
      {
        icone: "👥",
        titulo: "Clientes",
        texto: "Mantenha cadastro e histórico operacional conectados à barbearia.",
        detalhe: "Informações do cliente reunidas em um único lugar.",
        tipo: "Relacionamento",
      },
      {
        icone: "🧾",
        titulo: "Comandas",
        texto: "Acompanhe serviços, produtos e pagamentos durante o atendimento.",
        detalhe: "Do atendimento ao fechamento sem perder o histórico.",
        tipo: "Operação",
      },
      {
        icone: "📱",
        titulo: "Portal do Cliente",
        texto: "Disponibilize uma área própria para o cliente acompanhar os serviços disponíveis.",
        detalhe: "Mais autonomia para o cliente e menos dependência do balcão.",
        tipo: "Cliente",
      },
    ],
  },
  {
    titulo: "Operação e gestão",
    subtitulo: "Ferramentas para controlar o que acontece dentro da barbearia.",
    itens: [
      {
        icone: "📦",
        titulo: "Produtos e estoque",
        texto: "Controle produtos, vendas, quantidades e movimentações de estoque.",
        detalhe: "Acompanhe o que entra, sai e precisa de reposição.",
        tipo: "Estoque",
      },
      {
        icone: "💰",
        titulo: "Financeiro e caixa",
        texto: "Centralize movimentações financeiras e informações operacionais.",
        detalhe: "Mais clareza sobre entradas, saídas e fechamento.",
        tipo: "Financeiro",
      },
      {
        icone: "✂️",
        titulo: "Equipe",
        texto: "Organize profissionais, usuários e responsabilidades dentro da barbearia.",
        detalhe: "Perfis separados e operação mais organizada.",
        tipo: "Equipe",
      },
      {
        icone: "💳",
        titulo: "Planos e assinaturas",
        texto: "Gerencie planos de clientes, cobranças e recorrência.",
        detalhe: "Acompanhe clientes assinantes e seus ciclos.",
        tipo: "Receita recorrente",
      },
    ],
  },
  {
    titulo: "Plataforma",
    subtitulo: "Recursos que dão estrutura e segurança para a operação.",
    itens: [
      {
        icone: "🔐",
        titulo: "Acessos",
        texto: "Separe usuários e perfis de acesso de acordo com a função de cada pessoa.",
        detalhe: "Cada usuário acessa o que faz sentido para sua função.",
        tipo: "Segurança",
      },
      {
        icone: "🏪",
        titulo: "Gestão por barbearia",
        texto: "Cada barbearia trabalha com seus próprios dados e sua própria configuração.",
        detalhe: "Dados isolados e organização por estabelecimento.",
        tipo: "Multi-barbearia",
      },
      {
        icone: "📈",
        titulo: "Relatórios",
        texto: "Acompanhe informações consolidadas dos módulos disponíveis no sistema.",
        detalhe: "Decisões apoiadas por dados da própria operação.",
        tipo: "Gestão",
      },
      {
        icone: "⚡",
        titulo: "Acesso pelo navegador",
        texto: "Use o BarbSist sem depender da instalação de um programa específico.",
        detalhe: "Acesso por computador, tablet ou celular compatível.",
        tipo: "Acesso",
      },
    ],
  },
];

export default function RecursosPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/apresentacao" className={styles.brand}>
          ✂ <strong>Barb<span>Sist</span></strong>
        </Link>

        <nav>
          <Link href="/apresentacao">Início</Link>
          <Link href="/apresentacao#planos">Planos</Link>
          <Link href="/como-funciona">Como funciona</Link>
          <Link href="/contato">Contato</Link>
          <Link href="/login">Entrar</Link>
          <Link href="/cadastro" className={styles.primary}>Criar conta</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <span>RECURSOS</span>
        <h1>Veja rapidamente o que o BarbSist organiza para sua barbearia.</h1>
        <p>
          Os recursos foram agrupados por finalidade para ficar simples entender
          onde cada módulo ajuda na rotina.
        </p>
      </section>

      <section className={styles.content}>
        {grupos.map((grupo, grupoIndex) => (
          <section className={styles.group} key={grupo.titulo}>
            <div className={styles.groupTitle}>
              <div>
                <span className={styles.groupNumber}>0{grupoIndex + 1}</span>
                <h2>{grupo.titulo}</h2>
              </div>
              <p>{grupo.subtitulo}</p>
            </div>

            <div className={styles.grid}>
              {grupo.itens.map((item, index) => (
                <article
                  className={`${styles.card} ${styles[`accent${index + 1}`]}`}
                  key={item.titulo}
                >
                  <div className={styles.cardTop}>
                    <span className={styles.icon}>{item.icone}</span>
                    <span className={styles.tag}>{item.tipo}</span>
                  </div>

                  <h3>{item.titulo}</h3>
                  <p className={styles.description}>{item.texto}</p>

                  <div className={styles.result}>
                    <span>✓</span>
                    <p>{item.detalhe}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </section>

      <section className={styles.cta}>
        <div>
          <span className={styles.ctaLabel}>PRÓXIMO PASSO</span>
          <strong>Veja como começar a usar o BarbSist.</strong>
          <p>Entenda o fluxo desde o cadastro até a escolha do plano.</p>
        </div>
        <Link href="/como-funciona">Como funciona →</Link>
      </section>
    </main>
  );
}
