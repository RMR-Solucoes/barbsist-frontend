
"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";

import {
  listarPlanosBarbSist,
  obterMinhaAssinaturaBarbSist,
  obterAdequacaoPendenteBarbSist,
  checkoutBarbSistPix,
} from "@/services/barbsistAssinaturaService";

import { Painel, moeda } from "@/components/DataView";
import { listarBarbeiros } from "@/services/barbeiroService";

function mensagemErroApi(e, fallback) {
  const detail = e?.response?.data?.detail;

  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object" && detail.mensagem) {
    return detail.mensagem;
  }

  return e?.message || fallback;
}

function dataBr(valor) {
  if (!valor) return "-";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return String(valor);
  }

  return data.toLocaleDateString("pt-BR");
}

function dataHoraBr(valor) {
  if (!valor) return "-";

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return String(valor);

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

const faixasPlanos = [
  { limite: 1, nome: "Solo", detalhe: "1 barbeiro" },
  { limite: 2, nome: "Dupla", detalhe: "2 barbeiros" },
  { limite: 5, nome: "Equipe", detalhe: "até 5 barbeiros" },
  { limite: 10, nome: "Profissional", detalhe: "até 10 barbeiros" },
];

const periodosPlanos = [
  { meses: 1, nome: "Mensal" },
  { meses: 6, nome: "Semestral" },
  { meses: 12, nome: "Anual" },
];

export default function MinhaAssinaturaPage() {
  const { usuario } = useAuth();

  const [planos, setPlanos] = useState([]);
  const [assinatura, setAssinatura] = useState(null);
  const [barbeirosAtivos, setBarbeirosAtivos] = useState([]);
  const [adequacao, setAdequacao] = useState(null);
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
        listarBarbeiros(),
        obterAdequacaoPendenteBarbSist(),
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

      if (resultados[2]?.status === "fulfilled") {
        const dadosBarbeiros = resultados[2].value;
        setBarbeirosAtivos(
          Array.isArray(dadosBarbeiros)
            ? dadosBarbeiros.filter((barbeiro) => barbeiro?.ativo !== false)
            : []
        );
      } else {
        setBarbeirosAtivos([]);
      }

      if (resultados[3]?.status === "fulfilled") {
        setAdequacao(resultados[3].value || null);
      } else {
        setAdequacao(null);
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
        mensagemErroApi(
          e,
          "Não foi possível carregar a assinatura BarbSist."
        )
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

  const catalogoAgrupado = useMemo(() => {
    const indice = new Map(
      planos.map((plano) => [
        `${Number(plano.limite_barbeiros)}:${Number(plano.periodo_meses)}`,
        plano,
      ])
    );

    return faixasPlanos.map((faixa) => ({
      ...faixa,
      periodos: periodosPlanos.map((periodo) => ({
        ...periodo,
        plano: indice.get(`${faixa.limite}:${periodo.meses}`) || null,
      })),
    }));
  }, [planos]);

  const quantidadeBarbeirosAtivos = barbeirosAtivos.length;

  function planoCompativel(plano) {
    if (!plano) return false;
    return Number(plano.limite_barbeiros || 0) >= quantidadeBarbeirosAtivos;
  }

  const menorLimiteCompativel = useMemo(() => {
    const limites = planos
      .filter((plano) =>
        Number(plano.limite_barbeiros || 0) >= quantidadeBarbeirosAtivos
      )
      .map((plano) => Number(plano.limite_barbeiros || 0))
      .filter((limite) => limite > 0);

    return limites.length ? Math.min(...limites) : null;
  }, [planos, quantidadeBarbeirosAtivos]);

  async function pagarPix(plano) {
    setErro("");
    setMensagem("");
    setPagamentoPix(null);

    if (!planoCompativel(plano)) {
      setErro(
        `Sua barbearia possui ${quantidadeBarbeirosAtivos} barbeiro(s) ativo(s). ` +
          `O plano ${plano.nome} permite até ${plano.limite_barbeiros}. ` +
          "Escolha um plano compatível com sua equipe."
      );
      return;
    }

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
        mensagemErroApi(
          e,
          "Não foi possível gerar a cobrança PIX."
        )
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
        padding: "20px 30px 30px",
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
          <h1 style={{ margin: "0 0 4px", fontSize: 22 }}>
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

      <section style={{ marginTop: 14 }}>
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
                    "repeat(4,minmax(0,1fr))",
                  columnGap: 14,
                  rowGap: 2,
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

      {adequacao ? (
        <section
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 12,
            border: "1px solid #f59e0b",
            background: "#fffbeb",
            color: "#78350f",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 16 }}>
            Adequação de plano necessária
          </div>
          <div style={{ marginTop: 7, lineHeight: 1.5 }}>
            Sua equipe possui <strong>{adequacao.quantidade_barbeiros} barbeiro(s) ativo(s)</strong>,
            acima do limite de <strong>{adequacao.limite_origem}</strong> do plano{" "}
            <strong>{adequacao.plano_origem_nome || "atual"}</strong>.
            {adequacao.plano_destino_nome ? (
              <>
                {" "}O plano compatível é <strong>{adequacao.plano_destino_nome}</strong>.
              </>
            ) : (
              <> No momento não há um plano automático compatível com o tamanho da equipe.</>
            )}
          </div>
          <div style={{ marginTop: 7, lineHeight: 1.5 }}>
            Regularize até <strong>{dataHoraBr(adequacao.prazo_regularizacao)}</strong>.
            {(
              (
                adequacao.prazo_regularizacao &&
                !Number.isNaN(new Date(adequacao.prazo_regularizacao).getTime()) &&
                new Date(adequacao.prazo_regularizacao).getTime() <= Date.now()
              ) ||
              (
                Array.isArray(adequacao.barbeiros_bloqueados) &&
                adequacao.barbeiros_bloqueados.length > 0
              )
            ) ? (
              <> O prazo de regularização expirou. Os profissionais excedentes estão temporariamente indisponíveis para novas operações até a regularização do plano.</>
            ) : (
              <> Até essa data, o profissional excedente continuará funcionando normalmente.</>
            )}
          </div>
        </section>
      ) : null}

      <section style={{ marginTop: 16 }}>
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 12,
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #bfdbfe",
            background: "#eff6ff",
            color: "#1e3a8a",
          }}
        >
          <strong>Equipe atual: {quantidadeBarbeirosAtivos} barbeiro(s) ativo(s)</strong>
          <span style={{ color: "#475569", fontSize: 13 }}>
            Planos com limite inferior à sua equipe ficam bloqueados para contratação.
          </span>
        </div>

        {carregando ? (
          <p>Carregando planos...</p>
        ) : (
          <div
            style={{
              overflowX: "auto",
              marginTop: 18,
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              background: "#fff",
            }}
          >
            <table
              style={{
                width: "100%",
                minWidth: 920,
                borderCollapse: "collapse",
                tableLayout: "fixed",
              }}
            >
              <colgroup>
                <col style={{ width: "10%" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "30%" }} />
              </colgroup>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={cabecalhoPlano}>Plano</th>
                  {periodosPlanos.map((periodo) => (
                    <th key={periodo.meses} style={cabecalhoPlano}>
                      {periodo.nome}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {catalogoAgrupado.map((faixa) => (
                  <tr key={faixa.limite}>
                    <td style={celulaPlanoNome}>
                      <strong>{faixa.nome}</strong>
                      <span
                        style={{
                          display: "block",
                          marginTop: 5,
                          color: "#64748b",
                          fontSize: 13,
                        }}
                      >
                        {faixa.detalhe}
                      </span>
                    </td>
                    {faixa.periodos.map(({ meses, plano }) => {
                      const atual = assinatura?.plano_id === plano?.id;
                      const processando = processandoPlanoId === plano?.id;
                      const compativel = plano ? planoCompativel(plano) : false;
                      const recomendado =
                        plano &&
                        compativel &&
                        Number(plano.limite_barbeiros) === menorLimiteCompativel;

                      return (
                        <td
                          key={meses}
                          style={{
                            ...celulaPlanoPreco,
                            background: atual
                              ? "#eff6ff"
                              : plano && !compativel
                              ? "#f8fafc"
                              : recomendado
                              ? "#f0fdf4"
                              : "#fff",
                          }}
                        >
                          {plano ? (
                            <>
                              {atual ? (
                                <span style={seloPlanoAtual}>PLANO ATUAL</span>
                              ) : recomendado ? (
                                <span style={seloPlanoCompativel}></span>
                              ) : null}
                              {!compativel ? (
                                <div style={avisoPlanoBloqueado}>
                                  <strong>Plano incompatível com sua equipe atual</strong>
                                  <span>
                                    Permite até {plano.limite_barbeiros} barbeiro(s); sua barbearia possui {quantidadeBarbeirosAtivos} ativo(s).
                                  </span>
                                </div>
                              ) : null}
                              <div style={formaPagamentoPlano}>
                                <strong style={{ fontSize: 24, color: "#0f172a" }}>
                                  {moeda(plano.valor_pix)}
                                </strong>
                                <span style={{ color: "#64748b", fontSize: 12, fontWeight: 700 }}>
                                  no PIX
                                </span>
                              </div>

                              <div style={formasDisponiveisPlano}>
                                <span>PIX • Cartão de crédito • Mercado Pago</span>
                                <strong style={textoParcelamento}>
                                  Parcelamento disponível no cartão e Mercado Pago
                                </strong>
                                <span style={textoCondicoes}>
                                  Consulte condições e taxas no pagamento.
                                </span>
                              </div>
                              <button
                                type="button"
                                disabled={processando || !compativel}
                                onClick={() => pagarPix(plano)}
                                style={{
                                  ...botaoPrincipal,
                                  width: "100%",
                                  marginTop: 16,
                                  padding: "14px 12px",
                                  opacity: processando || !compativel ? 0.55 : 1,
                                  cursor: !compativel ? "not-allowed" : "pointer",
                                  background: !compativel ? "#94a3b8" : "#2563eb",
                                }}
                              >
                                {!compativel
                                  ? "Indisponível para sua equipe"
                                  : processando
                                  ? "Gerando PIX..."
                                  : atual
                                  ? "Pagar/Renovar com PIX"
                                  : "Contratar com PIX"}
                              </button>
                            </>
                          ) : (
                            <span style={{ color: "#94a3b8" }}>Indisponível</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
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
        padding: "7px 0",
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: 12,
          marginBottom: 3,
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

const cabecalhoPlano = {
  padding: "14px 16px",
  borderBottom: "1px solid #cbd5e1",
  color: "#334155",
  fontSize: 14,
  fontWeight: 800,
  textAlign: "left",
};

const celulaPlanoNome = {
  minWidth: 0,
  overflowWrap: "break-word",
  padding: "24px 10px",
  borderBottom: "1px solid #e2e8f0",
  verticalAlign: "top",
};

const celulaPlanoPreco = {
  minWidth: 200,
  padding: "24px 18px",
  borderBottom: "1px solid #e2e8f0",
  verticalAlign: "top",
};

const seloPlanoAtual = {
  display: "block",
  width: "fit-content",
  marginBottom: 8,
  padding: "4px 8px",
  borderRadius: 999,
  background: "#dbeafe",
  color: "#1d4ed8",
  fontSize: 10,
  fontWeight: 800,
};

const formaPagamentoPlano = {
  display: "flex",
  alignItems: "baseline",
  gap: 6,
  flexWrap: "wrap",
};

const formasDisponiveisPlano = {
  display: "grid",
  gap: 3,
  marginTop: 14,
  color: "#475569",
  fontSize: 11,
  lineHeight: 1.35,
};

const tituloFormasPagamento = {
  color: "#334155",
  fontWeight: 800,
};

const textoParcelamento = {
  color: "#334155",
  fontSize: 11,
};

const textoCondicoes = {
  color: "#64748b",
  fontSize: 10,
};


const seloPlanoCompativel = {
  display: "block",
  width: "fit-content",
  marginBottom: 8,
  padding: "4px 8px",
  borderRadius: 999,
  background: "#dcfce7",
  color: "#166534",
  fontSize: 10,
  fontWeight: 800,
};

const avisoPlanoBloqueado = {
  display: "grid",
  gap: 4,
  marginBottom: 10,
  padding: "9px 10px",
  borderRadius: 8,
  border: "1px solid #fecaca",
  background: "#fef2f2",
  color: "#991b1b",
  fontSize: 11,
  lineHeight: 1.35,
};
