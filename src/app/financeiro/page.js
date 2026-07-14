"use client";

import { useRouter } from "next/navigation";

export default function FinanceiroPage() {
  const router = useRouter();

  const cards = [
    {
      titulo: "Dashboard Financeiro",
      descricao: "Resumo geral de receitas, despesas e saldo.",
      icone: "💰",
      rota: "/financeiro",
    },
    {
      titulo: "Contas a Receber",
      descricao: "Controle de mensalidades, planos e recebimentos pendentes.",
      icone: "📥",
      rota: "/financeiro/contas-receber",
    },
    {
      titulo: "Contas a Pagar",
      descricao: "Controle de despesas, fornecedores e vencimentos.",
      icone: "📤",
      rota: "/financeiro/contas-pagar",
    },
    {
      titulo: "Fluxo de Caixa",
      descricao: "Entradas, saídas e saldo por período.",
      icone: "📈",
      rota: "/financeiro/fluxo-caixa",
    },
    {
      titulo: "DRE Simplificada",
      descricao: "Receita, despesas e lucro operacional.",
      icone: "📊",
      rota: "/financeiro/dre",
    },
  ];

  return (
    <main style={{ padding: "30px" }}>
      <h1>Financeiro</h1>

      <p style={{ color: "#6b7280", marginBottom: "30px" }}>
        Central financeira do BarbSist para controle de receitas, despesas,
        fluxo de caixa e indicadores.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
        }}
      >
        {cards.map((card) => (
          <button
            key={card.titulo}
            type="button"
            onClick={() => router.push(card.rota)}
            style={{
              textAlign: "left",
              border: "1px solid #d1d5db",
              borderRadius: "16px",
              padding: "22px",
              background: "linear-gradient(135deg, #ffffff, #f9fafb)",
              cursor: "pointer",
              boxShadow: "0 8px 18px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ fontSize: "42px", marginBottom: "12px" }}>
              {card.icone}
            </div>

            <h3 style={{ margin: "0 0 8px 0", color: "#111827" }}>
              {card.titulo}
            </h3>

            <p style={{ margin: 0, color: "#4b5563", lineHeight: "1.4" }}>
              {card.descricao}
            </p>
          </button>
        ))}
      </div>
    </main>
  );
}