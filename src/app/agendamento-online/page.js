"use client";

import { useEffect, useMemo, useState } from "react";

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

export default function AgendamentoOnlinePage() {
  const barbeariaSlug =
    (typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("barbearia")
      : null) ||
    process.env.NEXT_PUBLIC_BARBEARIA_SLUG ||
    "barbsist-admin";

  const hoje = new Date().toISOString().split("T")[0];

  const [abaAtiva, setAbaAtiva] = useState("agendar");
  const [barbearia, setBarbearia] = useState(null);

  const [servicos, setServicos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);

  const [servicoId, setServicoId] = useState("");
  const [modo, setModo] = useState("qualquer");
  const [barbeiroId, setBarbeiroId] = useState("");
  const [dataSelecionada, setDataSelecionada] = useState(hoje);

  const [horariosDia, setHorariosDia] = useState([]);
  const [horariosSemana, setHorariosSemana] = useState([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);
  const [agendamentoConfirmado, setAgendamentoConfirmado] = useState(null);

  const [cliente, setCliente] = useState({
    nome: "",
    telefone: "",
    email: "",
    observacoes: "",
  });

  const [telefoneConsulta, setTelefoneConsulta] = useState("");
  const [resultadoConsulta, setResultadoConsulta] = useState(null);
  

  const [telefoneCancelamento, setTelefoneCancelamento] = useState("");
  const [resultadoCancelamento, setResultadoCancelamento] = useState(null);

  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  

  useEffect(() => {
    carregarDadosIniciais();
    carregarBarbearia();
  }, []);

  useEffect(() => {
    if (abaAtiva !== "agendar") {
      return;
    }

    setHorarioSelecionado(null);
    carregarHorarios();
  }, [abaAtiva, servicoId, modo, barbeiroId, dataSelecionada]);
  
  async function carregarBarbearia() {
    try {
      const dados = await obterBarbeariaPublica(barbeariaSlug);
      setBarbearia(dados);
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
      console.error(error);
      setErro("Erro ao carregar dados do agendamento.");
    }
  }

  async function carregarHorarios() {
    if (!servicoId || !dataSelecionada) {
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
          servicoId,
          dataSelecionada
        );

        setHorariosSemana(dados || []);
        setHorariosDia([]);
      } else {
        const dados = await listarHorariosDiaOnline(
          barbeariaSlug,
          servicoId,
          dataSelecionada
        );

        setHorariosDia(dados || []);
        setHorariosSemana([]);
      }
    } catch (error) {
      console.error("Erro ao carregar horários:", error);
      console.error("Status:", error?.response?.status);
      console.error("URL:", error?.config?.url);
      console.error("Resposta:", error?.response?.data);

      const detalhe = error?.response?.data?.detail;

      setErro(
        detalhe ||
          error?.message ||
          "Erro ao carregar horários disponíveis."
      );
    } finally {
      setCarregando(false);
    }
      }

  function trocarAba(aba) {
    setAbaAtiva(aba);
    setMensagem("");
    setErro("");
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

    if (!servicoId) {
      setErro("Escolha um serviço.");
      return;
    }

    if (!horarioSelecionado) {
      setErro("Escolha um horário disponível.");
      return;
    }

    if (!cliente.nome.trim()) {
      setErro("Informe seu nome.");
      return;
    }

    if (!cliente.telefone.trim()) {
      setErro("Informe seu telefone.");
      return;
    }

    const dados = {
      nome_cliente: cliente.nome.trim(),
      telefone_cliente: cliente.telefone.trim(),
      barbeiro_id: Number(horarioSelecionado.barbeiro_id),
      servico_id: Number(servicoId),
      data_hora_inicio: horarioSelecionado.data_hora_inicio,
      tipo_atendimento: "avulso",
      observacoes: montarObservacoesCliente(),
    };

    try {
      setSalvando(true);

      const agendamentoCriado = await criarAgendamentoOnline(
        barbeariaSlug,
        dados
      );

      setAgendamentoConfirmado({
        cliente: cliente.nome.trim(),
        telefone: cliente.telefone.trim(),
        servico: servicoSelecionado?.nome || "-",
        barbeiro: horarioSelecionado?.barbeiro_nome || "-",
        data: horarioSelecionado?.data || dataSelecionada,
        horario: horarioSelecionado?.horario || "-",
        telefone_whatsapp: barbearia?.telefone_whatsapp || "",
        agendamento: agendamentoCriado,
      });

      setMensagem("Agendamento realizado com sucesso!");
      setHorarioSelecionado(null);

      setCliente({
        nome: "",
        telefone: "",
        email: "",
        observacoes: "",
      });

      await carregarHorarios();
    } catch (error) {
      console.error(error);

      const detalhe = error?.response?.data?.detail;

      setErro(detalhe || "Erro ao confirmar agendamento. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  async function consultarAgendamento() {
    setMensagem("");
    setErro("");
    setResultadoConsulta(null);

    if (!telefoneConsulta.trim()) {
      setErro("Informe o telefone para consultar.");
      return;
    }

    try {
      setCarregando(true);

      const dados = await consultarAgendamentoOnline(
        barbeariaSlug,
        telefoneConsulta.trim()
      );

      setResultadoConsulta(dados);
    } catch (error) {
      console.error(error);

      const detalhe = error?.response?.data?.detail;

      setErro(detalhe || "Nenhum agendamento encontrado.");
    } finally {
      setCarregando(false);
    }
  }

  async function buscarAgendamentosParaCancelar() {
    setMensagem("");
    setErro("");
    setResultadoCancelamento(null);

    if (!telefoneCancelamento.trim()) {
      setErro("Informe o telefone para buscar seus agendamentos.");
      return;
    }

    try {
      setCarregando(true);

      const dados = await consultarAgendamentoOnline(
        barbeariaSlug,
        telefoneCancelamento.trim()
      );

      setResultadoCancelamento(dados);
    } catch (error) {
      console.error(error);

      const detalhe = error?.response?.data?.detail;

      setErro(detalhe || "Nenhum agendamento encontrado para cancelamento.");
    } finally {
      setCarregando(false);
    }
  }

  async function cancelarAgendamento(agendamentoId) {
    const confirmar = window.confirm(
      "Tem certeza que deseja cancelar este agendamento?"
    );

    if (!confirmar) return;

    setMensagem("");
    setErro("");

    try {
      setSalvando(true);

      await cancelarAgendamentoOnline(
        barbeariaSlug,
        telefoneCancelamento.trim(),
        agendamentoId
      );

      setMensagem("Agendamento cancelado com sucesso.");

      await buscarAgendamentosParaCancelar();
      
    } catch (error) {
      console.error(error);

      const detalhe = error?.response?.data?.detail;

      setErro(detalhe || "Erro ao cancelar agendamento.");
    } finally {
      setSalvando(false);
    }
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

  const servicoSelecionado = useMemo(() => {
    return servicos.find((s) => Number(s.id) === Number(servicoId));
  }, [servicos, servicoId]);

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

  const dangerButtonStyle = {
    background: "#dc2626",
    color: "#ffffff",
    border: "none",
    padding: "11px 14px",
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

  const abaStyle = (ativo) => ({
    border: ativo ? "2px solid #ffffff" : "1px solid rgba(255,255,255,0.35)",
    background: ativo ? "#ffffff" : "rgba(255,255,255,0.12)",
    color: ativo ? "#111827" : "#ffffff",
    padding: "12px 18px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: "800",
  });

    return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #111827, #374151)",
        padding: "30px",
      }}
    >
      <section style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <header
          style={{
            color: "#ffffff",
            textAlign: "center",
            marginBottom: "25px",
          }}
        >
          <h1 style={{ fontSize: "36px", marginBottom: "8px" }}>
            {barbearia?.nome || "BarbSist - Agendamento Online"}
          </h1>

          <p style={{ color: "#d1d5db", fontSize: "17px" }}>
            Agende, consulte ou cancele seu atendimento.
          </p>
        </header>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "22px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => trocarAba("agendar")}
            style={abaStyle(abaAtiva === "agendar")}
          >
            AGENDAR
          </button>

          <button
            type="button"
            onClick={() => trocarAba("consultar")}
            style={abaStyle(abaAtiva === "consultar")}
          >
            CONSULTAR
          </button>

          <button
            type="button"
            onClick={() => trocarAba("cancelar")}
            style={abaStyle(abaAtiva === "cancelar")}
          >
            CANCELAR
          </button>
        </div>

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

  
        {abaAtiva === "agendar" && agendamentoConfirmado && (
          <div style={cardStyle}>
            <h2 style={{ color: "#166534" }}>✅ Agendamento confirmado</h2>

            <ResumoLinha titulo="Cliente" valor={agendamentoConfirmado.cliente} />
            <ResumoLinha titulo="Serviço" valor={agendamentoConfirmado.servico} />
            <ResumoLinha titulo="Barbeiro" valor={agendamentoConfirmado.barbeiro} />
            <ResumoLinha
              titulo="Data"
              valor={formatarData(agendamentoConfirmado.data)}
            />
            <ResumoLinha titulo="Horário" valor={agendamentoConfirmado.horario} />

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button
                type="button"
                onClick={() => {
                  setAgendamentoConfirmado(null);
                  setMensagem("");
                }}
                style={buttonStyle}
              >
                Novo Agendamento
              </button>

              <button
                type="button"
                onClick={() => abrirWhatsAppAgendamento(agendamentoConfirmado)}
                style={{
                  ...buttonStyle,
                  background: "#16a34a",
                }}
              >
                Falar no WhatsApp
              </button>
            </div>
          </div>
        )}

        {abaAtiva === "agendar" && !agendamentoConfirmado && (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 380px",
              gap: "20px",
              alignItems: "start",
            }}
          >
            <div style={{ display: "grid", gap: "20px" }}>
              <div style={cardStyle}>
                <h2>1. Escolha o serviço</h2>

                <select
                  value={servicoId}
                  onChange={(e) => setServicoId(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Selecione um serviço</option>

                  {servicos.map((servico) => (
                    <option key={servico.id} value={servico.id}>
                      {servico.nome} - {formatarMoeda(servico.preco)}
                    </option>
                  ))}
                </select>

                {servicoSelecionado && (
                  <p style={{ color: "#6b7280", marginTop: "10px" }}>
                    Tempo médio:{" "}
                    <strong>
                      {servicoSelecionado.tempo_medio_minutos || 30} minutos
                    </strong>
                  </p>
                )}
              </div>

              <div style={cardStyle}>
                <h2>2. Como deseja agendar?</h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "12px",
                  }}
                >
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
                <h2>
                  {modo === "barbeiro" ? "5." : "4."} Horários disponíveis
                </h2>

                {carregando && <p>Carregando horários...</p>}

                {!carregando && !servicoId && (
                  <p style={{ color: "#6b7280" }}>
                    Escolha um serviço para visualizar os horários.
                  </p>
                )}

                {!carregando &&
                  modo === "barbeiro" &&
                  servicoId &&
                  !barbeiroId && (
                    <p style={{ color: "#6b7280" }}>
                      Escolha um barbeiro para visualizar a semana.
                    </p>
                  )}

                {!carregando && modo === "qualquer" && servicoId && (
                  <ListaHorariosDia
                    horarios={horariosDia}
                    horarioSelecionado={horarioSelecionado}
                    selecionarHorario={selecionarHorario}
                    horarioButtonStyle={horarioButtonStyle}
                  />
                )}

                {!carregando &&
                  modo === "barbeiro" &&
                  servicoId &&
                  barbeiroId && (
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

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "12px",
                  }}
                >
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
                      onChange={(e) =>
                        alterarCliente("telefone", e.target.value)
                      }
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
                      onChange={(e) =>
                        alterarCliente("observacoes", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>
            </div>

            <aside style={{ ...cardStyle, position: "sticky", top: "20px" }}>
              <h2>Resumo</h2>

              <ResumoLinha titulo="Serviço" valor={servicoSelecionado?.nome} />
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
              <ResumoLinha
                titulo="Data"
                valor={formatarData(dataSelecionada)}
              />
              <ResumoLinha
                titulo="Horário"
                valor={horarioSelecionado?.horario || "-"}
              />
              <ResumoLinha titulo="Cliente" valor={cliente.nome || "-"} />

              <button
                type="button"
                onClick={confirmarAgendamento}
                disabled={salvando}
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

        {abaAtiva === "consultar" && (
          <div style={cardStyle}>
            <h2>Consultar Agendamento</h2>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <input
                value={telefoneConsulta}
                onChange={(e) => setTelefoneConsulta(e.target.value)}
                placeholder="Digite seu telefone"
                style={{ ...inputStyle, flex: "1", minWidth: "240px" }}
              />

              <button
                type="button"
                onClick={consultarAgendamento}
                style={buttonStyle}
              >
                Consultar
              </button>
            </div>

            {resultadoConsulta && (
              <ListaAgendamentos
                dados={resultadoConsulta}
                mostrarBotaoCancelar={false}
              />
            )}
          </div>
        )}

        {abaAtiva === "cancelar" && (
          <div style={cardStyle}>
            <h2>Cancelar Agendamento</h2>

            <p style={{ color: "#6b7280" }}>
              Informe seu telefone para localizar seus agendamentos futuros.
            </p>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <input
                value={telefoneCancelamento}
                onChange={(e) => setTelefoneCancelamento(e.target.value)}
                placeholder="Digite seu telefone"
                style={{ ...inputStyle, flex: "1", minWidth: "240px" }}
              />

              <button
                type="button"
                onClick={buscarAgendamentosParaCancelar}
                style={buttonStyle}
              >
                Buscar
              </button>
            </div>

            {resultadoCancelamento && (
              <ListaAgendamentos
                dados={resultadoCancelamento}
                mostrarBotaoCancelar={true}
                cancelarAgendamento={cancelarAgendamento}
                salvando={salvando}
                dangerButtonStyle={dangerButtonStyle}
              />
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function ListaAgendamentos({
  dados,
  mostrarBotaoCancelar,
  cancelarAgendamento,
  salvando,
  dangerButtonStyle,
}) {
  const agendamentos = dados?.agendamentos || [];

  if (agendamentos.length === 0) {
    return (
      <p style={{ color: "#6b7280", marginTop: "18px" }}>
        Nenhum agendamento futuro encontrado.
      </p>
    );
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>
        Cliente: {dados.cliente} | Telefone: {dados.telefone}
      </h3>

      <div style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
        {agendamentos.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "14px",
              background: "#f9fafb",
            }}
          >
            <strong>{item.servico}</strong>

            <p style={{ margin: "6px 0" }}>
              Barbeiro: <strong>{item.barbeiro}</strong>
            </p>

            <p style={{ margin: "6px 0" }}>
              Data/Hora:{" "}
              <strong>{formatarDataHora(item.data_hora_inicio)}</strong>
            </p>

            <p style={{ margin: "6px 0" }}>
              Status: <strong>{item.status}</strong>
            </p>

            {mostrarBotaoCancelar && (
              <button
                type="button"
                onClick={() => cancelarAgendamento(item.id)}
                disabled={salvando}
                style={{
                  ...dangerButtonStyle,
                  marginTop: "10px",
                  opacity: salvando ? 0.6 : 1,
                }}
              >
                Cancelar Agendamento
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
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
                  horarioSelecionado?.data_hora_inicio ===
                    item.data_hora_inicio &&
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

function abrirWhatsAppAgendamento(agendamento) {
  const mensagem = `
Olá! Meu agendamento foi confirmado:

Cliente: ${agendamento.cliente}
Serviço: ${agendamento.servico}
Barbeiro: ${agendamento.barbeiro}
Data: ${formatarData(agendamento.data)}
Horário: ${agendamento.horario}
`.trim();

  const telefone = agendamento.telefone_whatsapp || "";

  const url = telefone
    ? `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`
    : `https://wa.me/?text=${encodeURIComponent(mensagem)}`;

  window.open(url, "_blank");
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

function formatarDataHora(dataHora) {
  if (!dataHora) return "-";

  const data = new Date(dataHora);

  return data.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
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
