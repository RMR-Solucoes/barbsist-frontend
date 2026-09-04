"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { obterResumoPlataforma } from "@/services/adminPlataformaService";

export default function AdminPlataformaPage() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    obterResumoPlataforma()
      .then(setDados)
      .catch((e) =>
        setErro(
          e?.response?.data?.detail ||
            "Acesso negado ou erro ao carregar o resumo da plataforma."
        )
      );
  }, []);

  const areas = [
    ["Barbearias", "/admin-plataforma/barbearias", "🏪"],
    ["Planos SaaS", "/admin-plataforma/planos", "📦"],
    ["Assinaturas SaaS", "/admin-plataforma/assinaturas", "🧾"],
    ["Pagamentos", "/admin-plataforma/pagamentos", "💰"],
    ["Financeiro", "/admin-plataforma/financeiro", "\uD83D\uDCC8"],
    ["Parceiros", "/admin-plataforma/parceiros", "\uD83E\uDD1D"],
    ["Auditoria", "/admin-plataforma/auditoria", "🧭"],
    ["Mercado Pago", "/admin-plataforma/mercado-pago", "💳"],
  ];

  return (
    <main style={{ padding: 30, background: "#f8fafc", minHeight: "100vh" }}>
      <h1>Admin — Plataforma BarbSist</h1>
      <p style={{ color: "#64748b" }}>
        Administração global da plataforma SaaS.
      </p>

      {erro ? (
        <div style={{ color: "#991b1b", margin: "18px 0" }}>{erro}</div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
          gap: 14,
          margin: "24px 0",
        }}
      >
        {areas.map(([titulo, href, icone]) => (
          <Link
            key={href}
            href={href}
            style={{
              textDecoration: "none",
              color: "#0f172a",
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              padding: 18,
              boxShadow: "0 8px 22px rgba(15,23,42,.05)",
            }}
          >
            <div style={{ fontSize: 30 }}>{icone}</div>
            <strong>{titulo}</strong>
          </Link>
        ))}
      </div>

      <section
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 14,
          padding: 20,
          marginTop: 24,
          boxShadow: "0 6px 18px rgba(15,23,42,.04)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 18,
            fontSize: 20,
          }}
        >
          Resumo da plataforma
        </h2>

        {!dados ? (
          <div style={{ color: "#64748b" }}>
            Carregando resumo...
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(190px, 1fr))",
                gap: 14,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: 16,
                  background: "#f8fafc",
                }}
              >
                <div style={{ color: "#64748b" }}>
                  Barbearias
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    marginTop: 6,
                  }}
                >
                  {dados?.barbearias?.total ?? 0}
                </div>
                <div
                  style={{
                    color: "#475569",
                    fontSize: 13,
                    marginTop: 6,
                  }}
                >
                  Ativas: {dados?.barbearias?.ativas ?? 0}
                  {" | "}
                  Inativas: {dados?.barbearias?.inativas ?? 0}
                </div>
              </div>

              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: 16,
                  background: "#f8fafc",
                }}
              >
                <div style={{ color: "#64748b" }}>
                  Assinaturas SaaS
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    marginTop: 6,
                  }}
                >
                  {dados?.assinaturas_saas?.total ?? 0}
                </div>
                <div
                  style={{
                    color: "#475569",
                    fontSize: 13,
                    marginTop: 6,
                  }}
                >
                  Ativas: {dados?.assinaturas_saas?.ativas ?? 0}
                  {" | "}
                  Pendentes: {dados?.assinaturas_saas?.pendentes ?? 0}
                  {" | "}
                  Bloqueadas: {dados?.assinaturas_saas?.bloqueadas ?? 0}
                </div>
              </div>

              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: 16,
                  background: "#f8fafc",
                }}
              >
                <div style={{ color: "#64748b" }}>
                  Pagamentos aprovados
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    marginTop: 6,
                  }}
                >
                  {dados?.pagamentos_saas?.aprovados ?? 0}
                </div>
                <div
                  style={{
                    color: "#475569",
                    fontSize: 13,
                    marginTop: 6,
                  }}
                >
                  Pendentes: {dados?.pagamentos_saas?.pendentes ?? 0}
                </div>
              </div>

              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: 16,
                  background: "#f8fafc",
                }}
              >
                <div style={{ color: "#64748b" }}>
                  Receita aprovada
                </div>
                <div
                  style={{
                    fontSize: 25,
                    fontWeight: 700,
                    marginTop: 6,
                  }}
                >
                  {Number(
                    dados?.pagamentos_saas?.receita_aprovada ?? 0
                  ).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
