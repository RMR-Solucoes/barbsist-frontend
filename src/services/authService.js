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

export async function solicitarRecuperacaoSenha(
  dados
) {
  const resposta = await api.post(
    "/auth/esqueci-senha",
    dados
  );

  return resposta.data;
}

export async function redefinirSenha(dados) {
  const resposta = await api.post(
    "/auth/redefinir-senha",
    dados
  );

  return resposta.data;
}

export async function alterarMinhaSenha(dados) {
  const resposta = await api.put("/auth/minha-senha", dados);
  return resposta.data;
}
