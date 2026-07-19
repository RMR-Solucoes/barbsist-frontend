"use client";

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

import { obterBarbearia } from "@/services/barbeariaService";


export default function AgendamentoOnlinePage() {
  const [barbearia, setBarbearia] = useState(null);
  const hoje = new Date().toISOString().split("T")[0];

  const [servicos, setServicos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);

  const [servicoId, setServicoId] = useState("");
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
    carregarDadosIniciais();
    carregarBarbearia();
  }, []);

  useEffect(() => {
  if (abaPublica !== "agendar") {
    return;
  }

  setHorarioSelecionado(null);
  carregarHorarios();
}, [abaPublica, servicoId, modo, barbeiroId, dataSelecionada]);

  async function carregarBarbearia() {
  try {
    const dados = await obterBarbearia();

    console.log("BARBEARIA:", dados);

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
        listarServicosOnline(),
        listarBarbeirosOnline(),
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
          barbeiroId,
          servicoId,
          dataSelecionada
        );

        setHorariosSemana(dados || []);
        setHorariosDia([]);
      } else {
        const dados = await listarHorariosDiaOnline(servicoId, dataSelecionada);

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

    await criarAgendamentoOnline(dados);

    setAgendamentoConfirmado({
        cliente: cliente.nome,
        telefone: cliente.telefone,
        servico: servicoSelecionado?.nome || "",
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
  } catch (error) {
    console.error(error);

    const detalhe = error?.response?.data?.detail;

    setErro(
      detalhe || "Erro ao confirmar agendamento. Tente novamente."
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
      telefoneConsulta
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
        telefoneCancelamento
      );

    setResultadoCancelamento(resultado);
  } catch (error) {
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

async function cancelarAgendamento(id) {
  try {
    setCancelando(true);

    await cancelarAgendamentoOnline(id);

    setMensagem(
      "Agendamento cancelado com sucesso."
    );

    await buscarAgendamentosParaCancelar();
  } catch (error) {
    console.error(error);

    setErro(
      error?.response?.data?.detail ||
      "Erro ao cancelar agendamento."
    );
  } finally {
    setCancelando(false);
  }
}

  function abrirWhatsApp() {
  if (!agendamentoConfirmado) return;

  const mensagemWhatsapp = `
    Olá ${agendamentoConfirmado.cliente}!

    Seu agendamento foi confirmado com sucesso.

    📌 Serviço: ${agendamentoConfirmado.servico}

    ✂️ Barbeiro: ${agendamentoConfirmado.barbeiro}

    📅 Data: ${formatarData(
    agendamentoConfirmado.data
    )}

    ⏰ Horário: ${agendamentoConfirmado.horario}

    🧾 Protocolo: ${agendamentoConfirmado.protocolo}

    Obrigado pela preferência.
    `.trim();

  const telefoneBarbearia = barbearia?.telefone_whatsapp || "";

const url = telefoneBarbearia
  ? `https://wa.me/${telefoneBarbearia}?text=${encodeURIComponent(mensagemWhatsapp)}`
  : `https://wa.me/?text=${encodeURIComponent(mensagemWhatsapp)}`;
  

  window.open(url, "_blank");
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
            onClick={() => {
              setAgendamentoConfirmado(null);
              setMensagem("");
              setErro("");
              setHorarioSelecionado(null);

              setCliente({
                nome: "",
                telefone: "",
                email: "",
                observacoes: "",
              });
            }}
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
      <header className={styles.cabecalho}>
        {barbearia?.imagem_capa_url && (
          <img
            src={barbearia.imagem_capa_url}
            alt="Capa da Barbearia"
            className={styles.imagemCapa}
          />
        )}

        {barbearia?.logo_url && (
          <img
            src={barbearia.logo_url}
            alt="Logo da Barbearia"
            style={{
              width: "120px",
              height: "120px",
              objectFit: "contain",
              borderRadius: "50%",
              background: "#ffffff",
              padding: "10px",
              marginBottom: "15px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.20)",
            }}
          />
        )}

        <h1
          style={{
            fontSize: "42px",
            fontWeight: "700",
            marginBottom: "10px",
          }}
        >
          {barbearia?.nome || "BarbSist"}
        </h1>

        {barbearia?.slogan && (
          <p
            style={{
              color: "#d1d5db",
              fontSize: "20px",
              fontStyle: "italic",
              marginBottom: "15px",
            }}
          >
            {barbearia.slogan}
          </p>
        )}

        {barbearia?.endereco && (
          <p
            style={{
              color: "#d1d5db",
              fontSize: "15px",
              marginBottom: "6px",
            }}
          >
            📍 {barbearia.endereco}
          </p>
        )}

        {barbearia?.instagram && (
          <p
            style={{
              color: "#d1d5db",
              fontSize: "15px",
              marginBottom: "25px",
            }}
          >
            📸 {barbearia.instagram}
          </p>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "15px",
          }}
        >
          <button
            type="button"
            onClick={() => setAbaPublica("agendar")}
            style={{
              ...buttonStyle,
              background:
                abaPublica === "agendar"
                  ? "#2563eb"
                  : "#374151",
            }}
          >
            Agendar Horário
          </button>

          <button
            type="button"
            onClick={() => setAbaPublica("consultar")}
            style={{
              ...buttonStyle,
              background:
                abaPublica === "consultar"
                  ? "#2563eb"
                  : "#374151",
            }}
          >
            Consultar Agendamento
          </button>

          <button
            type="button"
            onClick={() => setAbaPublica("cancelar")}
            style={{
              ...buttonStyle,
              background:
                abaPublica === "cancelar"
                  ? "#dc2626"
                  : "#374151",
            }}
          >
            Cancelar Agendamento
          </button>
        </div>

        <p
          style={{
            color: "#d1d5db",
            fontSize: "17px",
            marginTop: "10px",
          }}
        >
          {abaPublica === "agendar" &&
            "Escolha seu serviço, horário e confirme seu atendimento."}

          {abaPublica === "consultar" &&
            "Informe seu telefone para consultar seus agendamentos."}

          {abaPublica === "cancelar" &&
            "Informe seu telefone para localizar e cancelar um agendamento."}
        </p>
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
                      ✂️ {agendamento.servico}
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
                      ✂️ {agendamento.servico}
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
                      onClick={() => cancelarAgendamento(agendamento.id)}
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

              {!carregando && !servicoId && (
                <p style={{ color: "#6b7280" }}>
                  Escolha um serviço para visualizar os horários.
                </p>
              )}

              {!carregando && modo === "barbeiro" && servicoId && !barbeiroId && (
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

              {!carregando && modo === "barbeiro" && servicoId && barbeiroId && (
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