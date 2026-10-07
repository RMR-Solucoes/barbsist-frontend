import Link from "next/link";
import styles from "./page.module.css";

const canais = [
  {
    icone: "💬",
    titulo: "Dúvidas comerciais",
    descricao: "Para entender planos, período de teste e funcionamento da plataforma.",
    itens: ["Comparação de planos", "Dúvidas antes do cadastro", "Informações sobre contratação"],
    destaque: "Comercial",
  },
  {
    icone: "🛠️",
    titulo: "Suporte",
    descricao: "Para dificuldades de uso e situações que precisem de acompanhamento.",
    itens: ["Problemas de acesso", "Dificuldades em funcionalidades", "Acompanhamento de ocorrências"],
    destaque: "Atendimento",
  },
  {
    icone: "💡",
    titulo: "Sugestões",
    descricao: "Para ouvir quem usa o BarbSist e transformar dificuldades reais em melhorias.",
    itens: ["Sugestões de recursos", "Dificuldades da rotina", "Ideias para evolução do sistema"],
    destaque: "Evolução",
  },
];

export default function ContatoPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/apresentacao" className={styles.brand}>
          ✂ <strong>Barb<span>Sist</span></strong>
        </Link>
        <nav>
          <Link href="/apresentacao">Início</Link>
          <Link href="/recursos">Recursos</Link>
          <Link href="/apresentacao#planos">Planos</Link>
          <Link href="/como-funciona">Como funciona</Link>
          <Link href="/login">Entrar</Link>
          <Link href="/cadastro" className={styles.primary}>Criar conta</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <span>CONTATO</span>
        <h1>Fale com o BarbSist pelo assunto certo.</h1>
        <p>
          A página já está organizada para receber dúvidas, suporte e sugestões.
          O canal direto de mensagens entre barbearia e Superadmin será conectado
          em uma etapa futura.
        </p>
      </section>

      <section className={styles.cards}>
        {canais.map((canal, index) => (
          <article
            className={`${styles.card} ${styles[`accent${index + 1}`]}`}
            key={canal.titulo}
          >
            <div className={styles.cardTop}>
              <span className={styles.icon}>{canal.icone}</span>
              <span className={styles.badge}>{canal.destaque}</span>
            </div>

            <h2>{canal.titulo}</h2>
            <p className={styles.description}>{canal.descricao}</p>

            <div className={styles.separator} />

            <span className={styles.listTitle}>VOCÊ PODERÁ TRATAR DE:</span>
            <ul>
              {canal.itens.map((item) => (
                <li key={item}>
                  <span>✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <div className={styles.status}>
              <span className={styles.statusDot} />
              Canal direto em preparação
            </div>
          </article>
        ))}
      </section>

      <section className={styles.notice}>
        <div className={styles.noticeIcon}>🔔</div>
        <div>
          <span className={styles.noticeLabel}>PRÓXIMA EVOLUÇÃO</span>
          <strong>Mensagens entre a barbearia e o Superadmin.</strong>
          <p>
            O futuro canal permitirá receber dúvidas, sugestões e relatos de
            dificuldade dentro do próprio BarbSist, sem depender de um contato
            externo fictício.
          </p>
        </div>
        <Link href="/apresentacao">Voltar ao início</Link>
      </section>
    </main>
  );
}
