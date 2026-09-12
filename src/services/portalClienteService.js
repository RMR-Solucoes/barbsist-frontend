import api from "@/services/api";

const TOKEN_KEY = "barbsist_portal_cliente_token";
const SLUG_KEY = "barbsist_portal_cliente_barbearia";

export function salvarBarbeariaPortal(slug) { if (typeof window !== "undefined" && slug) localStorage.setItem(SLUG_KEY, slug); }
export function obterBarbeariaPortal() { return typeof window === "undefined" ? null : localStorage.getItem(SLUG_KEY); }
export function salvarTokenCliente(token) { if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token); }
export function obterTokenCliente() { return typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY); }
export function sairPortalCliente() { if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY); }
function configCliente() { return { headers: { Authorization: `Bearer ${obterTokenCliente()}` } }; }

export async function loginCliente(barbeariaSlug, email, senha) {
  const { data } = await api.post("/portal-cliente/login", { barbearia_slug: barbeariaSlug, email, senha });
  salvarBarbeariaPortal(barbeariaSlug); salvarTokenCliente(data.access_token); return data;
}
export async function criarContaCliente(dados) {
  const { data } = await api.post("/portal-cliente/primeiro-acesso", {
    barbearia_slug: dados.barbeariaSlug, nome: dados.nome, telefone: dados.telefone, email: dados.email, senha: dados.senha,
  });
  salvarBarbeariaPortal(dados.barbeariaSlug); return data;
}
export async function confirmarEmailCliente(barbeariaSlug, email, codigo) {
  const { data } = await api.post("/portal-cliente/confirmar-email", { barbearia_slug: barbeariaSlug, email, codigo }); return data;
}
export async function reenviarCodigoCliente(barbeariaSlug, email) {
  const { data } = await api.post("/portal-cliente/reenviar-codigo", { barbearia_slug: barbeariaSlug, email }); return data;
}
export async function carregarPerfilCliente() { const { data } = await api.get("/portal-cliente/me", configCliente()); return data; }
export async function carregarMinhaAssinatura() { const { data } = await api.get("/portal-cliente/minha-assinatura", configCliente()); return data; }
export async function carregarMeusPagamentos() { const { data } = await api.get("/portal-cliente/meus-pagamentos", configCliente()); return data; }
export async function carregarPlanosDisponiveis() { const { data } = await api.get("/portal-cliente/planos-disponiveis", configCliente()); return data; }
export async function carregarMinhasComandasAbertas() { const { data } = await api.get("/portal-cliente/minhas-comandas-abertas", configCliente()); return data; }
export async function assinarPlanoPix(planoId, diaVencimento) {
  const { data } = await api.post(
    `/portal-cliente/assinar/${planoId}/pix`,
    { dia_vencimento: Number(diaVencimento) },
    configCliente(),
  );
  return data;
}
export async function alterarSenhaCliente(senhaAtual, novaSenha) {
  const { data } = await api.put("/portal-cliente/minha-senha", { senha_atual: senhaAtual, nova_senha: novaSenha }, configCliente()); return data;
}


export async function obterConfiguracaoPortalAdmin() {
  const { data } = await api.get(
    "/portal-cliente/admin/configuracao",
  );
  return data;
}

export async function atualizarConfiguracaoPortalAdmin(
  permitirAgendamentoPortal,
) {
  const { data } = await api.put(
    "/portal-cliente/admin/configuracao",
    {
      permitir_agendamento_portal:
        Boolean(permitirAgendamentoPortal),
    },
  );
  return data;
}
