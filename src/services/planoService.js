import api from "./api";

export async function listarPlanos() {
  const response = await api.get("/planos");
  return response.data;
}

export async function criarPlano(dados) {
  const response = await api.post("/planos", dados);
  return response.data;
}

export async function atualizarPlano(id, dados) {
  const response = await api.put(`/planos/${id}`, dados);
  return response.data;
}

export async function inativarPlano(id) {
  const response = await api.put(`/planos/${id}/inativar`);
  return response.data;
}

export async function reativarPlano(id) {
  const response = await api.put(`/planos/${id}/reativar`);
  return response.data;
}

