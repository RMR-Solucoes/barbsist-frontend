"use client";

import { numeroWhatsAppBrasil } from "../../utils/telefoneBrasil";

import { useEffect, useMemo, useState } from "react";
import styles from "./agendar.module.css";

import {
  listarBarbeirosOnline,
  listarServicosOnline,
  listarHorariosDiaOnline,
  listarHorariosSemanaOnline,
  criarAgendamentoOnline,
  consultarAgendamentoOnline,
  cancelarAgendamentoOnline,
} from "@/services/agendamentoOnlineService";

import { obterBarbeariaPublica } from "@/services/barbeariaService";
import {
  carregarPerfilCliente,
  carregarMinhaAssinatura,
  carregarSaldoCreditosCliente,
  obterTokenCliente,
} from "@/services/portalClienteService";


// BARBSIST_M4_1_ACABAMENTO
function formatarServicosAgendamentoM41(agendamento) {
  const listas = [
    agendamento?.servicos,
    agendamento?.servicos_nomes,
    agendamento?.servicosNomes,
  ];

  for (const lista of listas) {
    if (!Array.isArray(lista) || lista.length === 0) {
      continue;
    }

    const nomes = lista
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        return item?.nome || item?.servico || item?.descricao || "";
      })
      .filter(Boolean);

    if (nomes.length > 0) {
      return nomes.join(" + ");
    }
  }

  if (
    typeof agendamento?.servicos === "string" &&
    agendamento.servicos.trim()
  ) {
    return agendamento.servicos.trim();
  }

  return agendamento?.servico || "-";
}


