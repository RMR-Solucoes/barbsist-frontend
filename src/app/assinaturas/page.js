"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CardPayment,
  initMercadoPago,
} from "@mercadopago/sdk-react";

import { listarClientes } from "@/services/clienteService";
import { listarPlanos } from "@/services/planoService";
import {
  listarAssinaturas,
  criarAssinatura,
  renovarAssinatura,
  suspenderAssinatura,
  reativarAssinatura,
  listarPagamentosAssinatura,
  solicitarTrocaPlano,
  cancelarTrocaPlano,
} from "@/services/assinaturaService";

import {
  cobrarAssinaturaPix,
  cobrarAssinaturaCartao,
  obterConfiguracaoMercadoPago,
} from "@/services/mercadoPagoService";

// TROCA_PLANO_ETAPA6
export default function AssinaturasPage() {
  const [clientes, setClientes] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const [form, setForm] = useState({
    cliente_id: "",
    plano_id: "",
  });

  const [menuAbertoId, setMenuAbertoId] = useState(null);

  const [historicoAberto, setHistoricoAberto] = useState(false);

  const [pagamentosHistorico, setPagamentosHistorico] = useState([]);

  const [assinaturaSelecionada, setAssinaturaSelecionada] = useState(null);

  const [pixAberto, setPixAberto] = useState(false);
  const [pixCobranca, setPixCobranca] = useState(null);
  const [pixCarregando, setPixCarregando] = useState(false);

  const [cartaoAberto, setCartaoAberto] = useState(false);
  const [cartaoAssinatura, setCartaoAssinatura] = useState(null);
  const [cartaoCarregando, setCartaoCarregando] = useState(false);
  const [mercadoPagoPublicKey, setMercadoPagoPublicKey] = useState("");

  // TROCA_PLANO_ETAPA5
  const [modalTrocaPlano, setModalTrocaPlano] = useState(false);
  const [assinaturaTroca, setAssinaturaTroca] = useState(null);
  const [novoPlanoId, setNovoPlanoId] = useState("");
  const [trocaPlanoCarregando, setTrocaPlanoCarregando] = useState(false);
  useEffect(() => {
    carregarDados();
    carregarMercadoPago();
  }, []);

  async function carregarMercadoPago() {
    try {
      const configuracao = await obterConfiguracaoMercadoPago();

      const publicKey =
        configuracao?.public_key ||
        configuracao?.mercado_pago_public_key ||
        "";

      if (!publicKey) {
        return;
      }

      initMercadoPago(publicKey, {
        locale: "pt-BR",
      });

      setMercadoPagoPublicKey(publicKey);
    } catch (error) {
      console.error(
        "Erro ao carregar configuracao Mercado Pago:",
        error
      );
    }
  }

  async function carregarDados() {
  try {

    const clientesResponse = await listarClientes();
    console.log("CLIENTES:", clientesResponse);

    const planosResponse = await listarPlanos();
    console.log("PLANOS:", planosResponse);

    const assinaturasResponse = await listarAssinaturas();
    console.log("ASSINATURAS:", assinaturasResponse);

    setClientes(Array.isArray(clientesResponse) ? clientesResponse : []);
    setPlanos(Array.isArray(planosResponse) ? planosResponse : []);
    setAssinaturas(
      Array.isArray(assinaturasResponse) ? assinaturasResponse : []
    );

    setErro("");

  } catch (error) {
    console.error("ERRO COMPLETO:", error);
    setErro("Erro ao carregar dados de assinaturas.");
  }
}
  async function salvarAssinatura(e) {
    e.preventDefault();

    setMensagem("");
    setErro("");

    if (!form.cliente_id) {
      setErro("Selecione um cliente.");
      return;
    }

    if (!form.plano_id) {
      setErro("Selecione um plano.");
      return;
    }

    try {
      const dados = {
        cliente_id: Number(form.cliente_id),
        plano_id: Number(form.plano_id),
      };

      await criarAssinatura(dados);

      setMensagem("Assinatura cadastrada com sucesso.");

      setForm({
        cliente_id: "",
        plano_id: "",
      });

      await carregarDados();
    } catch (error) {
      console.error("Erro ao cadastrar assinatura:", error);
      setErro("Erro ao cadastrar assinatura.");
    }
  }

    async function renovar(assinatura) {
        if (!confirm("Deseja renovar esta assinatura?")) return;

        try {
            await renovarAssinatura(assinatura.id, {
            forma_pagamento: "PIX",
            observacoes: "Renovação realizada pelo sistema",
            });

            setMensagem("Assinatura renovada com sucesso.");
            setErro("");
            setMenuAbertoId(null);
            await carregarDados();
        } catch (error) {
            console.error(error);
            setErro(
              error?.response?.data?.detail ||
                "Erro ao renovar assinatura."
            );
        }
        }

        async function suspender(assinatura) {
        if (!confirm("Deseja suspender esta assinatura?")) return;

        try {
            await suspenderAssinatura(assinatura.id, {
            motivo: "Suspensão realizada pelo sistema",
            });

            setMensagem("Assinatura suspensa com sucesso.");
            setErro("");
            setMenuAbertoId(null);
            await carregarDados();
        } catch (error) {
            console.error(error);
            setErro("Erro ao suspender assinatura.");
        }
        }

        async function reativar(assinatura) {
        if (!confirm("Deseja reativar esta assinatura?")) return;

        try {
            await reativarAssinatura(assinatura.id, {});

            setMensagem("Assinatura reativada com sucesso.");
            setErro("");
            setMenuAbertoId(null);
            await carregarDados();
        } catch (error) {
            console.error(error);
            setErro("Erro ao reativar assinatura.");
        }
        }
        function abrirTrocaPlano(assinatura) {
            setMensagem("");
            setErro("");
            setMenuAbertoId(null);
            setAssinaturaTroca(assinatura);
            setNovoPlanoId(
              String(assinatura.plano_programado_id || assinatura.plano_id || "")
            );
            setModalTrocaPlano(true);
        }

  function formatarData(data) {
    if (!data) return "-";

    return new Date(data).toLocaleDateString("pt-BR");
  }

  function buscarNomeCliente(clienteId) {
    const cliente = clientes.find(
      (item) => Number(item.id) === Number(clienteId)
    );

    return cliente?.nome || `Cliente ${clienteId}`;
  }

  function buscarNomePlano(planoId) {
    const plano = planos.find((item) => Number(item.id) === Number(planoId));

    return plano?.nome || `Plano ${planoId}`;
  }

  function buscarValorPlano(planoId) {
    const plano = planos.find((item) => Number(item.id) === Number(planoId));
    return plano?.valor || 0;
    }

  function abrirCartao(assinatura) {
    setMensagem("");
    setErro("");
    setMenuAbertoId(null);

    if (!mercadoPagoPublicKey) {
      setErro(
        "Public Key do Mercado Pago nao esta disponivel."
      );
      return;
    }

    setCartaoAssinatura(assinatura);
    setCartaoAberto(true);
  }

  async function processarCartao(formData) {
    if (!cartaoAssinatura) {
      setErro("Assinatura nao selecionada.");
      return;
    }

    setCartaoCarregando(true);
    setMensagem("");
    setErro("");

    try {
      const cliente = clientes.find(
        (item) =>
          Number(item.id) ===
          Number(cartaoAssinatura.cliente_id)
      );

      if (!cliente?.email) {
        throw new Error(
          "Cliente sem e-mail cadastrado para pagamento com cartao."
        );
      }

      const dados = {
        token: formData.token,
        installments: Number(formData.installments || 1),
        payment_method_id:
          formData.payment_method_id,
        issuer_id: formData.issuer_id
          ? Number(formData.issuer_id)
          : null,
        payer_email: cliente.email,
      };

      const cobranca =
        await cobrarAssinaturaCartao(
          cartaoAssinatura.id,
          dados
        );

      setMensagem(
        cobranca?.status === "processed"
          ? "Pagamento com cartao aprovado."
          : "Pagamento com cartao enviado ao Mercado Pago."
      );

      setCartaoAberto(false);
      setCartaoAssinatura(null);

      await carregarDados();
    } catch (error) {
      console.error(
        "Erro ao processar pagamento com cartao:",
        error
      );

      setErro(
        error?.response?.data?.detail ||
        "Erro ao processar pagamento com cartao."
      );
    } finally {
      setCartaoCarregando(false);
    }
  }

  async function cobrarPix(assinatura) {
    setMensagem("");
    setErro("");
    setPixCarregando(true);

    try {
      const cliente = clientes.find(
        (item) =>
          Number(item.id) ===
          Number(assinatura.cliente_id)
      );

      const dados = {};

      if (cliente?.email) {
        dados.payer_email = cliente.email;
      }

      const cobranca = await cobrarAssinaturaPix(
        assinatura.id,
        dados
      );

      setPixCobranca({
        ...cobranca,
        assinatura,
      });

      setPixAberto(true);
      setMenuAbertoId(null);

      setMensagem("Cobrança PIX gerada com sucesso.");
    } catch (error) {
      console.error("Erro ao gerar cobrança PIX:", error);

      setErro(
        error?.response?.data?.detail ||
        "Erro ao gerar cobrança PIX."
      );
    } finally {
      setPixCarregando(false);
    }
  }

  async function abrirHistorico(assinatura) {
  try {

    const pagamentos =
      await listarPagamentosAssinatura(
        assinatura.id
      );

    setAssinaturaSelecionada(assinatura);

    setPagamentosHistorico(pagamentos);

    setHistoricoAberto(true);

    setMenuAbertoId(null);

  } catch (error) {

    console.error(error);

    setErro("Erro ao carregar histórico.");

  }
}
    async function confirmarTrocaPlano() {
      if (!assinaturaTroca || !novoPlanoId) {
        setErro("Selecione o novo plano.");
        return;
      }

      const planoEfetivoId =
        assinaturaTroca.plano_programado_id || assinaturaTroca.plano_id;
      if (Number(novoPlanoId) === Number(planoEfetivoId)) {
        setErro("Selecione um plano diferente do plano atual ou programado.");
        return;
      }

      try {
        setTrocaPlanoCarregando(true);
        setErro("");
        const resultado = await solicitarTrocaPlano(
          assinaturaTroca.id,
          novoPlanoId
        );

        setMensagem(
          resultado.plano_programado_id
            ? "Troca de plano programada para o proximo pagamento. Os usos atuais foram preservados."
            : "Plano alterado imediatamente. A assinatura ainda nao possuia pagamento confirmado."
        );
        setModalTrocaPlano(false);
        setAssinaturaTroca(null);
        await carregarDados();
      } catch (error) {
        console.error("Erro ao trocar plano:", error);
        setErro(
          error?.response?.data?.detail || "Erro ao solicitar troca de plano."
        );
      } finally {
        setTrocaPlanoCarregando(false);
      }
    }

    async function desfazerTrocaPlano() {
      if (!assinaturaTroca?.plano_programado_id) return;

      try {
        setTrocaPlanoCarregando(true);
        setErro("");
        await cancelarTrocaPlano(assinaturaTroca.id);
        setMensagem("Troca de plano programada cancelada.");
        setModalTrocaPlano(false);
        setAssinaturaTroca(null);
        await carregarDados();
      } catch (error) {
        console.error("Erro ao cancelar troca de plano:", error);
        setErro(
          error?.response?.data?.detail || "Erro ao cancelar troca de plano."
        );
      } finally {
        setTrocaPlanoCarregando(false);
      }
    }

  const resumo = useMemo(() => {
    const total = assinaturas.length;

    const ativas = assinaturas.filter(
      (assinatura) => String(assinatura.status).toUpperCase() === "ATIVO"
    ).length;

    const suspensas = assinaturas.filter(
      (assinatura) => String(assinatura.status).toUpperCase() === "SUSPENSO"
    ).length;

    const encerradas = assinaturas.filter(
      (assinatura) => String(assinatura.status).toUpperCase() === "ENCERRADO"
    ).length;

    return {
      total,
      ativas,
      suspensas,
      encerradas,
    };
  }, [assinaturas]);

  return (
    <main style={{ padding: "30px" }}>
      <h1>Assinaturas</h1>

      <p style={{ color: "#6b7280", marginBottom: "25px" }}>
        Cadastre e acompanhe os clientes assinantes da barbearia.
      </p>

      {mensagem && <div style={mensagemSucesso}>{mensagem}</div>}
      {erro && <div style={mensagemErro}>{erro}</div>}

      <section style={resumoContainer}>
        <div style={resumoCard}>
          <p style={resumoTitulo}>Assinaturas</p>
          <h3 style={resumoValor}>{resumo.total}</h3>
        </div>

        <div style={resumoCard}>
          <p style={resumoTitulo}>Ativas</p>
          <h3 style={resumoValor}>{resumo.ativas}</h3>
        </div>

        <div style={resumoCard}>
          <p style={resumoTitulo}>Suspensas</p>
          <h3 style={resumoValor}>{resumo.suspensas}</h3>
        </div>

        <div style={resumoCard}>
          <p style={resumoTitulo}>Encerradas</p>
          <h3 style={resumoValor}>{resumo.encerradas}</h3>
        </div>
      </section>

      <section style={card}>
        <h2>Nova Assinatura</h2>

        <form onSubmit={salvarAssinatura}>
          <label>Cliente</label>
          <select
            value={form.cliente_id}
            onChange={(e) =>
              setForm({ ...form, cliente_id: e.target.value })
            }
            style={campo}
          >
            <option value="">Selecione um cliente</option>

            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>

          <label>Plano</label>
          <select
            value={form.plano_id}
            onChange={(e) => setForm({ ...form, plano_id: e.target.value })}
            style={campo}
          >
            <option value="">Selecione um plano</option>

            {planos
              .filter((plano) => plano.ativo)
              .map((plano) => (
                <option key={plano.id} value={plano.id}>
                  {plano.nome} - {plano.quantidade_servicos} serviços
                </option>
              ))}
          </select>

          <button type="submit" style={botaoPrincipal}>
            Cadastrar Assinatura
          </button>
        </form>
      </section>

      <section style={card}>
        <h2>Assinaturas Cadastradas</h2>

        {assinaturas.length === 0 ? (
          <p style={{ color: "#6b7280" }}>Nenhuma assinatura cadastrada.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tabela}>
                <thead>
                <tr style={{ background: "#f3f4f6" }}>
                    <th style={thCentro}>ID</th>
                    <th style={th}>Cliente</th>
                    <th style={th}>Plano</th>
                    <th style={thCentro}>Valor Mensal</th>
                    <th style={thCentro}>Início</th>
                    <th style={thCentro}>Vencimento</th>
                    <th style={thCentro}>Serviços</th>
                    <th style={thCentro}>Status</th>
                    <th style={thCentro}>Pagamento</th>
                    <th style={thCentro}>Ações</th>
                    
                </tr>
                </thead>

              <tbody>
                {assinaturas.map((assinatura, index) => (
                    <tr
                    key={assinatura.id}
                    style={{
                        backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                    }}
                    >
                    <td style={tdCentro}>{assinatura.id}</td>

                    <td style={td}>
                        <strong>
                        {buscarNomeCliente(assinatura.cliente_id)}
                        </strong>
                    </td>

                    <td style={td}>
                        {buscarNomePlano(assinatura.plano_id)}
                    </td>

                    <td style={tdCentro}>
                        {Number(assinatura.valor_mensal || 0).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        })}
                    </td>

                    <td style={tdCentro}>
                        {formatarData(assinatura.data_inicio)}
                    </td>

                    <td style={tdCentro}>
                        {formatarData(assinatura.data_fim)}
                    </td>

                    <td style={tdCentro}>
                        {assinatura.usos_disponiveis ?? 0}
                    </td>

                    <td style={tdCentro}>
                        <span
                        style={
                            String(assinatura.status).toUpperCase() === "ATIVO"
                            ? badgeAtivo
                            : badgeInativo
                        }
                        >
                        {assinatura.status}
                        </span>
                    </td>

                    <td style={tdCentro}>
                        <span
                        style={
                            assinatura.status_pagamento === "PAGO"
                            ? badgeAtivo
                            : badgeInativo
                        }
                        >
                        {assinatura.status_pagamento || "PAGO"}
                        </span>
                    </td>

                    <td style={tdCentro}>
                        <div style={acoesWrapper}>
                        <button
                            type="button"
                            style={botaoMenu}
                            onClick={() =>
                            setMenuAbertoId(
                                menuAbertoId === assinatura.id
                                ? null
                                : assinatura.id
                            )
                            }
                        >
                            ⋮
                        </button>

                        {menuAbertoId === assinatura.id && (
                            <div style={menuAcoes}>
                                <button
                                    type="button"
                                    style={itemMenu}
                                    onClick={() => abrirTrocaPlano(assinatura)}
                                >
                                    Trocar plano
                                </button>

                                <button
                                    type="button"
                                    style={itemMenu}
                                    onClick={() => cobrarPix(assinatura)}
                                    disabled={pixCarregando}
                                >
                                    Cobrar via PIX
                                </button>

                                <button
                                    type="button"
                                    style={itemMenu}
                                    onClick={() => abrirCartao(assinatura)}
                                    disabled={cartaoCarregando}
                                >
                                    Cobrar com cartao
                                </button>

                                <button
                                    style={itemMenu}
                                    onClick={() => renovar(assinatura)}
                                >
                                    🔄 Renovar
                                </button>

                                {String(assinatura.status).toUpperCase() === "ATIVO" ? (
                                    <button
                                        style={itemMenu}
                                        onClick={() => suspender(assinatura)}
                                    >
                                        ⏸ Suspender
                                    </button>
                                    ) : (
                                    <button
                                        style={itemMenu}
                                        onClick={() => reativar(assinatura)}
                                    >
                                        ▶ Reativar
                                    </button>
                                    )}

                                <button
                                    style={itemMenu}
                                    onClick={() => abrirHistorico(assinatura)}
                                >
                                    📜 Histórico
                                </button>
                                </div>
                        )}
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        )}
      </section>

      {
historicoAberto && (

<div style={overlayModal}>

    <div style={modalGrande}>

        <div style={cabecalhoModal}>

            <h2>

                Histórico de Pagamentos

            </h2>

            <button
                onClick={() => setHistoricoAberto(false)}
                style={botaoFechar}
            >

                ✖

            </button>

        </div>

        <table style={tabela}>

            <thead>

                <tr>

                    <th style={th}>Data</th>
                    <th style={th}>Valor</th>
                    <th style={th}>Forma</th>
                    <th style={th}>Status</th>

                </tr>

            </thead>

            <tbody>

                {
                pagamentosHistorico.map((p) => (

                    <tr key={p.id}>

                        <td style={td}>
                            {formatarData(p.data_pagamento)}
                        </td>

                        <td style={td}>
                            R$ {Number(p.valor).toFixed(2)}
                        </td>

                        <td style={td}>
                            {p.forma_pagamento}
                        </td>

                        <td style={td}>
                            {p.status}
                        </td>

                    </tr>

                ))
                }

                {
                pagamentosHistorico.length === 0 && (

                    <tr>

                        <td
                            style={tdCentro}
                            colSpan={4}
                        >

                            Nenhum pagamento registrado.

                        </td>

                    </tr>

                )
                }

            </tbody>

        </table>

    </div>

</div>

)
}
       
   {modalTrocaPlano && assinaturaTroca && (
  <div style={overlayModal}>
    <div style={modalGrande}>
      <div style={cabecalhoModal}>
        <h2>Trocar plano</h2>
        <button
          type="button"
          onClick={() => {
            setModalTrocaPlano(false);
            setAssinaturaTroca(null);
          }}
          style={botaoFechar}
          disabled={trocaPlanoCarregando}
        >
          X
        </button>
      </div>

      <p>
        <strong>Cliente:</strong>{" "}
        {buscarNomeCliente(assinaturaTroca.cliente_id)}
      </p>
      <p>
        <strong>Plano atual:</strong>{" "}
        {buscarNomePlano(assinaturaTroca.plano_id)}
      </p>

      {assinaturaTroca.plano_programado_id && (
        <p style={{ color: "#b45309", fontWeight: 600 }}>
          Troca programada: {buscarNomePlano(assinaturaTroca.plano_programado_id)}
        </p>
      )}

      <label>Novo plano</label>
      <select
        value={novoPlanoId}
        onChange={(e) => setNovoPlanoId(e.target.value)}
        style={campo}
        disabled={trocaPlanoCarregando}
      >
        <option value="">Selecione</option>
        {planos
          .filter((plano) => plano.ativo !== false)
          .map((plano) => (
            <option key={plano.id} value={plano.id}>
              {plano.nome} - {Number(plano.valor || 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </option>
          ))}
      </select>

      <p style={{ marginTop: 12, color: "#555" }}>
        Se a assinatura ja possui pagamento confirmado, a troca sera aplicada
        somente no proximo pagamento. Os usos e o plano atual permanecem
        inalterados ate a confirmacao.
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          style={botaoPrincipal}
          onClick={confirmarTrocaPlano}
          disabled={trocaPlanoCarregando}
        >
          {trocaPlanoCarregando ? "Processando..." : "Confirmar troca"}
        </button>

        {assinaturaTroca.plano_programado_id && (
          <button
            type="button"
            style={itemMenu}
            onClick={desfazerTrocaPlano}
            disabled={trocaPlanoCarregando}
          >
            Cancelar troca programada
          </button>
        )}
      </div>
    </div>
  </div>
)}

      {cartaoAberto && cartaoAssinatura && (
        <div style={overlayModal}>
          <div style={modalGrande}>
            <div style={cabecalhoModal}>
              <h2>Pagamento com cartão</h2>

              <button
                type="button"
                onClick={() => {
                  setCartaoAberto(false);
                  setCartaoAssinatura(null);
                }}
                style={botaoFechar}
              >
                ✕
              </button>
            </div>

            <p>
              <strong>Cliente:</strong>{" "}
              {buscarNomeCliente(
                cartaoAssinatura.cliente_id
              )}
            </p>

            <p>
              <strong>Plano:</strong>{" "}
              {buscarNomePlano(
                (cartaoAssinatura.plano_programado_id || cartaoAssinatura.plano_id)
              )}
            </p>

            {mercadoPagoPublicKey ? (
              <CardPayment
                initialization={{
                  amount: Number(
                    planos.find(
                      (plano) =>
                        Number(plano.id) ===
                        Number(
                          (cartaoAssinatura.plano_programado_id || cartaoAssinatura.plano_id)
                        )
                    )?.valor_cartao ??
                    planos.find(
                      (plano) =>
                        Number(plano.id) ===
                        Number(
                          (cartaoAssinatura.plano_programado_id || cartaoAssinatura.plano_id)
                        )
                    )?.valor ??
                    cartaoAssinatura.valor_mensal ??
                    0
                  ),
                }}
                customization={{
                  paymentMethods: {
                    minInstallments: 1,
                    maxInstallments: Number(
                      planos.find(
                        (plano) =>
                          Number(plano.id) ===
                          Number(
                            (cartaoAssinatura.plano_programado_id || cartaoAssinatura.plano_id)
                          )
                      )?.max_parcelas_cartao ?? 1
                    ),
                  },
                }}
                onSubmit={processarCartao}
                onReady={() => {
                  console.log(
                    "CardPayment Mercado Pago pronto."
                  );
                }}
                onError={(error) => {
                  console.error(
                    "Erro CardPayment Mercado Pago:",
                    error
                  );
                  setErro(
                    "Erro ao carregar pagamento com cartao."
                  );
                }}
              />
            ) : (
              <p>
                Carregando Mercado Pago...
              </p>
            )}
          </div>
        </div>
      )}

      {pixAberto && pixCobranca && (
        <div style={overlayModal}>
          <div style={modalGrande}>
            <div style={cabecalhoModal}>
              <h2>Pagamento via PIX</h2>

              <button
                type="button"
                onClick={() => {
                  setPixAberto(false);
                  setPixCobranca(null);
                }}
                style={botaoFechar}
              >
                X
              </button>
            </div>

            <p>
              <strong>Cliente:</strong>{" "}
              {buscarNomeCliente(
                pixCobranca.assinatura.cliente_id
              )}
            </p>

            <p>
              <strong>Plano:</strong>{" "}
              {buscarNomePlano(
                (pixCobranca.assinatura.plano_programado_id || pixCobranca.assinatura.plano_id)
              )}
            </p>

            {pixCobranca.qr_code_base64 && (
              <div
                style={{
                  textAlign: "center",
                  margin: "20px 0",
                }}
              >
                <img
                  src={`data:image/png;base64,${pixCobranca.qr_code_base64}`}
                  alt="QR Code PIX"
                  style={{
                    width: 260,
                    maxWidth: "100%",
                  }}
                />
              </div>
            )}

            {pixCobranca.qr_code && (
              <>
                <label>PIX Copia e Cola</label>

                <textarea
                  readOnly
                  value={pixCobranca.qr_code}
                  style={{
                    ...campo,
                    minHeight: 110,
                  }}
                />

                <button
                  type="button"
                  style={botaoPrincipal}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        pixCobranca.qr_code
                      );
                      setMensagem("Código PIX copiado.");
                    } catch {
                      setErro(
                        "Não foi possível copiar o código PIX."
                      );
                    }
                  }}
                >
                  Copiar PIX
                </button>
              </>
            )}

            {pixCobranca.ticket_url && (
              <p style={{ marginTop: 20 }}>
                <a
                  href={pixCobranca.ticket_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir pagamento no Mercado Pago
                </a>
              </p>
            )}
          </div>
        </div>
      )}

    </main>
  );
}

const resumoContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "15px",
  marginBottom: "20px",
};

const resumoCard = {
  background: "white",
  padding: "18px",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
};

const resumoTitulo = {
  margin: 0,
  color: "#6b7280",
  fontSize: "14px",
};

const resumoValor = {
  margin: 0,
};

const card = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "20px",
  border: "1px solid #e5e7eb",
};

const campo = {
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  marginBottom: "15px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "15px",
};

const tabela = {
  width: "100%",
  minWidth: "850px",
  background: "white",
  borderCollapse: "collapse",
};

const th = {
  padding: "10px",
  borderBottom: "1px solid #d1d5db",
  textAlign: "left",
};

const thCentro = {
  ...th,
  textAlign: "center",
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #e5e7eb",
};

const tdCentro = {
  ...td,
  textAlign: "center",
};

const botaoPrincipal = {
  background: "#111827",
  color: "#fff",
  border: "none",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
};

const mensagemSucesso = {
  background: "#dcfce7",
  color: "#166534",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "15px",
  border: "1px solid #86efac",
};

const mensagemErro = {
  background: "#fee2e2",
  color: "#991b1b",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "15px",
  border: "1px solid #fecaca",
};

const badgeAtivo = {
  background: "#dcfce7",
  color: "#166534",
  padding: "4px 8px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: "bold",
};

const badgeInativo = {
  background: "#fee2e2",
  color: "#991b1b",
  padding: "4px 8px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: "bold",
};

const acoesWrapper = {
  position: "relative",
  display: "flex",
  justifyContent: "center",
};

const botaoMenu = {
  background: "#111827",
  color: "#fff",
  border: "none",
  width: "36px",
  height: "36px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "22px",
  lineHeight: "1",
};

const menuAcoes = {
  position: "absolute",
  top: "42px",
  right: "0",
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  boxShadow: "0 10px 20px rgba(0,0,0,0.12)",
  minWidth: "170px",
  zIndex: 20,
  overflow: "hidden",
};

const itemMenu = {
  display: "block",
  width: "100%",
  padding: "10px 12px",
  border: "none",
  background: "#fff",
  textAlign: "left",
  cursor: "pointer",
  fontSize: "14px",
};

const overlayModal = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.35)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
};

const modalGrande = {
    background: "#fff",
    width: "900px",
    maxWidth: "95%",
    borderRadius: 10,
    padding: 25,
};

const cabecalhoModal = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
};

const botaoFechar = {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 22,
};