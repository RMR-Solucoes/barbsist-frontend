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