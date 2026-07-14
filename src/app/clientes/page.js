"use client";

import { useEffect, useMemo, useState } from "react";

import {
  listarClientesComAssinaturas,
  criarCliente,
  excluirCliente,
  atualizarCliente,
} from "../../services/clienteService";

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [clienteEditandoId, setClienteEditandoId] = useState(null);
  const [clienteEditandoNome, setClienteEditandoNome] = useState("");
  const [filtro, setFiltro] = useState("");

  const [
  mostrarSomenteAssinantes,
  setMostrarSomenteAssinantes,
] = useState(false);

const [
  formularioAberto,
  setFormularioAberto,
] = useState(false);

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
      podeCadastrar: true,
      podeEditar: true,
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
    carregarClientes();
  }, []);

  async function carregarClientes() {
    try {
      setErro("");
      const dados = await listarClientesComAssinaturas();
      setClientes(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error("ERRO AO LISTAR CLIENTES:", error);
      setErro("Erro ao carregar clientes.");
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

    if (numeros.length <= 2) {
      return numeros;
    }

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

  async function salvarCliente() {
    limparMensagens();

    if (!permissaoAtual.podeCadastrar && !clienteEditandoId) {
      setErro("Você não tem permissão para cadastrar clientes.");
      return;
    }

    if (!permissaoAtual.podeEditar && clienteEditandoId) {
      setErro("Você não tem permissão para editar clientes.");
      return;
    }

    if (!nome.trim()) {
      setErro("Informe o nome do cliente.");
      return;
    }

    if (!telefone.trim()) {
      setErro("Informe o telefone do cliente.");
      return;
    }

    const telefoneLimpo = limparTelefone(telefone);

    if (telefoneLimpo.length < 10) {
      setErro("Informe um telefone válido com DDD.");
      return;
    }

    const clienteTelefoneDuplicado = clientes.find((cliente) => {
      const telefoneCliente = limparTelefone(cliente.telefone);

      return (
        telefoneCliente === telefoneLimpo &&
        Number(cliente.id) !== Number(clienteEditandoId)
      );
    });

    if (clienteTelefoneDuplicado) {
      setErro(
        `Já existe um cliente cadastrado com este telefone: ${clienteTelefoneDuplicado.nome}`
      );
      return;
    }

    if (email.trim()) {
      const emailNormalizado = email.trim().toLowerCase();

      const clienteEmailDuplicado = clientes.find((cliente) => {
        const emailCliente = String(cliente.email || "").trim().toLowerCase();

        return (
          emailCliente === emailNormalizado &&
          Number(cliente.id) !== Number(clienteEditandoId)
        );
      });

      if (clienteEmailDuplicado) {
        setErro(
          `Já existe um cliente cadastrado com este e-mail: ${clienteEmailDuplicado.nome}`
        );
        return;
      }
    }

    const dadosCliente = {
      nome: normalizarTexto(nome),
      telefone: formatarTelefone(telefone),
      email: email.trim().toLowerCase(),
      observacoes: normalizarTexto(observacoes),
    };

    try {
      if (clienteEditandoId) {
        await atualizarCliente(clienteEditandoId, dadosCliente);
        setMensagem("Cliente atualizado com sucesso.");
      } else {
        await criarCliente(dadosCliente);
        setMensagem("Cliente cadastrado com sucesso.");
      }

      limparFormulario();
      await carregarClientes();
    } catch (error) {
      console.error("ERRO AO SALVAR CLIENTE:", error);
      setErro("Erro ao salvar cliente.");
    }
  }

  async function removerCliente(id) {
    limparMensagens();

    if (!permissaoAtual.podeExcluir) {
      setErro("Você não tem permissão para excluir clientes.");
      return;
    }

    if (!confirm("Deseja excluir este cliente?")) return;

    try {
      await excluirCliente(id);
      setMensagem("Cliente excluído com sucesso.");
      await carregarClientes();
    } catch (error) {
      console.error("ERRO AO EXCLUIR CLIENTE:", error);
      setErro("Erro ao excluir cliente.");
    }
  }

  function prepararEdicao(cliente) {
    limparMensagens();

    if (!permissaoAtual.podeEditar) {
      setErro("Você não tem permissão para editar clientes.");
      return;
    }
    setFormularioAberto(true);
    setClienteEditandoId(cliente.id);
    setClienteEditandoNome(cliente.nome || "");
    setNome(cliente.nome || "");
    setTelefone(formatarTelefone(cliente.telefone || ""));
    setEmail(cliente.email || "");
    setObservacoes(cliente.observacoes || "");
  }

  function limparFormulario() {
    setFormularioAberto(false);
    setClienteEditandoId(null);
    setClienteEditandoNome("");
    setNome("");
    setTelefone("");
    setEmail("");
    setObservacoes("");
  }

  const clientesFiltrados = useMemo(() => {
  const termo = filtro
    .trim()
    .toLowerCase();

  return clientes
    .filter((cliente) => {
      if (
        mostrarSomenteAssinantes &&
        !cliente.possui_assinatura
      ) {
        return false;
      }

      const textoBusca = [
        cliente.nome,
        cliente.telefone,
        cliente.email,
        cliente.observacoes,
        cliente.plano_nome,
        cliente.assinatura_status,
        cliente.status_pagamento,
      ]
        .join(" ")
        .toLowerCase();

      return textoBusca.includes(termo);
    })
    .sort((a, b) =>
      (a.nome || "").localeCompare(
        b.nome || "",
        "pt-BR",
        {
          sensitivity: "base",
          numeric: true,
        }
      )
    );
}, [
  clientes,
  filtro,
  mostrarSomenteAssinantes,
]);

function formatarDataSimples(data) {
  if (!data) return "-";

  return new Date(data).toLocaleDateString(
    "pt-BR"
  );
}


function assinaturaEstaAtiva(cliente) {
  return (
    cliente.possui_assinatura &&
    cliente.assinatura_status === "ATIVO" &&
    cliente.status_pagamento === "PAGO"
  );
}


function calcularPercentualUsos(cliente) {
  const total = Number(
    cliente.quantidade_servicos_plano || 0
  );

  const restantes = Number(
    cliente.usos_disponiveis || 0
  );

  if (total <= 0) return 0;

  return Math.min(
    100,
    Math.max(
      0,
      (restantes / total) * 100
    )
  );
}

  return (
    <> 
      <div style={cabecalhoPagina}>
        <div>
          <h1 style={{ margin: 0 }}>
            Clientes
          </h1>

          <p style={subtituloPagina}>
            Gerencie seus clientes e visualize
            informações de assinatura.
          </p>
        </div>

        {permissaoAtual.podeCadastrar && (
          <button
            onClick={() => {
              limparMensagens();
              limparFormulario();
              setFormularioAberto(true);
            }}
            style={botaoNovoCliente}
          >
            + Novo Cliente
          </button>
        )}
      </div>

      <div style={resumoContainer}>
        <div style={resumoCard}>
          <p style={resumoTitulo}>
            Total de clientes
          </p>

          <h3 style={resumoValor}>
            {clientes.length}
          </h3>

          <small style={resumoDescricao}>
            Clientes cadastrados
          </small>
        </div>

        <div style={resumoCard}>
          <p style={resumoTitulo}>
            Clientes assinantes
          </p>

          <h3 style={resumoValor}>
            {
              clientes.filter(
                (cliente) =>
                  cliente.possui_assinatura
              ).length
            }
          </h3>

          <small style={resumoDescricao}>
            Com assinatura cadastrada
          </small>
        </div>

        <div style={resumoCard}>
          <p style={resumoTitulo}>
            Assinaturas ativas
          </p>

          <h3 style={resumoValor}>
            {
              clientes.filter(
                (cliente) =>
                  assinaturaEstaAtiva(cliente)
              ).length
            }
          </h3>

          <small style={resumoDescricao}>
            Ativas e com pagamento em dia
          </small>
        </div>

        <div style={resumoCard}>
          <p style={resumoTitulo}>
            Assinaturas vencidas
          </p>

          <h3 style={resumoValor}>
            {
              clientes.filter(
                (cliente) =>
                  cliente.assinatura_status ===
                    "VENCIDO" ||
                  cliente.status_pagamento ===
                    "VENCIDO" ||
                  cliente.status_pagamento ===
                    "INADIMPLENTE"
              ).length
            }
          </h3>

          <small style={resumoDescricao}>
            Necessitam regularização
          </small>
        </div>
      </div>

      {mensagem && (
        <div style={mensagemSucesso}>
          {mensagem}
        </div>
      )}

      {erro && (
        <div style={mensagemErro}>
          {erro}
        </div>
      )}

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>
          Pesquisa rápida
        </h3>

        <div style={linhaPesquisa}>
          <input
            type="text"
            placeholder={
              "🔍 Pesquisar por nome, telefone, " +
              "e-mail, plano ou status..."
            }
            value={filtro}
            onChange={(event) =>
              setFiltro(event.target.value)
            }
            style={{
              ...campo,
              marginBottom: 0,
            }}
          />

          <button
            type="button"
            onClick={() => setFiltro("")}
            style={botaoLimparFiltro}
          >
            Limpar filtro
          </button>
        </div>

        <div style={rodapePesquisa}>
          <span>
            Clientes encontrados:{" "}
            <strong>
              {clientesFiltrados.length}
            </strong>
          </span>

          <label style={filtroAssinantes}>
            <input
              type="checkbox"
              checked={mostrarSomenteAssinantes}
              onChange={(event) =>
                setMostrarSomenteAssinantes(
                  event.target.checked
                )
              }
            />

            Mostrar apenas assinantes
          </label>
        </div>
      </div>

      {clienteEditandoId && (
        <div style={faixaEdicao}>
          Editando cliente #{clienteEditandoId}:{" "}
          <strong>
            {clienteEditandoNome}
          </strong>
        </div>
      )}

      {formularioAberto &&
        (
          permissaoAtual.podeCadastrar ||
          clienteEditandoId
        ) && (
          <div
            style={
              clienteEditandoId
                ? cardEdicao
                : card
            }
          >
            <div style={cabecalhoFormulario}>
              <h3 style={{ margin: 0 }}>
                {clienteEditandoId
                  ? "Editar Cliente"
                  : "Novo Cliente"}
              </h3>

              <button
                type="button"
                onClick={limparFormulario}
                style={botaoFecharFormulario}
              >
                ✕
              </button>
            </div>

            <div style={gradeFormulario}>
              <div>
                <label style={labelCampo}>
                  Nome
                </label>

                <input
                  type="text"
                  placeholder="Nome completo"
                  value={nome}
                  onChange={(event) =>
                    setNome(
                      event.target.value.toUpperCase()
                    )
                  }
                  style={campo}
                />
              </div>

              <div>
                <label style={labelCampo}>
                  Telefone
                </label>

                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={telefone}
                  onChange={(event) =>
                    setTelefone(
                      formatarTelefone(
                        event.target.value
                      )
                    )
                  }
                  style={campo}
                />
              </div>

              <div>
                <label style={labelCampo}>
                  E-mail
                </label>

                <input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value.toLowerCase()
                    )
                  }
                  style={campo}
                />
              </div>
            </div>

      <label style={labelCampo}>
        Observações
      </label>

      <textarea
        placeholder="Observações sobre o cliente..."
        value={observacoes}
        onChange={(event) =>
          setObservacoes(
            event.target.value.toUpperCase()
          )
        }
        style={{
          ...campo,
          minHeight: "80px",
          resize: "vertical",
        }}
      />

      <div style={acoesFormulario}>
        <button
          onClick={salvarCliente}
          style={botaoAzul}
        >
          {clienteEditandoId
            ? "Atualizar Cliente"
            : "Salvar Cliente"}
        </button>

        <button
          onClick={limparFormulario}
          style={botaoCinza}
        >
          Cancelar
        </button>
      </div>
    </div>
  )}

<div style={cardTabela}>
  <div style={tituloTabela}>
    <h3 style={{ margin: 0 }}>
      Lista de Clientes
    </h3>

    <span style={{ color: "#6b7280" }}>
      {clientesFiltrados.length} registro(s)
    </span>
  </div>

  <div style={{ overflowX: "auto" }}>
    <table style={tabela}>
      <thead>
        <tr style={cabecalhoTabela}>
          <th style={th}>ID</th>
          <th style={th}>Nome</th>
          <th style={th}>Telefone</th>
          <th style={th}>E-mail</th>
          <th style={th}>Assinatura</th>
          <th style={th}>Plano</th>
          <th style={th}>Vencimento</th>
          <th style={th}>Usos restantes</th>
          <th style={th}>Ações</th>
        </tr>
      </thead>

      <tbody>
        {clientesFiltrados.length === 0 ? (
          <tr>
            <td
              colSpan="9"
              style={tdCentralizado}
            >
              Nenhum cliente encontrado.
            </td>
          </tr>
        ) : (
          clientesFiltrados.map(
            (cliente, index) => {
              const assinaturaAtiva =
                assinaturaEstaAtiva(cliente);

              const percentualUsos =
                calcularPercentualUsos(cliente);

              return (
                <tr
                  key={cliente.id}
                  style={{
                    backgroundColor:
                      assinaturaAtiva
                        ? "#f0fdf4"
                        : index % 2 === 0
                          ? "#ffffff"
                          : "#f9fafb",
                  }}
                >
                  <td style={td}>
                    {cliente.id}
                  </td>

                  <td style={td}>
                    <div style={nomeCliente}>
                      {assinaturaAtiva && (
                        <span
                          title="Assinante ativo"
                          style={estrelaAssinante}
                        >
                          ★
                        </span>
                      )}

                      <strong>
                        {cliente.nome}
                      </strong>
                    </div>

                    <div style={{ marginTop: "6px" }}>
                      {assinaturaAtiva ? (
                        <span
                          style={badgeAssinanteAtivo}
                        >
                          ASSINANTE ATIVO
                        </span>
                      ) : cliente.possui_assinatura ? (
                        <span
                          style={badgeAssinaturaInativa}
                        >
                          ASSINATURA{" "}
                          {cliente.assinatura_status ||
                            "INATIVA"}
                        </span>
                      ) : (
                        <span
                          style={badgeSemAssinatura}
                        >
                          NÃO ASSINANTE
                        </span>
                      )}
                    </div>
                  </td>

                  <td style={td}>
                    {cliente.telefone || "-"}
                  </td>

                  <td style={td}>
                    {cliente.email || "-"}
                  </td>

                  <td style={td}>
                    {cliente.possui_assinatura ? (
                      <>
                        <span
                          style={
                            assinaturaAtiva
                              ? badgeStatusAtivo
                              : badgeStatusInativo
                          }
                        >
                          {cliente.assinatura_status ||
                            "INATIVA"}
                        </span>

                        <div
                          style={{
                            marginTop: "5px",
                            fontSize: "12px",
                            color: "#6b7280",
                          }}
                        >
                          {cliente.status_pagamento ||
                            "-"}
                        </div>
                      </>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td style={td}>
                    {cliente.plano_nome || "-"}
                  </td>

                  <td style={td}>
                    {formatarDataSimples(
                      cliente.data_proximo_vencimento
                    )}
                  </td>

                  <td style={td}>
                    {cliente.possui_assinatura ? (
                      <div
                        style={{
                          minWidth: "120px",
                        }}
                      >
                        <strong>
                          {cliente.usos_disponiveis ?? 0}
                          {" / "}
                          {
                            cliente
                              .quantidade_servicos_plano ??
                            0
                          }
                        </strong>

                        <div style={barraUsosFundo}>
                          <div
                            style={{
                              ...barraUsosPreenchimento,
                              width: `${percentualUsos}%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td style={td}>
                    <div style={acoesTabela}>
                      {permissaoAtual.podeEditar && (
                        <button
                          type="button"
                          onClick={() =>
                            prepararEdicao(cliente)
                          }
                          style={botaoAmarelo}
                        >
                          Editar
                        </button>
                      )}

                      {permissaoAtual.podeExcluir && (
                        <button
                          type="button"
                          onClick={() =>
                            removerCliente(cliente.id)
                          }
                          style={botaoVermelho}
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            }
          )
        )}
      </tbody>
    </table>
  </div>

  <div style={legendaTabela}>
    <span style={estrelaAssinante}>
      ★
    </span>

    Clientes com estrela possuem assinatura ativa
    e pagamento em dia.
  </div>
</div>
</>
);
}

const cabecalhoPagina = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  marginBottom: "20px",
  flexWrap: "wrap",
};

const subtituloPagina = {
  margin: "6px 0 0",
  color: "#6b7280",
};

const botaoNovoCliente = {
  background: "#111827",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  padding: "11px 16px",
  fontWeight: "700",
  cursor: "pointer",
};

const resumoDescricao = {
  color: "#6b7280",
};

const linhaPesquisa = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: "10px",
};

const rodapePesquisa = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  flexWrap: "wrap",
  marginTop: "14px",
  color: "#4b5563",
};

const filtroAssinantes = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
};

const botaoLimparFiltro = {
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: "7px",
  padding: "10px 14px",
  cursor: "pointer",
};

const cabecalhoFormulario = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
};

const botaoFecharFormulario = {
  background: "transparent",
  border: "none",
  fontSize: "18px",
  cursor: "pointer",
  color: "#6b7280",
};

const gradeFormulario = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px",
};

const labelCampo = {
  display: "block",
  marginBottom: "6px",
  color: "#374151",
  fontSize: "14px",
  fontWeight: "600",
};

const acoesFormulario = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  flexWrap: "wrap",
};

const resumoContainer = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "15px",
  marginBottom: "20px",
};


const resumoCard = {
  background: "#ffffff",
  padding: "20px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  boxShadow:
    "0 2px 6px rgba(0, 0, 0, 0.04)",
};


const resumoTitulo = {
  margin: 0,
  marginBottom: "10px",
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "600",
};


const resumoValor = {
  margin: 0,
  color: "#111827",
  fontSize: "26px",
};


const card = {
  background: "#ffffff",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "20px",
  border: "1px solid #e5e7eb",
  boxShadow:
    "0 2px 6px rgba(0, 0, 0, 0.04)",
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

const cardTabela = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow:
    "0 2px 6px rgba(0, 0, 0, 0.04)",
};

const tituloTabela = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "18px",
  borderBottom: "1px solid #e5e7eb",
};

const cabecalhoTabela = {
  background: "#f3f4f6",
  textAlign: "left",
};

const nomeCliente = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
};

const estrelaAssinante = {
  color: "#f59e0b",
  fontSize: "18px",
};

const badgeAssinanteAtivo = {
  display: "inline-block",
  padding: "4px 7px",
  borderRadius: "999px",
  background: "#dcfce7",
  color: "#166534",
  fontSize: "10px",
  fontWeight: "700",
};

const badgeAssinaturaInativa = {
  display: "inline-block",
  padding: "4px 7px",
  borderRadius: "999px",
  background: "#fef3c7",
  color: "#92400e",
  fontSize: "10px",
  fontWeight: "700",
};

const badgeSemAssinatura = {
  display: "inline-block",
  padding: "4px 7px",
  borderRadius: "999px",
  background: "#e5e7eb",
  color: "#4b5563",
  fontSize: "10px",
  fontWeight: "700",
};

const badgeStatusAtivo = {
  display: "inline-block",
  padding: "5px 8px",
  borderRadius: "999px",
  background: "#dcfce7",
  color: "#166534",
  fontSize: "11px",
  fontWeight: "700",
};

const badgeStatusInativo = {
  display: "inline-block",
  padding: "5px 8px",
  borderRadius: "999px",
  background: "#fee2e2",
  color: "#991b1b",
  fontSize: "11px",
  fontWeight: "700",
};

const barraUsosFundo = {
  height: "7px",
  marginTop: "7px",
  borderRadius: "999px",
  background: "#e5e7eb",
  overflow: "hidden",
};

const barraUsosPreenchimento = {
  height: "100%",
  borderRadius: "999px",
  background: "#22c55e",
};

const acoesTabela = {
  display: "flex",
  gap: "6px",
  flexWrap: "wrap",
};

const legendaTabela = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "12px 18px",
  background: "#fffbeb",
  color: "#92400e",
  borderTop: "1px solid #fde68a",
  fontSize: "13px",
};