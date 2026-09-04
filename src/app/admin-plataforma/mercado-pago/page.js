"use client";

import { useEffect, useState } from "react";

import {
  obterStatusMercadoPagoPlataforma,
} from "@/services/adminPlataformaService";

const estilos = {
  pagina: {
    padding: 30,
    background: "#f8fafc",
    minHeight: "100vh",
  },

  subtitulo: {
    color: "#64748b",
    marginTop: 6,
  },

  cards: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    margin: "26px 0",
  },

  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 15,
    padding: 20,
    boxShadow:
      "0 6px 18px rgba(15,23,42,.04)",
  },

  cardTitulo: {
    color: "#64748b",
    marginBottom: 12,
    fontSize: 15,
  },

  cardValor: {
    fontSize: 18,
    fontWeight: 700,
  },

  statusOk: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#dcfce7",
    color: "#166534",
    fontWeight: 700,
  },

  statusErro: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#fee2e2",
    color: "#991b1b",
    fontWeight: 700,
  },

  painel: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 15,
    padding: 22,
    marginTop: 18,
    boxShadow:
      "0 6px 18px rgba(15,23,42,.04)",
  },

  linha: {
    display: "grid",
    gridTemplateColumns:
      "minmax(220px, 1fr) minmax(250px, 2fr)",
    gap: 18,
    padding: "15px 0",
    borderBottom: "1px solid #f1f5f9",
    alignItems: "center",
  },

  rotulo: {
    color: "#475569",
    fontWeight: 600,
  },

  valor: {
    color: "#0f172a",
    wordBreak: "break-all",
  },

  avisoOk: {
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },

  avisoErro: {
    background: "#fff7ed",
    color: "#9a3412",
    border: "1px solid #fed7aa",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },

  erro: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: 10,
    padding: 13,
    margin: "18px 0",
  },

  carregando: {
    padding: 30,
    color: "#64748b",
    textAlign: "center",
  },
};

function Status({ ok }) {
  return (
    <span
      style={
        ok
          ? estilos.statusOk
          : estilos.statusErro
      }
    >
      {ok ? "CONFIGURADO" : "NAO CONFIGURADO"}
    </span>
  );
}

export default function Page() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] =
    useState(true);

  async function carregar() {
    setCarregando(true);
    setErro("");

    try {
      const resposta =
        await obterStatusMercadoPagoPlataforma();

      setDados(resposta || {});
    } catch (e) {
      setErro(
        e?.response?.data?.detail ||
          "Erro ao carregar o status do Mercado Pago."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const pronto =
    Boolean(dados?.pronto_para_cobranca);

  return (
    <main style={estilos.pagina}>
      <h1>Mercado Pago da Plataforma</h1>

      <p style={estilos.subtitulo}>
        Status da integra&ccedil;&atilde;o de pagamentos
        utilizada nas assinaturas SaaS do BarbSist.
      </p>

      {erro ? (
        <div style={estilos.erro}>
          {erro}
        </div>
      ) : null}

      {carregando ? (
        <div style={estilos.carregando}>
          Carregando configura&ccedil;&atilde;o...
        </div>
      ) : (
        <>
          <section style={estilos.cards}>
            <div style={estilos.card}>
              <div style={estilos.cardTitulo}>
                Access Token
              </div>

              <div style={estilos.cardValor}>
                <Status
                  ok={
                    dados?.access_token_configurado
                  }
                />
              </div>
            </div>

            <div style={estilos.card}>
              <div style={estilos.cardTitulo}>
                Public Key
              </div>

              <div style={estilos.cardValor}>
                <Status
                  ok={
                    dados?.public_key_configurada
                  }
                />
              </div>
            </div>

            <div style={estilos.card}>
              <div style={estilos.cardTitulo}>
                Webhook Secret
              </div>

              <div style={estilos.cardValor}>
                <Status
                  ok={
                    dados?.webhook_secret_configurado
                  }
                />
              </div>
            </div>

            <div style={estilos.card}>
              <div style={estilos.cardTitulo}>
                Cobran&ccedil;a da plataforma
              </div>

              <div style={estilos.cardValor}>
                <span
                  style={
                    pronto
                      ? estilos.statusOk
                      : estilos.statusErro
                  }
                >
                  {pronto
                    ? "PRONTA"
                    : "NAO PRONTA"}
                </span>
              </div>
            </div>
          </section>

          <section style={estilos.painel}>
            <h2
              style={{
                marginTop: 0,
                fontSize: 20,
              }}
            >
              Configura&ccedil;&atilde;o operacional
            </h2>

            <div style={estilos.linha}>
              <div style={estilos.rotulo}>
                Access Token
              </div>

              <div style={estilos.valor}>
                <Status
                  ok={
                    dados?.access_token_configurado
                  }
                />
              </div>
            </div>

            <div style={estilos.linha}>
              <div style={estilos.rotulo}>
                Public Key
              </div>

              <div style={estilos.valor}>
                <Status
                  ok={
                    dados?.public_key_configurada
                  }
                />
              </div>
            </div>

            <div style={estilos.linha}>
              <div style={estilos.rotulo}>
                Webhook Secret
              </div>

              <div style={estilos.valor}>
                <Status
                  ok={
                    dados?.webhook_secret_configurado
                  }
                />
              </div>
            </div>

            <div style={estilos.linha}>
              <div style={estilos.rotulo}>
                URL do webhook
              </div>

              <div style={estilos.valor}>
                {dados?.webhook_url || "-"}
              </div>
            </div>

            <div style={estilos.linha}>
              <div style={estilos.rotulo}>
                Status geral
              </div>

              <div style={estilos.valor}>
                <span
                  style={
                    pronto
                      ? estilos.statusOk
                      : estilos.statusErro
                  }
                >
                  {pronto
                    ? "PRONTO PARA COBRANCA"
                    : "CONFIGURACAO INCOMPLETA"}
                </span>
              </div>
            </div>

            <div
              style={
                pronto
                  ? estilos.avisoOk
                  : estilos.avisoErro
              }
            >
              {pronto ? (
                <>
                  A integra&ccedil;&atilde;o da plataforma
                  est&aacute; pronta para processar
                  cobran&ccedil;as.
                </>
              ) : (
                <>
                  A integra&ccedil;&atilde;o ainda possui
                  configura&ccedil;&otilde;es pendentes.
                  Complete as credenciais necess&aacute;rias
                  antes de utilizar cobran&ccedil;as reais.
                </>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
