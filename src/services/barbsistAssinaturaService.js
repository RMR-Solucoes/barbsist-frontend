import api from "./api";

export async function listarPlanosBarbSist() {
  const resposta = await api.get("/barbsist-assinaturas/planos");
  return resposta.data;
}

export async function obterMinhaAssinaturaBarbSist() {
  const resposta = await api.get("/barbsist-assinaturas/minha-assinatura");
  return resposta.data;
}

export async function obterPublicKeyBarbSist() {
  const resposta = await api.get(
    "/barbsist-assinaturas/mercado-pago/public-key"
  );
  return resposta.data;
}

export async function checkoutBarbSistPix(dados) {
  const resposta = await api.post(
    "/barbsist-assinaturas/checkout/pix",
    dados
  );
  return resposta.data;
}

export async function checkoutBarbSistCartao(dados) {
  const resposta = await api.post(
    "/barbsist-assinaturas/checkout/cartao",
    dados
  );
  return resposta.data;
}
