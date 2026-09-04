import api from "./api";

export async function obterResumoPlataforma() {
  const resposta = await api.get("/admin/plataforma/resumo");
  return resposta.data;
}

export async function listarPlanosSaas() {
  const resposta = await api.get("/admin/barbsist-assinaturas/planos");
  return resposta.data;
}

export async function criarPlanoSaas(dados) {
  const resposta = await api.post("/admin/barbsist-assinaturas/planos", dados);
  return resposta.data;
}

export async function atualizarPlanoSaas(planoId, dados) {
  const resposta = await api.put(
    `/admin/barbsist-assinaturas/planos/${planoId}`,
    dados
  );
  return resposta.data;
}

export async function listarAssinaturasSaas(params = {}) {
  const resposta = await api.get(
    "/admin/barbsist-assinaturas/assinaturas",
    { params }
  );
  return resposta.data;
}

export async function bloquearAssinaturaSaas(assinaturaId) {
  const resposta = await api.put(
    `/admin/barbsist-assinaturas/assinaturas/${assinaturaId}/bloquear`
  );
  return resposta.data;
}

export async function liberarAssinaturaSaas(assinaturaId) {
  const resposta = await api.put(
    `/admin/barbsist-assinaturas/assinaturas/${assinaturaId}/liberar`
  );
  return resposta.data;
}

export async function listarPagamentosSaas(params = {}) {
  const resposta = await api.get(
    "/admin/barbsist-assinaturas/pagamentos",
    { params }
  );
  return resposta.data;
}

export async function listarAuditoriaSaas(params = {}) {
  const resposta = await api.get(
    "/admin/barbsist-assinaturas/auditoria",
    { params }
  );
  return resposta.data;
}

export async function obterStatusMercadoPagoPlataforma() {
  const resposta = await api.get(
    "/admin/barbsist-assinaturas/mercado-pago/status"
  );
  return resposta.data;
}

// ============================================================
// FINANCEIRO DA PLATAFORMA
// ============================================================

export async function obterResumoFinanceiroPlataforma(params = {}) {
  const resposta = await api.get(
    "/admin/financeiro-plataforma/resumo",
    { params }
  );
  return resposta.data;
}

export async function obterFluxoCaixaPlataforma(params = {}) {
  const resposta = await api.get(
    "/admin/financeiro-plataforma/fluxo-caixa",
    { params }
  );
  return resposta.data;
}

export async function listarMovimentacoesFinanceiroPlataforma(params = {}) {
  const resposta = await api.get(
    "/admin/financeiro-plataforma/movimentacoes",
    { params }
  );
  return resposta.data;
}

export async function criarMovimentacaoFinanceiroPlataforma(dados) {
  const resposta = await api.post(
    "/admin/financeiro-plataforma/movimentacoes",
    dados
  );
  return resposta.data;
}

export async function atualizarMovimentacaoFinanceiroPlataforma(
  movimentacaoId,
  dados
) {
  const resposta = await api.put(
    `/admin/financeiro-plataforma/movimentacoes/${movimentacaoId}`,
    dados
  );
  return resposta.data;
}



export async function listarBarbearias() {
  const resposta = await api.get("/barbearia/todas");
  return resposta.data;
}

export async function obterBarbeariaAdministracao(barbeariaId) {
  const resposta = await api.get(
    `/barbearia/administracao/${barbeariaId}`
  );
  return resposta.data;
}

export async function ativarBarbearia(barbeariaId) {
  const resposta = await api.put(
    `/barbearia/administracao/${barbeariaId}/ativar`
  );
  return resposta.data;
}

export async function desativarBarbearia(barbeariaId) {
  const resposta = await api.put(
    `/barbearia/administracao/${barbeariaId}/desativar`
  );
  return resposta.data;
}

export async function entrarContextoBarbearia(barbeariaId) {
  const resposta = await api.post(
    `/auth/superadmin/contexto/${barbeariaId}`
  );
  return resposta.data;
}

export async function sairContextoBarbearia() {
  const resposta = await api.delete("/auth/superadmin/contexto");
  return resposta.data;
}

// ============================================================
// PORTAL DO PARCEIRO - PREVIA SUPERADMIN
// ============================================================

export async function obterPortalParceiro(parceiroId) {
  const resposta = await api.get(
    `/portal-parceiro/${parceiroId}`
  );
  return resposta.data;
}

export async function obterCarteiraParceiro(parceiroId) {
  const resposta = await api.get(
    `/portal-parceiro/${parceiroId}/carteira`
  );
  return resposta.data;
}

export async function solicitarResgateParceiro(
  parceiroId,
  dados
) {
  const resposta = await api.post(
    `/portal-parceiro/${parceiroId}/resgates`,
    dados
  );
  return resposta.data;
}

