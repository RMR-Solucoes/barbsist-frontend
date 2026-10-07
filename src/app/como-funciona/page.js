import Link from "next/link";
import styles from "./page.module.css";

const etapas = [
  {
    numero: "01",
    icone: "🏪",
    titulo: "Crie sua conta",
    texto: "Cadastre sua barbearia e inicie o período gratuito de 40 dias.",
    acao: "Você informa os dados principais da barbearia.",
    resultado: "A conta fica pronta para receber a configuração inicial.",
  },
  {
    numero: "02",
    icone: "⚙️",
    titulo: "Configure a operação",
    texto: "Cadastre serviços, profissionais, produtos e informações essenciais.",
    acao: "Você prepara o sistema de acordo com a rotina real do negócio.",
    resultado: "O BarbSist passa a refletir a estrutura da sua barbearia.",
  },
  {
    numero: "03",
    icone: "✂️",
    titulo: "Use no dia a dia",
    texto: "Organize agenda, clientes, comandas, estoque e financeiro.",
    acao: "A equipe registra a operação conforme os atendimentos acontecem.",
    resultado: "As informações ficam conectadas dentro do mesmo sistema.",
  },
  {
    numero: "04",
    icone: "📊",
    titulo: "Escolha o plano",
    texto: "Ao final do teste, escolha a opção compatível com sua equipe.",
    acao: "Você compara os planos e a quantidade de profissionais.",
    resultado: "A barbearia continua no plano adequado ao seu tamanho.",
  },
];

export default function ComoFuncionaPage() {
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
          <Link href="/contato">Contato</Link>
          <Link href="/login">Entrar</Link>
          <Link href="/cadastro" className={styles.primary}>Criar conta</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <span>COMO FUNCIONA</span>
        <h1>Do primeiro cadastro à rotina diária, em quatro passos claros.</h1>
        <p>
          O fluxo foi organizado para você entender rapidamente o que precisa fazer
          e o que acontece depois de cada etapa.
        </p>
      </section>

      <section className={styles.steps}>
        {etapas.map((etapa, index) => (
          <article className={styles.stepCard} key={etapa.numero}>
            <div className={styles.stepTop}>
              <span className={styles.number}>{etapa.numero}</span>
              <span className={styles.icon}>{etapa.icone}</span>
            </div>

            <h2>{etapa.titulo}</h2>
            <p className={styles.description}>{etapa.texto}</p>

            <div className={styles.infoBox}>
              <span>VOCÊ FAZ</span>
              <p>{etapa.acao}</p>
            </div>

            <div className={`${styles.infoBox} ${styles.resultBox}`}>
              <span>RESULTADO</span>
              <p>{etapa.resultado}</p>
            </div>

            {index < etapas.length - 1 && (
              <span className={styles.flowArrow}>→</span>
            )}
          </article>
        ))}
      </section>

      <section className={styles.trial}>
        <div className={styles.trialIcon}>🎁</div>
        <div>
          <span>40 DIAS GRÁTIS</span>
          <h2>Conheça o sistema antes de contratar.</h2>
          <p>
            Use o período de teste para entender a rotina do BarbSist e decidir
            qual plano é adequado à quantidade de profissionais da barbearia.
          </p>
        </div>
        <Link href="/apresentacao#planos">Ver planos →</Link>
      </section>
    </main>
  );
}
