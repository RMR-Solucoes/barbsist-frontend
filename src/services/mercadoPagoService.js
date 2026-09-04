import api from "./api";

export async function obterStatusMercadoPago() {
  const resposta = await api.get("/mercado-pago/status");
  return resposta.data;
}

export async function obterConfiguracaoMercadoPago() {
  const resposta = await api.get("/mercado-pago/configuracao");
  return resposta.data;
}

export async function atualizarConfiguracaoMercadoPago(dados) {
  const resposta = await api.put("/mercado-pago/configuracao", dados);
  return resposta.data;
}

export async function conectarMercadoPago() {
  const resposta = await api.get("/mercado-pago/oauth/conectar");
  return resposta.data;
}

export async function desconectarMercadoPago() {
  const resposta = await api.post("/mercado-pago/oauth/desconectar");
  return resposta.data;
}

export async function listarCobrancasMercadoPago(params = {}) {
  const resposta = await api.get("/mercado-pago/cobrancas", { params });
  return resposta.data;
}

export async function criarCobrancaPix(dados) {
  const resposta = await api.post("/mercado-pago/cobrancas/pix", dados);
  return resposta.data;
}

export async function criarCobrancaCartao(dados) {
  const resposta = await api.post("/mercado-pago/cobrancas/cartao", dados);
  return resposta.data;
}

export async function cobrarAssinaturaPix(assinaturaId, dados = {}) {
  const resposta = await api.post(
    `/mercado-pago/assinaturas/${assinaturaId}/pix`,
    dados
  );
  return resposta.data;
}

export async function cobrarAssinaturaCartao(assinaturaId, dados) {
  const resposta = await api.post(
    `/mercado-pago/assinaturas/${assinaturaId}/cartao`,
    dados
  );
  return resposta.data;
}
