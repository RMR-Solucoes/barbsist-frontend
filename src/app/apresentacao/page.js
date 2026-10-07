"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import styles from "./page.module.css";

const recursos = [
  ["📅", "Agenda inteligente", "Organize seus horários, serviços e profissionais."],
  ["👥", "Clientes e fidelização", "Histórico de atendimentos e relacionamento com seus clientes."],
  ["🧾", "Comandas e pagamentos", "Controle comandas e aceite múltiplas formas de pagamento."],
  ["📦", "Produtos e estoque", "Gerencie seu estoque de forma simples e prática."],
  ["📊", "Financeiro e relatórios", "Acompanhe receitas, despesas e resultados da sua barbearia."],
  ["👑", "Assinaturas e planos", "Gerencie planos e mensalidades dos seus clientes."],
];

const passos = [
  ["1", "🏪", "Cadastre sua barbearia", "Crie sua conta, preencha as informações e personalize seu espaço."],
  ["2", "⚙️", "Organize sua operação", "Configure serviços, profissionais, agenda, produtos e formas de pagamento."],
  ["3", "📊", "Acompanhe resultados", "Veja relatórios, evolua seu negócio e tome decisões com mais segurança."],
];

const planos = [
  {
    nome: "Solo",
    slug: "solo",
    descricao: "Ideal para barbeiros independentes.",
    mensal: "R$ 19,90",
    semestral: "R$ 99,90",
    anual: "R$ 169,90",
    itens: ["Agenda e clientes", "Comandas e pagamentos", "Produtos e estoque", "Relatórios essenciais"],
  },
  {
    nome: "Dupla",
    slug: "dupla",
    descricao: "Para pequenas barbearias.",
    mensal: "R$ 29,90",
    semestral: "R$ 149,90",
    anual: "R$ 249,90",
    itens: ["Tudo do plano Solo", "Até 2 profissionais", "Controle de equipe", "Portal do Cliente"],
  },
  {
    nome: "Equipe",
    slug: "equipe",
    descricao: "Para barbearias em crescimento.",
    mensal: "R$ 49,90",
    semestral: "R$ 249,90",
    anual: "R$ 419,90",
    destaque: true,
    itens: ["Tudo do plano Dupla", "Até 5 profissionais", "Financeiro completo", "Relatórios e indicadores"],
  },
  {
    nome: "Profissional",
    slug: "profissional",
    descricao: "Para barbearias com alta demanda.",
    mensal: "R$ 79,90",
    semestral: "R$ 399,90",
    anual: "R$ 669,90",
    itens: ["Tudo do plano Equipe", "Até 10 profissionais", "Mais capacidade", "Recursos da plataforma"],
  },
];

