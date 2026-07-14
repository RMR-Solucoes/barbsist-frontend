"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    listarPlanos,
    criarPlano,
    atualizarPlano,
    inativarPlano,
    reativarPlano,
} from "@/services/planoService";

export default function PlanosPage() {
  const [planos, setPlanos] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const formularioRef = useRef(null);

  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    valor: "",
    quantidade_servicos: "",
    validade_dias: "30",
  });

  useEffect(() => {
    carregarPlanos();
  }, []);

  async function carregarPlanos() {
    try {
      const response = await listarPlanos();
      setPlanos(Array.isArray(response) ? response : []);
      setErro("");
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
      setErro("Erro ao carregar planos.");
    }
  }

  function limparFormulario() {
    setEditandoId(null);
    setMensagem("");
    setErro("");

    setForm({
      nome: "",
      descricao: "",
      valor: "",
      quantidade_servicos: "",
      validade_dias: "30",
    });
  }

  function editarPlano(plano) {
    setEditandoId(plano.id);

    setForm({
      nome: plano.nome || "",
      descricao: plano.descricao || "",
      valor: plano.valor ?? "",
      quantidade_servicos: plano.quantidade_servicos ?? "",
      validade_dias: plano.validade_dias ?? "30",
    });

    setMensagem("");
    setErro("");

    setTimeout(() => {
      formularioRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  async function alterarStatusPlano(plano) {
  try {
    if (plano.ativo) {
      if (!confirm(`Deseja inativar o plano "${plano.nome}"?`)) {
        return;
      }

      await inativarPlano(plano.id);
      setMensagem("Plano inativado com sucesso.");
    } else {
      if (!confirm(`Deseja reativar o plano "${plano.nome}"?`)) {
        return;
      }

      await reativarPlano(plano.id);
      setMensagem("Plano reativado com sucesso.");
    }

    await carregarPlanos();

  } catch (error) {
    console.error(error);
    setErro("Erro ao alterar o status do plano.");
  }
}

  async function salvarPlano(e) {
    e.preventDefault();

    setMensagem("");
    setErro("");

    if (!form.nome.trim()) {
      setErro("Informe o nome do plano.");
      return;
    }

    if (!form.valor || Number(form.valor) <= 0) {
      setErro("Informe um valor válido para o plano.");
      return;
    }

    if (!form.quantidade_servicos || Number(form.quantidade_servicos) <= 0) {
      setErro("Informe a quantidade de serviços inclusos.");
      return;
    }

    if (!form.validade_dias || Number(form.validade_dias) <= 0) {
      setErro("Informe a validade do plano em dias.");
      return;
    }

    try {
      const dadosPlano = {
        nome: form.nome.trim().toUpperCase(),
        descricao: form.descricao.trim(),
        valor: Number(form.valor),
        quantidade_servicos: Number(form.quantidade_servicos),
        validade_dias: Number(form.validade_dias),
        ativo: true,
      };

      if (editandoId) {
        await atualizarPlano(editandoId, dadosPlano);
        setMensagem("Plano atualizado com sucesso.");
      } else {
        await criarPlano(dadosPlano);
        setMensagem("Plano cadastrado com sucesso.");
      }

      limparFormulario();
      await carregarPlanos();
    } catch (error) {
      console.error("Erro ao salvar plano:", error);

      setErro(
        editandoId
          ? "Erro ao atualizar plano."
          : "Erro ao cadastrar plano."
      );
    }
  }

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function limitarTexto(texto, limite = 45) {
    if (!texto) return "Sem descrição";
    return texto.length > limite ? texto.substring(0, limite) + "..." : texto;
  }

  const planosOrdenados = useMemo(() => {
    return [...planos].sort((a, b) => Number(b.id) - Number(a.id));
  }, [planos]);

  const resumo = useMemo(() => {
    const total = planos.length;

    const ativos = planos.filter((plano) => plano.ativo).length;

    const valorMedio =
      total > 0
        ? planos.reduce((soma, plano) => soma + Number(plano.valor || 0), 0) /
          total
        : 0;

    const maiorPlano = planos.reduce((maior, plano) => {
      if (!maior) return plano;

      return Number(plano.valor || 0) > Number(maior.valor || 0)
        ? plano
        : maior;
    }, null);

    return {
      total,
      ativos,
      valorMedio,
      maiorPlano: maiorPlano?.nome || "-",
    };
  }, [planos]);

  return (
    <main style={{ padding: "30px" }}>
      <h1>Planos</h1>

      <p style={{ color: "#6b7280", marginBottom: "25px" }}>
        Cadastre, edite e consulte os planos de assinatura da barbearia.
      </p>

      {mensagem && <div style={mensagemSucesso}>{mensagem}</div>}
      {erro && <div style={mensagemErro}>{erro}</div>}

      <section style={resumoContainer}>
        <div style={resumoCard}>
          <p style={resumoTitulo}>Planos cadastrados</p>
          <h3 style={resumoValor}>{resumo.total}</h3>
        </div>

        <div style={resumoCard}>
          <p style={resumoTitulo}>Planos ativos</p>
          <h3 style={resumoValor}>{resumo.ativos}</h3>
        </div>

        <div style={resumoCard}>
          <p style={resumoTitulo}>Valor médio mensal</p>
          <h3 style={resumoValor}>{formatarMoeda(resumo.valorMedio)}</h3>
        </div>

        <div style={resumoCard}>
          <p style={resumoTitulo}>Maior plano</p>
          <h3 style={resumoValor}>{resumo.maiorPlano}</h3>
        </div>
      </section>

      <section ref={formularioRef} style={card}>
        <h2>{editandoId ? "Editar Plano" : "Novo Plano"}</h2>

        {editandoId && (
          <p style={avisoEdicao}>
            Editando o plano ID {editandoId}. Após alterar os dados, clique em
            Atualizar Plano.
          </p>
        )}

        <form onSubmit={salvarPlano}>
          <label>Nome do plano</label>
          <input
            type="text"
            placeholder="Ex: Plano Mensal Premium"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            style={campo}
          />

          <label>Descrição</label>
          <textarea
            placeholder="Ex: Inclui 4 cortes por mês com validade de 30 dias."
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            style={{ ...campo, minHeight: "80px" }}
          />

          <label>Valor do plano</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex: 89.90"
            value={form.valor}
            onChange={(e) => setForm({ ...form, valor: e.target.value })}
            style={campo}
          />

          <label>Quantidade de serviços inclusos</label>
          <input
            type="number"
            min="1"
            placeholder="Ex: 4"
            value={form.quantidade_servicos}
            onChange={(e) =>
              setForm({ ...form, quantidade_servicos: e.target.value })
            }
            style={campo}
          />

          <label>Validade do plano em dias</label>
          <input
            type="number"
            min="1"
            placeholder="Ex: 30"
            value={form.validade_dias}
            onChange={(e) =>
              setForm({ ...form, validade_dias: e.target.value })
            }
            style={campo}
          />

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button type="submit" style={botaoPrincipal}>
              {editandoId ? "Atualizar Plano" : "Salvar Plano"}
            </button>

            <button type="button" onClick={limparFormulario} style={botaoCinza}>
              {editandoId ? "Cancelar Edição" : "Limpar"}
            </button>
          </div>
        </form>
      </section>

      <section style={card}>
        <h2>Planos Cadastrados</h2>

        {planosOrdenados.length === 0 ? (
          <p style={{ color: "#6b7280" }}>Nenhum plano cadastrado.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tabela}>
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th style={th}>ID</th>
                  <th style={th}>Plano</th>
                  <th style={th}>Descrição</th>
                  <th style={thDireita}>Valor</th>
                  <th style={thCentro}>Serviços</th>
                  <th style={thCentro}>Validade</th>
                  <th style={thCentro}>Status</th>
                  <th style={thCentro}>Ações</th>
                </tr>
              </thead>

              <tbody>
                {planosOrdenados.map((plano, index) => (
                  <tr
                    key={plano.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                    }}
                  >
                    <td style={td}>{plano.id}</td>

                    <td style={td}>
                      <strong>{plano.nome}</strong>
                    </td>

                    <td style={td} title={plano.descricao || ""}>
                      {limitarTexto(plano.descricao)}
                    </td>

                    <td style={tdDireita}>{formatarMoeda(plano.valor)}/mês</td>

                    <td style={tdCentro}>{plano.quantidade_servicos}</td>

                    <td style={tdCentro}>{plano.validade_dias} dias</td>

                    <td style={tdCentro}>
                      {plano.ativo ? (
                        <span style={badgeAtivo}>Ativo</span>
                      ) : (
                        <span style={badgeInativo}>Inativo</span>
                      )}
                    </td>

                    <td style={tdCentro}>
                    <div style={acoesContainer}>
                      <button
                        type="button"
                        style={botaoEditar}
                        title="Editar plano"
                        onClick={() => editarPlano(plano)}
                      >
                        ✏
                      </button>

                      <button
                        type="button"
                        style={plano.ativo ? botaoExcluir : botaoAtivar}
                        title={plano.ativo ? "Inativar plano" : "Reativar plano"}
                        onClick={() => alterarStatusPlano(plano)}
                      >
                        {plano.ativo ? "🚫" : "✔"}
                      </button>
                    </div>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

const resumoTitulo = {
  margin: 0,
  color: "#6b7280",
  fontSize: "14px",
};

const resumoValor = {
  margin: 0,
};

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
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const card = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "20px",
  border: "1px solid #e5e7eb",
};

const avisoEdicao = {
  background: "#eff6ff",
  color: "#1d4ed8",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #bfdbfe",
  marginBottom: "15px",
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

const thDireita = {
  ...th,
  textAlign: "right",
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #e5e7eb",
  verticalAlign: "top",
};

const tdCentro = {
  ...td,
  textAlign: "center",
};

const tdDireita = {
  ...td,
  textAlign: "right",
};

const botaoPrincipal = {
  background: "#111827",
  color: "#fff",
  border: "none",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
};

const botaoCinza = {
  background: "#6b7280",
  color: "#fff",
  border: "none",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
};

const botaoPequeno = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
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

const botaoVerde = {
  background: "#16a34a",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
};

const botaoVermelho = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
};

const acoesContainer = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "8px",
};

const botaoEditar = {
  background: "#28eb25",
  color: "#ffffff",
  border: "none",
  width: "38px",
  height: "38px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const botaoExcluir = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  width: "38px",
  height: "38px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const botaoAtivar = {
  background: "#16a34a",
  color: "#fff",
  border: "none",
  width: "38px",
  height: "38px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};