"use client";

import { useEffect, useMemo, useState } from "react";

import { listarClientes } from "@/services/clienteService";
import { listarBarbeiros } from "@/services/barbeiroService";
import { listarProdutos } from "@/services/produtoService";
import {
  adicionarProdutoVenda,
  buscarVenda,
  cancelarVenda,
  criarVenda,
  fecharVenda,
  listarVendas,
  removerItemVenda,
} from "@/services/vendaService";

import styles from "./vendas.module.css";

const formasPagamento = [
  "PIX",
  "DINHEIRO",
  "CARTAO_CREDITO",
  "CARTAO_DEBITO",
];

function detalheErro(error, fallback) {
  const detail = error?.response?.data?.detail;
  return typeof detail === "string" ? detail : fallback;
}

function moeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function VendasPage() {
  const [vendas, setVendas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [produtos, setProdutos] = useState([]);

  const [vendaAtual, setVendaAtual] = useState(null);
  const [clienteId, setClienteId] = useState("");
  const [barbeiroId, setBarbeiroId] = useState("");
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [formaPagamento, setFormaPagamento] = useState("PIX");

  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarBase();
  }, []);

  async function carregarBase() {
    setCarregando(true);
    setErro("");

    try {
      const [dadosVendas, dadosClientes, dadosBarbeiros, dadosProdutos] =
        await Promise.all([
          listarVendas(),
          listarClientes(),
          listarBarbeiros(),
          listarProdutos(),
        ]);

      setVendas(Array.isArray(dadosVendas) ? dadosVendas : []);
      setClientes(Array.isArray(dadosClientes) ? dadosClientes : []);
      setBarbeiros(Array.isArray(dadosBarbeiros) ? dadosBarbeiros : []);
      setProdutos(Array.isArray(dadosProdutos) ? dadosProdutos : []);

      const aberta = (dadosVendas || []).find(
        (venda) => venda.status === "aberta"
      );

      if (aberta) {
        const atualizada = await buscarVenda(aberta.id);
        setVendaAtual(atualizada);
      }
    } catch (error) {
      console.error(error);
      setErro(
        detalheErro(
          error,
          "Não foi possível carregar a área de vendas."
        )
      );
    } finally {
      setCarregando(false);
    }
  }

  async function atualizarVendaAtual(id = vendaAtual?.id) {
    if (!id) return;

    const [venda, listaVendas, listaProdutos] = await Promise.all([
      buscarVenda(id),
      listarVendas(),
      listarProdutos(),
    ]);

    setVendaAtual(venda);
    setVendas(Array.isArray(listaVendas) ? listaVendas : []);
    setProdutos(Array.isArray(listaProdutos) ? listaProdutos : []);
  }

  async function iniciarVenda() {
    if (processando) return;

    setProcessando(true);
    setErro("");
    setMensagem("");

    try {
      const venda = await criarVenda({
        cliente_id: clienteId ? Number(clienteId) : null,
        barbeiro_id: barbeiroId ? Number(barbeiroId) : null,
      });

      const atualizada = await buscarVenda(venda.id);

      setVendaAtual(atualizada);
      setMensagem(
        clienteId
          ? "Venda iniciada com sucesso."
          : "Venda avulsa iniciada sem cliente cadastrado."
      );

      const lista = await listarVendas();
      setVendas(Array.isArray(lista) ? lista : []);
    } catch (error) {
      console.error(error);
      setErro(detalheErro(error, "Não foi possível iniciar a venda."));
    } finally {
      setProcessando(false);
    }
  }

  async function adicionarProduto() {
    if (!vendaAtual || !produtoId || processando) return;

    setProcessando(true);
    setErro("");
    setMensagem("");

    try {
      await adicionarProdutoVenda(vendaAtual.id, {
        produto_id: Number(produtoId),
        quantidade: Number(quantidade || 1),
      });

      await atualizarVendaAtual();
      setProdutoId("");
      setQuantidade(1);
      setMensagem("Produto adicionado à venda.");
    } catch (error) {
      console.error(error);
      setErro(detalheErro(error, "Não foi possível adicionar o produto."));
    } finally {
      setProcessando(false);
    }
  }

  async function removerItem(itemId) {
    if (!vendaAtual || processando) return;

    setProcessando(true);
    setErro("");
    setMensagem("");

    try {
      await removerItemVenda(vendaAtual.id, itemId);
      await atualizarVendaAtual();
      setMensagem("Item removido e estoque devolvido.");
    } catch (error) {
      console.error(error);
      setErro(detalheErro(error, "Não foi possível remover o item."));
    } finally {
      setProcessando(false);
    }
  }

  async function finalizarVenda() {
    if (!vendaAtual || processando) return;

    if (!(vendaAtual.itens || []).length) {
      setErro("Adicione ao menos um produto antes de finalizar.");
      return;
    }

    setProcessando(true);
    setErro("");
    setMensagem("");

    try {
      await fecharVenda(vendaAtual.id, {
        forma_pagamento: formaPagamento,
      });

      setMensagem(
        "Venda finalizada. O lançamento correspondente foi enviado ao Caixa."
      );

      setVendaAtual(null);
      setClienteId("");
      setBarbeiroId("");

      const [lista, listaProdutos] = await Promise.all([
        listarVendas(),
        listarProdutos(),
      ]);
      setVendas(Array.isArray(lista) ? lista : []);
      setProdutos(Array.isArray(listaProdutos) ? listaProdutos : []);
    } catch (error) {
      console.error(error);
      setErro(detalheErro(error, "Não foi possível finalizar a venda."));
    } finally {
      setProcessando(false);
    }
  }

  async function cancelarAtual() {
    if (!vendaAtual || processando) return;

    if (!window.confirm("Cancelar esta venda e devolver os itens ao estoque?")) {
      return;
    }

    setProcessando(true);
    setErro("");
    setMensagem("");

    try {
      await cancelarVenda(vendaAtual.id);
      setVendaAtual(null);
      setClienteId("");
      setBarbeiroId("");
      setMensagem("Venda cancelada. Estoque devolvido.");

      const [lista, listaProdutos] = await Promise.all([
        listarVendas(),
        listarProdutos(),
      ]);

      setVendas(Array.isArray(lista) ? lista : []);
      setProdutos(Array.isArray(listaProdutos) ? listaProdutos : []);
    } catch (error) {
      console.error(error);
      setErro(detalheErro(error, "Não foi possível cancelar a venda."));
    } finally {
      setProcessando(false);
    }
  }

  const resumo = useMemo(() => {
    const abertas = vendas.filter((v) => v.status === "aberta").length;
    const fechadas = vendas.filter((v) => v.status === "fechada").length;
    const totalFechado = vendas
      .filter((v) => v.status === "fechada")
      .reduce((soma, v) => soma + Number(v.total || 0), 0);

    return { abertas, fechadas, totalFechado };
  }, [vendas]);

  const produtosDisponiveis = useMemo(
    () =>
      produtos.filter(
        (produto) =>
          produto.ativo !== false && Number(produto.estoque || 0) > 0
      ),
    [produtos]
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Vendas</h1>
          <p>
            Venda rápida de produtos, com cliente e barbeiro opcionais.
          </p>
        </div>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={carregarBase}
          disabled={carregando || processando}
        >
          Atualizar
        </button>
      </header>

      {mensagem && <div className={styles.success}>{mensagem}</div>}
      {erro && <div className={styles.error}>{erro}</div>}

      <section className={styles.metrics}>
        <article className={styles.metricCard}>
          <span>Vendas abertas</span>
          <strong>{resumo.abertas}</strong>
        </article>
        <article className={styles.metricCard}>
          <span>Vendas fechadas</span>
          <strong>{resumo.fechadas}</strong>
        </article>
        <article className={styles.metricCard}>
          <span>Total fechado</span>
          <strong>{moeda(resumo.totalFechado)}</strong>
        </article>
      </section>

      <section className={styles.workspace}>
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Nova venda</h2>
              <p>Cliente e barbeiro são opcionais.</p>
            </div>
          </div>

          <label className={styles.field}>
            <span>Cliente</span>
            <select
              value={clienteId}
              onChange={(event) => setClienteId(event.target.value)}
              disabled={Boolean(vendaAtual)}
            >
              <option value="">Venda sem cliente cadastrado</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Barbeiro</span>
            <select
              value={barbeiroId}
              onChange={(event) => setBarbeiroId(event.target.value)}
              disabled={Boolean(vendaAtual)}
            >
              <option value="">Sem barbeiro vinculado</option>
              {barbeiros.map((barbeiro) => (
                <option key={barbeiro.id} value={barbeiro.id}>
                  {barbeiro.nome}
                </option>
              ))}
            </select>
          </label>

          {!vendaAtual ? (
            <button
              className={styles.primaryButton}
              type="button"
              onClick={iniciarVenda}
              disabled={processando}
            >
              {processando ? "Iniciando..." : "Iniciar venda"}
            </button>
          ) : (
            <div className={styles.activeSale}>
              <span>Venda em atendimento</span>
              <strong>#{vendaAtual.id}</strong>
            </div>
          )}
        </article>

        <article className={`${styles.card} ${styles.saleCard}`}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Venda atual</h2>
              <p>
                {vendaAtual
                  ? `Venda #${vendaAtual.id}`
                  : "Inicie uma venda para adicionar produtos."}
              </p>
            </div>
            {vendaAtual && (
              <strong className={styles.total}>
                {moeda(vendaAtual.total)}
              </strong>
            )}
          </div>

          {vendaAtual ? (
            <>
              <div className={styles.addRow}>
                <label className={styles.field}>
                  <span>Produto</span>
                  <select
                    value={produtoId}
                    onChange={(event) => setProdutoId(event.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {produtosDisponiveis.map((produto) => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome} — estoque {produto.estoque} —{" "}
                        {moeda(produto.preco_venda)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={`${styles.field} ${styles.quantity}`}>
                  <span>Qtd.</span>
                  <input
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(event) => setQuantidade(event.target.value)}
                  />
                </label>

                <button
                  className={styles.primaryButton}
                  type="button"
                  onClick={adicionarProduto}
                  disabled={!produtoId || processando}
                >
                  Adicionar
                </button>
              </div>

              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Qtd.</th>
                      <th>Unitário</th>
                      <th>Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(vendaAtual.itens || []).length ? (
                      vendaAtual.itens.map((item) => (
                        <tr key={item.id}>
                          <td>{item.descricao}</td>
                          <td>{item.quantidade}</td>
                          <td>{moeda(item.valor_unitario)}</td>
                          <td>{moeda(item.subtotal)}</td>
                          <td>
                            <button
                              className={styles.linkDanger}
                              type="button"
                              onClick={() => removerItem(item.id)}
                              disabled={processando}
                            >
                              Remover
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className={styles.empty}>
                          Nenhum produto adicionado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className={styles.checkout}>
                <label className={styles.field}>
                  <span>Forma de pagamento</span>
                  <select
                    value={formaPagamento}
                    onChange={(event) =>
                      setFormaPagamento(event.target.value)
                    }
                  >
                    {formasPagamento.map((forma) => (
                      <option key={forma} value={forma}>
                        {forma.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>

                <div className={styles.actions}>
                  <button
                    className={styles.cancelButton}
                    type="button"
                    onClick={cancelarAtual}
                    disabled={processando}
                  >
                    Cancelar venda
                  </button>

                  <button
                    className={styles.finishButton}
                    type="button"
                    onClick={finalizarVenda}
                    disabled={processando || !(vendaAtual.itens || []).length}
                  >
                    {processando ? "Processando..." : "Finalizar venda"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.blankState}>
              <span>🛒</span>
              <h3>Nenhuma venda aberta</h3>
              <p>
                Use o formulário ao lado para iniciar uma venda avulsa.
              </p>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
