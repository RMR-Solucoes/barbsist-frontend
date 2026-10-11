import api from "./api";

export async function listarProdutos() {
  const response = await api.get("/produtos");
  return response.data;
}

export async function buscarProduto(id) {
  const response = await api.get(`/produtos/${id}`);
  return response.data;
}

export async function criarProduto(dados) {
  const response = await api.post("/produtos", dados);
  return response.data;
}

export async function atualizarProduto(id, dados) {
  const response = await api.put(`/produtos/${id}`, dados);
  return response.data;
}

export async function deletarProduto(id) {
  const response = await api.delete(`/produtos/${id}`);
  return response.data;
}

export async function reativarProduto(id) {
  const response = await api.put(`/produtos/${id}/reativar`);
  return response.data;
}

export async function entradaEstoque(id, dados) {
  const response = await api.post(`/produtos/${id}/estoque/entrada`, dados);
  return response.data;
}

export async function ajustarEstoque(id, dados) {
  const response = await api.post(`/produtos/${id}/estoque/ajuste`, dados);
  return response.data;
}

export async function listarMovimentacoesEstoque(id, limite = 50) {
  const response = await api.get(`/produtos/${id}/estoque/movimentacoes`, {
    params: { limite },
  });
  return response.data;
}