export default function AgendamentoOnlinePage() {
  // A68-D45: estado inicial identico no SSR e no navegador.
  const [origemPortal, setOrigemPortal] = useState(false);

  useEffect(() => {
    const origem = new URLSearchParams(
      window.location.search
    ).get("origem");

    setOrigemPortal(origem === "portal-cliente");
  }, []);

  const [barbeariaSlug, setBarbeariaSlug] = useState("");

  function voltarAoPortalCliente() {
    if (typeof window !== "undefined") {
      window.location.assign("/portal-cliente/inicio");
    }
  }

  const [barbearia, setBarbearia] = useState(null);
  const agendamentoOnlineAtivo = Boolean(barbearia?.permitir_agendamento_portal);
  // BARBSIST_P9_2R
  const agendamentoExclusivo = Boolean(
    barbearia?.agendamento_exige_plano_cliente
  );
  const hoje = new Date().toISOString().split("T")[0];

  const [servicos, setServicos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);

  // BARBSIST_MULTI_SERVICE_M4_CLIENTE
  const [servicosIds, setServicosIds] = useState([]);
  // P10-D14J.32-C: opcao voluntaria pelo plano quando avulso e permitido.
  const [tipoAtendimentoEscolhido, setTipoAtendimentoEscolhido] = useState("avulso");
  // A65: usos da assinatura nao equivalem a creditos livres (reservas pendentes).
  const [resumoPlano, setResumoPlano] = useState(null);
  const [carregandoPlano, setCarregandoPlano] = useState(false);
  const [erroPlano, setErroPlano] = useState("");
  // Saldo por instante escolhido: nunca equivale a usos_disponiveis.
  const [saldoCiclo, setSaldoCiclo] = useState(null);
  const [carregandoSaldo, setCarregandoSaldo] = useState(false);
  const [erroSaldo, setErroSaldo] = useState("");
  const usaPlano = agendamentoExclusivo || tipoAtendimentoEscolhido === "plano";
  const [modo, setModo] = useState("qualquer");
  const [barbeiroId, setBarbeiroId] = useState("");
  const [dataSelecionada, setDataSelecionada] = useState(hoje);

  const [horariosDia, setHorariosDia] = useState([]);
  const [horariosSemana, setHorariosSemana] = useState([]);

  const [horarioSelecionado, setHorarioSelecionado] = useState(null);

  const [cliente, setCliente] = useState({
    nome: "",
    telefone: "",
    email: "",
    observacoes: "",
  });

  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const [agendamentoConfirmado, setAgendamentoConfirmado] = useState(null);

  const [abaPublica, setAbaPublica] = useState("agendar");
  const [telefoneConsulta, setTelefoneConsulta] = useState("");
  const [resultadoConsulta, setResultadoConsulta] = useState(null);
  const [consultando, setConsultando] = useState(false);

  const [telefoneCancelamento, setTelefoneCancelamento] = useState("");
  const [resultadoCancelamento, setResultadoCancelamento] = useState(null);
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    const slug = new URLSearchParams(
      window.location.search
    ).get("barbearia")?.trim();

    if (!slug) {
      setErro("Barbearia nao informada para agendamento.");
      return;
    }

    setBarbeariaSlug(slug);
  }, []);

  useEffect(() => {
    if (!barbeariaSlug) return;

    carregarDadosIniciais();
    carregarBarbearia();
  }, [barbeariaSlug]);

  useEffect(() => {
    if (!origemPortal) {
      return;
    }

    // Visita publica: nao consultar perfil sem token.
    if (!obterTokenCliente()) {
      return;
    }

    carregarPerfilCliente()
      .then((perfilCliente) => {
        const telefone = perfilCliente?.telefone || "";

        setCliente((dadosAtuais) => ({
          ...dadosAtuais,
          nome: perfilCliente?.nome || dadosAtuais.nome,
          telefone: telefone || dadosAtuais.telefone,
          email: perfilCliente?.email || dadosAtuais.email,
        }));

        if (telefone) {
          setTelefoneConsulta(telefone);
          setTelefoneCancelamento(telefone);
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar cliente do portal:", error);
      });
  }, [origemPortal]);

  useEffect(() => {
  if (abaPublica !== "agendar") {
    return;
  }

  setHorarioSelecionado(null);
  carregarHorarios();
}, [abaPublica, servicosIds, modo, barbeiroId, dataSelecionada]);

  // A65: consulta autenticada ja usada pelo Portal do Cliente.
  // Esta resposta informa usos remanescentes, mas NAO substitui o saldo
  // livre calculado por ciclo para a data do agendamento.
  useEffect(() => {
    let ativo = true;
    if (!barbeariaSlug || !usaPlano) {
      setResumoPlano(null);
      setErroPlano("");
      setCarregandoPlano(false);
      return;
    }

    if (!obterTokenCliente()) {
      setResumoPlano(null);
      setErroPlano("Entre no Portal do Cliente para utilizar a assinatura.");
      setCarregandoPlano(false);
      return;
    }

    setCarregandoPlano(true);
    setResumoPlano(null);
    setErroPlano("");

    Promise.all([carregarPerfilCliente(), carregarMinhaAssinatura()])
      .then(([perfilCliente, assinaturaRecebida]) => {
        if (!ativo) return;
        if (perfilCliente?.barbearia_slug !== barbeariaSlug || !perfilCliente?.cliente_id) {
          setErroPlano("Esta conta pertence a outra barbearia.");
          return;
        }
        setResumoPlano(assinaturaRecebida || null);
        if (!assinaturaRecebida) {
          setErroPlano("Nenhuma assinatura encontrada para este cliente.");
        }
      })
      .catch((falha) => {
        if (!ativo) return;
        const status = falha?.response?.status;
        setErroPlano(status === 401 || status === 403
          ? "Sessao invalida. Acesse novamente o Portal do Cliente."
          : "Nao foi possivel consultar os dados da assinatura.");
      })
      .finally(() => {
        if (ativo) setCarregandoPlano(false);
      });

    return () => { ativo = false; };
  }, [barbeariaSlug, usaPlano]);

  // B20-C4-A65-R6: consulta o saldo para a data/hora EXATA do slot.
  // Limpa o saldo quando o slot muda, prevenindo exibir creditos de outro ciclo.
  const instanteSaldo = horarioSelecionado?.data_hora_inicio || "";
  useEffect(() => {
    let ativo = true;
    setSaldoCiclo(null);
    setErroSaldo("");
    if (!usaPlano || !barbeariaSlug || !instanteSaldo || erroPlano) {
      setCarregandoSaldo(false);
      return;
    }
    if (!obterTokenCliente()) {
      setErroSaldo("Entre novamente no Portal do Cliente para consultar seus creditos.");
      setCarregandoSaldo(false);
      return;
    }

    setCarregandoSaldo(true);
    carregarSaldoCreditosCliente(instanteSaldo)
      .then((saldo) => {
        if (ativo) setSaldoCiclo(saldo);
      })
      .catch((falha) => {
        if (!ativo) return;
        const status = falha?.response?.status;
        const detalhe = falha?.response?.data?.detail;
        setErroSaldo(status === 401 || status === 403
          ? "Acesso ao saldo nao autorizado. Entre novamente no Portal do Cliente."
          : status === 404
            ? "Nao foi encontrada uma assinatura para esta conta."
            : typeof detalhe === "string" && status === 409
              ? detalhe
              : "Nao foi possivel obter o saldo livre para o horario escolhido.");
      })
      .finally(() => {
        if (ativo) setCarregandoSaldo(false);
      });

    return () => { ativo = false; };
  }, [usaPlano, barbeariaSlug, instanteSaldo, erroPlano]);

  async function carregarBarbearia() {
  try {
    const dados = await obterBarbeariaPublica(barbeariaSlug);

    console.log("BARBEARIA:", dados);

    setBarbearia(dados);
    if (dados?.agendamento_exige_plano_cliente) {
      setTipoAtendimentoEscolhido("plano");
    }

    if (!dados?.permitir_agendamento_portal) {
      setAbaPublica("consultar");
    }
  } catch (error) {
    console.error(error);
    setBarbearia(null);
  }
}

  async function carregarDadosIniciais() {
    try {
      setErro("");

      const [dadosServicos, dadosBarbeiros] = await Promise.all([
        listarServicosOnline(barbeariaSlug),
        listarBarbeirosOnline(barbeariaSlug),
      ]);

      setServicos(dadosServicos || []);
      setBarbeiros(dadosBarbeiros || []);
    } catch (error) {
      const status = error?.response?.status;
      const detalhe = error?.response?.data?.detail;

      const bloqueioSaasEsperado =
        status === 403 &&
        detalhe === "Agendamento online não está disponível nesta barbearia.";

      if (bloqueioSaasEsperado) {
        if (agendamentoOnlineAtivo) {
          setErro("Novos agendamentos online estão temporariamente indisponíveis.");
        } else {
          setErro("");
        }
      } else {
        console.error(error);
        setErro("Erro ao carregar dados do agendamento.");
      }
    }
  }

  function alternarServico(servicoId) {
    const id = Number(servicoId);

    setServicosIds((atuais) => {
      const jaSelecionado = atuais.some(
        (item) => Number(item) === id
      );

      if (jaSelecionado) {
        return atuais.filter(
          (item) => Number(item) !== id
        );
      }

      return [...atuais, id];
    });
  }

  async function carregarHorarios() {
    if (servicosIds.length === 0 || !dataSelecionada) {
      setHorariosDia([]);
      setHorariosSemana([]);
      return;
    }

    if (modo === "barbeiro" && !barbeiroId) {
      setHorariosDia([]);
      setHorariosSemana([]);
      return;
    }

    try {
      setCarregando(true);
      setErro("");

      if (modo === "barbeiro") {
        const dados = await listarHorariosSemanaOnline(
          barbeariaSlug,
          barbeiroId,
          servicosIds,
          dataSelecionada
        );

        setHorariosSemana(dados || []);
        setHorariosDia([]);
      } else {
        const dados = await listarHorariosDiaOnline(
          barbeariaSlug,
          servicosIds,
          dataSelecionada
        );

        setHorariosDia(dados || []);
        setHorariosSemana([]);
      }
    } catch (error) {
      console.error(error);
      setErro("Erro ao carregar horários disponíveis.");
    } finally {
      setCarregando(false);
    }
  }

  function reiniciarNovoAgendamentoM41() {
    setAgendamentoConfirmado(null);
    setMensagem("");
    setErro("");

    setServicosIds([]);
    setModo("qualquer");
    setBarbeiroId("");
    setDataSelecionada(hoje);

    setHorariosDia([]);
    setHorariosSemana([]);
    setHorarioSelecionado(null);

    setCliente({
      nome: "",
      telefone: "",
      email: "",
      observacoes: "",
    });
  }

  function alterarCliente(campo, valor) {
    setCliente((atual) => ({
      ...atual,
      [campo]: campo === "nome" ? valor.toUpperCase() : valor,
    }));
  }

  function selecionarHorario(horario) {
    setMensagem("");
    setErro("");
    setHorarioSelecionado(horario);
  }

  async function confirmarAgendamento() {
  setMensagem("");
  setErro("");

  if (!agendamentoOnlineAtivo) {
    setErro("Agendamento online não está disponível nesta barbearia.");
    return;
  }
  if (servicosIds.length === 0) {
    setErro("Escolha pelo menos um serviço.");
    return;
  }

  if (!horarioSelecionado) {
    setErro("Escolha um horário disponível.");
    return;
  }

  if (usaPlano && (carregandoPlano || carregandoSaldo)) {
    setErro("Aguarde a verificacao da assinatura e dos creditos livres.");
    return;
  }

  if (usaPlano && (erroPlano || erroSaldo)) {
    setErro(erroPlano || erroSaldo);
    return;
  }
  if (usaPlano && (!resumoPlano || !saldoCiclo ||
      instanteSaldo !== horarioSelecionado?.data_hora_inicio)) {
    setErro("Ainda nao foi possivel validar o saldo para este horario.");
    return;
  }
  if (usaPlano && Number(saldoCiclo.creditos_livres) < servicosIds.length) {
    setErro("Saldo insuficiente para os servicos selecionados. Selecione menos servicos ou atendimento avulso.");
    return;
  }

  if (usaPlano && resumoPlano &&
      (String(resumoPlano.status || "").toUpperCase() !== "ATIVO" ||
       String(resumoPlano.status_pagamento || "").toUpperCase() !== "PAGO")) {
    setErro("Sua assinatura ainda nao esta ativa e paga. Escolha avulso ou regularize o plano.");
    return;
  }

  let perfilAutenticado = null;
  let tokenReserva = null;

  if (usaPlano) {
    tokenReserva = obterTokenCliente();

    if (!tokenReserva) {
      setErro(
        "Para utilizar créditos do plano, entre no Portal do Cliente desta barbearia."
      );
      window.location.assign(
        `/portal-cliente?barbearia=${encodeURIComponent(barbeariaSlug)}`
      );
      return;
    }

    try {
      perfilAutenticado = await carregarPerfilCliente();
    } catch {
      setErro("Sua sessão do Portal do Cliente expirou. Entre novamente.");
      return;
    }

    if (
      perfilAutenticado?.barbearia_slug !== barbeariaSlug ||
      !perfilAutenticado?.cliente_id
    ) {
      setErro(
        "Sua conta pertence a outra barbearia. Entre no portal correto."
      );
      return;
    }

    if (
      !perfilAutenticado?.nome?.trim() ||
      !perfilAutenticado?.telefone?.trim()
    ) {
      setErro(
        "Atualize seu nome e telefone no Portal do Cliente antes de agendar."
      );
      return;
    }
  }

  if (!usaPlano && !cliente.nome.trim()) {
    setErro("Informe seu nome.");
    return;
  }

  if (!usaPlano && !cliente.telefone.trim()) {
    setErro("Informe seu telefone.");
    return;
  }

  const dados = {
    nome_cliente: usaPlano
      ? perfilAutenticado.nome.trim()
      : cliente.nome.trim(),
    telefone_cliente: usaPlano
      ? perfilAutenticado.telefone.trim()
      : cliente.telefone.trim(),
    barbeiro_id: Number(horarioSelecionado.barbeiro_id),
    servico_id: Number(servicosIds[0]),
    servicos_ids: servicosIds.map(Number),
    data_hora_inicio: horarioSelecionado.data_hora_inicio,
    tipo_atendimento: usaPlano ? "plano" : "avulso",
    observacoes: montarObservacoesCliente(),
  };

  try {
    setSalvando(true);

    // Nova consulta antes de criar: evita usar saldo exibido que ja ficou antigo.
    // O backend continua sendo a autoridade e valida novamente na reserva.
    if (usaPlano) {
      const saldoAtual = await carregarSaldoCreditosCliente(dados.data_hora_inicio);
      setSaldoCiclo(saldoAtual);
      if (!Number.isFinite(Number(saldoAtual?.creditos_livres)) ||
          Number(saldoAtual.creditos_livres) < servicosIds.length) {
        setErro("Nao ha creditos livres suficientes para este atendimento.");
        return;
      }
    }

    await criarAgendamentoOnline(
      barbeariaSlug,
      dados,
      usaPlano ? tokenReserva : null
    );

    setAgendamentoConfirmado({
        cliente: usaPlano
          ? perfilAutenticado.nome
          : cliente.nome,
        telefone: usaPlano ? perfilAutenticado.telefone : cliente.telefone,
        servico: servicosSelecionados
          .map((item) => item.nome)
          .join(", "),
        barbeiro: horarioSelecionado.barbeiro_nome,
        data: dataSelecionada,
        horario: horarioSelecionado.horario,
        protocolo: `AGD-${dataSelecionada.replaceAll("-", "")}-${horarioSelecionado.horario.replace(":", "")}`,
        });
    setHorarioSelecionado(null);

    setCliente({
      nome: "",
      telefone: "",
      email: "",
      observacoes: "",
    });

    await carregarHorarios();
    if (usaPlano) {
      try {
        const atualizada = await carregarMinhaAssinatura();
        setResumoPlano(atualizada || null);
      } catch {
        // A reserva foi confirmada; falha de atualizacao nao a desfaz.
        setErroPlano("Atualize a pagina para consultar sua assinatura.");
      }
    }
  } catch (error) {
    console.error(error);

    const detalhe = error?.response?.data?.detail;

    const status = error?.response?.status;
    setErro(
      status === 401
        ? "Sua sessao expirou. Entre novamente no Portal do Cliente."
        : status === 403
          ? "Seu acesso nao autoriza este agendamento. Verifique a barbearia e a assinatura."
          : status === 409
            ? (typeof detalhe === "string" ? detalhe : "Nao ha creditos livres suficientes para reservar os servicos selecionados.")
            : typeof detalhe === "string"
              ? detalhe
              : "Erro ao confirmar agendamento. Tente novamente."
    );
  } finally {
    setSalvando(false);
  }
}

async function consultarAgendamento() {
  if (!telefoneConsulta.trim()) {
    setErro("Informe o telefone.");
    return;
  }

  try {
    setConsultando(true);
    setErro("");
    setMensagem("");
    setResultadoConsulta(null);

    const resultado = await consultarAgendamentoOnline(
      barbeariaSlug,
      telefoneConsulta,
      obterTokenCliente(barbeariaSlug)
    );

    const agendamentos = resultado?.agendamentos || [];

    setResultadoConsulta({
      ...resultado,
      agendamentos,
    });

    if (agendamentos.length === 0) {
      setMensagem(
        "Nenhum agendamento futuro encontrado para este telefone."
      );
    }
  } catch (error) {
    console.error(error);

    setResultadoConsulta(null);

    setErro(
      error?.response?.data?.detail ||
        "Nenhum agendamento encontrado."
    );
  } finally {
    setConsultando(false);
  }
}
async function buscarAgendamentosParaCancelar() {
  if (!telefoneCancelamento.trim()) {
    setErro("Informe o telefone.");
    return;
  }

  try {
    setCancelando(true);
    setErro("");
    setResultadoCancelamento(null);

    const resultado =
      await consultarAgendamentoOnline(
        barbeariaSlug,
        telefoneCancelamento,
        obterTokenCliente(barbeariaSlug)
      );

    setResultadoCancelamento(resultado);
  } catch (error) {
    // A68-D40: 404 significa que nao ha agendamentos
    // ativos para exibir. Preservar a mensagem de
    // cancelamento concluido, quando houver.
    if (error?.response?.status === 404) {
      setResultadoCancelamento({ agendamentos: [] });
      return;
    }

    console.error(error);

    setResultadoCancelamento(null);

    setErro(
      error?.response?.data?.detail ||
      "Nenhum agendamento encontrado."
    );
  } finally {
    setCancelando(false);
  }
}

async function cancelarAgendamento(agendamento) {
  setErro("");
  setMensagem("");
  let tokenCancelamento = null;
  if ((agendamento?.tipo_atendimento || "").toLowerCase() === "plano") {
    tokenCancelamento = obterTokenCliente();
    if (!tokenCancelamento) {
      setErro("Para cancelar um atendimento do plano, entre no Portal do Cliente da barbearia.");
      return;
    }
    try {
      const perfil = await carregarPerfilCliente();
      if (perfil?.barbearia_slug !== barbeariaSlug || !perfil?.cliente_id) {
        setErro("Este acesso pertence a outra barbearia. Entre no Portal do Cliente correto.");
        return;
      }
    } catch {
      setErro("Sua sessão do Portal do Cliente expirou. Entre novamente.");
      return;
    }
  }
  try {
    setCancelando(true);

    await cancelarAgendamentoOnline(
      barbeariaSlug,
      telefoneCancelamento,
      agendamento.id,
      tokenCancelamento
    );

    setMensagem(
      "Agendamento cancelado com sucesso."
    );

    await buscarAgendamentosParaCancelar();
  } catch (error) {
    console.error(error);

    setErro(
      error?.response?.status === 409
        ? "Não é possível cancelar este agendamento porque já existe uma comanda vinculada. Procure a barbearia."
        : error?.response?.status === 401
          ? "Sua sessão do Portal do Cliente não está válida. Faça login novamente."
          : error?.response?.status === 403
            ? "Este agendamento pertence a outro cliente ou barbearia."
            : error?.response?.data?.detail || "Erro ao cancelar agendamento."
    );
  } finally {
    setCancelando(false);
  }
}

  function abrirWhatsApp() {
  if (!agendamentoConfirmado) return;

  const mensagemWhatsapp = [
    `Olá ${agendamentoConfirmado.cliente}!`,
    "",
    "Seu agendamento foi confirmado com sucesso.",
    "",
    `Serviço: ${agendamentoConfirmado.servico}`,
    `Barbeiro: ${agendamentoConfirmado.barbeiro}`,
    `Data: ${formatarData(agendamentoConfirmado.data)}`,
    `Horário: ${agendamentoConfirmado.horario}`,
    `Protocolo: ${agendamentoConfirmado.protocolo}`,
    "",
    "Obrigado pela preferência.",
  ].join("\n");

  const telefoneBarbearia = numeroWhatsAppBrasil(
    barbearia?.telefone_whatsapp
  );

  const url = telefoneBarbearia
    ? `https://wa.me/${telefoneBarbearia}?text=${encodeURIComponent(
        mensagemWhatsapp
      )}`
    : `https://wa.me/?text=${encodeURIComponent(mensagemWhatsapp)}`;

  window.open(url, "_blank", "noopener,noreferrer");
}

  function montarObservacoesCliente() {
  const partes = [
    "AGENDAMENTO ONLINE",
    `CLIENTE: ${cliente.nome.trim()}`,
    `TELEFONE: ${cliente.telefone.trim()}`,
  ];

  if (cliente.email.trim()) {
    partes.push(`EMAIL: ${cliente.email.trim()}`);
  }

  if (cliente.observacoes.trim()) {
    partes.push(`OBS: ${cliente.observacoes.trim()}`);
  }

  return partes.join(" | ");
}

const servicosSelecionados = useMemo(() => {
  const selecionados = new Set(
    servicosIds.map((id) => Number(id))
  );

  return servicos.filter(
    (servico) => selecionados.has(Number(servico.id))
  );
}, [servicos, servicosIds]);

const duracaoTotalSelecionada = useMemo(() => {
  return servicosSelecionados.reduce(
    (total, servico) =>
      total + Number(servico.tempo_medio_minutos || 30),
    0
  );
}, [servicosSelecionados]);

const valorTotalSelecionado = useMemo(() => {
  return servicosSelecionados.reduce(
    (total, servico) =>
      total + Number(servico.preco || 0),
    0
  );
}, [servicosSelecionados]);

const barbeiroSelecionado = useMemo(() => {
  return barbeiros.find((b) => Number(b.id) === Number(barbeiroId));
}, [barbeiros, barbeiroId]);

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "15px",
};

