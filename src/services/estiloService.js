import api from "./api";

export async function listarEstilos(params = {}) {
  const resposta = await api.get("/estilos", { params });
  return resposta.data;
}

export async function criarEstilo(dados) {
  const resposta = await api.post("/estilos", dados);
  return resposta.data;
}

export async function buscarEstilo(estiloId) {
  const resposta = await api.get(`/estilos/${estiloId}`);
  return resposta.data;
}

export async function atualizarEstilo(estiloId, dados) {
  const resposta = await api.put(`/estilos/${estiloId}`, dados);
  return resposta.data;
}

export async function inativarEstilo(estiloId) {
  const resposta = await api.delete(`/estilos/${estiloId}`);
  return resposta.data;
}

export async function reativarEstilo(estiloId) {
  const resposta = await api.put(`/estilos/${estiloId}/reativar`);
  return resposta.data;
}
