"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";
import {
  assinarPlanoPix,
  carregarMeusPagamentos,
  carregarMinhasComandasAbertas,
  carregarMinhaAssinatura,
  carregarPlanosDisponiveis,
  carregarPerfilCliente,
  obterStatusMercadoPagoCliente,
  pagarComandaCartao,
  pagarComandaPix,
  obterBarbeariaPortal,
  obterTokenCliente,
  sairPortalCliente,
} from "@/services/portalClienteService";

const dinheiro = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function dataBr(valor) {
  if (!valor) return "—";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(valor),
  );
}

function rotulo(valor) {
  return String(valor || "—").replaceAll("_", " ");
}

function CorStatus({ children, positivo = false }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
        positivo
          ? "bg-emerald-100 text-emerald-800"
          : "bg-amber-100 text-amber-800"
      }`}
    >
      {rotulo(children)}
    </span>
  );
}

export default function Inicio() {
  const router = useRouter();
  const [perfil, setPerfil] = useState(null);
  const [assinatura, setAssinatura] = useState(null);
  const [pagamentos, setPagamentos] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [diaVencimento, setDiaVencimento] = useState(
    Math.min(new Date().getDate(), 28),
  );
  const [processandoPlanoId, setProcessandoPlanoId] = useState(null);
  const [pix, setPix] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erroFatal, setErroFatal] = useState("");
  const [erro, setErro] = useState("");
  const [secao, setSecao] = useState(null);
  const [comandas, setComandas] = useState([]);
  const [processandoComandaId, setProcessandoComandaId] = useState(null);
  const [comandaPagamento, setComandaPagamento] = useState(null);
  const [formaPagamento, setFormaPagamento] = useState("pix");
  const [mercadoPago, setMercadoPago] = useState({ disponivel: false, public_key: null });

  useEffect(() => {
    if (!obterTokenCliente()) {
      router.replace(
        `/portal-cliente?barbearia=${encodeURIComponent(obterBarbeariaPortal() || "")}`,
      );
      return;
    }

    Promise.all([
      carregarPerfilCliente(),
      carregarMinhaAssinatura(),
      carregarMeusPagamentos(),
      carregarPlanosDisponiveis(),
      carregarMinhasComandasAbertas(),
      obterStatusMercadoPagoCliente(),
    ])
      .then(([perfilRecebido, assinaturaRecebida, pagamentosRecebidos, planosRecebidos, comandasRecebidas, mercadoPagoRecebido]) => {
        setPerfil(perfilRecebido);
        setAssinatura(assinaturaRecebida);
        setPagamentos(pagamentosRecebidos);
        setPlanos(planosRecebidos);
        setComandas(comandasRecebidas);
        setMercadoPago(mercadoPagoRecebido || { disponivel: false, public_key: null });
        if (mercadoPagoRecebido?.public_key) {
          initMercadoPago(mercadoPagoRecebido.public_key, { locale: "pt-BR" });
        }
      })
      .catch((falha) => {
        const status = falha?.response?.status;

        if (status === 401 || status === 403) {
          const slug = obterBarbeariaPortal() || "";

          sairPortalCliente();

          router.replace(
            `/portal-cliente?barbearia=${encodeURIComponent(slug)}`,
          );
          return;
        }

        setErroFatal(
          falha?.response?.data?.detail ||
            "Não foi possível carregar os dados do portal.",
        );
      })
      .finally(() => setCarregando(false));
  }, [router]);

  function sair() {
    sairPortalCliente();
    router.replace(
      `/portal-cliente?barbearia=${encodeURIComponent(obterBarbeariaPortal() || "")}`,
    );
  }

  function abrirAgendamento() {
    const slug = perfil?.barbearia_slug || obterBarbeariaPortal();
    if (!slug) return;

    router.push(`/agendar?barbearia=${encodeURIComponent(slug)}&origem=portal-cliente`);
  }

  async function contratarPix(planoId) {
    setErro("");
    setMensagem("");
    setProcessandoPlanoId(planoId);
    try {
      const cobranca = await assinarPlanoPix(planoId, diaVencimento);
      setPix(cobranca);
      setMensagem("Cobrança PIX gerada. A assinatura será ativada após a confirmação do pagamento.");
    } catch (falha) {
      setErro(
        falha?.response?.data?.detail ||
          "Não foi possível iniciar a contratação do plano.",
      );
    } finally {
      setProcessandoPlanoId(null);
    }
  }

  async function pagarPixComanda(comanda) {
    setErro("");
    setMensagem("");
    setProcessandoComandaId(comanda.id);
    try {
      const cobranca = await pagarComandaPix(comanda.id, perfil?.email);
      setPix({ ...cobranca, origem: "comanda", comanda_id: comanda.id });
      setMensagem("Cobrança PIX gerada. A comanda será fechada após a confirmação do pagamento.");
    } catch (falha) {
      setErro(
        falha?.response?.data?.detail ||
          "Não foi possível gerar o pagamento desta comanda.",
      );
    } finally {
      setProcessandoComandaId(null);
    }
  }

  function abrirPagamentoComanda(comanda) {
    setErro("");
    setMensagem("");
    setFormaPagamento("pix");
    setComandaPagamento(comanda);
  }

  async function confirmarPagamentoComanda() {
    if (!comandaPagamento) return;
    if (formaPagamento === "pix") {
      setComandaPagamento(null);
      await pagarPixComanda(comandaPagamento);
      return;
    }
    if (formaPagamento === "dinheiro" || formaPagamento === "debito") {
      setMensagem(
        formaPagamento === "dinheiro"
          ? "Pagamento em dinheiro será confirmado pela barbearia no atendimento."
          : "Pagamento no débito será realizado e confirmado na barbearia.",
      );
      setComandaPagamento(null);
    }
  }

  async function enviarCartaoComanda(formData) {
    if (!comandaPagamento) return;
    setErro("");
    setProcessandoComandaId(comandaPagamento.id);
    try {
      const cobranca = await pagarComandaCartao(comandaPagamento.id, {
        token: formData.token,
        payment_method_id: formData.payment_method_id,
        installments: Number(formData.installments || 1),
        issuer_id: formData.issuer_id ? Number(formData.issuer_id) : null,
        payer_email: formData.payer?.email || perfil?.email,
        identification_type: formData.payer?.identification?.type || null,
        identification_number: formData.payer?.identification?.number || null,
      });
      setMensagem(
        cobranca?.status === "processed"
          ? "Pagamento aprovado. A comanda será atualizada automaticamente."
          : "Pagamento enviado ao Mercado Pago e aguardando confirmação.",
      );
      setComandaPagamento(null);
      window.location.reload();
      return cobranca;
    } catch (falha) {
      setErro(falha?.response?.data?.detail || "Pagamento recusado ou não processado.");
      throw falha;
    } finally {
      setProcessandoComandaId(null);
    }
  }

  async function pagarMercadoPagoComanda(comanda) {
    setErro("");
    setMensagem("");
    setProcessandoComandaId(comanda.id);

    // A janela precisa ser aberta durante o clique para não ser bloqueada
    // pelo navegador enquanto a cobrança é criada no backend.
    const janelaMercadoPago = window.open("", "_blank");

    try {
      const cobranca = await pagarComandaPix(comanda.id, perfil?.email);
      setPix({ ...cobranca, origem: "comanda", comanda_id: comanda.id });

      if (cobranca?.ticket_url) {
        if (janelaMercadoPago) {
          janelaMercadoPago.opener = null;
          janelaMercadoPago.location.replace(cobranca.ticket_url);
        } else {
          window.location.assign(cobranca.ticket_url);
        }
        setMensagem("Pagamento aberto no Mercado Pago. A comanda será fechada após a confirmação.");
      } else {
        janelaMercadoPago?.close();
        setMensagem("Cobrança gerada. Use o QR Code ou o PIX Copia e Cola para pagar.");
      }
    } catch (falha) {
      janelaMercadoPago?.close();
      setErro(
        falha?.response?.data?.detail ||
          "Não foi possível abrir o pagamento no Mercado Pago.",
      );
    } finally {
      setProcessandoComandaId(null);
    }
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-slate-100 p-8 text-center text-slate-700">
        Carregando seu portal...
      </main>
    );
  }

  if (erroFatal || !perfil) {
    return (
      <main className="min-h-screen bg-slate-100 p-8 text-center">
        <p className="text-red-700">{erroFatal || "Sua sessão expirou."}</p>
        <button className="mt-4 rounded-lg bg-slate-950 px-4 py-2 text-white" onClick={sair}>
          Voltar ao acesso
        </button>
      </main>
    );
  }

  const assinaturaAtiva = assinatura?.status === "ATIVO";
  const pagamentoPago = assinatura?.status_pagamento === "PAGO";

  if (!secao) {
    const cards = [
      { id: "plano", titulo: "Meu plano", texto: assinatura?.plano?.nome || "Escolha uma assinatura", detalhe: assinatura ? `Status: ${rotulo(assinatura.status)}` : "Conheça os planos disponíveis", cor: "border-violet-200 bg-violet-50", destaque: "text-violet-700" },
      { id: "planos", titulo: "Assinar plano", texto: "Planos disponíveis", detalhe: `${planos.length} opção(ões) para contratação`, cor: "border-cyan-200 bg-cyan-50", destaque: "text-cyan-700" },
      { id: "pagamentos", titulo: "Pagamentos", texto: `${pagamentos.length} registro(s)`, detalhe: "Consulte seu histórico financeiro", cor: "border-emerald-200 bg-emerald-50", destaque: "text-emerald-700" },
      { id: "agendamento", titulo: "Agendamento", texto: "Agendar horário", detalhe: "Escolha serviço, profissional e horário", cor: "border-blue-200 bg-blue-50", destaque: "text-blue-700" },
      ...(comandas.length ? [{ id: "comandas", titulo: "Minhas comandas", texto: `${comandas.length} comanda(s) aberta(s)`, detalhe: `Total em aberto: ${dinheiro.format(comandas.reduce((s, c) => s + Number(c.total || 0), 0))}`, cor: "border-amber-200 bg-amber-50", destaque: "text-amber-700" }] : []),
    ];
    return (
      <main className="min-h-screen bg-slate-100 p-4 md:p-8"><div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4 rounded-2xl bg-slate-950 p-6 text-white"><div><p className="text-sm text-blue-300">{perfil.barbearia_nome}</p><h1 className="text-2xl font-bold">Olá, {perfil.nome}</h1></div><button onClick={sair} className="rounded-lg border px-4 py-2 hover:bg-white hover:text-slate-950">Sair</button></header>
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{cards.map((card) => <button key={card.id} type="button" onClick={() => card.id === "agendamento" ? abrirAgendamento() : setSecao(card.id)} className={`rounded-xl border p-5 text-left shadow transition hover:-translate-y-0.5 hover:shadow-lg ${card.cor}`}><p className={`text-sm font-semibold ${card.destaque}`}>{card.titulo}</p><h2 className="mt-2 text-lg font-bold text-slate-950">{card.texto}</h2><p className="mt-2 text-sm text-slate-600">{card.detalhe}</p><span className={`mt-4 inline-block text-sm font-semibold ${card.destaque}`}>Acessar →</span></button>)}</section>
      </div></main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <button type="button" onClick={() => setSecao(null)} className="mb-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">← Voltar ao portal</button>
        <header className="flex items-center justify-between gap-4 rounded-2xl bg-slate-950 p-6 text-white">
          <div>
            <p className="text-sm text-blue-300">{perfil.barbearia_nome}</p>
            <h1 className="text-2xl font-bold">Olá, {perfil.nome}</h1>
          </div>
          <button onClick={sair} className="rounded-lg border px-4 py-2 hover:bg-white hover:text-slate-950">
            Sair
          </button>
        </header>

        {secao === "plano" && <>
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl bg-white p-5 shadow md:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-blue-700">Meu plano</p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {assinatura?.plano?.nome || "Nenhum plano contratado"}
                </h2>
              </div>
              {assinatura && <CorStatus positivo={assinaturaAtiva}>{assinatura.status}</CorStatus>}
            </div>

            {assinatura ? (
              <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div><p className="text-slate-500">Valor mensal</p><p className="font-semibold">{dinheiro.format(assinatura.valor_mensal || 0)}</p></div>
                <div><p className="text-slate-500">Usos disponíveis</p><p className="font-semibold">{assinatura.usos_disponiveis}</p></div>
                <div><p className="text-slate-500">Próximo vencimento</p><p className="font-semibold">{dataBr(assinatura.data_proximo_vencimento)}</p></div>
                <div><p className="text-slate-500">Vigência atual</p><p className="font-semibold">até {dataBr(assinatura.data_fim)}</p></div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">Escolha um dos planos disponíveis abaixo.</p>
            )}

            {assinatura?.status === "PENDENTE" && assinatura.status_pagamento !== "PAGO" && (
              <button
                type="button"
                onClick={() => contratarPix(assinatura.plano.id)}
                disabled={processandoPlanoId !== null}
                className="mt-5 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
              >
                {processandoPlanoId ? "Gerando PIX..." : "Pagar assinatura com PIX"}
              </button>
            )}

            {assinatura?.plano_programado && (
              <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
                Próximo plano: <strong>{assinatura.plano_programado.nome}</strong>, após a confirmação da próxima cobrança.
              </p>
            )}
          </article>

          <article className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm font-medium text-blue-700">Situação financeira</p>
            <div className="mt-3">
              {assinatura ? (
                <CorStatus positivo={pagamentoPago}>{assinatura.status_pagamento}</CorStatus>
              ) : (
                <p className="text-sm text-slate-600">Sem assinatura.</p>
              )}
            </div>
            {assinatura?.data_ultimo_pagamento && (
              <p className="mt-4 text-sm text-slate-600">
                Último pagamento: {dataBr(assinatura.data_ultimo_pagamento)}
              </p>
            )}
          </article>
        </section>
        </>}

        {secao === "planos" && (
          <section className="mt-6 rounded-xl bg-white p-5 shadow">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-blue-700">Assinaturas</p>
                <h2 className="text-xl font-bold text-slate-950">Conheça nossos planos</h2>
                <p className="mt-1 text-sm text-slate-600">A ativação ocorre somente após a confirmação do pagamento.</p>
              </div>
              <label className="text-sm font-medium text-slate-700">
                Dia de vencimento
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={diaVencimento}
                  onChange={(evento) => setDiaVencimento(evento.target.value)}
                  className="ml-2 w-20 rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
            </div>

            {planos.length === 0 ? (
              <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">A barbearia ainda não disponibilizou planos para contratação.</p>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {planos.map((plano) => (
                  <article key={plano.id} className="flex flex-col rounded-xl border border-slate-200 p-5">
                    <h3 className="text-lg font-bold text-slate-950">{plano.nome}</h3>
                    {plano.descricao && <p className="mt-2 text-sm text-slate-600">{plano.descricao}</p>}
                    <dl className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between gap-3"><dt className="text-slate-500">Serviços por ciclo</dt><dd className="font-semibold">{plano.quantidade_servicos}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-slate-500">Validade</dt><dd className="font-semibold">{plano.validade_dias} dias</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-slate-500">PIX</dt><dd className="font-semibold text-emerald-700">{dinheiro.format(plano.valor_pix)}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-slate-500">Cartão</dt><dd className="font-semibold">{dinheiro.format(plano.valor_cartao)} em até {plano.max_parcelas_cartao}x</dd></div>
                    </dl>
                    <button
                      type="button"
                      onClick={() => contratarPix(plano.id)}
                      disabled={processandoPlanoId !== null || Number(diaVencimento) < 1 || Number(diaVencimento) > 28}
                      className="mt-5 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {processandoPlanoId === plano.id ? "Gerando PIX..." : "Assinar com PIX"}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {(erro || mensagem) && (
          <div className={`mt-6 rounded-lg p-4 text-sm ${erro ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>
            {erro || mensagem}
          </div>
        )}

        {secao === "pagamentos" && <section className="mt-6 rounded-xl bg-white p-5 shadow">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-blue-700">Pagamentos</p>
              <h2 className="text-xl font-bold text-slate-950">Histórico financeiro</h2>
            </div>
            <span className="text-sm text-slate-500">{pagamentos.length} registro(s)</span>
          </div>

          {pagamentos.length === 0 ? (
            <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              Nenhum pagamento registrado até o momento.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-b text-slate-500">
                  <tr>
                    <th className="px-3 py-3">Data</th><th className="px-3 py-3">Plano</th><th className="px-3 py-3">Referência</th><th className="px-3 py-3">Forma</th><th className="px-3 py-3">Valor</th><th className="px-3 py-3">Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {pagamentos.map((pagamento) => (
                    <tr className="border-b last:border-0" key={pagamento.id}>
                      <td className="px-3 py-3">{dataBr(pagamento.data_pagamento)}</td>
                      <td className="px-3 py-3 font-medium">{pagamento.plano_nome}</td>
                      <td className="px-3 py-3">{pagamento.referencia_mes || "—"}</td>
                      <td className="px-3 py-3 capitalize">{rotulo(pagamento.forma_pagamento).toLowerCase()}</td>
                      <td className="px-3 py-3">{dinheiro.format(pagamento.valor)}</td>
                      <td className="px-3 py-3"><CorStatus positivo={pagamento.status === "PAGO"}>{pagamento.status}</CorStatus></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>}

        {secao === "comandas" && <section className="mt-6 rounded-xl bg-white p-5 shadow">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-blue-700">Minhas comandas</p>
              <h2 className="text-xl font-bold text-slate-950">Comandas em aberto</h2>
            </div>
            <span className="text-sm text-slate-500">{comandas.length} registro(s)</span>
          </div>
          {comandas.length === 0 ? (
            <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">Nenhuma comanda em aberto.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {comandas.map((comanda) => (
                <article key={comanda.id} className="rounded-xl border border-slate-200 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-950">Comanda #{comanda.id}</h3>
                      <p className="mt-1 text-sm text-slate-600">Profissional: {comanda.barbeiro_nome || "Não informado"}</p>
                      <p className="text-sm text-slate-600">Aberta em: {dataBr(comanda.data_abertura)}</p>
                    </div>
                    <div className="text-right">
                      <CorStatus positivo={false}>{comanda.status || "ABERTA"}</CorStatus>
                      <p className="mt-2 text-lg font-bold text-slate-950">{dinheiro.format(comanda.total || 0)}</p>
                    </div>
                  </div>
                  {comanda.itens?.length > 0 && (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-[560px] text-left text-sm">
                        <thead className="border-b text-slate-500"><tr><th className="px-2 py-2">Item</th><th className="px-2 py-2">Qtd.</th><th className="px-2 py-2">Valor</th><th className="px-2 py-2">Subtotal</th></tr></thead>
                        <tbody>{comanda.itens.map((item, indice) => <tr className="border-b last:border-0" key={`${comanda.id}-${indice}`}><td className="px-2 py-2">{item.descricao}</td><td className="px-2 py-2">{item.quantidade}</td><td className="px-2 py-2">{dinheiro.format(item.valor_unitario || 0)}</td><td className="px-2 py-2 font-medium">{dinheiro.format(item.subtotal || 0)}</td></tr>)}</tbody>
                      </table>
                    </div>
                  )}
                  {Number(comanda.total || 0) > 0 ? (
                    <div className="mt-4 flex justify-end border-t border-slate-200 pt-4">
                      <button type="button" onClick={() => abrirPagamentoComanda(comanda)}
                        className="rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white hover:bg-blue-800">
                        Pagar Comanda
                      </button>
                    </div>
                  ) : (
                    <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                      Aguardando a inclusão de serviços ou produtos para liberar o pagamento.
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>}
      </div>

      {comandaPagamento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <section className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-sm font-medium text-blue-700">Comanda #{comandaPagamento.id}</p><h2 className="text-2xl font-bold">Pagar Comanda</h2></div>
              <button type="button" onClick={() => setComandaPagamento(null)} className="rounded-lg border px-3 py-2">Fechar</button>
            </div>
            <p className="mt-4 text-lg">Total: <strong>{dinheiro.format(comandaPagamento.total)}</strong></p>
            <label className="mt-5 block text-sm font-semibold">Forma de pagamento</label>
            <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3">
              <option value="pix">Pix</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="debito">Débito</option>
              <option value="credito">Crédito</option>
            </select>
            {(formaPagamento === "dinheiro" || formaPagamento === "debito") && (
              <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                Esta modalidade será paga no estabelecimento e confirmada pela equipe da barbearia.
              </p>
            )}
            {formaPagamento === "credito" && (
              mercadoPago?.public_key ? (
                <div className="mt-4 rounded-lg border p-3">
                  <CardPayment
                    initialization={{ amount: Number(comandaPagamento.total || 0), payer: { email: perfil?.email || "" } }}
                    customization={{ paymentMethods: { minInstallments: 1, maxInstallments: 12 } }}
                    onSubmit={enviarCartaoComanda}
                    onError={(error) => setErro(error?.message || "Erro ao carregar pagamento com cartão.")}
                  />
                </div>
              ) : <p className="mt-4 text-sm text-red-700">Pagamento online indisponível para esta barbearia.</p>
            )}
            {formaPagamento !== "credito" && (
              <button type="button" onClick={confirmarPagamentoComanda} disabled={processandoComandaId !== null}
                className="mt-5 w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white disabled:opacity-60">
                {processandoComandaId === comandaPagamento.id ? "Processando..." : "Pagar Comanda"}
              </button>
            )}
          </section>
        </div>
      )}

      {pix && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <section className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-sm font-medium text-blue-700">Pagamento</p><h2 className="text-xl font-bold">{pix.origem === "comanda" ? `PIX da comanda #${pix.comanda_id}` : "PIX da assinatura"}</h2></div>
              <button type="button" onClick={() => { setPix(null); window.location.reload(); }} className="rounded-lg border px-3 py-2">Fechar</button>
            </div>
            <p className="mt-4 text-sm text-slate-600">Valor: <strong>{dinheiro.format(pix.valor)}</strong></p>
            {pix.qr_code_base64 && (
              <img src={`data:image/png;base64,${pix.qr_code_base64}`} alt="QR Code PIX" className="mx-auto mt-5 w-64 max-w-full" />
            )}
            {pix.qr_code && (
              <div className="mt-5">
                <label className="text-sm font-medium">PIX Copia e Cola</label>
                <textarea readOnly value={pix.qr_code} className="mt-2 min-h-28 w-full rounded-lg border border-slate-300 p-3 text-sm" />
                <button type="button" onClick={async () => { await navigator.clipboard.writeText(pix.qr_code); setMensagem("Código PIX copiado."); }} className="mt-3 w-full rounded-lg bg-slate-950 px-4 py-2 font-semibold text-white">Copiar PIX</button>
              </div>
            )}
            {pix.ticket_url && <a href={pix.ticket_url} target="_blank" rel="noreferrer" className="mt-4 block text-center font-medium text-blue-700">Abrir no Mercado Pago</a>}
          </section>
        </div>
      )}
    </main>
  );
}

