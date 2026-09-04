"use client";

import { useEffect, useState } from "react";

import {
  conectarMercadoPago,
  desconectarMercadoPago,
  listarCobrancasMercadoPago,
  obterConfiguracaoMercadoPago,
  obterStatusMercadoPago,
} from "@/services/mercadoPagoService";

import {
  Botao,
  Painel,
  moeda,
} from "@/components/DataView";


function extrairUrl(dados) {
  if (
    typeof dados === "string" &&
    dados.startsWith("http")
  ) {
    return dados;
  }

  return (
    dados?.url ||
    dados?.authorization_url ||
    dados?.oauth_url ||
    dados?.link ||
    null
  );
}


function formatarData(valor) {
  if (!valor) return "-";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return String(valor);
  }

  return data.toLocaleString("pt-BR");
}


function SimNao({ valor }) {
  const ativo = Boolean(valor);

  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 9px",
        borderRadius: 999,
        fontWeight: 700,
        fontSize: 12,
        background: ativo
          ? "#dcfce7"
          : "#fee2e2",
        color: ativo
          ? "#166534"
          : "#991b1b",
      }}
    >
      {ativo ? "SIM" : "NÃO"}
    </span>
  );
}


function StatusConta({ conectado }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "7px 11px",
        borderRadius: 999,
        fontWeight: 700,
        background: conectado
          ? "#dcfce7"
          : "#fef3c7",
        color: conectado
          ? "#166534"
          : "#92400e",
      }}
    >
      {conectado
        ? "Conta conectada"
        : "Conta não conectada"}
    </span>
  );
}


