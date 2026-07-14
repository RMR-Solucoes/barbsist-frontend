"use client";

import { useEffect, useMemo, useState } from "react";

import {
  listarBarbeiros,
  criarBarbeiro,
  excluirBarbeiro,
  atualizarBarbeiro,
  excluirBarbeiroDefinitivamente,
  reativarBarbeiro,
} from "../../services/barbeiroService";

export default function BarbeirosPage() {
  const [barbeiros, setBarbeiros] = useState([]);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState("ASSOCIADO");
  const [percentualComissao, setPercentualComissao] = useState("50");
  const [especialidades, setEspecialidades] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [barbeiroEditandoId, setBarbeiroEditandoId] = useState(null);
  const [barbeiroEditandoNome, setBarbeiroEditandoNome] = useState("");
  const [filtro, setFiltro] = useState("");

  const perfilUsuario = "admin";

  const permissoes = {
    admin: {
      podeCadastrar: true,
      podeEditar: true,
      podeExcluir: true,
      podeListar: true,
    },
    gerente: {
      podeCadastrar: true,
      podeEditar: true,
      podeExcluir: true,
      podeListar: true,
    },
    recepcao: {
      podeCadastrar: false,
      podeEditar: false,
      podeExcluir: false,
      podeListar: true,
    },
    barbeiro: {
      podeCadastrar: false,
      podeEditar: false,
      podeExcluir: false,
      podeListar: true,
    },
  };

  const permissaoAtual = permissoes[perfilUsuario];

  useEffect(() => {
    carregarBarbeiros();
  }, []);

  async function carregarBarbeiros() {
    try {
      setErro("");
      const dados = await listarBarbeiros();
      setBarbeiros(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error("ERRO AO LISTAR BARBEIROS:", error);
      setErro("Erro ao carregar barbeiros.");
    }
  }

  function normalizarTexto(valor) {
    return String(valor || "").trim().toUpperCase();
  }

  function limparTelefone(valor) {
    return String(valor || "").replace(/\D/g, "");
  }

  function formatarTelefone(valor) {
    const numeros = limparTelefone(valor).slice(0, 11);

    if (numeros.length <= 2) return numeros;

    if (numeros.length <= 6) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    }

    if (numeros.length <= 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(
        6
      )}`;
    }

    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(
      7
    )}`;
  }

  function limparMensagens() {
    setErro("");
    setMensagem("");
  }

  async function salvarBarbeiro() {
    limparMensagens();

    if (!permissaoAtual.podeCadastrar && !barbeiroEditandoId) {
      setErro("Você não tem permissão para cadastrar barbeiros.");
      return;
    }

    if (!permissaoAtual.podeEditar && barbeiroEditandoId) {
      setErro("Você não tem permissão para editar barbeiros.");
      return;
    }

    if (!nome.trim()) {
      setErro("Informe o nome do barbeiro.");
      return;
    }

    if (!telefone.trim()) {
      setErro("Informe o telefone do barbeiro.");
      return;
    }

    const telefoneLimpo = limparTelefone(telefone);

    if (telefoneLimpo.length < 10) {
      setErro("Informe um telefone válido com DDD.");
      return;
    }

    const comissaoNumero = Number(percentualComissao);

    if (
      percentualComissao === "" ||
      Number.isNaN(comissaoNumero) ||
      comissaoNumero < 0 ||
      comissaoNumero > 100
    ) {
      setErro("Informe uma comissão válida entre 0 e 100.");
      return;
    }

    const barbeiroTelefoneDuplicado = barbeiros.find((barbeiro) => {
      const telefoneBarbeiro = limparTelefone(barbeiro.telefone);

      return (
        telefoneBarbeiro === telefoneLimpo &&
        Number(barbeiro.id) !== Number(barbeiroEditandoId)
      );
    });

    if (barbeiroTelefoneDuplicado) {
      setErro(
        `Já existe um barbeiro cadastrado com este telefone: ${barbeiroTelefoneDuplicado.nome}`
      );
      return;
    }

    if (email.trim()) {
      const emailNormalizado = email.trim().toLowerCase();

      const barbeiroEmailDuplicado = barbeiros.find((barbeiro) => {
        const emailBarbeiro = String(barbeiro.email || "").trim().toLowerCase();

        return (
          emailBarbeiro === emailNormalizado &&
          Number(barbeiro.id) !== Number(barbeiroEditandoId)
        );
      });

      if (barbeiroEmailDuplicado) {
        setErro(
          `Já existe um barbeiro cadastrado com este e-mail: ${barbeiroEmailDuplicado.nome}`
        );
        return;
      }
    }

    const dadosBarbeiro = {
      nome: normalizarTexto(nome),
      telefone: formatarTelefone(telefone),
      email: email.trim().toLowerCase(),
      tipo: normalizarTexto(tipo),
      percentual_comissao: comissaoNumero,
      especialidades: normalizarTexto(especialidades),
      observacoes: normalizarTexto(observacoes),
    };

    try {
      if (barbeiroEditandoId) {
        await atualizarBarbeiro(barbeiroEditandoId, dadosBarbeiro);
        setMensagem("Barbeiro atualizado com sucesso.");
      } else {
        await criarBarbeiro(dadosBarbeiro);
        setMensagem("Barbeiro cadastrado com sucesso.");
      }

      limparFormulario();
      await carregarBarbeiros();
    } catch (error) {
      console.error("ERRO AO SALVAR BARBEIRO:", error);

      const detalhe = error?.response?.data?.detail;

      setErro(detalhe || "Erro ao salvar barbeiro.");
    }
  }

  async function removerBarbeiro(id) {
  limparMensagens();

  if (!permissaoAtual.podeExcluir) {
    setErro("Você não tem permissão para inativar barbeiros.");
    return;
  }

  const confirmar = confirm(
    "Deseja INATIVAR este barbeiro?\n\nEle continuará no sistema e poderá ser reativado futuramente."
  );

  if (!confirmar) return;

  try {
    await excluirBarbeiro(id);

    setMensagem(
      "Barbeiro inativado com sucesso."
    );

    await carregarBarbeiros();
  } catch (error) {
    console.error(
      "ERRO AO INATIVAR BARBEIRO:",
      error
    );

    const detalhe =
      error?.response?.data?.detail;

    setErro(
      detalhe || "Erro ao inativar barbeiro."
    );
  }
}

async function reativarBarbeiroSelecionado(id) {
  const confirmar = window.confirm("Deseja reativar este barbeiro?");

  if (!confirmar) return;

  try {
    setMensagem("");
    setErro("");

    await reativarBarbeiro(id);

    setMensagem("Barbeiro reativado com sucesso.");
    await carregarBarbeiros();
  } catch (error) {
    console.error(error);

    const detalhe =
      error?.response?.data?.detail ||
      "Erro ao reativar barbeiro.";

    setErro(detalhe);
  }
}



  async function excluirDefinitivamente(id) {
  limparMensagens();

  if (!permissaoAtual.podeExcluir) {
    setErro("Você não tem permissão para excluir barbeiros.");
    return;
  }

  const confirmar = confirm(
    "ATENÇÃO!\n\nDeseja EXCLUIR DEFINITIVAMENTE este barbeiro?\n\nEsta ação não poderá ser desfeita."
  );

  if (!confirmar) return;

  try {
    await excluirBarbeiroDefinitivamente(id);

    setMensagem(
      "Barbeiro excluído definitivamente."
    );

    await carregarBarbeiros();
  } catch (error) {
    console.error(
      "ERRO AO EXCLUIR BARBEIRO:",
      error
    );

    const detalhe =
      error?.response?.data?.detail;

    setErro(
      detalhe || "Erro ao excluir barbeiro."
    );
  }
}

  function prepararEdicao(barbeiro) {
    limparMensagens();

    if (!permissaoAtual.podeEditar) {
      setErro("Você não tem permissão para editar barbeiros.");
      return;
    }

    setBarbeiroEditandoId(barbeiro.id);
    setBarbeiroEditandoNome(barbeiro.nome || "");
    setNome(barbeiro.nome || "");
    setTelefone(formatarTelefone(barbeiro.telefone || ""));
    setEmail(barbeiro.email || "");
    setTipo(barbeiro.tipo || "ASSOCIADO");
    setPercentualComissao(String(barbeiro.percentual_comissao ?? 50));
    setEspecialidades(barbeiro.especialidades || "");
    setObservacoes(barbeiro.observacoes || "");
  }

  function limparFormulario() {
    setBarbeiroEditandoId(null);
    setBarbeiroEditandoNome("");
    setNome("");
    setTelefone("");
    setEmail("");
    setTipo("ASSOCIADO");
    setPercentualComissao("50");
    setEspecialidades("");
    setObservacoes("");
  }

  const barbeirosFiltrados = useMemo(() => {
    const termo = filtro.trim().toLowerCase();

    return barbeiros
      .filter((barbeiro) => {
        const textoBusca = [
          barbeiro.nome,
          barbeiro.telefone,
          barbeiro.email,
          barbeiro.tipo,
          barbeiro.percentual_comissao,
          barbeiro.especialidades,
          barbeiro.observacoes,
        ]
          .join(" ")
          .toLowerCase();

        return textoBusca.includes(termo);
      })
      .sort((a, b) =>
        (a.nome || "").localeCompare(b.nome || "", "pt-BR", {
          sensitivity: "base",
          numeric: true,
        })
      );
  }, [barbeiros, filtro]);

  return (
    <>
      <h1>Barbeiros</h1>

      {mensagem && <div style={mensagemSucesso}>{mensagem}</div>}
      {erro && <div style={mensagemErro}>{erro}</div>}

      <div style={card}>
        <h3>Pesquisa Rápida</h3>

        <input
          type="text"
          placeholder="🔍 Pesquisar por nome, telefone, email, tipo ou especialidade..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={campo}
        />

        <p style={{ marginTop: "10px", color: "#4b5563" }}>
          Total de barbeiros: <strong>{barbeirosFiltrados.length}</strong>
        </p>
      </div>

      {barbeiroEditandoId && (
        <div style={faixaEdicao}>
          Editando barbeiro #{barbeiroEditandoId}:{" "}
          <strong>{barbeiroEditandoNome}</strong>
        </div>
      )}

      {(permissaoAtual.podeCadastrar || barbeiroEditandoId) && (
        <div style={barbeiroEditandoId ? cardEdicao : card}>
          <h3>{barbeiroEditandoId ? "Editar Barbeiro" : "Novo Barbeiro"}</h3>

          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value.toUpperCase())}
            style={campo}
          />

          <input
            type="text"
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
            style={campo}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
            style={campo}
          />

          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value.toUpperCase())}
            style={campo}
          >
            <option value="ASSOCIADO">ASSOCIADO</option>
            <option value="FUNCIONARIO">FUNCIONÁRIO</option>
            <option value="PARCEIRO">PARCEIRO</option>
          </select>

          <input
            type="number"
            placeholder="Percentual de Comissão (%)"
            value={percentualComissao}
            min="0"
            max="100"
            onChange={(e) => setPercentualComissao(e.target.value)}
            style={campo}
          />

          <input
            type="text"
            placeholder="Especialidades"
            value={especialidades}
            onChange={(e) => setEspecialidades(e.target.value.toUpperCase())}
            style={campo}
          />

          <textarea
            placeholder="Observações"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value.toUpperCase())}
            style={{ ...campo, minHeight: "80px" }}
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={salvarBarbeiro} style={botaoAzul}>
              {barbeiroEditandoId ? "Atualizar Barbeiro" : "Salvar Barbeiro"}
            </button>

            {barbeiroEditandoId && (
              <button onClick={limparFormulario} style={botaoCinza}>
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}

      <table style={tabela}>
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            <th style={th}>ID</th>
            <th style={th}>Nome</th>
            <th style={th}>Telefone</th>
            <th style={th}>Email</th>
            <th style={th}>Tipo</th>
            <th style={th}>Comissão</th>
            <th style={th}>Status</th>
            <th style={th}>Ações</th>
          </tr>
        </thead>

        <tbody>
          {barbeirosFiltrados.length === 0 ? (
            <tr>
              <td colSpan="8" style={tdCentralizado}>
                Nenhum barbeiro encontrado.
              </td>
            </tr>
          ) : (
            barbeirosFiltrados.map((barbeiro, index) => (
              <tr
                key={barbeiro.id}
                style={{
                  backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                }}
              >
                <td style={td}>{barbeiro.id}</td>
                <td style={td}>{barbeiro.nome}</td>
                <td style={td}>{formatarTelefone(barbeiro.telefone || "")}</td>
                <td style={td}>{barbeiro.email}</td>
                <td style={td}>{barbeiro.tipo}</td>
                <td style={td}>{barbeiro.percentual_comissao}%</td>
                <td style={td}>
                  {barbeiro.ativo ? (
                    <span style={statusAtivo}>Ativo</span>
                  ) : (
                    <span style={statusInativo}>Inativo</span>
                  )}
                </td>
                <td style={td}>
                  {permissaoAtual.podeEditar && (
                    <button
                      onClick={() => prepararEdicao(barbeiro)}
                      style={botaoAmarelo}
                    >
                      Editar
                    </button>
                  )}

                  {permissaoAtual.podeExcluir && barbeiro.ativo && (
                    <button
                      onClick={() => removerBarbeiro(barbeiro.id)}
                      style={botaoVermelho}
                    >
                      Inativar
                    </button>
                  )}

                  {permissaoAtual.podeExcluir && !barbeiro.ativo && (
                    <button
                      onClick={() => reativarBarbeiroSelecionado(barbeiro.id)}
                      style={botaoVerde}
                    >
                      Reativar
                    </button>
                  )}

                  {permissaoAtual.podeExcluir && (
                    <button
                      onClick={() => excluirDefinitivamente(barbeiro.id)}
                      style={botaoVermelhoEscuro}
                    >
                      Excluir
                    </button>
                  )}
                
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}

const card = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "20px",
};

const cardEdicao = {
  background: "#fff7ed",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "20px",
  border: "2px solid #f59e0b",
};

const campo = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  border: "1px solid #d1d5db",
  borderRadius: "5px",
};

const tabela = {
  width: "100%",
  background: "white",
  borderCollapse: "collapse",
};

const th = {
  padding: "10px",
  borderBottom: "1px solid #d1d5db",
  textAlign: "left",
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #e5e7eb",
};

const tdCentralizado = {
  padding: "20px",
  textAlign: "center",
  color: "#6b7280",
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

const faixaEdicao = {
  background: "#fef3c7",
  color: "#92400e",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "15px",
  border: "1px solid #fcd34d",
};

const statusAtivo = {
  background: "#dcfce7",
  color: "#166534",
  padding: "4px 8px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "bold",
};

const statusInativo = {
  background: "#fee2e2",
  color: "#991b1b",
  padding: "4px 8px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "bold",
};

const botaoAzul = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: "5px",
  cursor: "pointer",
};

const botaoCinza = {
  background: "#6b7280",
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: "5px",
  cursor: "pointer",
};

const botaoAmarelo = {
  background: "#f59e0b",
  color: "white",
  border: "none",
  padding: "5px 10px",
  borderRadius: "5px",
  cursor: "pointer",
  marginRight: "5px",
};

const botaoVermelho = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "5px 10px",
  borderRadius: "5px",
  cursor: "pointer",
};

const botaoVermelhoEscuro = {
  background: "#7f1d1d",
  color: "white",
  border: "none",
  padding: "5px 10px",
  borderRadius: "5px",
  cursor: "pointer",
  marginLeft: "5px",
};

const botaoVerde = {
  background: "#16a34a",
  color: "white",
  border: "none",
  padding: "5px 10px",
  borderRadius: "5px",
  cursor: "pointer",
  marginLeft: "5px",
};
