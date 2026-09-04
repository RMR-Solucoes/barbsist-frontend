"use client";

import { useEffect, useState } from "react";
import { buscarDre } from "@/services/financeiroService";
import { moeda } from "@/components/DataView";

function dataBr(data) {
  if (!data) return "-";

  const partes = String(data).split("-");
  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export default function DrePage() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    buscarDre()
      .then(setDados)
      .catch((e) => {
        console.error(e);
        setErro(
          e?.response?.data?.detail ||
            "Erro ao carregar DRE."
        );
      });
  }, []);

  const resultado = Number(dados?.resultado ?? 0);

  return (
    <main
      style={{
        padding: 30,
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <h1>DRE Simplificada</h1>

      <p style={{ color: "#64748b" }}>
        Demonstrativo resumido das receitas, despesas e resultado da barbearia.
      </p>

      {erro ? (
        <div
          style={{
            color: "#991b1b",
            margin: "18px 0",
          }}
        >
          {erro}
        </div>
      ) : null}

      {!dados && !erro ? (
        <div
          style={{
            background: "#fff",
            padding: 24,
            borderRadius: 14,
            marginTop: 24,
          }}
        >
          Carregando demonstrativo...
        </div>
      ) : null}

      {dados ? (
        <>
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              padding: 24,
              marginTop: 24,
            }}
          >
            <div
              style={{
                color: "#64748b",
                marginBottom: 6,
              }}
            >
              Período
            </div>

            <strong>
              {dataBr(dados?.data_inicio)} a{" "}
              {dataBr(dados?.data_fim)}
            </strong>
          </div>

          <section
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              marginTop: 18,
              overflow: "hidden",
            }}
          >
            <Linha
              titulo="Receita operacional"
              valor={dados?.receita_operacional}
            />

            <Linha
              titulo="(+) Outras entradas"
              valor={dados?.outras_entradas}
            />

            <Linha
              titulo="Receitas totais"
              valor={dados?.receitas_totais}
              subtotal
            />

            <Linha
              titulo="(-) Despesas operacionais"
              valor={dados?.despesas_operacionais}
            />

            <Linha
              titulo="(-) Outras saídas"
              valor={dados?.outras_saidas}
            />

            <Linha
              titulo="Despesas totais"
              valor={dados?.despesas_totais}
              subtotal
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 20,
                padding: "24px 22px",
                background:
                  resultado >= 0
                    ? "#f0fdf4"
                    : "#fef2f2",
                borderTop: "2px solid #cbd5e1",
              }}
            >
              <strong
                style={{
                  fontSize: 20,
                }}
              >
                Resultado
              </strong>

              <strong
                style={{
                  fontSize: 26,
                  color:
                    resultado >= 0
                      ? "#166534"
                      : "#991b1b",
                }}
              >
                {moeda(resultado)}
              </strong>
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}

function Linha({
  titulo,
  valor,
  subtotal = false,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 20,
        padding: "17px 22px",
        borderTop: "1px solid #e2e8f0",
        background: subtotal
          ? "#f8fafc"
          : "#fff",
      }}
    >
      <span
        style={{
          fontWeight: subtotal ? 700 : 400,
          color: "#334155",
        }}
      >
        {titulo}
      </span>

      <span
        style={{
          fontWeight: subtotal ? 700 : 600,
          color: "#0f172a",
          whiteSpace: "nowrap",
        }}
      >
        {moeda(valor ?? 0)}
      </span>
    </div>
  );
}
