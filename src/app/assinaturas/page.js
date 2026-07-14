"use client";

import { useEffect, useMemo, useState } from "react";

import { listarClientes } from "@/services/clienteService";
import { listarPlanos } from "@/services/planoService";
import {
  listarAssinaturas,
  criarAssinatura,
  renovarAssinatura,
  suspenderAssinatura,
  reativarAssinatura,
  listarPagamentosAssinatura,
  atualizarAssinatura,
} from "@/services/assinaturaService";

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

  const [modalEditar, setModalEditar] = useState(false);

  const [assinaturaEditando, setAssinaturaEditando] = useState(null);

  const [formEditar, setFormEditar] = useState({
    data_inicio: "",
    data_fim: "",
    dias_tolerancia: 5,
    usos_disponiveis: 0,
    valor_mensal: 0,
    status: "",
    status_pagamento: "",
});





  useEffect(() => {
    carregarDados();
  }, []);

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
            setErro("Erro ao renovar assinatura.");
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

        function abrirEdicao(assinatura) {

            setAssinaturaEditando(assinatura);

            setFormEditar({
                data_inicio: assinatura.data_inicio?.substring(0,10),
                data_fim: assinatura.data_fim?.substring(0,10),
                dias_tolerancia: assinatura.dias_tolerancia,
                usos_disponiveis: assinatura.usos_disponiveis,
                valor_mensal: assinatura.valor_mensal,
                status: assinatura.status,
                status_pagamento: assinatura.status_pagamento,
            });

            setModalEditar(true);
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

    async function salvarEdicaoAssinatura() {
    try {
        const dados = {
        data_inicio: formEditar.data_inicio,
        data_fim: formEditar.data_fim,
        data_proximo_vencimento: formEditar.data_fim,
        dias_tolerancia: Number(formEditar.dias_tolerancia),
        usos_disponiveis: Number(formEditar.usos_disponiveis),
        valor_mensal: Number(formEditar.valor_mensal),
        status: formEditar.status,
        status_pagamento: formEditar.status_pagamento,
        };

        await atualizarAssinatura(assinaturaEditando.id, dados);

        setMensagem("Assinatura atualizada com sucesso.");
        setErro("");
        setModalEditar(false);
        setAssinaturaEditando(null);

        await carregarDados();
    } catch (error) {
        console.error("Erro ao salvar edição:", error);
        setErro("Erro ao salvar alterações da assinatura.");
    }
    }

  const resumo = useMemo(() => {
    const total = assinaturas.length;

    const ativas = assinaturas.filter(
      (assinatura) => assinatura.status === "ATIVA"
    ).length;

    const suspensas = assinaturas.filter(
      (assinatura) => assinatura.status === "SUSPENSA"
    ).length;

    const encerradas = assinaturas.filter(
      (assinatura) => assinatura.status === "ENCERRADA"
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
                            assinatura.status === "ATIVA"
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
                                    style={itemMenu}
                                    onClick={() => {
                                        console.log("CLICOU EDITAR", assinatura);
                                        abrirEdicao(assinatura);
                                    }}
                                    >
                                    ✏ Editar
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
       
   {modalEditar && assinaturaEditando && (
  <div style={overlayModal}>
    <div style={modalGrande}>
      <div style={cabecalhoModal}>
        <h2>Editar Assinatura</h2>

        <button
          type="button"
          onClick={() => setModalEditar(false)}
          style={botaoFechar}
        >
          ✖
        </button>
      </div>

      <label>Data de início</label>
      <input
        type="date"
        value={formEditar.data_inicio}
        onChange={(e) =>
          setFormEditar({ ...formEditar, data_inicio: e.target.value })
        }
        style={campo}
      />

      <label>Vencimento</label>
      <input
        type="date"
        value={formEditar.data_fim}
        onChange={(e) =>
          setFormEditar({ ...formEditar, data_fim: e.target.value })
        }
        style={campo}
      />

      <label>Dias de tolerância</label>
      <input
        type="number"
        value={formEditar.dias_tolerancia}
        onChange={(e) =>
          setFormEditar({ ...formEditar, dias_tolerancia: e.target.value })
        }
        style={campo}
      />

      <label>Serviços disponíveis</label>
      <input
        type="number"
        value={formEditar.usos_disponiveis}
        onChange={(e) =>
          setFormEditar({ ...formEditar, usos_disponiveis: e.target.value })
        }
        style={campo}
      />

      <label>Valor mensal</label>
      <input
        type="number"
        step="0.01"
        value={formEditar.valor_mensal}
        onChange={(e) =>
          setFormEditar({ ...formEditar, valor_mensal: e.target.value })
        }
        style={campo}
      />

      <label>Status</label>
      <select
        value={formEditar.status}
        onChange={(e) =>
          setFormEditar({ ...formEditar, status: e.target.value })
        }
        style={campo}
      >
        <option value="ATIVO">ATIVO</option>
        <option value="VENCIDO">VENCIDO</option>
        <option value="SUSPENSO">SUSPENSO</option>
        <option value="INATIVO">INATIVO</option>
        <option value="ENCERRADO">ENCERRADO</option>
      </select>

      <label>Status do pagamento</label>
      <select
        value={formEditar.status_pagamento}
        onChange={(e) =>
          setFormEditar({
            ...formEditar,
            status_pagamento: e.target.value,
          })
        }
        style={campo}
      >
        <option value="PAGO">PAGO</option>
        <option value="VENCIDO">VENCIDO</option>
        <option value="PENDENTE_PAGAMENTO">PENDENTE_PAGAMENTO</option>
        <option value="INADIMPLENTE">INADIMPLENTE</option>
      </select>

      <button
        type="button"
        style={botaoPrincipal}
        onClick={salvarEdicaoAssinatura}
        >
        Salvar Alterações
        </button>
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