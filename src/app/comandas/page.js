"use client";

import { useEffect, useMemo, useState } from "react";

import {
  listarComandas,
  criarComanda,
  buscarComanda,
  adicionarServicoComanda,
  adicionarProdutoComanda,
  consultarAssinaturaComanda,
  usarPlanoNoItem,
  fecharComanda,
} from "@/services/comandaService";

import { listarServicos } from "@/services/servicoService";
import { listarProdutos } from "@/services/produtoService";
import { listarClientes } from "@/services/clienteService";
import { listarBarbeiros } from "@/services/barbeiroService";


export default function ComandasPage() {
  const [comandas, setComandas] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);

  const [novoClienteId, setNovoClienteId] = useState("");
  const [novoBarbeiroId, setNovoBarbeiroId] = useState("");
  const [abrindoComanda, setAbrindoComanda] = useState(false);

  const [
    comandaSelecionada,
    setComandaSelecionada,
  ] = useState(null);

  const [
    assinaturaComanda,
    setAssinaturaComanda,
  ] = useState(null);

  const [
    carregandoAssinatura,
    setCarregandoAssinatura,
  ] = useState(false);

  const [
    usandoPlanoItemId,
    setUsandoPlanoItemId,
  ] = useState(null);

  const [servicoId, setServicoId] = useState("");
  const [produtoId, setProdutoId] = useState("");

  const [
    quantidadeServico,
    setQuantidadeServico,
  ] = useState(1);

  const [
    quantidadeProduto,
    setQuantidadeProduto,
  ] = useState(1);

  const [
    formaPagamento,
    setFormaPagamento,
  ] = useState("pix");

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);


  useEffect(() => {
    carregarDadosIniciais();
  }, []);


  function obterDetalheErro(error, mensagemPadrao) {
    return (
      error?.response?.data?.detail ||
      mensagemPadrao
    );
  }


  async function carregarDadosIniciais() {
    try {
      setErro("");
      setCarregando(true);

      const dadosComandas = await listarComandas();
      setComandas(dadosComandas || []);

      const dadosServicos = await listarServicos();
      setServicos(dadosServicos || []);

      const dadosClientes = await listarClientes();
      setClientes(
        Array.isArray(dadosClientes)
          ? dadosClientes
          : []
      );

      const dadosBarbeiros = await listarBarbeiros();
      setBarbeiros(
        Array.isArray(dadosBarbeiros)
          ? dadosBarbeiros
          : []
      );

      try {
        const dadosProdutos = await listarProdutos();
        setProdutos(dadosProdutos || []);
      } catch (errorProdutos) {
        console.warn(
          "Produtos não carregados:",
          errorProdutos
        );

        setProdutos([]);

        setErro(
          "Comandas e serviços carregados. " +
          "Produtos não carregados por falta de permissão."
        );
      }
    } catch (error) {
      console.error(error);

      setErro(
        obterDetalheErro(
          error,
          "Erro ao carregar dados da tela de comandas."
        )
      );
    } finally {
      setCarregando(false);
    }
  }


  async function carregarComandas() {
    try {
      const dados = await listarComandas();
      setComandas(dados || []);
    } catch (error) {
      console.error(error);

      setErro(
        obterDetalheErro(
          error,
          "Erro ao carregar comandas."
        )
      );
    }
  }


  async function abrirNovaComanda() {
    try {
      setErro("");
      setMensagem("");
      setAbrindoComanda(true);

      const novaComanda = await criarComanda({
        cliente_id: novoClienteId
          ? Number(novoClienteId)
          : null,
        barbeiro_id: novoBarbeiroId
          ? Number(novoBarbeiroId)
          : null,
      });

      setNovoClienteId("");
      setNovoBarbeiroId("");

      await carregarComandas();
      await selecionarComanda(novaComanda.id);

      setMensagem(
        `Comanda #${novaComanda.id} aberta com sucesso.`
      );
    } catch (error) {
      console.error(error);

      setErro(
        obterDetalheErro(
          error,
          "Erro ao abrir nova comanda."
        )
      );
    } finally {
      setAbrindoComanda(false);
    }
  }


  async function carregarAssinaturaComanda(
    comandaId,
    mostrarErro = true
  ) {
    if (!comandaId) {
      setAssinaturaComanda(null);
      return;
    }

    try {
      setCarregandoAssinatura(true);

      const dados = await consultarAssinaturaComanda(
        comandaId
      );

      setAssinaturaComanda(dados);
    } catch (error) {
      console.error(error);
      setAssinaturaComanda(null);

      if (mostrarErro) {
        setErro(
          obterDetalheErro(
            error,
            "Erro ao consultar a assinatura do cliente."
          )
        );
      }
    } finally {
      setCarregandoAssinatura(false);
    }
  }


  async function selecionarComanda(id) {
    try {
      setErro("");
      setMensagem("");
      setAssinaturaComanda(null);

      const dados = await buscarComanda(id);

      setComandaSelecionada(dados);

      setServicoId("");
      setProdutoId("");
      setQuantidadeServico(1);
      setQuantidadeProduto(1);
      setFormaPagamento("pix");

      await carregarAssinaturaComanda(
        id,
        false
      );
    } catch (error) {
      console.error(error);

      setErro(
        obterDetalheErro(
          error,
          "Erro ao buscar detalhes da comanda."
        )
      );
    }
  }


  async function atualizarComandaSelecionada(
    comandaId = comandaSelecionada?.id
  ) {
    if (!comandaId) return;

    const dados = await buscarComanda(comandaId);
    setComandaSelecionada(dados);
  }


  async function atualizarFluxoComanda(
    comandaId = comandaSelecionada?.id
  ) {
    if (!comandaId) return;

    await Promise.all([
      atualizarComandaSelecionada(comandaId),
      carregarComandas(),
      carregarAssinaturaComanda(
        comandaId,
        false
      ),
    ]);
  }


  async function adicionarServico() {
    if (!comandaSelecionada) {
      setErro("Selecione uma comanda.");
      return;
    }

    if (!servicoId) {
      setErro("Selecione um serviço.");
      return;
    }

    const quantidade = Number(
      quantidadeServico || 1
    );

    if (quantidade <= 0) {
      setErro(
        "A quantidade do serviço deve ser maior que zero."
      );

      return;
    }

    try {
      setErro("");
      setMensagem("");

      await adicionarServicoComanda(
        comandaSelecionada.id,
        {
          servico_id: Number(servicoId),
          quantidade,
        }
      );

      setMensagem(
        "Serviço adicionado à comanda."
      );

      await atualizarFluxoComanda(
        comandaSelecionada.id
      );

      setServicoId("");
      setQuantidadeServico(1);
    } catch (error) {
      console.error(error);

      setErro(
        obterDetalheErro(
          error,
          "Erro ao adicionar serviço na comanda."
        )
      );
    }
  }


  async function adicionarProduto() {
    if (!comandaSelecionada) {
      setErro("Selecione uma comanda.");
      return;
    }

    if (!produtoId) {
      setErro("Selecione um produto.");
      return;
    }

    const quantidade = Number(
      quantidadeProduto || 1
    );

    if (quantidade <= 0) {
      setErro(
        "A quantidade do produto deve ser maior que zero."
      );

      return;
    }

    try {
      setErro("");
      setMensagem("");
      await adicionarProdutoComanda(
        comandaSelecionada.id,
        {
          produto_id: Number(produtoId),
          quantidade,
        }
      );

      setMensagem(
        "Produto adicionado à comanda."
      );

      await atualizarFluxoComanda(
        comandaSelecionada.id
      );

      setProdutoId("");
      setQuantidadeProduto(1);
    } catch (error) {
      console.error(error);

      setErro(
        obterDetalheErro(
          error,
          "Erro ao adicionar produto. Verifique o estoque."
        )
      );
    }
  }


  async function utilizarPlanoNoItem(item) {
    if (!comandaSelecionada) {
      setErro("Selecione uma comanda.");
      return;
    }

    const assinatura =
      assinaturaComanda?.assinatura;

    if (!assinatura?.id) {
      setErro(
        "Não foi encontrada uma assinatura válida."
      );

      return;
    }

    if (!assinaturaComanda?.pode_usar_plano) {
      setErro(
        assinaturaComanda?.motivo ||
        "O plano não está disponível para uso."
      );

      return;
    }

    if (item.tipo !== "servico") {
      setErro(
        "Somente serviços podem ser utilizados pelo plano."
      );

      return;
    }

    if (item.quantidade !== 1) {
      setErro(
        "O serviço deve possuir quantidade 1 para utilizar o plano."
      );

      return;
    }

    if (item.pago_com_plano) {
      setErro(
        "Este serviço já foi utilizado pelo plano."
      );

      return;
    }

    const confirmar = window.confirm(
      `Deseja utilizar um uso do plano no serviço "${item.descricao}"?`
    );

    if (!confirmar) return;

    try {
      setErro("");
      setMensagem("");
      setUsandoPlanoItemId(item.id);

      const resultado = await usarPlanoNoItem(
        comandaSelecionada.id,
        item.id,
        assinatura.id
      );

      setMensagem(
        resultado?.mensagem ||
        "Serviço utilizado pelo plano com sucesso."
      );

      await atualizarFluxoComanda(
        comandaSelecionada.id
      );
    } catch (error) {
      console.error(error);

      setErro(
        obterDetalheErro(
          error,
          "Erro ao utilizar o plano neste serviço."
        )
      );
    } finally {
      setUsandoPlanoItemId(null);
    }
  }

  async function utilizarPlanoNosItensElegiveis() {
  if (!comandaSelecionada) {
    setErro("Selecione uma comanda.");
    return;
  }

  const assinatura = assinaturaComanda?.assinatura;

  if (!assinatura?.id) {
    setErro("Não foi encontrada uma assinatura válida.");
    return;
  }

  if (!assinaturaComanda?.pode_usar_plano) {
    setErro(
      assinaturaComanda?.motivo ||
        "O plano não está disponível para uso."
    );
    return;
  }

  const servicosPermitidosIds =
  assinatura.servicos_permitidos_ids || [];

  const itensElegiveis =
    comandaSelecionada.itens?.filter(
      (item) =>
        item.tipo === "servico" &&
        !item.pago_com_plano &&
        item.quantidade === 1 &&
        servicosPermitidosIds.includes(
          Number(item.servico_id)
        )
    ) || [];

  if (itensElegiveis.length === 0) {
    setErro(
      "Não existem serviços elegíveis para uso do plano."
    );
    return;
  }

  const quantidadeUsos = Number(
    assinatura.usos_disponiveis || 0
  );

  const itensQueReceberaoPlano = itensElegiveis.slice(
    0,
    quantidadeUsos
  );

  if (itensQueReceberaoPlano.length === 0) {
    setErro("O plano não possui usos disponíveis.");
    return;
  }

  const confirmar = window.confirm(
    `Deseja utilizar o plano em ${
      itensQueReceberaoPlano.length
    } serviço(s) elegível(is)?`
  );

  if (!confirmar) return;

  try {
    setErro("");
    setMensagem("");
    setUsandoPlanoItemId("todos");

    for (const item of itensQueReceberaoPlano) {
      await usarPlanoNoItem(
        comandaSelecionada.id,
        item.id,
        assinatura.id
      );
    }

    setMensagem(
      `${itensQueReceberaoPlano.length} serviço(s) utilizado(s) pelo plano.`
    );

    await atualizarFluxoComanda(
      comandaSelecionada.id
    );
  } catch (error) {
    console.error(error);

    setErro(
      obterDetalheErro(
        error,
        "Erro ao utilizar o plano nos serviços."
      )
    );

    await atualizarFluxoComanda(
      comandaSelecionada.id
    );
  } finally {
    setUsandoPlanoItemId(null);
  }
}


  async function fecharComandaSelecionada() {
    if (!comandaSelecionada) {
      setErro("Selecione uma comanda.");
      return;
    }

    if (comandaSelecionada.status !== "aberta") {
      setErro("Esta comanda já está fechada.");
      return;
    }

    const confirmar = window.confirm(
      `Deseja fechar a comanda #${comandaSelecionada.id} ` +
      `no valor de ${formatarMoeda(
        comandaSelecionada.total
      )}?`
    );

    if (!confirmar) return;

    try {
      setErro("");
      setMensagem("");

      const resultado = await fecharComanda(
        comandaSelecionada.id,
        {
          forma_pagamento: formaPagamento,
        }
      );

      setMensagem(
        resultado?.mensagem ||
        "Comanda fechada com sucesso."
      );

      await carregarComandas();

      const atualizada = await buscarComanda(
        comandaSelecionada.id
      );

      setComandaSelecionada(atualizada);

      await carregarAssinaturaComanda(
        comandaSelecionada.id,
        false
      );
    } catch (error) {
      console.error(error);

      setErro(
        obterDetalheErro(
          error,
          "Erro ao fechar comanda."
        )
      );
    }
  }


  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
  }


  function formatarData(data) {
    if (!data) return "-";

    return new Date(data).toLocaleString(
      "pt-BR",
      {
        dateStyle: "short",
        timeStyle: "short",
      }
    );
  }


  function formatarPagamento(valor) {
    if (!valor) return "-";

    return valor
      .replaceAll("_", " ")
      .toUpperCase();
  }


  const resumo = useMemo(() => {
    const abertas = comandas.filter(
      (comanda) => comanda.status === "aberta"
    );

    const fechadas = comandas.filter(
      (comanda) => comanda.status === "fechada"
    );

    const totalAberto = abertas.reduce(
      (soma, comanda) =>
        soma + Number(comanda.total || 0),
      0
    );

    const totalFechado = fechadas.reduce(
      (soma, comanda) =>
        soma + Number(comanda.total || 0),
      0
    );

    return {
      abertas: abertas.length,
      fechadas: fechadas.length,
      totalAberto,
      totalFechado,
    };
  }, [comandas]);


  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
  };


  const buttonStyle = {
    background: "#111827",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  };


  const dangerButtonStyle = {
    ...buttonStyle,
    background: "#dc2626",
  };


  const cardStyle = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "18px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
  };


  const assinatura = assinaturaComanda?.assinatura;


  return (
    <main
      style={{
        padding: "30px",
        background: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ marginBottom: "5px" }}>
        Comandas
      </h1>

      <p
        style={{
          marginBottom: "25px",
          color: "#4b5563",
        }}
      >
        Atendimentos e vendas de produtos em um único fluxo.
      </p>

      {mensagem && (
        <div
          style={{
            background: "#dcfce7",
            color: "#166534",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "8px",
          }}
        >
          {mensagem}
        </div>
      )}

      {erro && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "8px",
          }}
        >
          {erro}
        </div>
      )}

      <section
        style={{
          ...cardStyle,
          marginBottom: "25px",
        }}
      >
        <div style={{ marginBottom: "18px" }}>
          <h2 style={{ margin: 0 }}>
            Abrir nova comanda
          </h2>

          <p
            style={{
              color: "#6b7280",
              margin: "6px 0 0",
            }}
          >
            Use a mesma comanda para atendimento,
            venda de produtos ou ambos.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "15px",
            alignItems: "end",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
              }}
            >
              Cliente
            </label>

            <select
              value={novoClienteId}
              onChange={(event) =>
                setNovoClienteId(event.target.value)
              }
              style={inputStyle}
            >
              <option value="">
                Cliente avulso
              </option>

              {clientes
                .filter(
                  (cliente) =>
                    cliente.ativo !== false
                )
                .map((cliente) => (
                  <option
                    key={cliente.id}
                    value={cliente.id}
                  >
                    {cliente.nome}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
              }}
            >
              Barbeiro
            </label>

            <select
              value={novoBarbeiroId}
              onChange={(event) =>
                setNovoBarbeiroId(event.target.value)
              }
              style={inputStyle}
            >
              <option value="">
                Sem barbeiro
              </option>

              {barbeiros
                .filter(
                  (barbeiro) =>
                    barbeiro.ativo !== false
                )
                .map((barbeiro) => (
                  <option
                    key={barbeiro.id}
                    value={barbeiro.id}
                  >
                    {barbeiro.nome}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <button
              type="button"
              onClick={abrirNovaComanda}
              disabled={abrindoComanda}
              style={{
                ...buttonStyle,
                width: "100%",
                opacity: abrindoComanda
                  ? 0.6
                  : 1,
              }}
            >
              {abrindoComanda
                ? "Abrindo..."
                : "Abrir Comanda"}
            </button>
          </div>
        </div>

        <div
          style={{
            marginTop: "12px",
            padding: "10px 12px",
            borderRadius: "8px",
            background: "#f3f4f6",
            color: "#4b5563",
            fontSize: "13px",
          }}
        >
          Para venda somente de produtos, cliente e
          barbeiro podem ficar em branco. Para serviços,
          selecione um barbeiro.
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <div style={cardStyle}>
          <h2>{resumo.abertas}</h2>
          <p>Comandas abertas</p>
        </div>

        <div style={cardStyle}>
          <h2>{resumo.fechadas}</h2>
          <p>Comandas fechadas</p>
        </div>

        <div style={cardStyle}>
          <h2>
            {formatarMoeda(resumo.totalAberto)}
          </h2>
          <p>Total em aberto</p>
        </div>

        <div style={cardStyle}>
          <h2>
            {formatarMoeda(resumo.totalFechado)}
          </h2>
          <p>Total fechado</p>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1.65fr 1fr",
          gap: "20px",
          alignItems: "start",
        }}
      >
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h2>Lista de Comandas</h2>

            <button
              onClick={carregarDadosIniciais}
              style={buttonStyle}
              disabled={carregando}
            >
              {carregando
                ? "Carregando..."
                : "Atualizar"}
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              width="100%"
              cellPadding="10"
              style={{
                borderCollapse: "collapse",
                background: "#fff",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#334155",
                    color: "#ffffff",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "14px 12px" }}>ID</th>
                  <th style={{ padding: "14px 12px" }}>Cliente</th>
                  <th style={{ padding: "14px 12px" }}>Barbeiro</th>
                  <th style={{ padding: "14px 12px" }}>Status</th>
                  <th style={{ padding: "14px 12px", textAlign: "right" }}>Total</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {comandas.map((comanda, index) => (
                  <tr
                    key={comanda.id}
                    style={{
                      borderBottom:
                        "1px solid #e5e7eb",
                      background:
                        comandaSelecionada?.id ===
                        comanda.id
                          ? "#dbeafe"
                          : index % 2 === 0
                            ? "#ffffff"
                            : "#f1f5f9",
                    }}
                  >
                    <td>#{comanda.id}</td>

                    <td>
                      {comanda.cliente_nome ||
                        "CLIENTE AVULSO"}
                    </td>

                    <td>
                      {comanda.barbeiro_nome || "-"}
                    </td>

                    <td>
                      <span
                        style={{
                          padding: "5px 8px",
                          borderRadius: "999px",
                          fontSize: "13px",
                          fontWeight: "700",
                          background:
                            comanda.status === "aberta"
                              ? "#dcfce7"
                              : "#e5e7eb",
                          color:
                            comanda.status === "aberta"
                              ? "#166534"
                              : "#374151",
                        }}
                      >
                        {comanda.status?.toUpperCase()}
                      </span>
                    </td>

                    <td>
                      {formatarMoeda(comanda.total)}
                    </td>

                    <td>
                      <button
                        onClick={() =>
                          selecionarComanda(
                            comanda.id
                          )
                        }
                        style={{
                          ...buttonStyle,
                          padding: "8px 10px",
                          fontSize: "13px",
                          background:
                            comanda.status ===
                            "fechada"
                              ? "#6b7280"
                              : "#111827",
                        }}
                      >
                        {comanda.status === "fechada"
                          ? "Visualizar"
                          : "Operar"}
                      </button>
                    </td>
                  </tr>
                ))}

                {comandas.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      align="center"
                      style={{ padding: "20px" }}
                    >
                      Nenhuma comanda encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside
          style={{
            ...cardStyle,
            fontSize: "13px",
          }}
        >
          {!comandaSelecionada ? (
            <div>
              <h2>Operação da Comanda</h2>

              <p style={{ color: "#6b7280" }}>
                Selecione uma comanda para visualizar
                itens, adicionar serviços ou produtos e
                fechar o atendimento.
              </p>
            </div>
          ) : (
            <div>
              <h2>
                Comanda #{comandaSelecionada.id}
              </h2>

              <p>
                <strong>Cliente:</strong>{" "}
                {comandaSelecionada.cliente_nome ||
                  "CLIENTE AVULSO"}
              </p>

              <p>
                <strong>Barbeiro:</strong>{" "}
                {comandaSelecionada.barbeiro_nome ||
                  "-"}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {comandaSelecionada.status?.toUpperCase()}
              </p>

              <p>
                <strong>Abertura:</strong>{" "}
                {formatarData(
                  comandaSelecionada.data_abertura
                )}
              </p>

              <hr style={{ margin: "15px 0" }} />

              {carregandoAssinatura && (
                <p style={{ color: "#6b7280" }}>
                  Consultando assinatura...
                </p>
              )}

              {!carregandoAssinatura &&
                assinaturaComanda?.possui_assinatura &&
                assinatura && (
                  <div
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      marginBottom: "15px",
                      background:
                        assinaturaComanda.pode_usar_plano
                          ? "#eff6ff"
                          : "#fff7ed",
                      border:
                        assinaturaComanda.pode_usar_plano
                          ? "1px solid #93c5fd"
                          : "1px solid #fdba74",
                    }}
                  >
                    <strong>
                      💳 CLIENTE ASSINANTE
                    </strong>

                    <p style={{ margin: "8px 0 0" }}>
                      <strong>Plano:</strong>{" "}
                      {assinatura.plano_nome || "-"}
                    </p>

                    <p style={{ margin: "6px 0 0" }}>
                      <strong>Status:</strong>{" "}
                      {assinatura.status}
                    </p>

                    <p style={{ margin: "6px 0 0" }}>
                      <strong>Pagamento:</strong>{" "}
                      {assinatura.status_pagamento}
                    </p>

                    <p style={{ margin: "6px 0 0" }}>
                      <strong>Usos restantes:</strong>{" "}
                      {assinatura.usos_disponiveis}
                    </p>

                    <p style={{ margin: "6px 0 0" }}>
                      <strong>Vencimento:</strong>{" "}
                      {formatarData(
                        assinatura.data_proximo_vencimento
                      )}
                    </p>

                    {!assinaturaComanda.pode_usar_plano &&
                      assinaturaComanda.motivo && (
                        <p
                          style={{
                            color: "#9a3412",
                            margin: "8px 0 0",
                          }}
                        >
                          {assinaturaComanda.motivo}
                        </p>
                      )}
                  </div>
                )}

              {!carregandoAssinatura &&
                assinaturaComanda &&
                !assinaturaComanda.possui_assinatura && (
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      marginBottom: "15px",
                      background: "#f3f4f6",
                      color: "#4b5563",
                    }}
                  >
                    Cliente sem assinatura disponível.
                  </div>
                )}

              <h3>Itens</h3>

              {comandaSelecionada.itens?.length > 0 ? (
                <table
                  width="100%"
                  cellPadding="8"
                  style={{
                    borderCollapse: "collapse",
                    marginBottom: "15px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#f3f4f6",
                        textAlign: "left",
                      }}
                    >
                      <th>Descrição</th>
                      <th>Qtd.</th>
                      <th>Subtotal</th>
                      <th>Situação</th>
                    </tr>
                  </thead>

                  <tbody>
                    {comandaSelecionada.itens.map(
                      (item) => (
                        <tr
                          key={item.id}
                          style={{
                            borderBottom:
                              "1px solid #eee",
                          }}
                        >
                          <td>
                            <strong>
                              {item.descricao}
                            </strong>

                            <br />

                            <small>
                              {item.tipo}
                            </small>
                          </td>

                          <td>{item.quantidade}</td>

                          <td>
                            {formatarMoeda(
                              item.subtotal
                            )}
                          </td>

                          <td>
                            {item.tipo === "servico" &&
                            item.pago_com_plano ? (
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "5px 8px",
                                  borderRadius: "999px",
                                  background: "#dbeafe",
                                  color: "#1d4ed8",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                }}
                              >
                                💳 PLANO
                              </span>
                            ) : item.tipo ===
                              "servico" ? (
                              <div>
                                <span
                                  style={{
                                    display:
                                      "inline-block",
                                    padding:
                                      "5px 8px",
                                    borderRadius:
                                      "999px",
                                    background:
                                      "#f3f4f6",
                                    color: "#374151",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    marginBottom:
                                      "6px",
                                  }}
                                >
                                  💵 AVULSO
                                </span>

                                {comandaSelecionada.status === "aberta" &&
                                assinaturaComanda?.pode_usar_plano &&
                                item.quantidade === 1 &&
                                (
                                  assinatura?.servicos_permitidos_ids || []
                                ).includes(Number(item.servico_id)) && (
                                    <div>
                                      <button
                                        onClick={() =>
                                          utilizarPlanoNoItem(
                                            item
                                          )
                                        }
                                        disabled={
                                          usandoPlanoItemId ===
                                          item.id
                                        }
                                        style={{
                                          ...buttonStyle,
                                          padding:
                                            "6px 8px",
                                          fontSize:
                                            "11px",
                                          background:
                                            "#2563eb",
                                          opacity:
                                            usandoPlanoItemId ===
                                            item.id
                                              ? 0.6
                                              : 1,
                                        }}
                                      >
                                        {usandoPlanoItemId ===
                                        item.id
                                          ? "Utilizando..."
                                          : "Usar Plano"}
                                      </button>
                                    </div>
                                  )}
                              </div>
                            ) : (
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "5px 8px",
                                  borderRadius: "999px",
                                  background: "#fef3c7",
                                  color: "#92400e",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                }}
                              >
                                📦 PRODUTO
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: "#6b7280" }}>
                  Nenhum item adicionado.
                </p>
              )}

              <h2>
                Total a pagar:{" "}
                {formatarMoeda(
                  comandaSelecionada.total
                )}
              </h2>

              {comandaSelecionada.status ===
                "aberta" && (
                <>
                  <hr
                    style={{ margin: "15px 0" }}
                  />

                  <h3>Adicionar Serviço</h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "1fr 90px",
                      gap: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <select
                      value={servicoId}
                      onChange={(event) =>
                        setServicoId(
                          event.target.value
                        )
                      }
                      style={inputStyle}
                    >
                      <option value="">
                        Selecione o serviço
                      </option>

                      {servicos.map((servico) => (
                        <option
                          key={servico.id}
                          value={servico.id}
                        >
                          {servico.nome} -{" "}
                          {formatarMoeda(
                            servico.preco
                          )}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={quantidadeServico}
                      onChange={(event) =>
                        setQuantidadeServico(
                          event.target.value
                        )
                      }
                      style={inputStyle}
                    />
                  </div>

                  <button
                    onClick={adicionarServico}
                    style={buttonStyle}
                  >
                    Adicionar Serviço
                  </button>

                  <hr
                    style={{ margin: "15px 0" }}
                  />

                  <h3>Adicionar Produto</h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "1fr 90px",
                      gap: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <select
                      value={produtoId}
                      onChange={(event) =>
                        setProdutoId(
                          event.target.value
                        )
                      }
                      style={inputStyle}
                    >
                      <option value="">
                        Selecione o produto
                      </option>

                      {produtos.map((produto) => (
                        <option
                          key={produto.id}
                          value={produto.id}
                        >
                          {produto.nome} -{" "}
                          {formatarMoeda(
                            produto.preco_venda
                          )}{" "}
                          | Estoque: {produto.estoque}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={quantidadeProduto}
                      onChange={(event) =>
                        setQuantidadeProduto(
                          event.target.value
                        )
                      }
                      style={inputStyle}
                    />
                  </div>

                  <button
                    onClick={adicionarProduto}
                    style={buttonStyle}
                  >
                    Adicionar Produto
                  </button>

                  <hr
                    style={{ margin: "15px 0" }}
                  />

                 <h3>Fechar Comanda</h3>

                {assinaturaComanda?.pode_usar_plano &&
                  comandaSelecionada.itens?.some(
                    (item) =>
                      item.tipo === "servico" &&
                      !item.pago_com_plano &&
                      item.quantidade === 1
                  ) && (
                    <button
                      onClick={utilizarPlanoNosItensElegiveis}
                      disabled={usandoPlanoItemId === "todos"}
                      style={{
                        ...buttonStyle,
                        width: "100%",
                        marginBottom: "10px",
                        background: "#2563eb",
                        opacity:
                          usandoPlanoItemId === "todos"
                            ? 0.6
                            : 1,
                      }}
                    >
                      {usandoPlanoItemId === "todos"
                        ? "Utilizando plano..."
                        : "💳 Usar plano nos serviços elegíveis"}
                    </button>
                  )}

                {Number(comandaSelecionada.total || 0) > 0 ? (
                  <select
                    value={formaPagamento}
                    onChange={(event) =>
                      setFormaPagamento(event.target.value)
                    }
                    style={{
                      ...inputStyle,
                      marginBottom: "10px",
                    }}
                  >
                    <option value="pix">Pix</option>

                    <option value="dinheiro">
                      Dinheiro
                    </option>

                    <option value="debito">
                      Débito
                    </option>

                    <option value="credito">
                      Crédito
                    </option>
                  </select>
                ) : (
                  <div
                    style={{
                      background: "#dbeafe",
                      color: "#1d4ed8",
                      padding: "10px",
                      borderRadius: "8px",
                      marginBottom: "10px",
                    }}
                  >
                    💳 Comanda integralmente coberta pelo plano.
                  </div>
                )}

                <button
                  onClick={fecharComandaSelecionada}
                  style={dangerButtonStyle}
                >
                  Fechar Comanda
                </button>
                </>
              )}

              {comandaSelecionada.status ===
                "fechada" && (
                <div
                  style={{
                    background: "#f3f4f6",
                    borderRadius: "8px",
                    padding: "14px",
                    marginTop: "15px",
                  }}
                >
                  <strong>Comanda fechada.</strong>

                  <p style={{ margin: "8px 0 0" }}>
                    <strong>Pagamento:</strong>{" "}
                    {formatarPagamento(
                      comandaSelecionada.forma_pagamento
                    )}
                  </p>

                  <p style={{ margin: "8px 0 0" }}>
                    <strong>Fechamento:</strong>{" "}
                    {formatarData(
                      comandaSelecionada.data_fechamento
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}