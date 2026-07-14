"use client";

import { useEffect, useState } from "react";

import { listarBarbeiros } from "@/services/barbeiroService";

import {
  obterBarbearia,
  criarBarbearia,
  atualizarBarbearia,
} from "@/services/barbeariaService";

import {
  listarConfiguracoesFuncionamento,
  atualizarConfiguracaoFuncionamento,
} from "@/services/configuracaoFuncionamentoService";

import {
  listarDisponibilidadeBarbeiro,
  atualizarDisponibilidadeBarbeiro,
} from "@/services/barbeiroDisponibilidadeService";

export default function ConfiguracoesPage() {
  const [abaAtiva, setAbaAtiva] = useState("funcionamento");

  const [configuracoes, setConfiguracoes] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState("");
  const [disponibilidades, setDisponibilidades] = useState([]);

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const diasSemana = [
    "SEGUNDA",
    "TERÇA",
    "QUARTA",
    "QUINTA",
    "SEXTA",
    "SÁBADO",
    "DOMINGO",
  ];

  useEffect(() => {
    carregarConfiguracoes();
    carregarBarbeiros();
    carregarBarbearia();
  }, []);

  useEffect(() => {
    if (barbeiroSelecionado) {
      carregarDisponibilidadeBarbeiro(barbeiroSelecionado);
    }
  }, [barbeiroSelecionado]);

  function limparMensagens() {
    setMensagem("");
    setErro("");
  }

  async function carregarConfiguracoes() {
    try {
      const dados = await listarConfiguracoesFuncionamento();
      setConfiguracoes(dados);
    } catch {
      setErro("Erro ao carregar configurações.");
    }
  }

  async function carregarBarbeiros() {
    try {
      const dados = await listarBarbeiros();
      setBarbeiros(dados.filter((b) => b.ativo !== false));
    } catch {
      setErro("Erro ao carregar barbeiros.");
    }
  }

  async function carregarDisponibilidadeBarbeiro(barbeiroId) {
    limparMensagens();

    try {
      const dados = await listarDisponibilidadeBarbeiro(barbeiroId);
      setDisponibilidades(dados);
    } catch {
      setErro("Erro ao carregar disponibilidade do barbeiro.");
    }
  }

  function alterarCampoFuncionamento(index, campo, valor) {
    const copia = [...configuracoes];

    copia[index] = {
      ...copia[index],
      [campo]: valor,
    };

    setConfiguracoes(copia);
  }

  function alterarCampoDisponibilidade(index, campo, valor) {
    const copia = [...disponibilidades];

    copia[index] = {
      ...copia[index],
      [campo]: valor,
    };

    setDisponibilidades(copia);
  }

  async function salvarFuncionamento() {
    limparMensagens();

    try {
      for (const config of configuracoes) {
        await atualizarConfiguracaoFuncionamento(config.id, {
          trabalha: config.trabalha,
          hora_inicio: config.hora_inicio,
          hora_fim: config.hora_fim,
        });
      }

      setMensagem("Configurações de funcionamento salvas com sucesso.");
    } catch {
      setErro("Erro ao salvar configurações de funcionamento.");
    }
  }

  async function salvarDisponibilidadeBarbeiro() {
    limparMensagens();

    if (!barbeiroSelecionado) {
      setErro("Selecione um barbeiro.");
      return;
    }

    try {
      for (const item of disponibilidades) {
        await atualizarDisponibilidadeBarbeiro(item.id, {
          usa_padrao: item.usa_padrao,
          trabalha: item.trabalha,
          hora_inicio: item.hora_inicio,
          hora_fim: item.hora_fim,
        });
      }

      setMensagem("Disponibilidade do barbeiro salva com sucesso.");
    } catch {
      setErro("Erro ao salvar disponibilidade do barbeiro.");
    }
  }

  function aplicarUsoPadraoTodos(valor) {
    const atualizadas = disponibilidades.map((item) => ({
      ...item,
      usa_padrao: valor,
    }));

    setDisponibilidades(atualizadas);
  }

  async function carregarBarbearia() {
  try {
    const dados = await obterBarbearia();

    setBarbearia({
      nome: dados.nome || "",
      telefone_whatsapp: dados.telefone_whatsapp || "",
      endereco: dados.endereco || "",
      instagram: dados.instagram || "",
      logo_url: dados.logo_url || "",
      slogan: dados.slogan || "",
      imagem_capa_url: dados.imagem_capa_url || "",
    });

    setBarbeariaExiste(true);
  } catch {
    setBarbeariaExiste(false);
  }
}

function alterarCampoBarbearia(campo, valor) {
  setBarbearia((atual) => ({
    ...atual,
    [campo]: valor,
  }));
}

async function salvarBarbearia() {
  limparMensagens();

  if (!barbearia.nome.trim()) {
    setErro("Informe o nome da barbearia.");
    return;
  }

  try {
    if (barbeariaExiste) {
      await atualizarBarbearia(barbearia);
    } else {
      await criarBarbearia(barbearia);
      setBarbeariaExiste(true);
    }

    setMensagem("Dados da barbearia salvos com sucesso.");
  } catch {
    setErro("Erro ao salvar dados da barbearia.");
  }
}

  

  const todosUsamPadrao =
    disponibilidades.length > 0 &&
    disponibilidades.every((item) => item.usa_padrao === true);

  const inputTimeStyle = {
    padding: "8px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "15px",
  };

  const cardStyle = {
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "15px",
    background: "#ffffff",
  };

  const buttonStyle = {
    background: "#111827",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
  };

  const tabButtonStyle = (ativa) => ({
    border: ativa ? "2px solid #2563eb" : "1px solid #d1d5db",
    background: ativa ? "#eff6ff" : "#ffffff",
    color: "#111827",
    padding: "12px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: ativa ? "bold" : "normal",
  });

  const inputPadraoStyle = {
    width: "100%",
    padding: "10px",
    marginTop: "8px",
    marginBottom: "15px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "15px",
   };

  const [barbearia, setBarbearia] = useState({
    nome: "",
    telefone_whatsapp: "",
    endereco: "",
    instagram: "",
    logo_url: "",
    slogan: "",
    imagem_capa_url: "",
  });

 

const [barbeariaExiste, setBarbeariaExiste] = useState(false);

  return (
    <main style={{ padding: "30px" }}>
      <h1>Configurações</h1>

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "25px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => setAbaAtiva("barbearia")}
          style={tabButtonStyle(abaAtiva === "barbearia")}
        >
          🏪 Dados da Barbearia
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva("funcionamento")}
          style={tabButtonStyle(abaAtiva === "funcionamento")}
        >
          🕒 Funcionamento
        </button>

        <button
          type="button"
          onClick={() => setAbaAtiva("disponibilidade")}
          style={tabButtonStyle(abaAtiva === "disponibilidade")}
        >
          ✂️ Disponibilidade dos Barbeiros
        </button>
      </div>

      {mensagem && (
        <div
          style={{
            background: "#d1fae5",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "8px",
          }}
        >
          {mensagem}
        </div>
      )}

      {erro && (
        <div
          style={{
            background: "#fee2e2",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "8px",
          }}
        >
          {erro}
        </div>
      )}

      {abaAtiva === "barbearia" && (
        <section>
          <h2>Dados da Barbearia</h2>

          <div style={{ ...cardStyle, maxWidth: "800px" }}>
            <label>Nome da Barbearia</label>
            <input
              value={barbearia.nome || ""}
              onChange={(e) =>
                alterarCampoBarbearia("nome", e.target.value)
              }
              style={inputPadraoStyle}
            />

            <label>Slogan da Barbearia</label>
            <input
              value={barbearia.slogan || ""}
              onChange={(e) =>
                alterarCampoBarbearia("slogan", e.target.value)
              }
              placeholder="Ex: Corte, barba e estilo para quem valoriza presença."
              style={inputPadraoStyle}
            />

            <label>Telefone WhatsApp</label>
            <input
              value={barbearia.telefone_whatsapp || ""}
              onChange={(e) =>
                alterarCampoBarbearia("telefone_whatsapp", e.target.value)
              }
              placeholder="Ex: 5511999999999"
              style={inputPadraoStyle}
            />

            <label>Endereço</label>
            <input
              value={barbearia.endereco || ""}
              onChange={(e) =>
                alterarCampoBarbearia("endereco", e.target.value)
              }
              style={inputPadraoStyle}
            />

            <label>Instagram</label>
            <input
              value={barbearia.instagram || ""}
              onChange={(e) =>
                alterarCampoBarbearia("instagram", e.target.value)
              }
              placeholder="@suaBarbearia"
              style={inputPadraoStyle}
            />

            <label>Logo URL</label>
            <input
              value={barbearia.logo_url || ""}
              onChange={(e) =>
                alterarCampoBarbearia("logo_url", e.target.value)
              }
              placeholder="https://..."
              style={inputPadraoStyle}
            />

            {barbearia.logo_url && (
              <div style={{ marginBottom: "15px" }}>
                <p>Prévia da logo:</p>
                <img
                  src={barbearia.logo_url}
                  alt="Logo da barbearia"
                  style={{
                    maxWidth: "160px",
                    maxHeight: "100px",
                    objectFit: "contain",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px",
                  }}
                />
              </div>
            )}

            <label>Imagem de Capa URL</label>
            <input
              value={barbearia.imagem_capa_url || ""}
              onChange={(e) =>
                alterarCampoBarbearia("imagem_capa_url", e.target.value)
              }
              placeholder="https://..."
              style={inputPadraoStyle}
            />

            {barbearia.imagem_capa_url && (
              <div style={{ marginBottom: "15px" }}>
                <p>Prévia da imagem de capa:</p>
                <img
                  src={barbearia.imagem_capa_url}
                  alt="Imagem de capa da barbearia"
                  style={{
                    width: "100%",
                    maxWidth: "500px",
                    maxHeight: "220px",
                    objectFit: "cover",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                  }}
                />
              </div>
            )}

            <button
              type="button"
              onClick={salvarBarbearia}
              style={buttonStyle}
            >
              Salvar Dados da Barbearia
            </button>
          </div>
        </section>
      )}

      {abaAtiva === "funcionamento" && (
        <section>
          <h2>Funcionamento da Barbearia</h2>

          {configuracoes.map((config, index) => (
            <div key={config.id} style={cardStyle}>
              <h3>{diasSemana[config.dia_semana]}</h3>

              <label>
                <input
                  type="checkbox"
                  checked={config.trabalha}
                  onChange={(e) =>
                    alterarCampoFuncionamento(
                      index,
                      "trabalha",
                      e.target.checked
                    )
                  }
                />
                {" "}Trabalha neste dia
              </label>

              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  marginTop: "15px",
                }}
              >
                <div>
                  <label>Início</label>
                  <br />

                  <input
                    type="time"
                    value={config.hora_inicio}
                    disabled={!config.trabalha}
                    onChange={(e) =>
                      alterarCampoFuncionamento(
                        index,
                        "hora_inicio",
                        e.target.value
                      )
                    }
                    style={inputTimeStyle}
                  />
                </div>

                <div>
                  <label>Fim</label>
                  <br />

                  <input
                    type="time"
                    value={config.hora_fim}
                    disabled={!config.trabalha}
                    onChange={(e) =>
                      alterarCampoFuncionamento(
                        index,
                        "hora_fim",
                        e.target.value
                      )
                    }
                    style={inputTimeStyle}
                  />
                </div>
              </div>
            </div>
          ))}

          <button onClick={salvarFuncionamento} style={buttonStyle}>
            Salvar Funcionamento
          </button>
        </section>
      )}

      {abaAtiva === "disponibilidade" && (
        <section>
          <h2>Disponibilidade dos Barbeiros</h2>

          <div style={{ ...cardStyle, maxWidth: "700px" }}>
            <label>Selecione o barbeiro</label>
            <br />

            <select
              value={barbeiroSelecionado}
              onChange={(e) => setBarbeiroSelecionado(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "15px",
              }}
            >
              <option value="">Selecione</option>

              {barbeiros.map((barbeiro) => (
                <option key={barbeiro.id} value={barbeiro.id}>
                  {barbeiro.nome}
                </option>
              ))}
            </select>
          </div>

          {barbeiroSelecionado && disponibilidades.length > 0 && (
            <>
              <div style={{ ...cardStyle, background: "#f9fafb" }}>
                <label>
                  <input
                    type="checkbox"
                    checked={todosUsamPadrao}
                    onChange={(e) => aplicarUsoPadraoTodos(e.target.checked)}
                  />
                  {" "}Usar horário padrão da barbearia para todos os dias
                </label>

                <p style={{ color: "#6b7280", marginTop: "8px" }}>
                  Se marcado, este barbeiro seguirá automaticamente os horários
                  definidos em Funcionamento da Barbearia.
                </p>
              </div>

              {!todosUsamPadrao &&
                disponibilidades.map((item, index) => (
                  <div key={item.id} style={cardStyle}>
                    <h3>{diasSemana[item.dia_semana]}</h3>

                    <label>
                      <input
                        type="checkbox"
                        checked={item.usa_padrao}
                        onChange={(e) =>
                          alterarCampoDisponibilidade(
                            index,
                            "usa_padrao",
                            e.target.checked
                          )
                        }
                      />
                      {" "}Usar horário padrão neste dia
                    </label>

                    {!item.usa_padrao && (
                      <>
                        <br />
                        <br />

                        <label>
                          <input
                            type="checkbox"
                            checked={item.trabalha}
                            onChange={(e) =>
                              alterarCampoDisponibilidade(
                                index,
                                "trabalha",
                                e.target.checked
                              )
                            }
                          />
                          {" "}Trabalha neste dia
                        </label>

                        <div
                          style={{
                            display: "flex",
                            gap: "20px",
                            marginTop: "15px",
                          }}
                        >
                          <div>
                            <label>Início</label>
                            <br />

                            <input
                              type="time"
                              value={item.hora_inicio}
                              disabled={!item.trabalha}
                              onChange={(e) =>
                                alterarCampoDisponibilidade(
                                  index,
                                  "hora_inicio",
                                  e.target.value
                                )
                              }
                              style={inputTimeStyle}
                            />
                          </div>

                          <div>
                            <label>Fim</label>
                            <br />

                            <input
                              type="time"
                              value={item.hora_fim}
                              disabled={!item.trabalha}
                              onChange={(e) =>
                                alterarCampoDisponibilidade(
                                  index,
                                  "hora_fim",
                                  e.target.value
                                )
                              }
                              style={inputTimeStyle}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}

              <button onClick={salvarDisponibilidadeBarbeiro} style={buttonStyle}>
                Salvar Disponibilidade do Barbeiro
              </button>
            </>
          )}
        </section>
      )}
    </main>
  );
}