export default function ApresentacaoPage() {
  const [periodo, setPeriodo] = useState("mensal");

  function preco(plano) {
    if (periodo === "semestral") return plano.semestral;
    if (periodo === "anual") return plano.anual;
    return plano.mensal;
  }

  function sufixo() {
    if (periodo === "semestral") return "/6 meses";
    if (periodo === "anual") return "/ano";
    return "/mês";
  }

  return (
    <div className={styles.viewport}>
      <main className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/apresentacao" className={styles.brand}>
              <span className={styles.brandIcon}>✂</span>
              <span className={styles.brandText}>
                <strong>Barb<span>Sist</span></strong>
              </span>
            </Link>

            <nav className={styles.nav}>
              <Link href="/recursos">Recursos</Link>
              <Link href="/apresentacao#planos">Planos</Link>
              <Link href="/como-funciona">Como funciona</Link>
              <Link href="/contato">Contato</Link>
            </nav>

            <div className={styles.headerActions}>
              <Link href="/login" className={styles.loginButton}>Entrar</Link>
              <Link href="/cadastro" className={styles.createButton}>Criar conta</Link>
            </div>
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <div className={styles.heroKicker}>
              <span />
              SISTEMA COMPLETO PARA BARBEARIAS
            </div>

            <h1>
              Mais controle para
              <span>sua barbearia.</span>
            </h1>

            <h2>Gestão simples. Operação organizada.</h2>

            <p>
              O BarbSist centraliza agenda, clientes, comandas, produtos,
              estoque, financeiro, assinaturas e pagamentos em um só lugar,
              para sua barbearia crescer com mais organização e controle.
            </p>

                        <div className={styles.heroTrust}>
              <span className={styles.trustGift}>🎁</span>

              <span className={styles.trialMessage}>
                <strong>Teste grátis por 40 dias</strong>
                <small>Conheça o BarbSist antes de contratar.</small>
              </span>

              <span className={styles.trialPill}>Sem compromisso</span>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <Image
              src="/barbsist-hero-v13.jpg"
              alt="Barbearia com painel do BarbSist"
              fill
              priority
              className={styles.heroImage}
              sizes="(max-width: 900px) 100vw, 58vw"
            />
          </div>
        </section>

        <section id="recursos" className={styles.resources}>
          <div className={styles.resourcesTop}>
            <div>
              <span className={styles.kicker}>RECURSOS</span>
              <h2>Tudo que sua barbearia precisa, em um só lugar.</h2>
            </div>

            <div className={styles.resourcesAside}>
              <p>Ferramentas completas para facilitar sua rotina e acompanhar melhor o negócio.</p>
              <Link href="/recursos">Ver todos os recursos →</Link>
            </div>
          </div>

          <div className={styles.resourceGrid}>
            {recursos.map(([icone, titulo, texto]) => (
              <article key={titulo} className={styles.resourceCard}>
                <span className={styles.resourceIcon}>{icone}</span>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="como-funciona" className={styles.steps}>
          <div className={styles.stepsTitle}>
            <span className={styles.kicker}>COMO FUNCIONA</span>
            <h2>Comece em minutos e simplifique sua rotina.</h2>
          </div>

          <div className={styles.stepsGrid}>
            {passos.map(([numero, icone, titulo, texto], index) => (
              <article key={numero} className={styles.step}>
                <span className={styles.stepNumber}>{numero}</span>
                <span className={styles.stepIcon}>{icone}</span>
                <div>
                  <h3>{titulo}</h3>
                  <p>{texto}</p>
                </div>
                {index < passos.length - 1 && <span className={styles.stepArrow}>›</span>}
              </article>
            ))}
          </div>
        </section>

        <section id="planos" className={styles.plans}>
          <div className={styles.plansTop}>
            <div>
              <span className={styles.kicker}>PLANOS</span>
              <h2>Escolha o plano ideal para sua barbearia.</h2>
            </div>

            <div className={styles.planControls}>
              <span>40 dias grátis antes da contratação</span>
              <div className={styles.toggle}>
                {[
                  ["mensal", "Mensal"],
                  ["semestral", "Semestral"],
                  ["anual", "Anual"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPeriodo(value)}
                    className={periodo === value ? styles.activePeriod : ""}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.planGrid}>
            {planos.map((plano) => (
              <article
                key={plano.nome}
                className={`${styles.planCard} ${plano.destaque ? styles.featuredPlan : ""}`}
              >
                {plano.destaque && <div className={styles.featuredLabel}>★ MAIS ESCOLHIDO</div>}

                <div className={styles.planHeading}>
                  <span className={styles.planIcon}>
                    {plano.nome === "Solo" ? "👤" :
                     plano.nome === "Dupla" ? "👥" :
                     plano.nome === "Equipe" ? "👥" : "🏢"}
                  </span>
                  <div>
                    <h3>{plano.nome}</h3>
                    <p>{plano.descricao}</p>
                  </div>
                </div>

                <div className={styles.price}>
                  <strong>{preco(plano)}</strong>
                  <span>{sufixo()}</span>
                </div>

                <ul>
                  {plano.itens.map((item) => <li key={item}>✓ {item}</li>)}
                </ul>

                <Link href="/cadastro" className={styles.planButton}>
                  Começar agora
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="contato" className={styles.finalCta}>
          <span className={styles.finalIcon}>✂</span>
          <div className={styles.finalText}>
            <strong>Pronto para modernizar sua barbearia?</strong>
            <span>Crie sua conta e teste o BarbSist gratuitamente por 40 dias.</span>
          </div>

          <div className={styles.finalChecks}>
            <span>✓ 40 dias grátis</span>
            <span>✓ Sem compromisso</span>
            <span>✓ Configuração rápida</span>
          </div>
        </section>
      </main>
    </div>
  );
}
