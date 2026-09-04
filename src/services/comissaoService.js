import api from "./api";

export async function listarComissoes() {
  const response = await api.get("/comissoes");
  return response.data;
}

export async function listarMinhasComissoes(params = {}) {
  const response = await api.get("/comissoes/minhas", { params });
  return response.data;
}

export async function listarComissoesBarbeiro(barbeiroId, params = {}) {
  const response = await api.get(
    `/comissoes/barbeiro/${barbeiroId}`,
    { params }
  );
  return response.data;
}
