import api from "./api";

export async function listarCaixa() {
  const response = await api.get("/caixa");
  return response.data;
}

export async function criarMovimentacaoCaixa(dados) {
  const response = await api.post("/caixa", dados);
  return response.data;
}