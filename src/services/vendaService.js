import api from "./api";

export async function listarVendas() {
  const response = await api.get("/vendas");
  return response.data;
}

export async function buscarVenda(id) {
  const response = await api.get(`/vendas/${id}`);
  return response.data;
}

export async function criarVenda(dados = {}) {
  const response = await api.post("/vendas", dados);
  return response.data;
}

export async function adicionarProdutoVenda(vendaId, dados) {
  const response = await api.post(
    `/vendas/${vendaId}/produtos`,
    dados
  );
  return response.data;
}

export async function removerItemVenda(vendaId, itemId) {
  const response = await api.delete(
    `/vendas/${vendaId}/itens/${itemId}`
  );
  return response.data;
}

export async function fecharVenda(vendaId, dados) {
  const response = await api.put(
    `/vendas/${vendaId}/fechar`,
    dados
  );
  return response.data;
}

export async function cancelarVenda(vendaId) {
  const response = await api.put(
    `/vendas/${vendaId}/cancelar`
  );
  return response.data;
}
