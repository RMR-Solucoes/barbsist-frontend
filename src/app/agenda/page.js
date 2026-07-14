"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/services/api";

import { listarClientes } from "@/services/clienteService";
import { listarBarbeiros } from "@/services/barbeiroService";
import { listarServicos } from "@/services/servicoService";

import {
  listarAgendamentos,
  criarAgendamento,
  cancelarAgendamento,
  converterAgendamentoEmComanda,
} from "@/services/agendamentoService";

import { listarConfiguracoesFuncionamento } from "@/services/configuracaoFuncionamentoService";

import { listarDisponibilidadeBarbeiro } from "@/services/barbeiroDisponibilidadeService";

export default function AgendaPage() {
  const [abaAtiva, setAbaAtiva] = useState("agendamento");
  const [modoVisualizacao, setModoVisualizacao] = useState("diario");

  const [clientes, setClientes] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [agendaSemanal, setAgendaSemanal] = useState([]);
  const [ultimoAgendamento, setUltimoAgendamento] = useState(null);

  const [configuracoesFuncionamento, setConfiguracoesFuncionamento] = useState([]);
  const [disponibilidadeBarbeiro, setDisponibilidadeBarbeiro] = useState([]);

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const hoje = new Date().toISOString().split("T")[0];

  const [semanaSelecionada, setSemanaSelecionada] = useState(hoje);

  const diasSemana = [
    "SEGUNDA",
    "TERÇA",
    "QUARTA",
    "QUINTA",
    "SEXTA",
    "SÁBADO",
    "DOMINGO",
  ];

  const [filtros, setFiltros] = useState({
    data_agenda: hoje,
    barbeiro_id: "",
  });

  const [form, setForm] = useState({
    cliente_id: "",
    barbeiro_id: "",
    servico_id: "",
    data: hoje,
    hora: "",
    tipo_atendimento: "avulso",
    observacoes: "",
  });
  
 useEffect(() => {
  carregarDadosIniciais();
}, []);

useEffect(() => {
  carregarAgendamentos();
}, [filtros]);

useEffect(() => {
  if (form.barbeiro_id) {
    carregarDisponibilidadeDoBarbeiro(form.barbeiro_id);
  } else {
    setDisponibilidadeBarbeiro([]);
  }
}, [form.barbeiro_id]);

// Carrega a agenda semanal na aba AGENDA
useEffect(() => {
  if (abaAtiva === "agenda" && modoVisualizacao === "semanal") {
    carregarAgendaSemanal();
  }
}, [
  abaAtiva,
  modoVisualizacao,
  filtros.barbeiro_id,
  filtros.data_agenda,
]);

// Carrega a agenda semanal no ticket do NOVO AGENDAMENTO
useEffect(() => {
  if (abaAtiva === "agendamento" && form.barbeiro_id && form.servico_id) {
    carregarAgendaSemanal();
  }
}, [
  abaAtiva,
  form.barbeiro_id,
  form.servico_id,
  semanaSelecionada,
]);

  async function carregarDadosIniciais() {
    try {
      const [
        clientesData,
        barbeirosData,
        servicosData,
        funcionamentoData,
      ] = await Promise.all([
        listarClientes(),
        listarBarbeiros(),
        listarServicos(),
        listarConfiguracoesFuncionamento(),
      ]);

      setClientes(clientesData.filter((c) => c.ativo !== false));
      setBarbeiros(barbeirosData.filter((b) => b.ativo !== false));
      setServicos(servicosData.filter((s) => s.ativo !== false));
      setConfiguracoesFuncionamento(funcionamentoData);
    } catch {
      setErro("Erro ao carregar dados iniciais.");
    }
  }

  async function carregarDisponibilidadeDoBarbeiro(barbeiroId) {
    try {
      const dados = await listarDisponibilidadeBarbeiro(barbeiroId);
      setDisponibilidadeBarbeiro(dados);
    } catch {
      setErro("Erro ao carregar disponibilidade do barbeiro.");
    }
  }

  async function carregarAgendamentos() {
    try {
      const dados = await listarAgendamentos({
        data_agenda: filtros.data_agenda,
        barbeiro_id: filtros.barbeiro_id,
      });

      const ordenados = [...dados].sort(
        (a, b) => new Date(a.data_hora_inicio) - new Date(b.data_hora_inicio)
      );

      setAgendamentos(ordenados);
    } catch {
      setErro("Erro ao carregar agendamentos.");
    }
  }

  async function carregarAgendaSemanal() {
  try {
    setErro("");

    const dataBase = filtros.data_agenda || semanaSelecionada || hoje;

    const inicioSemana = new Date(`${dataBase}T00:00:00`);
    inicioSemana.setDate(
      inicioSemana.getDate() -
        (inicioSemana.getDay() === 0 ? 6 : inicioSemana.getDay() - 1)
    );
    inicioSemana.setHours(0, 0, 0, 0);

    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);
    fimSemana.setHours(23, 59, 59, 999);

    const barbeiroSelecionado =
      abaAtiva === "agenda"
        ? filtros.barbeiro_id
        : form.barbeiro_id;

    const response = await api.get("/agendamentos/calendario", {
      params: {
        barbeiro_id: barbeiroSelecionado || undefined,
        data_inicio: inicioSemana.toISOString(),
        data_fim: fimSemana.toISOString(),
      },
    });

    setAgendaSemanal(response.data || []);
    setErro("");
  } catch (error) {
    console.error("Erro ao carregar agenda semanal:", error);
    setAgendaSemanal([]);

    setErro(
      error?.response?.data?.detail ||
        "Erro ao carregar agenda semanal."
    );
  }
}
  function limparMensagens() {
    setMensagem("");
    setErro("");
  }

  function handleFormChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "data" || name === "barbeiro_id" || name === "servico_id"
        ? { hora: "" }
        : {}),
    }));
  }

  function handleFiltroChange(e) {
    const { name, value } = e.target;

    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function buscarNome(lista, id) {
    const item = lista.find((i) => Number(i.id) === Number(id));
    return item ? item.nome : "-";
  }

  function buscarServico(id) {
    return servicos.find((s) => Number(s.id) === Number(id));
  }

  function formatarDataHora(dataHora) {
    if (!dataHora) return "-";

    const data = new Date(dataHora);

    return data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function transformarEmMinutos(horario) {
    const [hora, minuto] = horario.split(":").map(Number);
    return hora * 60 + minuto;
  }

  function horariosConflitam(inicioA, fimA, inicioB, fimB) {
    return inicioA < fimB && fimA > inicioB;
  }

  function obterMinutosAgora() {
    const agora = new Date();
    return agora.getHours() * 60 + agora.getMinutes();
  }

  function obterDiaSemanaSistema(dataTexto) {
    const data = new Date(`${dataTexto}T00:00:00`);
    const diaJs = data.getDay();

    return diaJs === 0 ? 6 : diaJs - 1;
  }

  function gerarHorariosPorIntervalo(horaInicio, horaFim) {
    const horarios = [];

    let inicio = transformarEmMinutos(horaInicio);
    const fim = transformarEmMinutos(horaFim);

    while (inicio < fim) {
      const hora = Math.floor(inicio / 60);
      const minuto = inicio % 60;

      horarios.push(
        `${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}`
      );

      inicio += 30;
    }

    return horarios;
  }

  function dataEhPassada(dataTexto) {
    const hojeSistema = new Date().toISOString().split("T")[0];
    return dataTexto < hojeSistema;
  }

  function separarHorariosPorPeriodo(horarios) {
    return {
      manha: horarios.filter(
        (horario) => transformarEmMinutos(horario) < transformarEmMinutos("12:00")
      ),
      tarde: horarios.filter(
        (horario) => transformarEmMinutos(horario) >= transformarEmMinutos("12:00")
      ),
    };
  }

  function formatarPeriodoDisponibilidade(horaInicio, horaFim) {
    const inicio = transformarEmMinutos(horaInicio);
    const fim = transformarEmMinutos(horaFim);
    const meioDia = transformarEmMinutos("12:00");

    if (fim <= meioDia) {
      return {
        manha: `${horaInicio} às ${horaFim}`,
        tarde: null,
      };
    }

    if (inicio >= meioDia) {
      return {
        manha: null,
        tarde: `${horaInicio} às ${horaFim}`,
      };
    }

    return {
      manha: `${horaInicio} às 12:00`,
      tarde: `12:00 às ${horaFim}`,
    };
  }

  const horariosDisponiveis = useMemo(() => {
    if (!form.data || dataEhPassada(form.data)) {
      return [];
    }

    if (!form.barbeiro_id || !form.servico_id) {
      return [];
    }

    const diaSemana = obterDiaSemanaSistema(form.data);

    const funcionamentoDia = configuracoesFuncionamento.find(
      (c) => Number(c.dia_semana) === Number(diaSemana)
    );

    if (!funcionamentoDia || !funcionamentoDia.trabalha) {
      return [];
    }

    let horaInicioBase = funcionamentoDia.hora_inicio;
    let horaFimBase = funcionamentoDia.hora_fim;

    const disponibilidadeDia = disponibilidadeBarbeiro.find(
      (d) => Number(d.dia_semana) === Number(diaSemana)
    );

    if (disponibilidadeDia && disponibilidadeDia.usa_padrao === false) {
      if (!disponibilidadeDia.trabalha) {
        return [];
      }

      horaInicioBase = disponibilidadeDia.hora_inicio;
      horaFimBase = disponibilidadeDia.hora_fim;
    }

    const horarios = gerarHorariosPorIntervalo(horaInicioBase, horaFimBase);

    const hojeSistema = new Date().toISOString().split("T")[0];
    const dataSelecionadaEhHoje = form.data === hojeSistema;
    const minutosAgora = obterMinutosAgora();

    const servicoSelecionado = servicos.find(
      (s) => Number(s.id) === Number(form.servico_id)
    );

    const duracaoServico = Number(servicoSelecionado?.tempo_medio_minutos || 30);
    const fechamentoMin = transformarEmMinutos(horaFimBase);

    const agendamentosDoBarbeiro = agendamentos.filter(
      (ag) =>
        Number(ag.barbeiro_id) === Number(form.barbeiro_id) &&
        ag.status !== "cancelado" &&
        ag.data_hora_inicio?.startsWith(form.data)
    );

    return horarios.filter((horario) => {
      const inicioNovo = transformarEmMinutos(horario);
      const fimNovo = inicioNovo + duracaoServico;

      if (dataSelecionadaEhHoje && inicioNovo <= minutosAgora) {
        return false;
      }

      if (fimNovo > fechamentoMin) {
        return false;
      }

      return !agendamentosDoBarbeiro.some((ag) => {
        const inicioExistente = new Date(ag.data_hora_inicio);
        const fimExistente = new Date(ag.data_hora_fim);

        const inicioExistenteMin =
          inicioExistente.getHours() * 60 + inicioExistente.getMinutes();

        const fimExistenteMin =
          fimExistente.getHours() * 60 + fimExistente.getMinutes();

        return horariosConflitam(
          inicioNovo,
          fimNovo,
          inicioExistenteMin,
          fimExistenteMin
        );
      });
    });
  }, [
    form.data,
    form.barbeiro_id,
    form.servico_id,
    servicos,
    agendamentos,
    configuracoesFuncionamento,
    disponibilidadeBarbeiro,
  ]);

  const horariosPorPeriodo = useMemo(() => {
    return separarHorariosPorPeriodo(horariosDisponiveis);
  }, [horariosDisponiveis]);

  const agendaVisualDoDia = useMemo(() => {
  return montarAgendaVisualDoDia();
}, [agendamentos, horariosDisponiveis]);

  const resumo = useMemo(() => {
  const total = agendamentos.length;

  const cancelados = agendamentos.filter(
    (a) => a.status === "cancelado"
  ).length;

  const ativos = agendamentos.filter(
    (a) => a.status !== "cancelado"
  ).length;

  const concluidos = agendamentos.filter(
    (a) => a.status === "concluido"
  ).length;

  const clientesUnicos = new Set(
    agendamentos.map((a) => a.cliente_id)
  ).size;

  const faturamentoIdeal = agendamentos.reduce((soma, ag) => {
  if (ag.status === "cancelado") return soma;

  const servico = buscarServico(ag.servico_id);
  return soma + Number(servico?.preco || 0);
}, 0);

const faturamentoReal = agendamentos.reduce((soma, ag) => {
  if (ag.status === "cancelado") return soma;
  if (ag.tipo_atendimento === "plano") return soma;

  const servico = buscarServico(ag.servico_id);
  return soma + Number(servico?.preco || 0);
}, 0);

const valorAtendimentosPlano = agendamentos.reduce((soma, ag) => {
  if (ag.status === "cancelado") return soma;
  if (ag.tipo_atendimento !== "plano") return soma;

  const servico = buscarServico(ag.servico_id);
  return soma + Number(servico?.preco || 0);
}, 0);

  return {
    total,
    ativos,
    concluidos,
    cancelados,
    clientesUnicos,
    faturamentoIdeal,
    faturamentoReal,
    valorAtendimentosPlano,
  };
}, [agendamentos, servicos]);

  async function salvarAgendamento(e) {
    e.preventDefault();
    limparMensagens();

    if (
      !form.cliente_id ||
      !form.barbeiro_id ||
      !form.servico_id ||
      !form.data ||
      !form.hora
    ) {
      setErro("Preencha cliente, barbeiro, serviço, data e hora.");
      return;
    }

    if (dataEhPassada(form.data)) {
      setErro("Não é permitido criar agendamento em data passada.");
      return;
    }

    if (horariosDisponiveis.length === 0) {
      setErro("Não há horários disponíveis para esta data, barbeiro e serviço.");
      return;
    }

    if (!horariosDisponiveis.includes(form.hora)) {
      setErro("O horário selecionado não está disponível.");
      return;
    }

    const dados = {
      cliente_id: Number(form.cliente_id),
      barbeiro_id: Number(form.barbeiro_id),
      servico_id: Number(form.servico_id),
      data_hora_inicio: `${form.data}T${form.hora}:00`,
      estilo_corte_id: null,
      estilo_barba_id: null,
      tipo_atendimento: form.tipo_atendimento || "avulso",
      observacoes: form.observacoes || "",
    };

    try {
      const agendamentoCriado = await criarAgendamento(dados);

      setMensagem("Agendamento cadastrado com sucesso.");
      setUltimoAgendamento(agendamentoCriado);

      const novosFiltros = {
        data_agenda: form.data,
        barbeiro_id: form.barbeiro_id,
      };

      setFiltros(novosFiltros);

      const dadosAtualizados = await listarAgendamentos(novosFiltros);

      const ordenados = [...dadosAtualizados].sort(
        (a, b) =>
          new Date(a.data_hora_inicio) - new Date(b.data_hora_inicio)
      );

      setAgendamentos(ordenados);

      setForm({
        cliente_id: "",
        barbeiro_id: "",
        servico_id: "",
        data: form.data,
        hora: "",
        tipo_atendimento: "avulso",
        observacoes: "",
      });
    } catch (error) {
      const detalhe = error?.response?.data?.detail;
      setErro(detalhe || "Erro ao cadastrar agendamento.");
    }
  }

  async function cancelar(id) {
    limparMensagens();

    const confirmar = window.confirm("Deseja realmente cancelar este agendamento?");
    if (!confirmar) return;

    try {
      await cancelarAgendamento(id);
      setMensagem("Agendamento cancelado com sucesso.");
      carregarAgendamentos();
    } catch {
      setErro("Erro ao cancelar agendamento.");
    }
  }
  
async function iniciarAtendimento(id) {
  limparMensagens();

  const confirmar = window.confirm(
    "Deseja iniciar este atendimento e gerar uma comanda?"
  );

  if (!confirmar) return;

  try {
    const resultado = await converterAgendamentoEmComanda(id);

    setMensagem(
      `Atendimento iniciado. Comanda nº ${resultado.comanda_id} criada com sucesso.`
    );

    await carregarAgendamentos();
    await carregarAgendaSemanal();
  } catch (error) {
    const detalhe = error?.response?.data?.detail;
    setErro(detalhe || "Erro ao iniciar atendimento.");
  }
}

  function statusStyle(status) {
    if (status === "cancelado") {
      return {
        background: "#fee2e2",
        color: "#991b1b",
      };
    }

    if (status === "concluido") {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    return {
      background: "#dbeafe",
      color: "#1d4ed8",
    };
  }

  function renderTicketDisponibilidadeBarbeiro() {
  if (!form.barbeiro_id) {
    return null;
  }

  if (!form.servico_id) {
    return (
      <div style={infoTicketStyle}>
        <strong>📌 Agenda semanal do barbeiro</strong>
        <p style={{ margin: "8px 0 0 0", color: "#6b7280" }}>
          Selecione um serviço para liberar os horários disponíveis.
        </p>
      </div>
    );
  }

  if (disponibilidadeBarbeiro.length === 0) {
    return (
      <div style={infoTicketStyle}>
        <strong>📌 Agenda semanal do barbeiro</strong>
        <p style={{ margin: "8px 0 0 0", color: "#6b7280" }}>
          Carregando disponibilidade...
        </p>
      </div>
    );
  }

  function formatarDataInput(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  }

  function obterInicioSemana(dataTexto) {
    const data = new Date(`${dataTexto}T00:00:00`);
    const diaSemanaJs = data.getDay();
    const diferenca = diaSemanaJs === 0 ? -6 : 1 - diaSemanaJs;

    data.setDate(data.getDate() + diferenca);
    data.setHours(0, 0, 0, 0);

    return data;
  }

  function gerarDiasDaSemana() {
    const inicio = obterInicioSemana(semanaSelecionada);

    return Array.from({ length: 7 }, (_, index) => {
      const data = new Date(inicio);
      data.setDate(inicio.getDate() + index);

      return {
        nome: diasSemana[index],
        dia_semana: index,
        dataTexto: formatarDataInput(data),
        dataFormatada: data.toLocaleDateString("pt-BR"),
      };
    });
  }

  function obterHorarioBaseDia(diaSemana) {
    const funcionamentoDia = configuracoesFuncionamento.find(
      (c) => Number(c.dia_semana) === Number(diaSemana)
    );

    const disponibilidadeDia = disponibilidadeBarbeiro.find(
      (d) => Number(d.dia_semana) === Number(diaSemana)
    );

    if (!funcionamentoDia || !funcionamentoDia.trabalha) {
      return null;
    }

    let horaInicio = funcionamentoDia.hora_inicio;
    let horaFim = funcionamentoDia.hora_fim;

    if (disponibilidadeDia && disponibilidadeDia.usa_padrao === false) {
      if (!disponibilidadeDia.trabalha) {
        return null;
      }

      horaInicio = disponibilidadeDia.hora_inicio;
      horaFim = disponibilidadeDia.hora_fim;
    }

    return {
      horaInicio,
      horaFim,
    };
  }

  function gerarHorariosDisponiveisDoDia(dia) {
    const base = obterHorarioBaseDia(dia.dia_semana);

    if (!base) {
      return [];
    }

    const servicoSelecionado = servicos.find(
      (s) => Number(s.id) === Number(form.servico_id)
    );

    const duracaoServico = Number(servicoSelecionado?.tempo_medio_minutos || 30);
    const horarios = gerarHorariosPorIntervalo(base.horaInicio, base.horaFim);
    const fechamentoMin = transformarEmMinutos(base.horaFim);

    const hojeSistema = new Date().toISOString().split("T")[0];
    const dataSelecionadaEhHoje = dia.dataTexto === hojeSistema;
    const minutosAgora = obterMinutosAgora();

    const agendamentosDoDia = agendaSemanal.filter((evento) =>
      evento.start?.startsWith(dia.dataTexto)
    );

    return horarios.filter((horario) => {
      const inicioNovo = transformarEmMinutos(horario);
      const fimNovo = inicioNovo + duracaoServico;

      if (dataEhPassada(dia.dataTexto)) {
        return false;
      }

      if (dataSelecionadaEhHoje && inicioNovo <= minutosAgora) {
        return false;
      }

      if (fimNovo > fechamentoMin) {
        return false;
      }

      const conflito = agendamentosDoDia.some((evento) => {
        const inicioExistente = new Date(evento.start);
        const fimExistente = new Date(evento.end);

        const inicioExistenteMin =
          inicioExistente.getHours() * 60 + inicioExistente.getMinutes();

        const fimExistenteMin =
          fimExistente.getHours() * 60 + fimExistente.getMinutes();

        return horariosConflitam(
          inicioNovo,
          fimNovo,
          inicioExistenteMin,
          fimExistenteMin
        );
      });

      return !conflito;
    });
  }

  const dias = gerarDiasDaSemana();

  return (
    <div style={infoTicketStyle}>
      <strong>📌 Escolha a semana e o horário do barbeiro</strong>

      <div style={{ marginTop: "12px", marginBottom: "15px" }}>
        <label>Escolha uma data da semana</label>
        <input
          type="date"
          value={semanaSelecionada}
          min={hoje}
          onChange={(e) => {
            setSemanaSelecionada(e.target.value);
            setForm((prev) => ({
              ...prev,
              data: e.target.value,
              hora: "",
            }));
          }}
          style={inputStyle}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "12px",
          marginTop: "12px",
        }}
      >
        {dias.map((dia) => {
          const base = obterHorarioBaseDia(dia.dia_semana);
          const horarios = gerarHorariosDisponiveisDoDia(dia);

          return (
            <div
              key={dia.dataTexto}
              style={{
                padding: "12px",
                borderRadius: "10px",
                background: base ? "#ecfdf5" : "#f3f4f6",
                color: base ? "#065f46" : "#6b7280",
                border: base ? "1px solid #a7f3d0" : "1px solid #e5e7eb",
              }}
            >
              <strong>{dia.nome}</strong>
              <p style={{ margin: "4px 0 10px 0", fontSize: "13px" }}>
                {dia.dataFormatada}
              </p>

              {!base ? (
                <p style={{ margin: 0 }}>Fechado</p>
              ) : horarios.length === 0 ? (
                <p style={{ margin: 0, color: "#991b1b" }}>
                  Sem horários livres
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                  }}
                >
                  {horarios.map((horario) => {
                    const selecionado =
                      form.data === dia.dataTexto && form.hora === horario;

                    return (
                      <button
                        key={`${dia.dataTexto}-${horario}`}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            data: dia.dataTexto,
                            hora: horario,
                          }));

                          setFiltros((prev) => ({
                            ...prev,
                            data_agenda: dia.dataTexto,
                            barbeiro_id: form.barbeiro_id,
                          }));
                        }}
                        style={{
                          padding: "7px 10px",
                          borderRadius: "8px",
                          border: selecionado
                            ? "2px solid #991b1b"
                            : "1px solid #86efac",
                          background: selecionado ? "#dc2626" : "#dcfce7",
                          color: selecionado ? "#ffffff" : "#166534",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        {horario}
                      </button>
                    );
                  })}
                </div>
              )} 
            </div>
          );
        })}
      </div>

      {form.data && form.hora && (
      <div
        style={{
          marginTop: "15px",
          padding: "12px",
          borderRadius: "10px",
          background: "#dcfce7",
          color: "#166534",
          border: "1px solid #86efac",
          fontWeight: "bold",
        }}
      >
        ✅ Horário selecionado: {form.data.split("-").reverse().join("/")} às{" "}
        {form.hora}
      </div>
    )}
    </div>
  );
}

  function montarAgendaVisualDoDia() {
  const horariosBase = [];

  agendamentos.forEach((agendamento) => {
    if (agendamento.status === "cancelado") return;

    const inicio = new Date(agendamento.data_hora_inicio);

    const horario = inicio.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    horariosBase.push({
      horario,
      tipo: "ocupado",
      agendamento,
    });
  });

  horariosDisponiveis.forEach((horario) => {
    horariosBase.push({
      horario,
      tipo: "livre",
      agendamento: null,
    });
  });

  return horariosBase.sort(
    (a, b) => transformarEmMinutos(a.horario) - transformarEmMinutos(b.horario)
  );
}

  function renderResumoAgendamento(agendamento) {
    if (!agendamento) {
      return (
        <p style={{ color: "#6b7280" }}>
          Nenhum agendamento cadastrado nesta sessão.
        </p>
      );
    }

    return (
      <div style={cardStyle}>
        <p><strong>ID:</strong> {agendamento.id}</p>
        <p><strong>Cliente:</strong> {buscarNome(clientes, agendamento.cliente_id)}</p>
        <p><strong>Barbeiro:</strong> {buscarNome(barbeiros, agendamento.barbeiro_id)}</p>
        <p><strong>Serviço:</strong> {buscarNome(servicos, agendamento.servico_id)}</p>
        <p><strong>Início:</strong> {formatarDataHora(agendamento.data_hora_inicio)}</p>
        <p><strong>Fim:</strong> {formatarDataHora(agendamento.data_hora_fim)}</p>
        <p><strong>Status:</strong> {agendamento.status}</p>
      </div>
    );
  }

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginTop: "5px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "15px",
    backgroundColor: "#fff",
    color: "#000",
  };

  const buttonStyle = {
    padding: "10px 16px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#111827",
    color: "#fff",
    cursor: "pointer",
    marginRight: "8px",
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#991b1b",
  };

  const infoTicketStyle = {
    border: "1px solid #bfdbfe",
    borderRadius: "12px",
    padding: "14px",
    background: "linear-gradient(135deg, #eff6ff, #ffffff)",
    marginBottom: "15px",
  };

  const cardStyle = {
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    padding: "15px",
    background: "#f9fafb",
  };

  const ticketStyle = (ativa) => ({
    width: "230px",
    minHeight: ativa ? "130px" : "95px",
    padding: "18px",
    border: ativa ? "2px solid #2563eb" : "1px solid #d1d5db",
    borderRadius: "16px",
    background: ativa
      ? "linear-gradient(135deg, #eff6ff, #dbeafe)"
      : "linear-gradient(135deg, #ffffff, #f9fafb)",
    color: "#111827",
    cursor: "pointer",
    boxShadow: ativa
      ? "0 12px 25px rgba(37, 99, 235, 0.25)"
      : "0 6px 15px rgba(0,0,0,0.08)",
    transform: ativa ? "translateY(-5px) scale(1.03)" : "translateY(0)",
    transition: "all 0.25s ease",
    textAlign: "left",
  });

  const ticketIconStyle = {
    fontSize: "38px",
    marginBottom: "10px",
  };

  const agendaVisualItemStyle = (tipo, status) => {
  if (tipo === "livre") {
    return {
      border: "1px solid #d1d5db",
      background: "#ffffff",
      color: "#374151",
    };
  }

  if (status === "cancelado") {
    return {
      border: "1px solid #fecaca",
      background: "#fee2e2",
      color: "#991b1b",
    };
  }

  if (status === "concluido") {
    return {
      border: "1px solid #bbf7d0",
      background: "#dcfce7",
      color: "#166534",
    };
  }

  if (status === "confirmado") {
    return {
      border: "1px solid #bfdbfe",
      background: "#dbeafe",
      color: "#1d4ed8",
    };
  }

  if (status === "em_atendimento") {
    return {
      border: "1px solid #fde68a",
      background: "#fef3c7",
      color: "#92400e",
    };
  }

  return {
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    color: "#1e3a8a",
  };
};

  const resumoCardStyle = {
    ...cardStyle,
    minWidth: "180px",
    flex: "1",
  };

  return (
    <main style={{ padding: "30px" }}>
      <h1>Agenda Interna</h1>

      <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setAbaAtiva("agendamento")}
          onMouseEnter={() => setAbaAtiva("agendamento")}
          style={ticketStyle(abaAtiva === "agendamento")}
        >
          <div style={ticketIconStyle}>🎫</div>
          <h3 style={{ margin: "0 0 6px 0" }}>Agendamento</h3>
          <p style={{ margin: 0, color: "#4b5563" }}>Criar novo atendimento</p>
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva("agenda")}
          onMouseEnter={() => setAbaAtiva("agenda")}
          style={ticketStyle(abaAtiva === "agenda")}
        >
          <div style={ticketIconStyle}>📅</div>
          <h3 style={{ margin: "0 0 6px 0" }}>Agenda</h3>
          <p style={{ margin: 0, color: "#4b5563" }}>Consultar horários e clientes</p>
        </button>
      </div>

      {mensagem && (
        <div style={{ background: "#d1fae5", padding: "10px", marginBottom: "10px" }}>
          {mensagem}
        </div>
      )}

      {erro && (
        <div style={{ background: "#fee2e2", padding: "10px", marginBottom: "10px" }}>
          {erro}
        </div>
      )}

      {abaAtiva === "agendamento" && (
        <>
          <section style={{ ...cardStyle, marginBottom: "30px", maxWidth: "850px" }}>
            <h2>Novo Agendamento</h2>

            <form onSubmit={salvarAgendamento}>
              <label>Cliente</label>
              <select name="cliente_id" value={form.cliente_id} onChange={handleFormChange} style={inputStyle}>
                <option value="">Selecione um cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>

              <label>Barbeiro</label>
              <select name="barbeiro_id" value={form.barbeiro_id} onChange={handleFormChange} style={inputStyle}>
                <option value="">Selecione um barbeiro</option>
                {barbeiros.map((barbeiro) => (
                  <option key={barbeiro.id} value={barbeiro.id}>
                    {barbeiro.nome}
                  </option>
                ))}
              </select>

              {renderTicketDisponibilidadeBarbeiro()}

              <label>Serviço</label>
              <select name="servico_id" value={form.servico_id} onChange={handleFormChange} style={inputStyle}>
                <option value="">Selecione um serviço</option>
                {servicos.map((servico) => (
                  <option key={servico.id} value={servico.id}>
                    {servico.nome} - {formatarMoeda(servico.preco)} - {servico.tempo_medio_minutos} min
                  </option>
                ))}
              </select>

              
              {form.barbeiro_id && form.servico_id && horariosDisponiveis.length === 0 && (
                <p style={{ color: "#991b1b", marginTop: "-8px" }}>
                  Nenhum horário disponível para esta data, barbeiro e serviço.
                  Verifique a disponibilidade do barbeiro ou escolha outra data.
                </p>
              )}


              <label>Tipo de Atendimento</label>

              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  marginBottom: "15px",
                  flexWrap: "wrap",
                }}
              >
                <label
                  style={{
                    border: form.tipo_atendimento === "avulso" ? "2px solid #111827" : "1px solid #d1d5db",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    cursor: "pointer",
                    background: form.tipo_atendimento === "avulso" ? "#f3f4f6" : "#ffffff",
                  }}
                >
                  <input
                    type="radio"
                    name="tipo_atendimento"
                    value="avulso"
                    checked={form.tipo_atendimento === "avulso"}
                    onChange={handleFormChange}
                    style={{ marginRight: "8px" }}
                  />
                  Atendimento Avulso
                </label>

                <label
                  style={{
                    border: form.tipo_atendimento === "plano" ? "2px solid #2563eb" : "1px solid #d1d5db",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    cursor: "pointer",
                    background: form.tipo_atendimento === "plano" ? "#eff6ff" : "#ffffff",
                  }}
                >
                  <input
                    type="radio"
                    name="tipo_atendimento"
                    value="plano"
                    checked={form.tipo_atendimento === "plano"}
                    onChange={handleFormChange}
                    style={{ marginRight: "8px" }}
                  />
                  Usar Plano
                </label>
              </div>

              <label>Observações</label>
              <textarea
                name="observacoes"
                value={form.observacoes}
                onChange={handleFormChange}
                style={{ ...inputStyle, minHeight: "80px" }}
              />

              <button type="submit" style={buttonStyle}>
                Cadastrar Agendamento
              </button>
            </form>
          </section>

          <section>
            <h2>Último Agendamento Cadastrado</h2>
            {renderResumoAgendamento(ultimoAgendamento)}
          </section>
        </>
      )}

      {abaAtiva === "agenda" && (
        <>
          <section style={{ ...cardStyle, marginBottom: "30px" }}>
            <h2>Filtros da Agenda</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label>Data da agenda</label>
                <input
                  type="date"
                  name="data_agenda"
                  value={filtros.data_agenda}
                  onChange={handleFiltroChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label>Barbeiro</label>
                <select
                  name="barbeiro_id"
                  value={filtros.barbeiro_id}
                  onChange={handleFiltroChange}
                  style={inputStyle}
                >
                  <option value="">Todos os barbeiros</option>
                  {barbeiros.map((barbeiro) => (
                    <option key={barbeiro.id} value={barbeiro.id}>
                      {barbeiro.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginBottom: "25px" }}>
            <div style={resumoCardStyle}>
              <h3>{resumo.total}</h3>
              <p>Total na agenda</p>
            </div>

            <div style={resumoCardStyle}>
              <h3>{resumo.ativos}</h3>
              <p>Ativos</p>
            </div>

            <div style={resumoCardStyle}>
              <h3>{resumo.cancelados}</h3>
              <p>Cancelados</p>
            </div>

            <div style={resumoCardStyle}>
              <h3>{formatarMoeda(resumo.faturamentoIdeal)}</h3>
              <p>Faturamento ideal</p>
            </div>

            <div style={resumoCardStyle}>
              <h3>{formatarMoeda(resumo.faturamentoReal)}</h3>
              <p>Faturamento real</p>
            </div>

            <div style={resumoCardStyle}>
              <h3>{formatarMoeda(resumo.valorAtendimentosPlano)}</h3>
              <p>Atendimentos por plano</p>
            </div>

            <div style={resumoCardStyle}>
              <h3>{resumo.clientesUnicos}</h3>
              <p>Clientes do dia</p>
            </div>
          </section>

          <section
            style={{
              ...cardStyle,
              marginBottom: "25px",
            }}
          >
            <h2>Resumo do Dia</h2>

            <p>
              <strong>Barbeiro:</strong>{" "}
              {filtros.barbeiro_id
                ? buscarNome(barbeiros, filtros.barbeiro_id)
                : "Todos"}
            </p>

            <p>
              <strong>Agendamentos:</strong> {resumo.total}
            </p>

            <p>
              <strong>Clientes:</strong> {resumo.clientesUnicos}
            </p>

            <p>
              <strong>Faturamento ideal:</strong>{" "}
              {formatarMoeda(resumo.faturamentoIdeal)}
              <br />
              <strong>Faturamento real:</strong>{" "}
              {formatarMoeda(resumo.faturamentoReal)}
              <br />
              <strong>Atendimentos por plano:</strong>{" "}
              {formatarMoeda(resumo.valorAtendimentosPlano)}
            </p>
          </section>

          <section
          
          style={{
            ...cardStyle,
            marginBottom: "25px",
          }}
        >
          <h2>Agenda Visual do Dia</h2>

          {agendaVisualDoDia.length === 0 ? (
            <p style={{ color: "#6b7280" }}>
              Nenhum horário disponível ou ocupado para os filtros selecionados.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "10px",
              }}
            >
              {agendaVisualDoDia.map((item, index) => {
                const agendamento = item.agendamento;
                const servico = agendamento ? buscarServico(agendamento.servico_id) : null;

                return (
                  <div
                    key={`${item.horario}-${index}`}
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      ...agendaVisualItemStyle(
                        item.tipo,
                        agendamento?.status
                      ),
                    }}
                  >
                    <strong>{item.horario}</strong>

                    {item.tipo === "livre" ? (
                      <p style={{ margin: "6px 0 0 0" }}>Livre</p>
                    ) : (
                      <>
                        <p style={{ margin: "6px 0 0 0" }}>
                          {buscarNome(clientes, agendamento.cliente_id)}
                        </p>

                        <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>
                          {servico?.nome || "Serviço"}
                        </p>

                        <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>
                          Status: {agendamento.status}
                        </p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

          <div
  style={{
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  }}
>
  <button
    type="button"
    onClick={() => setModoVisualizacao("diario")}
    style={{
      padding: "10px 20px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      background: modoVisualizacao === "diario" ? "#111827" : "#e5e7eb",
      color: modoVisualizacao === "diario" ? "#ffffff" : "#111827",
    }}
  >
    📅 Diário
  </button>

  <button
    type="button"
    onClick={() => setModoVisualizacao("semanal")}
    style={{
      padding: "10px 20px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      background: modoVisualizacao === "semanal" ? "#111827" : "#e5e7eb",
      color: modoVisualizacao === "semanal" ? "#ffffff" : "#111827",
    }}
  >
    🗓️ Semanal
  </button>
</div>

{modoVisualizacao === "diario" && (
  <>
    <h2>Agendamentos do Dia</h2>

    <table width="100%" cellPadding="10" style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#f3f4f6" }}>
          <th>ID</th>
          <th>Início</th>
          <th>Fim</th>
          <th>Cliente</th>
          <th>Barbeiro</th>
          <th>Serviço</th>
          <th>Tipo</th>
          <th>Duração</th>
          <th>Status</th>
          <th>Observações</th>
          <th>Ações</th>
        </tr>
      </thead>
      
      <tbody>
        {agendamentos.map((agendamento) => {
          const servico = buscarServico(agendamento.servico_id);

          return (
            <tr key={agendamento.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td>{agendamento.id}</td>
              <td>{formatarDataHora(agendamento.data_hora_inicio)}</td>
              <td>{formatarDataHora(agendamento.data_hora_fim)}</td>
              <td>{buscarNome(clientes, agendamento.cliente_id)}</td>
              <td>{buscarNome(barbeiros, agendamento.barbeiro_id)}</td>
              <td>{servico?.nome || "-"}</td>

              <td>
                <span
                  style={{
                    padding: "5px 10px",
                    borderRadius: "20px",
                    fontWeight: "bold",
                    fontSize: "12px",
                    background:
                      agendamento.tipo_atendimento === "plano"
                        ? "#dbeafe"
                        : "#dcfce7",
                    color:
                      agendamento.tipo_atendimento === "plano"
                        ? "#1d4ed8"
                        : "#166534",
                  }}
                >
                  {agendamento.tipo_atendimento === "plano"
                    ? "💳 PLANO"
                    : "💵 AVULSO"}
                </span>
              </td>

              <td>{servico?.tempo_medio_minutos || "-"} min</td>

              <td>
                <span
                  style={{
                    padding: "5px 10px",
                    borderRadius: "20px",
                    fontWeight: "bold",
                    fontSize: "13px",
                    ...statusStyle(agendamento.status),
                  }}
                >
                  {agendamento.status}
                </span>
              </td>

              <td>{agendamento.observacoes || "-"}</td>

              <td>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {agendamento.status === "agendado" && (
                    <button
                      type="button"
                      onClick={() => iniciarAtendimento(agendamento.id)}
                      style={{
                        background: "#16a34a",
                        color: "#fff",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      ▶ Iniciar
                    </button>
                  )}

                  {agendamento.status !== "cancelado" &&
                    agendamento.status !== "concluido" &&
                    agendamento.status !== "atendido" && (
                      <button
                        type="button"
                        onClick={() => cancelar(agendamento.id)}
                        style={cancelButtonStyle}
                      >
                        Cancelar
                      </button>
                    )}

                  {agendamento.status === "cancelado" && (
                    <span style={{ color: "#991b1b", fontWeight: "bold" }}>
                      Cancelado
                    </span>
                  )}

                  {(agendamento.status === "concluido" ||
                    agendamento.status === "atendido") && (
                    <span style={{ color: "#166534", fontWeight: "bold" }}>
                      Atendido
                    </span>
                  )}
                </div>
              </td>
            </tr>
          );
        })}

        {agendamentos.length === 0 && (
          <tr>
            <td colSpan="11" align="center">
              Nenhum agendamento encontrado para os filtros selecionados.
            </td>
          </tr>
        )}
      </tbody>
      </table>
      </>
      )}

{modoVisualizacao === "semanal" && (
  <section style={cardStyle}>
    <h2>Agenda Semanal</h2>

    {agendaSemanal.length === 0 ? (
      <p style={{ color: "#6b7280" }}>
        Nenhum agendamento encontrado para a semana.
      </p>
    ) : (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "15px",
        }}
      >
        {agendaSemanal.map((evento) => (
        <div
          key={evento.id}
          style={{
            border: "1px solid #bbf7d0",
            borderRadius: "10px",
            padding: "15px",
            background: "#f0fdf4",
          }}
>
            <h4>{evento.title}</h4>

            <p>
              <strong>Início:</strong>
              <br />
              {formatarDataHora(evento.start)}
            </p>

            <p>
              <strong>Fim:</strong>
              <br />
              {formatarDataHora(evento.end)}
            </p>

            <p>
              <strong>Barbeiro:</strong>
              <br />
              {evento.barbeiro}
            </p>

            <span
              style={{
                padding: "5px 10px",
                borderRadius: "20px",
                fontWeight: "bold",
                background:
                  evento.status === "cancelado"
                    ? "#fee2e2"
                    : evento.status === "concluido" || evento.status === "atendido"
                    ? "#dcfce7"
                    : "#dbeafe",
                color:
                  evento.status === "cancelado"
                    ? "#991b1b"
                    : evento.status === "concluido" || evento.status === "atendido"
                    ? "#166534"
                    : "#1d4ed8",
              }}
            >
              {evento.status === "cancelado"
                ? "Cancelado"
                : evento.status === "concluido" || evento.status === "atendido"
                ? "Atendido"
                : "Agendado"}
            </span>
          </div>
        ))}
      </div>
    )}
  </section>
)}
        </>
      )}
    </main>
  );
}