"use client";

import { useRouter } from "next/navigation";

export default function FinanceiroPage() {
  const router = useRouter();

  const cards = [
    ["Dashboard Financeiro", "Resumo calculado pelo backend.", "💰", "/financeiro/dashboard"],
    ["Contas a Receber", "Recebimentos, mensalidades e pendências.", "📥", "/financeiro/contas-receber"],
    ["Contas a Pagar", "Despesas, fornecedores e vencimentos.", "📤", "/financeiro/contas-pagar"],
    ["Fluxo de Caixa", "Entradas, saídas e saldo por período.", "📈", "/financeiro/fluxo-caixa"],
    ["DRE Simplificada", "Receita, despesas e resultado operacional.", "📊", "/financeiro/dre"],
    ["Mercado Pago", "Conta conectada, cobranças e configuração.", "💳", "/mercado-pago"],
    ["Pagamentos de Planos", "Histórico e inadimplência das assinaturas.", "🧾", "/financeiro/pagamentos-planos"],
  ];

  return (
    <main style={{ padding: 30 }}>
      <h1>Financeiro</h1>
      <p style={{ color: "#6b7280", marginBottom: 30 }}>
        Central financeira integrada aos endpoints consolidados do backend.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
        gap: 20
      }}>
        {cards.map(([titulo, descricao, icone, rota]) => (
          <button
            key={titulo}
            type="button"
            onClick={() => router.push(rota)}
            style={{
              textAlign: "left",
              border: "1px solid #d1d5db",
              borderRadius: 16,
              padding: 22,
              background: "#fff",
              cursor: "pointer",
              boxShadow: "0 8px 18px rgba(0,0,0,.08)",
            }}
          >
            <div style={{ fontSize: 42 }}>{icone}</div>
            <h3>{titulo}</h3>
            <p style={{ color: "#4b5563" }}>{descricao}</p>
          </button>
        ))}
      </div>
    </main>
  );
}
