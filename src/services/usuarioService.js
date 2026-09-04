import api from "./api";

export async function listarUsuarios(params = {}) {
  const resposta = await api.get("/usuarios", { params });
  return resposta.data;
}

export async function criarUsuario(dados) {
  const resposta = await api.post("/usuarios", dados);
  return resposta.data;
}

export async function buscarUsuario(usuarioId) {
  const resposta = await api.get(`/usuarios/${usuarioId}`);
  return resposta.data;
}

export async function atualizarUsuario(usuarioId, dados) {
  const resposta = await api.put(`/usuarios/${usuarioId}`, dados);
  return resposta.data;
}

export async function inativarUsuario(usuarioId) {
  const resposta = await api.delete(`/usuarios/${usuarioId}`);
  return resposta.data;
}

export async function reativarUsuario(usuarioId) {
  const resposta = await api.put(`/usuarios/${usuarioId}/reativar`);
  return resposta.data;
}

export async function alterarSenhaUsuario(usuarioId, dados) {
  const resposta = await api.put(`/usuarios/${usuarioId}/senha`, dados);
  return resposta.data;
}
