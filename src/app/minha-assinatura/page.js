
"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";

import {
  listarPlanosBarbSist,
  obterMinhaAssinaturaBarbSist,
  checkoutBarbSistPix,
} from "@/services/barbsistAssinaturaService";

import { Painel, moeda } from "@/components/DataView";

function dataBr(valor) {
  if (!valor) return "-";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return String(valor);
  }

  return data.toLocaleDateString("pt-BR");
}

function statusVisual(status) {
  const valor = String(status || "").toUpperCase();

  if (
    valor === "ATIVA" ||
    valor === "ATIVO" ||
    valor === "PAGO" ||
    valor === "APROVADO"
  ) {
    return {
      background: "#dcfce7",
      color: "#166534",
    };
  }

  if (
    valor === "PENDENTE" ||
    valor === "AGUARDANDO_PAGAMENTO"
  ) {
    return {
      background: "#fef3c7",
      color: "#92400e",
    };
  }

  if (
    valor === "BLOQUEADA" ||
    valor === "BLOQUEADO" ||
    valor === "SUSPENSA" ||
    valor === "CANCELADA"
  ) {
    return {
      background: "#fee2e2",
      color: "#991b1b",
    };
  }

  return {
    background: "#e2e8f0",
    color: "#334155",
  };
}

function Badge({ valor }) {
  const estilo = statusVisual(valor);

  return (
    <span
      style={{
        ...estilo,
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      {String(valor || "-").replaceAll("_", " ")}
    </span>
  );
}

export default function MinhaAssinaturaPage() {
  const { usuario } = useAuth();

  const [planos, setPlanos] = useState([]);
  const [assinatura, setAssinatura] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [processandoPlanoId, setProcessandoPlanoId] = useState(null);
  const [pagamentoPix, setPagamentoPix] = useState(null);

  async function carregar() {
    setErro("");
    setCarregando(true);

    try {
      const resultados = await Promise.allSettled([
        listarPlanosBarbSist(),
        obterMinhaAssinaturaBarbSist(),
      ]);

      if (resultados[0].status === "fulfilled") {
        const dados = resultados[0].value;

        setPlanos(
          Array.isArray(dados)
            ? dados.filter((plano) => plano.ativo !== false)
            : []
        );
      }

      if (resultados[1].status === "fulfilled") {
        setAssinatura(resultados[1].value || null);
      }

      if (
        resultados.every(
          (resultado) => resultado.status === "rejected"
        )
      ) {
        throw new Error(
          "Não foi possível carregar os dados da assinatura."
        );
      }
    } catch (e) {
      console.error(e);

      setErro(
        e?.response?.data?.detail ||
          e?.message ||
          "Não foi possível carregar a assinatura BarbSist."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const mapaPlanos = useMemo(
    () =>
      Object.fromEntries(
        planos.map((plano) => [plano.id, plano])
      ),
    [planos]
  );

  const planoAtual =
    assinatura?.plano_id
      ? mapaPlanos[assinatura.plano_id]
      : null;

  async function pagarPix(plano) {
    setErro("");
    setMensagem("");
    setPagamentoPix(null);

    const email = String(usuario?.email || "").trim();

    if (!email) {
      setErro(
        "O usuário autenticado não possui e-mail disponível para gerar o PIX."
      );
      return;
    }

    const confirmou = window.confirm(
      `Gerar cobrança PIX para o plano "${plano.nome}" no valor de ${moeda(plano.valor_pix)}?`
    );

    if (!confirmou) return;

    setProcessandoPlanoId(plano.id);

    try {
      const resultado = await checkoutBarbSistPix({
        plano_id: plano.id,
        payer_email: email,
      });

      setPagamentoPix(resultado);
      setMensagem("Cobrança PIX gerada com sucesso.");

      await carregar();
    } catch (e) {
      console.error(e);

      setErro(
        e?.response?.data?.detail ||
          "Não foi possível gerar a cobrança PIX."
      );
    } finally {
      setProcessandoPlanoId(null);
    }
  }

  async function copiarPix() {
    const codigo = pagamentoPix?.qr_code;

    if (!codigo) return;

    try {
      await navigator.clipboard.writeText(codigo);
      setMensagem("Código PIX copiado.");
    } catch {
      setErro(
        "Não foi possível copiar o código PIX automaticamente."
      );
    }
  }

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
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ marginBottom: 6 }}>
            Minha Assinatura BarbSist
          </h1>

          <p
            style={{
              color: "#64748b",
              margin: 0,
            }}
          >
            Gerencie o plano da sua barbearia para utilização da plataforma.
          </p>
        </div>

        <button
          type="button"
          onClick={carregar}
          style={botaoSecundario}
        >
          Atualizar
        </button>
      </div>

      {erro ? (
        <div
          style={{
            background: "#fef2f2",
            color: "#991b1b",
            border: "1px solid #fecaca",
            borderRadius: 10,
            padding: 14,
            marginTop: 18,
          }}
        >
          {erro}
        </div>
      ) : null}

      {mensagem ? (
        <div
          style={{
            background: "#f0fdf4",
            color: "#166534",
            border: "1px solid #bbf7d0",
            borderRadius: 10,
            padding: 14,
            marginTop: 18,
          }}
        >
          {mensagem}
        </div>
      ) : null}

      <section style={{ marginTop: 24 }}>
        <Painel titulo="Assinatura atual">
          {carregando ? (
            <p>Carregando assinatura...</p>
          ) : !assinatura ? (
            <div
              style={{
                padding: 16,
                background: "#f8fafc",
                borderRadius: 10,
                color: "#475569",
              }}
            >
              Sua barbearia ainda não possui uma assinatura ativa do BarbSist.
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(210px,1fr))",
                  gap: 16,
                }}
              >
                <Info
                  titulo="Plano"
                  valor={
                    planoAtual?.nome ||
                    `Plano #${assinatura.plano_id}`
                  }
                />

                <Info
                  titulo="Situação"
                  valor={<Badge valor={assinatura.status} />}
                />

                <Info
                  titulo="Pagamento"
                  valor={
                    <Badge valor={assinatura.status_pagamento} />
                  }
                />

                <Info
                  titulo="Forma de pagamento"
                  valor={assinatura.forma_pagamento || "-"}
                />

                <Info
                  titulo="Início"
                  valor={dataBr(assinatura.data_inicio)}
                />

                <Info
                  titulo="Fim do período"
                  valor={dataBr(assinatura.data_fim)}
                />

                <Info
                  titulo="Próximo vencimento"
                  valor={dataBr(
                    assinatura.data_proximo_vencimento
                  )}
                />

                <Info
                  titulo="Limite de barbeiros"
                  valor={planoAtual?.limite_barbeiros ?? "-"}
                />
              </div>
              {assinatura.promocao_codigo ? (
                <div
                  style={{
                    marginTop: 18,
                    padding: 16,
                    borderRadius: 10,
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                  }}
                >
                  <strong>
                    Promoção ativa: {assinatura.promocao_codigo}
                  </strong>

                  <div
                    style={{
                      color: "#475569",
                      marginTop: 6,
                    }}
                  >
                    Período:{" "}
                    {dataBr(assinatura.promocao_inicio)} até{" "}
                    {dataBr(assinatura.promocao_fim)}
                  </div>

                  {assinatura.fundador_posicao ? (
                    <div
                      style={{
                        color: "#475569",
                        marginTop: 4,
                      }}
                    >
                      Fundador nº {assinatura.fundador_posicao}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {assinatura.motivo_bloqueio ? (
                <div
                  style={{
                    marginTop: 18,
                    padding: 16,
                    borderRadius: 10,
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#991b1b",
                  }}
                >
                  <strong>Motivo do bloqueio</strong>

                  <div style={{ marginTop: 6 }}>
                    {assinatura.motivo_bloqueio}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </Painel>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 6 }}>
          Planos disponíveis
        </h2>

        <p
          style={{
            color: "#64748b",
            marginTop: 0,
          }}
        >
          Escolha o plano mais adequado ao tamanho da sua equipe.
        </p>

        {carregando ? (
          <p>Carregando planos...</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(270px,1fr))",
              gap: 18,
              marginTop: 18,
            }}
          >
            {planos.map((plano) => {
              const atual =
                assinatura?.plano_id === plano.id;

              return (
                <div
                  key={plano.id}
                  style={{
                    background: "#fff",
                    border: atual
                      ? "2px solid #2563eb"
                      : "1px solid #e2e8f0",
                    borderRadius: 14,
                    padding: 22,
                    position: "relative",
                  }}
                >
                  {atual ? (
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        background: "#dbeafe",
                        color: "#1d4ed8",
                        padding: "5px 9px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      PLANO ATUAL
                    </div>
                  ) : null}

                  <h3
                    style={{
                      marginTop: 0,
                      marginBottom: 8,
                      paddingRight: atual ? 90 : 0,
                    }}
                  >
                    {plano.nome}
                  </h3>

                  <p
                    style={{
                      color: "#64748b",
                      minHeight: 42,
                    }}
                  >
                    {plano.descricao || "Plano BarbSist."}
                  </p>

                  <div style={{ marginTop: 18 }}>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#64748b",
                      }}
                    >
                      PIX
                    </div>

                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      {moeda(plano.valor_pix)}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      color: "#334155",
                    }}
                  >
                    Cartão:{" "}
                    <strong>
                      {moeda(plano.valor_cartao)}
                    </strong>
                  </div>

                  <div
                    style={{
                      marginTop: 7,
                      color: "#334155",
                    }}
                  >
                    Parcelamento: até{" "}
                    <strong>{plano.max_parcelas_cartao}x</strong>
                  </div>

                  <div
                    style={{
                      marginTop: 7,
                      color: "#334155",
                    }}
                  >
                    Barbeiros: até{" "}
                    <strong>{plano.limite_barbeiros}</strong>
                  </div>

                  <div
                    style={{
                      marginTop: 7,
                      color: "#334155",
                    }}
                  >
                    Período:{" "}
                    <strong>{plano.periodo_meses} mês(es)</strong>
                  </div>

                  <button
                    type="button"
                    disabled={processandoPlanoId === plano.id}
                    onClick={() => pagarPix(plano)}
                    style={{
                      ...botaoPrincipal,
                      width: "100%",
                      marginTop: 20,
                      opacity:
                        processandoPlanoId === plano.id
                          ? 0.65
                          : 1,
                    }}
                  >
                    {processandoPlanoId === plano.id
                      ? "Gerando PIX..."
                      : atual
                      ? "Pagar/Renovar com PIX"
                      : "Contratar com PIX"}
                  </button>

                  <button
                    type="button"
                    disabled
                    style={{
                      ...botaoSecundario,
                      width: "100%",
                      marginTop: 9,
                      opacity: 0.55,
                      cursor: "not-allowed",
                    }}
                  >
                    Cartão — em homologação
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {pagamentoPix ? (
        <section style={{ marginTop: 28 }}>
          <Painel titulo="Pagamento PIX">
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(260px,1fr))",
                gap: 24,
              }}
            >
              <div>
                <Info
                  titulo="Valor"
                  valor={moeda(pagamentoPix.valor)}
                />

                <Info
                  titulo="Status"
                  valor={<Badge valor={pagamentoPix.status} />}
                />

                <Info
                  titulo="Forma"
                  valor={pagamentoPix.tipo_pagamento || "PIX"}
                />

                <Info
                  titulo="E-mail"
                  valor={
                    pagamentoPix.payer_email ||
                    usuario?.email ||
                    "-"
                  }
                />
              </div>

              <div>
                {pagamentoPix.qr_code_base64 ? (
                  <img
                    src={`data:image/png;base64,${pagamentoPix.qr_code_base64}`}
                    alt="QR Code PIX"
                    style={{
                      width: 220,
                      height: 220,
                      objectFit: "contain",
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      background: "#fff",
                      padding: 10,
                    }}
                  />
                ) : null}

                {pagamentoPix.qr_code ? (
                  <div style={{ marginTop: 16 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: 13,
                        color: "#64748b",
                        marginBottom: 6,
                      }}
                    >
                      PIX Copia e Cola
                    </label>

                    <textarea
                      readOnly
                      value={pagamentoPix.qr_code}
                      rows={5}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: 10,
                        border: "1px solid #cbd5e1",
                        borderRadius: 8,
                        resize: "vertical",
                      }}
                    />

                    <button
                      type="button"
                      onClick={copiarPix}
                      style={{
                        ...botaoPrincipal,
                        marginTop: 10,
                      }}
                    >
                      Copiar código PIX
                    </button>
                  </div>
                ) : null}

                {pagamentoPix.ticket_url ? (
                  <a
                    href={pagamentoPix.ticket_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-block",
                      marginTop: 14,
                      color: "#2563eb",
                      fontWeight: 700,
                    }}
                  >
                    Abrir cobrança
                  </a>
                ) : null}
              </div>
            </div>
          </Painel>
        </section>
      ) : null}
    </main>
  );
}

function Info({ titulo, valor }) {
  return (
    <div
      style={{
        padding: "12px 0",
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: 13,
          marginBottom: 5,
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          fontWeight: 700,
          color: "#0f172a",
        }}
      >
        {valor}
      </div>
    </div>
  );
}

const botaoPrincipal = {
  border: 0,
  borderRadius: 8,
  padding: "11px 16px",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: 800,
  cursor: "pointer",
};

const botaoSecundario = {
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  padding: "10px 16px",
  background: "#ffffff",
  color: "#334155",
  fontWeight: 700,
  cursor: "pointer",
};
