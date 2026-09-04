import api from "./api";

export async function listarCaixa() {
  const response = await api.get("/caixa");
  return response.data;
}

export async function criarMovimentacaoCaixa(dados) {
  const response = await api.post("/caixa", dados);
  return response.data;
}

export async function obterResumoCaixa(params = {}) {
  const response = await api.get("/caixa/resumo", { params });
  return response.data;
}

export async function buscarMovimentacaoCaixa(id) {
  const response = await api.get(`/caixa/${id}`);
  return response.data;
}