const buttonStyle = {
  background: "#111827",
  color: "#ffffff",
  border: "none",
  padding: "13px 18px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "700",
};

const optionButtonStyle = (ativo) => ({
  border: ativo ? "2px solid #2563eb" : "1px solid #d1d5db",
  background: ativo ? "#eff6ff" : "#ffffff",
  color: "#111827",
  padding: "14px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: ativo ? "700" : "500",
  textAlign: "left",
});

const horarioButtonStyle = (ativo) => ({
  border: ativo ? "2px solid #16a34a" : "1px solid #d1d5db",
  background: ativo ? "#dcfce7" : "#ffffff",
  color: "#111827",
  padding: "10px 12px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "700",
});

if (agendamentoConfirmado) {
  return (
    <main
      className={styles.pagina}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <section
        style={{
          background: "#ffffff",
          width: "100%",
          maxWidth: "620px",
          borderRadius: "22px",
          padding: "35px",
          boxShadow: "0 15px 35px rgba(0,0,0,0.25)",
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        {origemPortal && (
          <div style={{ marginBottom: "18px" }}>
            <button
              type="button"
              onClick={voltarAoPortalCliente}
              style={{
                ...buttonStyle,
                background: "transparent",
                border: "1px solid #93c5fd",
                color: "#ffffff",
              }}
            >
              ← Voltar ao Portal do Cliente
            </button>
          </div>
        )}

        <div
          style={{
            fontSize: "54px",
            marginBottom: "10px",
          }}
        >
          ✅
        </div>

        <h1
          style={{
            color: "#166534",
            marginBottom: "8px",
          }}
        >
          Agendamento Confirmado
        </h1>

        <p
          style={{
            color: "#6b7280",
            marginBottom: "25px",
          }}
        >
          Seu horário foi reservado com sucesso.
        </p>

        <div
          style={{
            textAlign: "left",
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "20px",
            lineHeight: "1.9",
            marginBottom: "25px",
          }}
        >
          <p>
            <strong>Cliente:</strong>{" "}
            {agendamentoConfirmado.cliente}
          </p>

          <p>
            <strong>Telefone:</strong>{" "}
            {agendamentoConfirmado.telefone}
          </p>

          <p>
            <strong>Serviço:</strong>{" "}
            {agendamentoConfirmado.servico}
          </p>

          <p>
            <strong>Barbeiro:</strong>{" "}
            {agendamentoConfirmado.barbeiro}
          </p>

          <p>
            <strong>Data:</strong>{" "}
            {formatarData(
              agendamentoConfirmado.data
            )}
          </p>

          <p>
            <strong>Horário:</strong>{" "}
            {agendamentoConfirmado.horario}
          </p>

          <p>
            <strong>Protocolo:</strong>{" "}
            {agendamentoConfirmado.protocolo}
          </p>
        </div>

        <div className={styles.acoesConfirmacao}>
          <button
            type="button"
            className={styles.botaoPrincipal}
            onClick={reiniciarNovoAgendamentoM41}
            style={{
              ...buttonStyle,
              flex: 1,
              background: "#111827",
            }}
          >
            Novo Agendamento
          </button>

          <button
            type="button"
            className={styles.botaoPrincipal}
            onClick={abrirWhatsApp}
            style={{
              ...buttonStyle,
              flex: 1,
              background: "#16a34a",
            }}
          >
            WhatsApp
          </button>
        </div>
      </section>
    </main>
  );
}

return (
  <main className={styles.pagina}>
    <section className={styles.container}>
      {origemPortal && (
        <div style={{ marginBottom: "18px" }}>
          <button
            type="button"
            onClick={voltarAoPortalCliente}
            style={{
              ...buttonStyle,
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              color: "#1e293b",
            }}
          >
            ← Voltar à tela inicial
          </button>
        </div>
      )}
      <header className={styles.cabecalho}>
        <section className={styles.painelBarbearia}>
          {barbearia?.imagem_capa_url && (
            <img
              src={barbearia.imagem_capa_url}
              alt="Capa da Barbearia"
              className={styles.imagemCapa}
            />
          )}

          <div className={styles.identidadeConteudo}>
            {barbearia?.logo_url ? (
              <img
                src={barbearia.logo_url}
                alt="Logo da Barbearia"
                className={styles.logo}
              />
            ) : (
              <div className={styles.logoPlaceholder}>✂</div>
            )}

            <span className={styles.seloAgendamento}>Agendamento online</span>

            <h1 className={styles.titulo}>
              {barbearia?.nome || "BarbSist"}
            </h1>

            {barbearia?.slogan && (
              <p className={styles.slogan}>{barbearia.slogan}</p>
            )}

            <div className={styles.infoBarbearia}>
              {barbearia?.telefone_whatsapp && (
                <span>📱 {barbearia.telefone_whatsapp}</span>
              )}

              {!barbearia?.telefone_whatsapp && barbearia?.telefone && (
                <span>📞 {barbearia.telefone}</span>
              )}

              {barbearia?.instagram && (
                <span>📸 {barbearia.instagram}</span>
              )}

              {barbearia?.endereco && (
                <span>📍 {barbearia.endereco}</span>
              )}
            </div>
          </div>
        </section>

        <section className={styles.painelNavegacao}>
          <div>
            <span className={styles.sobretitulo}>BARBSIST</span>
            <h2 className={styles.tituloAcao}>
              {abaPublica === "agendar" && "Agende seu horário"}
              {abaPublica === "consultar" && "Consulte seus horários"}
              {abaPublica === "cancelar" && "Cancelar agendamento"}
            </h2>
          </div>

          <div className={styles.abas}>
            <button
              type="button"
              onClick={() => {
                if (agendamentoOnlineAtivo) {
                  setAbaPublica("agendar");
                }
              }}
              disabled={!agendamentoOnlineAtivo}
              className={`${styles.botaoAba} ${
                abaPublica === "agendar" ? styles.botaoAbaAtivo : ""
              }`}
            >
              Agendar
            </button>

            <button
              type="button"
              onClick={() => setAbaPublica("consultar")}
              className={`${styles.botaoAba} ${
                abaPublica === "consultar" ? styles.botaoAbaAtivo : ""
              }`}
            >
              Consultar
            </button>

            <button
              type="button"
              onClick={() => setAbaPublica("cancelar")}
              className={`${styles.botaoAba} ${
                abaPublica === "cancelar" ? styles.botaoAbaPerigo : ""
              }`}
            >
              Cancelar
            </button>
          </div>

          <p className={styles.instrucaoTopo}>
            {abaPublica === "agendar" &&
              "Escolha o serviço, profissional, data e horário. A confirmação leva apenas alguns passos."}

            {abaPublica === "consultar" &&
              "Informe seu telefone para consultar seus agendamentos."}

            {abaPublica === "cancelar" &&
              "Informe seu telefone para localizar e cancelar um agendamento."}
          </p>

          {!agendamentoOnlineAtivo && (
            <div className={styles.avisoIndisponivel}>
              🔒 Novos agendamentos online estão temporariamente indisponíveis.
            </div>
          )}
        </section>
      </header>
      {mensagem && (
        <div
          style={{
            background: "#dcfce7",
            color: "#166534",
            padding: "14px",
            borderRadius: "12px",
            marginBottom: "18px",
            fontWeight: "700",
          }}
        >
          {mensagem}
        </div>
      )}

      {erro && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "14px",
            borderRadius: "12px",
            marginBottom: "18px",
            fontWeight: "700",
          }}
        >
          {erro}
        </div>
      )}

      {abaPublica === "consultar" && (
        <section style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={cardStyle}>
            <h2>Consultar Agendamento</h2>

            <p style={{ color: "#6b7280", marginBottom: "15px" }}>
              Digite seu telefone para consultar seus agendamentos.
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <input
                value={telefoneConsulta}
                onChange={(e) => setTelefoneConsulta(e.target.value)}
                placeholder="Digite seu telefone"
                style={inputStyle}
              />

              <button
                type="button"
                onClick={consultarAgendamento}
                disabled={consultando}
                style={{
                  ...buttonStyle,
                  minWidth: "140px",
                  opacity: consultando ? 0.6 : 1,
                }}
              >
                {consultando ? "Consultando..." : "Consultar"}
              </button>
            </div>

            {resultadoConsulta && (
              <div
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <h3>{resultadoConsulta.cliente}</h3>

                <p>
                  <strong>Telefone:</strong> {resultadoConsulta.telefone}
                </p>

                <hr style={{ margin: "15px 0" }} />

                {resultadoConsulta.agendamentos?.length === 0 && (
                  <p>Nenhum agendamento encontrado.</p>
                )}

                {resultadoConsulta.agendamentos?.map((agendamento) => (
                  <div
                    key={agendamento.id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      padding: "16px",
                      background: "#ffffff",
                      marginBottom: "12px",
                    }}
                  >
                    <h3 style={{ marginBottom: "12px", color: "#111827" }}>
                      ✂️ {formatarServicosAgendamentoM41(agendamento)}
                    </h3>

                    <p>
                      <strong>👨‍💼 Barbeiro:</strong> {agendamento.barbeiro}
                    </p>

                    <p>
                      <strong>📅 Data:</strong>{" "}
                      {new Date(agendamento.data_hora_inicio).toLocaleDateString(
                        "pt-BR"
                      )}
                    </p>

                    <p>
                      <strong>🕒 Horário:</strong>{" "}
                      {new Date(agendamento.data_hora_inicio).toLocaleTimeString(
                        "pt-BR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>

                    <p>
                      <strong>📌 Status:</strong> {agendamento.status}
                    </p>

                    <p>
                      <strong>💳 Atendimento:</strong>{" "}
                      {agendamento.tipo_atendimento}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {abaPublica === "cancelar" && (
        <section style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={cardStyle}>
            <h2>Cancelar Agendamento</h2>

            <p style={{ color: "#6b7280", marginBottom: "15px" }}>
              Digite seu telefone para localizar seus agendamentos.
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <input
                value={telefoneCancelamento}
                onChange={(e) => setTelefoneCancelamento(e.target.value)}
                placeholder="Digite seu telefone"
                style={inputStyle}
              />

              <button
                type="button"
                onClick={buscarAgendamentosParaCancelar}
                disabled={cancelando}
                style={{
                  ...buttonStyle,
                  minWidth: "140px",
                  opacity: cancelando ? 0.6 : 1,
                }}
              >
                {cancelando ? "Buscando..." : "Buscar"}
              </button>
            </div>

            {resultadoCancelamento && (
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                <h3>{resultadoCancelamento.cliente}</h3>

                <p>
                  <strong>Telefone:</strong> {resultadoCancelamento.telefone}
                </p>

                {resultadoCancelamento.agendamentos?.length === 0 && (
                  <p>Nenhum agendamento encontrado.</p>
                )}

                {resultadoCancelamento.agendamentos?.map((agendamento) => (
                  <div
                    key={agendamento.id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      padding: "16px",
                      background: "#f9fafb",
                    }}
                  >
                    <h3 style={{ marginBottom: "12px", color: "#111827" }}>
                      ✂️ {formatarServicosAgendamentoM41(agendamento)}
                    </h3>

                    <p>
                      <strong>👨‍💼 Barbeiro:</strong> {agendamento.barbeiro}
                    </p>

                    <p>
                      <strong>📅 Data:</strong>{" "}
                      {new Date(agendamento.data_hora_inicio).toLocaleDateString(
                        "pt-BR"
                      )}
                    </p>

                    <p>
                      <strong>🕒 Horário:</strong>{" "}
                      {new Date(agendamento.data_hora_inicio).toLocaleTimeString(
                        "pt-BR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>

                    <p>
                      <strong>📌 Status:</strong> {agendamento.status}
                    </p>

                    <p>
                      <strong>💳 Atendimento:</strong>{" "}
                      {agendamento.tipo_atendimento}
                    </p>

                    <button
                      type="button"
                      onClick={() => cancelarAgendamento(agendamento)}
                      disabled={cancelando}
                      style={{
                        marginTop: "12px",
                        background: "#dc2626",
                        color: "#ffffff",
                        border: "none",
                        padding: "11px 16px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "700",
                        opacity: cancelando ? 0.6 : 1,
                      }}
                    >
                      {cancelando ? "Cancelando..." : "Cancelar Agendamento"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
      {abaPublica === "agendar" && (
        <section className={styles.layoutAgendamento}>
          <div className={styles.colunaFormulario}>
            <div className={styles.etapaCard}>
              <div className={styles.etapaCabecalho}>
                <span className={styles.numeroEtapa}>1</span>
                <div>
                  <h2>Escolha os serviços</h2>
                  <p>Selecione um ou mais atendimentos.</p>
                </div>
              </div>

              <div className={styles.listaServicos}>
                {servicos.map((servico) => {
                  const selecionado = servicosIds.some(
                    (id) => Number(id) === Number(servico.id)
                  );

                  return (
                    <button
                      key={servico.id}
                      type="button"
                      onClick={() => alternarServico(servico.id)}
                      className={`${styles.servicoItem} ${
                        selecionado ? styles.servicoItemAtivo : ""
                      }`}
                    >
                      <span className={styles.servicoSelecao}>
                        {selecionado ? "✓" : ""}
                      </span>

                      <span className={styles.servicoDescricao}>
                        <strong>{servico.nome}</strong>
                        <small>
                          {servico.tempo_medio_minutos || 30} min
                        </small>
                      </span>

                      <span className={styles.servicoPreco}>
                        <strong>{formatarMoeda(servico.preco)}</strong>
                        <small>
                          {selecionado ? "Selecionado" : "Selecionar"}
                        </small>
                      </span>
                    </button>
                  );
                })}

                {!servicos.length && (
                  <p className={styles.textoAuxiliar}>
                    Nenhum serviço disponível para agendamento.
                  </p>
                )}
              </div>

              {servicosIds.length > 0 && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    display: "grid",
                    gap: "6px",
                  }}
                >
                  <strong>
                    {servicosIds.length} serviço
                    {servicosIds.length === 1 ? "" : "s"} selecionado
                    {servicosIds.length === 1 ? "" : "s"}
                  </strong>
                  <span>
                    Tempo estimado: {duracaoTotalSelecionada} min
                  </span>
                  <span>
                    Total: {formatarMoeda(valorTotalSelecionado)}
                  </span>
                </div>
              )}
            </div>

            <div style={cardStyle}>
              <h2>Forma de atendimento</h2>
              {agendamentoExclusivo ? (
                <p>Esta barbearia permite agendamento online somente com plano ativo.</p>
              ) : (
                <div className={styles.gradeOpcoes}>
                  <button type="button"
                    style={optionButtonStyle(tipoAtendimentoEscolhido === "avulso")}
                    onClick={() => setTipoAtendimentoEscolhido("avulso")}
                    aria-pressed={tipoAtendimentoEscolhido === "avulso"}>
                    <strong>Atendimento avulso</strong>
                    <br />
                    <span>Pagamento conforme as condições da barbearia.</span>
                  </button>
                  <button type="button"
                    style={optionButtonStyle(tipoAtendimentoEscolhido === "plano")}
                    onClick={() => setTipoAtendimentoEscolhido("plano")}
                    aria-pressed={tipoAtendimentoEscolhido === "plano"}>
                    <strong>Usar meu plano</strong>
                    <br />
                    <span>Necessita login no Portal do Cliente e créditos válidos.</span>
                  </button>
                </div>
              )}
              {usaPlano && (
                <div role="status" aria-live="polite" style={{ marginTop: "12px", color: "#334155", display: "grid", gap: "8px" }}>
                  {carregandoPlano && <p>Consultando sua assinatura...</p>}
                  {erroPlano && <p style={{ color: "#b91c1c" }}>{erroPlano}</p>}
                  {!carregandoPlano && resumoPlano && (
                    <>
                      <p><strong>Assinatura:</strong> {resumoPlano?.plano?.nome || "Plano contratado"}</p>
                      <p><strong>Situação:</strong> {resumoPlano.status || "Nao informada"} / {resumoPlano.status_pagamento || "Pagamento nao informado"}</p>
                      <p><strong>Usos remanescentes informados:</strong> {Number.isInteger(Number(resumoPlano.usos_disponiveis)) && resumoPlano.usos_disponiveis !== null ? resumoPlano.usos_disponiveis : "Nao informado"}</p>
                    </>
                  )}
                  <p><strong>Créditos necessários:</strong> {servicosIds.length} (um por serviço).</p>
                  {!horarioSelecionado && <p>Escolha um horario para consultar os creditos livres validos naquela data.</p>}
                  {carregandoSaldo && <p>Consultando saldo livre para o horario...</p>}
                  {erroSaldo && <p style={{ color: "#b91c1c" }}>{erroSaldo}</p>}
                  {horarioSelecionado && !carregandoSaldo && saldoCiclo && (
                    <>
                      <p><strong>Créditos livres:</strong> {saldoCiclo.creditos_livres}</p>
                      <p><strong>Créditos reservados:</strong> {saldoCiclo.creditos_reservados}</p>
                      <p><strong>Créditos consumidos no ciclo:</strong> {saldoCiclo.creditos_consumidos_ciclo}</p>
                      {Number(saldoCiclo.creditos_livres) < servicosIds.length && (
                        <p style={{ color: "#b91c1c" }}>Créditos insuficientes para os serviços escolhidos.</p>
                      )}
                    </>
                  )}
                  <p style={{ fontSize: "13px", color: "#64748b" }}>
                    O saldo livre considera reservas e consumo no ciclo da data escolhida.
                    A disponibilidade sera revalidada pelo servidor na confirmacao.
                  </p>
                </div>
              )}
            </div>

            <div style={cardStyle}>
              <h2>2. Como deseja agendar?</h2>

              <div className={styles.gradeOpcoes}>
                <button
                  type="button"
                  onClick={() => {
                    setModo("qualquer");
                    setBarbeiroId("");
                  }}
                  style={optionButtonStyle(modo === "qualquer")}
                >
                  <strong>Primeiro horário disponível</strong>
                  <br />
                  <span style={{ color: "#6b7280" }}>
                    Ver horários de todos os barbeiros no dia.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setModo("barbeiro")}
                  style={optionButtonStyle(modo === "barbeiro")}
                >
                  <strong>Escolher barbeiro</strong>
                  <br />
                  <span style={{ color: "#6b7280" }}>
                    Ver a semana disponível de um barbeiro.
                  </span>
                </button>
              </div>
            </div>

            {modo === "barbeiro" && (
              <div style={cardStyle}>
                <h2>3. Escolha o barbeiro</h2>

                <select
                  value={barbeiroId}
                  onChange={(e) => setBarbeiroId(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Selecione um barbeiro</option>

                  {barbeiros.map((barbeiro) => (
                    <option key={barbeiro.id} value={barbeiro.id}>
                      {barbeiro.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={cardStyle}>
              <h2>{modo === "barbeiro" ? "4." : "3."} Escolha a data</h2>

              <input
                type="date"
                value={dataSelecionada}
                min={hoje}
                onChange={(e) => setDataSelecionada(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={cardStyle}>
              <h2>{modo === "barbeiro" ? "5." : "4."} Horários disponíveis</h2>

              {carregando && <p>Carregando horários...</p>}

              {!carregando && servicosIds.length === 0 && (
                <p style={{ color: "#6b7280" }}>
                  Escolha um serviço para visualizar os horários.
                </p>
              )}

              {!carregando && modo === "barbeiro" && servicosIds.length > 0 && !barbeiroId && (
                <p style={{ color: "#6b7280" }}>
                  Escolha um barbeiro para visualizar a semana.
                </p>
              )}

              {!carregando && modo === "qualquer" && servicosIds.length > 0 && (
                <ListaHorariosDia
                  horarios={horariosDia}
                  horarioSelecionado={horarioSelecionado}
                  selecionarHorario={selecionarHorario}
                  horarioButtonStyle={horarioButtonStyle}
                />
              )}

              {!carregando && modo === "barbeiro" && servicosIds.length > 0 && barbeiroId && (
                <ListaHorariosSemana
                  semana={horariosSemana}
                  horarioSelecionado={horarioSelecionado}
                  selecionarHorario={selecionarHorario}
                  horarioButtonStyle={horarioButtonStyle}
                />
              )}
            </div>

            <div style={cardStyle}>
              <h2>{modo === "barbeiro" ? "6." : "5."} Seus dados</h2>

              <div className={styles.gradeDados}>
                <div>
                  <label>Nome</label>
                  <input
                    value={cliente.nome}
                    onChange={(e) => alterarCliente("nome", e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label>Telefone</label>
                  <input
                    value={cliente.telefone}
                    onChange={(e) => alterarCliente("telefone", e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label>Email opcional</label>
                  <input
                    value={cliente.email}
                    onChange={(e) => alterarCliente("email", e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label>Observações</label>
                  <input
                    value={cliente.observacoes}
                    onChange={(e) => alterarCliente("observacoes", e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          <aside
            className={styles.resumo}
            style={cardStyle}
          >
            <h2>Resumo</h2>
            <ResumoLinha
              titulo="Serviços"
              valor={
                servicosSelecionados.length
                  ? servicosSelecionados
                      .map((item) => item.nome)
                      .join(", ")
                  : "-"
              }
            />
            <ResumoLinha
              titulo="Tempo estimado"
              valor={
                servicosSelecionados.length
                  ? `${duracaoTotalSelecionada} min`
                  : "-"
              }
            />
            <ResumoLinha
              titulo="Total"
              valor={
                servicosSelecionados.length
                  ? formatarMoeda(valorTotalSelecionado)
                  : "-"
              }
            />

            <ResumoLinha
              titulo="Atendimento"
              valor={usaPlano ? "Plano de assinatura" : "Avulso"}
            />
            <ResumoLinha
              titulo="Modo"
              valor={
                modo === "barbeiro"
                  ? "Barbeiro específico"
                  : "Primeiro horário disponível"
              }
            />

            <ResumoLinha
              titulo="Barbeiro"
              valor={
                horarioSelecionado?.barbeiro_nome ||
                barbeiroSelecionado?.nome ||
                "-"
              }
            />

            <ResumoLinha titulo="Data" valor={formatarData(dataSelecionada)} />

            <ResumoLinha
              titulo="Horário"
              valor={horarioSelecionado?.horario || "-"}
            />

            <ResumoLinha titulo="Cliente" valor={cliente.nome || "-"} />

            <button
              type="button"
              className={styles.botaoPrincipal}
              onClick={confirmarAgendamento}
              disabled={salvando || (usaPlano && (
                carregandoPlano || carregandoSaldo || Boolean(erroPlano) ||
                Boolean(erroSaldo) || !horarioSelecionado || !saldoCiclo ||
                !Number.isFinite(Number(saldoCiclo.creditos_livres)) ||
                Number(saldoCiclo.creditos_livres) < servicosIds.length
              ))}
              style={{
                ...buttonStyle,
                width: "100%",
                marginTop: "20px",
                opacity: salvando ? 0.6 : 1,
              }}
            >
              {salvando ? "Confirmando..." : "Confirmar Agendamento"}
            </button>
          </aside>
        </section>
      )}
    </section>
  </main>
);
}

function ListaHorariosDia({
  horarios,
  horarioSelecionado,
  selecionarHorario,
  horarioButtonStyle,
}) {
  if (!horarios || horarios.length === 0) {
    return (
      <p style={{ color: "#6b7280" }}>
        Nenhum horário disponível para esta data.
      </p>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: "10px",
      }}
    >
      {horarios.map((item, index) => {
        const ativo =
          horarioSelecionado?.data_hora_inicio === item.data_hora_inicio &&
          Number(horarioSelecionado?.barbeiro_id) === Number(item.barbeiro_id);

        return (
          <button
            key={`${item.data_hora_inicio}-${item.barbeiro_id}-${index}`}
            type="button"
            onClick={() => selecionarHorario(item)}
            style={horarioButtonStyle(ativo)}
          >
            {item.horario}
            <br />
            <span style={{ fontSize: "12px", color: "#4b5563" }}>
              {item.barbeiro_nome}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ListaHorariosSemana({
  semana,
  horarioSelecionado,
  selecionarHorario,
  horarioButtonStyle,
}) {
  if (!semana || semana.length === 0) {
    return (
      <p style={{ color: "#6b7280" }}>
        Nenhum horário disponível para esta semana.
      </p>
    );
  }

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      {semana.map((dia) => (
        <div key={dia.data}>
          <h3 style={{ marginBottom: "10px" }}>
            {nomeDiaSemana(dia.dia_semana)} - {formatarData(dia.data)}
          </h3>

          {dia.horarios.length === 0 ? (
            <p style={{ color: "#9ca3af" }}>Sem horários disponíveis.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                gap: "10px",
              }}
            >
              {dia.horarios.map((item, index) => {
                const ativo =
                  horarioSelecionado?.data_hora_inicio === item.data_hora_inicio &&
                  Number(horarioSelecionado?.barbeiro_id) ===
                    Number(item.barbeiro_id);

                return (
                  <button
                    key={`${item.data_hora_inicio}-${index}`}
                    type="button"
                    onClick={() => selecionarHorario(item)}
                    style={horarioButtonStyle(ativo)}
                  >
                    {item.horario}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ResumoLinha({ titulo, valor }) {
  return (
    <div
      style={{
        borderBottom: "1px solid #e5e7eb",
        padding: "10px 0",
      }}
    >
      <p style={{ color: "#6b7280", margin: 0, fontSize: "13px" }}>{titulo}</p>
      <strong>{valor || "-"}</strong>
    </div>
  );
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(data) {
  if (!data) return "-";

  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarDataHora(valor) {
  if (!valor) return "-";

  const data = new Date(valor);

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function nomeDiaSemana(numero) {
  const dias = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
    "Domingo",
  ];

  return dias[numero] || "-";
}