export default function MercadoPagoPage() {
  const [status, setStatus] =
    useState(null);

  const [configuracao, setConfiguracao] =
    useState(null);

  const [cobrancas, setCobrancas] =
    useState([]);

  const [erro, setErro] =
    useState("");

  const [processando, setProcessando] =
    useState(false);

  const [carregando, setCarregando] =
    useState(true);


  async function carregar() {
    setErro("");
    setCarregando(true);

    try {
      const resultados =
        await Promise.allSettled([
          obterStatusMercadoPago(),
          obterConfiguracaoMercadoPago(),
          listarCobrancasMercadoPago(),
        ]);

      if (
        resultados[0].status ===
        "fulfilled"
      ) {
        setStatus(resultados[0].value);
      }

      if (
        resultados[1].status ===
        "fulfilled"
      ) {
        setConfiguracao(
          resultados[1].value
        );
      }

      if (
        resultados[2].status ===
        "fulfilled"
      ) {
        const dados =
          resultados[2].value;

        setCobrancas(
          Array.isArray(dados)
            ? dados
            : Array.isArray(dados?.items)
              ? dados.items
              : Array.isArray(dados?.cobrancas)
                ? dados.cobrancas
                : []
        );
      }

      if (
        resultados[0].status ===
        "rejected"
      ) {
        throw resultados[0].reason;
      }
    } catch (e) {
      console.error(e);

      setErro(
        e?.response?.data?.detail ||
          "Erro ao carregar Mercado Pago."
      );
    } finally {
      setCarregando(false);
    }
  }


  useEffect(() => {
    carregar();
  }, []);


  async function conectar() {
    setProcessando(true);
    setErro("");

    try {
      const dados =
        await conectarMercadoPago();

      const url =
        extrairUrl(dados);

      if (url) {
        window.location.href = url;
      } else {
        setErro(
          "O backend respondeu, mas não retornou uma URL OAuth reconhecida."
        );
      }
    } catch (e) {
      console.error(e);

      setErro(
        e?.response?.data?.detail ||
          "Não foi possível iniciar a conexão com o Mercado Pago."
      );
    } finally {
      setProcessando(false);
    }
  }


  async function desconectar() {
    if (
      !window.confirm(
        "Desconectar a conta Mercado Pago desta barbearia?"
      )
    ) {
      return;
    }

    setProcessando(true);
    setErro("");

    try {
      await desconectarMercadoPago();
      await carregar();
    } catch (e) {
      console.error(e);

      setErro(
        e?.response?.data?.detail ||
          "Não foi possível desconectar."
      );
    } finally {
      setProcessando(false);
    }
  }


  const conectado =
    Boolean(
      status?.conectado ??
      configuracao?.conectado
    );

  const configurado =
    Boolean(
      status?.configurado ??
      configuracao?.configurado
    );

  const ativo =
    Boolean(
      status?.ativo ??
      configuracao?.ativo
    );

  const ambiente =
    status?.ambiente ??
    configuracao?.ambiente ??
    "-";

  const webhookUrl =
    status?.webhook_url ??
    configuracao?.webhook_url ??
    "-";


  return (
    <main
      style={{
        padding: 30,
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div>
          <h1>Mercado Pago</h1>

          <p
            style={{
              color: "#64748b",
            }}
          >
            Integração da barbearia para receber cobranças dos próprios clientes.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <Botao
            onClick={conectar}
            disabled={
              processando ||
              conectado
            }
          >
            Conectar
          </Botao>

          <Botao
            onClick={desconectar}
            tipo="perigo"
            disabled={
              processando ||
              !conectado
            }
          >
            Desconectar
          </Botao>

          <Botao
            onClick={carregar}
            tipo="neutro"
            disabled={carregando}
          >
            Atualizar
          </Botao>
        </div>
      </div>


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


      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: 16,
          margin: "24px 0",
        }}
      >
        <Resumo
          titulo="Situação da conta"
          conteudo={
            <StatusConta
              conectado={conectado}
            />
          }
        />

        <Resumo
          titulo="Configuração"
          conteudo={
            <SimNao
              valor={configurado}
            />
          }
        />

        <Resumo
          titulo="Integração ativa"
          conteudo={
            <SimNao
              valor={ativo}
            />
          }
        />

        <Resumo
          titulo="Ambiente"
          conteudo={
            <strong>
              {String(
                ambiente
              ).toUpperCase()}
            </strong>
          }
        />
      </div>


      <Painel titulo="Dados da integração">
        {carregando ? (
          <p>
            Carregando configuração...
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2,minmax(0,1fr))",
              gap: 0,
            }}
          >
            <Campo
              titulo="Status OAuth"
              valor={
                status?.oauth_status ??
                configuracao?.oauth_status ??
                "-"
              }
            />

            <Campo
              titulo="Usuário Mercado Pago"
              valor={
                status?.mercado_pago_user_id ??
                configuracao?.mercado_pago_user_id ??
                "-"
              }
            />

            <Campo
              titulo="Conectado em"
              valor={
                formatarData(
                  status?.conectado_em ??
                  configuracao?.conectado_em
                )
              }
            />

            <Campo
              titulo="Expiração do token"
              valor={
                formatarData(
                  status?.token_expires_at ??
                  configuracao?.token_expires_at
                )
              }
            />

            <Campo
              titulo="Access Token configurado"
              valor={
                <SimNao
                  valor={
                    status?.access_token_configurado ??
                    configuracao?.access_token_configurado
                  }
                />
              }
            />

            <Campo
              titulo="Webhook Secret configurado"
              valor={
                <SimNao
                  valor={
                    status?.webhook_secret_configurado ??
                    configuracao?.webhook_secret_configurado
                  }
                />
              }
            />

            <Campo
              titulo="Public Key"
              valor={
                status?.public_key ??
                configuracao?.public_key ??
                "-"
              }
            />

            <Campo
              titulo="Webhook"
              valor={webhookUrl}
            />
          </div>
        )}
      </Painel>


      <Painel titulo="Cobranças">
        {carregando ? (
          <p>
            Carregando cobranças...
          </p>
        ) : cobrancas.length === 0 ? (
          <p
            style={{
              color: "#64748b",
            }}
          >
            Nenhuma cobrança registrada.
          </p>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#f8fafc",
                  }}
                >
                  <Th>ID</Th>
                  <Th>Origem</Th>
                  <Th>Valor</Th>
                  <Th>Forma</Th>
                  <Th>Status</Th>
                  <Th>Data</Th>
                </tr>
              </thead>

              <tbody>
                {cobrancas.map(
                  (cobranca, indice) => (
                    <tr
                      key={
                        cobranca.id ??
                        indice
                      }
                      style={{
                        borderTop:
                          "1px solid #e2e8f0",
                      }}
                    >
                      <Td>
                        {cobranca.id ??
                          "-"}
                      </Td>

                      <Td>
                        {cobranca.origem_negocio ??
                          cobranca.origem ??
                          "-"}
                      </Td>

                      <Td forte>
                        {moeda(
                          cobranca.valor ??
                          cobranca.amount ??
                          0
                        )}
                      </Td>

                      <Td>
                        {cobranca.forma_pagamento ??
                          cobranca.tipo_pagamento ??
                          "-"}
                      </Td>

                      <Td>
                        {cobranca.status ??
                          "-"}
                      </Td>

                      <Td>
                        {formatarData(
                          cobranca.criado_em ??
                          cobranca.created_at ??
                          cobranca.data_criacao
                        )}
                      </Td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </Painel>
    </main>
  );
}


function Resumo({
  titulo,
  conteudo,
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 14,
        padding: 22,
      }}
    >
      <div
        style={{
          color: "#64748b",
          marginBottom: 10,
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          fontSize: 20,
        }}
      >
        {conteudo}
      </div>
    </div>
  );
}


function Campo({
  titulo,
  valor,
}) {
  return (
    <div
      style={{
        padding: "16px 18px",
        borderBottom:
          "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: 13,
          marginBottom: 6,
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          fontWeight: 600,
          wordBreak: "break-word",
        }}
      >
        {valor}
      </div>
    </div>
  );
}


function Th({ children }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "13px 12px",
        color: "#475569",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}


function Td({
  children,
  forte = false,
}) {
  return (
    <td
      style={{
        padding: "14px 12px",
        verticalAlign: "top",
        fontWeight:
          forte ? 700 : 400,
      }}
    >
      {children}
    </td>
  );
}
