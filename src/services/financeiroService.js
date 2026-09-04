import api from "./api";

export async function buscarDashboardFinanceiro(params = {}) {
  const resposta = await api.get("/financeiro/dashboard", { params });
  return resposta.data;
}

export async function buscarFluxoCaixa(params = {}) {
  const resposta = await api.get("/financeiro/fluxo-caixa", { params });
  return resposta.data;
}

export async function buscarDre(params = {}) {
  const resposta = await api.get("/financeiro/dre", { params });
  return resposta.data;
}
