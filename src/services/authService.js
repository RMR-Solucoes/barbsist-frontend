import api from "./api";

export async function realizarLogin(dados) {
  const resposta = await api.post(
    "/auth/login",
    dados
  );

  return resposta.data;
}

export async function buscarUsuarioLogado() {
  const resposta = await api.get("/auth/me");

  return resposta.data;
}