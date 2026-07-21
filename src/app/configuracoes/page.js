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
  const [abaAtiva, setAbaAtiva] = useState("barbearia");

  const [configuracoes, setConfiguracoes] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState("");
  const [disponibilidades, setDisponibilidades] = useState([]);

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const [barbearia, setBarbearia] = useState({

  id: null,
  slug: "",
  nome: "",
  responsavel: "",
  email: "",
  telefone: "",
  telefone_whatsapp: "",
  cnpj: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
  instagram: "",
  logo_url: "",
  slogan: "",
  imagem_capa_url: "",
  ativa: true,
  created_at: null,
});

const [barbeariaExiste, setBarbeariaExiste] = useState(false);
const [salvandoBarbearia, setSalvandoBarbearia] = useState(false);
const [linkAgendamento, setLinkAgendamento] = useState("");

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

  useEffect(() => {
    if (typeof window !== "undefined" && barbearia.slug) {
      const slugSeguro = encodeURIComponent(barbearia.slug);

      setLinkAgendamento(
        `${window.location.origin}/agendar?barbearia=${slugSeguro}`
      );
    } else {
      setLinkAgendamento("");
    }
  }, [barbearia.slug]);

  function limparMensagens() {
    setMensagem("");
    setErro("");
  }

  async function copiarLinkAgendamento() {
    limparMensagens();

    if (!linkAgendamento) {
      setErro(
        "O link ainda não está disponível. Salve primeiro os dados da barbearia."
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(linkAgendamento);
      setMensagem("Link público de agendamento copiado com sucesso.");
    } catch {
      setErro(
        "Não foi possível copiar o link automaticamente. Selecione e copie o endereço manualmente."
      );
    }
  }

  function compartilharLinkWhatsApp() {
    limparMensagens();

    if (!linkAgendamento) {
      setErro(
        "O link ainda não está disponível. Salve primeiro os dados da barbearia."
      );
      return;
    }

    const nomeBarbearia =
      barbearia.nome || "nossa barbearia";

    const mensagemWhatsApp =
      `Olá! Agende seu horário na ${nomeBarbearia} pelo link:\n\n` +
      linkAgendamento;

    const urlWhatsApp =
      `https://wa.me/?text=${encodeURIComponent(mensagemWhatsApp)}`;

    window.open(
      urlWhatsApp,
      "_blank",
      "noopener,noreferrer"
    );
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
  id: dados.id || null,
  slug: dados.slug || "",
  nome: dados.nome || "",
  responsavel: dados.responsavel || "",
  email: dados.email || "",
  telefone: dados.telefone || "",
  telefone_whatsapp: dados.telefone_whatsapp || "",
  cnpj: dados.cnpj || "",
  endereco: dados.endereco || "",
  cidade: dados.cidade || "",
  estado: dados.estado || "",
  cep: dados.cep || "",
  instagram: dados.instagram || "",
  logo_url: dados.logo_url || "",
  slogan: dados.slogan || "",
  imagem_capa_url: dados.imagem_capa_url || "",
  ativa: dados.ativa !== false,
  created_at: dados.created_at || null,
});

    setBarbeariaExiste(true);
  } catch (error) {
    if (error?.response?.status === 404) {
      setBarbeariaExiste(false);
      return;
    }

    setErro("Erro ao carregar os dados da barbearia.");
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

  if (
    barbearia.email &&
    !barbearia.email.includes("@")
  ) {
    setErro("Informe um e-mail válido.");
    return;
  }

  try {
    setSalvandoBarbearia(true);

    let dadosSalvos;

    const {
      id,
      slug,
      created_at,
      ...dadosParaSalvar
    } = barbearia;

    if (barbeariaExiste) {
      dadosSalvos = await atualizarBarbearia(dadosParaSalvar);
    } else {
      dadosSalvos = await criarBarbearia(dadosParaSalvar);
      setBarbeariaExiste(true);
    }

    setBarbearia({
  id: dadosSalvos.id || null,
  slug: dadosSalvos.slug || "",
  nome: dadosSalvos.nome || "",
  responsavel: dadosSalvos.responsavel || "",
  email: dadosSalvos.email || "",
  telefone: dadosSalvos.telefone || "",
  telefone_whatsapp: dadosSalvos.telefone_whatsapp || "",
  cnpj: dadosSalvos.cnpj || "",
  endereco: dadosSalvos.endereco || "",
  cidade: dadosSalvos.cidade || "",
  estado: dadosSalvos.estado || "",
  cep: dadosSalvos.cep || "",
  instagram: dadosSalvos.instagram || "",
  logo_url: dadosSalvos.logo_url || "",
  slogan: dadosSalvos.slogan || "",
  imagem_capa_url: dadosSalvos.imagem_capa_url || "",
  ativa: dadosSalvos.ativa !== false,
  created_at: dadosSalvos.created_at || null,
});

    setMensagem("Dados da barbearia salvos com sucesso.");
  } catch (error) {
    const detalhe =
      error?.response?.data?.detail;

    setErro(
      typeof detalhe === "string"
        ? detalhe
        : "Erro ao salvar os dados da barbearia."
    );
  } finally {
    setSalvandoBarbearia(false);
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


   function somenteNumeros(valor) {
  return valor.replace(/\D/g, "");
}


function formatarTelefone(valor) {
  const numeros = somenteNumeros(valor).slice(0, 11);

  if (numeros.length <= 10) {
    return numeros
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return numeros
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}


function formatarWhatsApp(valor) {
  const numeros = somenteNumeros(valor).slice(0, 13);

  if (numeros.startsWith("55")) {
    return numeros
      .replace(/^(\d{2})(\d{2})(\d)/, "+$1 ($2) $3")
      .replace(/(\d{5})(\d)/, "$1-$2");
  }

  return formatarTelefone(numeros);
}


function formatarCnpj(valor) {
  return somenteNumeros(valor)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}


function formatarCep(valor) {
  return somenteNumeros(valor)
    .slice(0, 8)
    .replace(/^(\d{5})(\d)/, "$1-$2");
}


function formatarData(valor) {
  if (!valor) {
    return "Não informado";
  }

  return new Date(valor).toLocaleDateString("pt-BR");
}

const estadosBrasil = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];


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
          🏢 Empresa
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
    <h2>Empresa / Barbearia</h2>

    <p
      style={{
        color: "#6b7280",
        marginTop: "-6px",
        marginBottom: "20px",
      }}
    >
      Cadastre e mantenha atualizadas as informações da empresa, utilizadas na agenda online, relatórios, identidade visual e comunicação com os clientes.
    </p>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "12px",
        maxWidth: "1000px",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          ...cardStyle,
          marginBottom: 0,
          padding: "16px",
        }}
      >
        <div style={{ color: "#6b7280", fontSize: "13px" }}>
          Empresa
        </div>

        <strong>{barbearia.nome || "Não cadastrada"}</strong>
      </div>

      <div
        style={{
          ...cardStyle,
          marginBottom: 0,
          padding: "16px",
        }}
      >
        <div style={{ color: "#6b7280", fontSize: "13px" }}>
          Status
        </div>

        <strong
          style={{
            color: barbearia.ativa
              ? "#15803d"
              : "#b91c1c",
          }}
        >
          {barbearia.ativa ? "● Ativa" : "● Inativa"}
        </strong>
      </div>

      <div
        style={{
          ...cardStyle,
          marginBottom: 0,
          padding: "16px",
        }}
      >
        <div style={{ color: "#6b7280", fontSize: "13px" }}>
          Cadastro
        </div>

        <strong>{formatarData(barbearia.created_at)}</strong>
      </div>

      <div
        style={{
          ...cardStyle,
          marginBottom: 0,
          padding: "16px",
        }}
      >
        <div style={{ color: "#6b7280", fontSize: "13px" }}>
          Identificador
        </div>

        <strong>{barbearia.id || "—"}</strong>
      </div>
    </div>

        <div
          style={{
            ...cardStyle,
            maxWidth: "1000px",
            background: "#f8fafc",
            border: "1px solid #bfdbfe",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "8px" }}>
            🌐 Link Público de Agendamento
          </h3>

          <p
            style={{
              color: "#6b7280",
              marginTop: 0,
              marginBottom: "16px",
              lineHeight: 1.5,
            }}
          >
            Copie este endereço e envie aos clientes para que eles possam
            realizar agendamentos online.
          </p>

          {linkAgendamento ? (
            <>
              <input
                type="text"
                value={linkAgendamento}
                readOnly
                onFocus={(e) => e.target.select()}
                style={{
                  ...inputPadraoStyle,
                  marginBottom: "12px",
                  background: "#ffffff",
                  cursor: "text",
                }}
              />

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={copiarLinkAgendamento}
                  style={buttonStyle}
                >
                  📋 Copiar Link
                </button>

                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      linkAgendamento,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  style={{
                    ...buttonStyle,
                    background: "#2563eb",
                  }}
                >
                  🌐 Abrir Link
                </button>
                <button
                  type="button"
                  onClick={compartilharLinkWhatsApp}
                  style={{
                    ...buttonStyle,
                    background: "#16a34a",
                  }}
                >
                  📱 Compartilhar no WhatsApp
                </button>
              </div>
            </>
          ) : (
            <div
              style={{
                padding: "14px",
                borderRadius: "8px",
                background: "#fef3c7",
                color: "#92400e",
              }}
            >
              O link será gerado após o cadastro da barbearia possuir um
              identificador público.
            </div>
          )}
        </div>

    <div style={{ ...cardStyle, maxWidth: "1000px" }}>
      <h3 style={{ marginTop: 0 }}>Dados cadastrais</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "0 20px",
        }}
      >
        <div>
          <label>Nome da Barbearia *</label>
          <input
            value={barbearia.nome}
            onChange={(e) =>
              alterarCampoBarbearia(
                "nome",
                e.target.value
              )
            }
            placeholder="Nome fantasia da barbearia"
            style={inputPadraoStyle}
          />
        </div>

        <div>
          <label>Responsável</label>
          <input
            value={barbearia.responsavel}
            onChange={(e) =>
              alterarCampoBarbearia(
                "responsavel",
                e.target.value
              )
            }
            placeholder="Nome do proprietário ou responsável"
            style={inputPadraoStyle}
          />
        </div>

        <div>
          <label>E-mail</label>
          <input
            type="email"
            value={barbearia.email}
            onChange={(e) =>
              alterarCampoBarbearia(
                "email",
                e.target.value
              )
            }
            placeholder="contato@barbearia.com.br"
            style={inputPadraoStyle}
          />
        </div>

        <div>
          <label>Telefone</label>
          <input
            value={barbearia.telefone}
            onChange={(e) =>
              alterarCampoBarbearia(
                "telefone",
                formatarTelefone(e.target.value)
              )
            }
            placeholder="Ex.: 11999999999"
            style={inputPadraoStyle}
          />
        </div>

        <div>
          <label>Telefone WhatsApp</label>
          <input
            value={barbearia.telefone_whatsapp}
            onChange={(e) =>
              alterarCampoBarbearia(
                "telefone_whatsapp",
                formatarWhatsApp(e.target.value)
              )
            }
            placeholder="Ex.: 5511999999999"
            style={inputPadraoStyle}
          />
        </div>

        <div>
          <label>CNPJ</label>
          <input
            value={barbearia.cnpj}
            onChange={(e) =>
              alterarCampoBarbearia(
                "cnpj",
                formatarCnpj(e.target.value)
              )
            }
            placeholder="00.000.000/0001-00"
            style={inputPadraoStyle}
          />
        </div>
      </div>

      <hr
        style={{
          border: 0,
          borderTop: "1px solid #e5e7eb",
          margin: "15px 0 25px",
        }}
      />

      <h3>Endereço</h3>

      <div>
        <label>Endereço completo</label>
        <input
          value={barbearia.endereco}
          onChange={(e) =>
            alterarCampoBarbearia(
              "endereco",
              e.target.value
            )
          }
          placeholder="Rua, número e complemento"
          style={inputPadraoStyle}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "0 20px",
        }}
      >
        <div>
          <label>Cidade</label>
          <input
            value={barbearia.cidade}
            onChange={(e) =>
              alterarCampoBarbearia(
                "cidade",
                e.target.value
              )
            }
            placeholder="Cidade"
            style={inputPadraoStyle}
          />
        </div>

        <div>
          <label>Estado</label>
          <select
            value={barbearia.estado}
            onChange={(e) =>
              alterarCampoBarbearia(
                "estado",
                e.target.value
              )
            }
            style={inputPadraoStyle}
          >
            <option value="">Selecione</option>

            {estadosBrasil.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>CEP</label>
          <input
            value={barbearia.cep}
            onChange={(e) =>
              alterarCampoBarbearia(
                "cep",
                formatarCep(e.target.value)
              )
            }
            placeholder="00000-000"
            style={inputPadraoStyle}
          />
        </div>
      </div>

      <hr
        style={{
          border: 0,
          borderTop: "1px solid #e5e7eb",
          margin: "15px 0 25px",
        }}
      />

      <h3>Identidade visual</h3>

      <label>Slogan da Barbearia</label>
      <input
        value={barbearia.slogan}
        onChange={(e) =>
          alterarCampoBarbearia(
            "slogan",
            e.target.value
          )
        }
        placeholder="Ex.: Corte, barba e estilo para quem valoriza presença."
        style={inputPadraoStyle}
      />

      <label>Instagram</label>
      <input
        value={barbearia.instagram}
        onChange={(e) =>
          alterarCampoBarbearia(
            "instagram",
            e.target.value
          )
        }
        placeholder="@suaBarbearia"
        style={inputPadraoStyle}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          alignItems: "start",
        }}
      >
        <div>
          <label>Logo URL</label>

          <input
            value={barbearia.logo_url}
            onChange={(e) =>
              alterarCampoBarbearia(
                "logo_url",
                e.target.value
              )
            }
            placeholder="Informe a URL da logo"
            style={inputPadraoStyle}
          />

          <div
            style={{
              minHeight: "220px",
              border: "1px dashed #d1d5db",
              borderRadius: "10px",
              padding: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f9fafb",
            }}
          >
            {barbearia.logo_url ? (
              <img
                src={barbearia.logo_url}
                alt="Logo da barbearia"
                style={{
                  maxWidth: "220px",
                  maxHeight: "180px",
                  objectFit: "contain",
                }}
              />
            ) : (
              <span style={{ color: "#9ca3af" }}>
                🖼️

                Nenhuma logo informada
              </span>
            )}
          </div>
        </div>

        <div>
          <label>Imagem de Capa URL</label>

          <input
            value={barbearia.imagem_capa_url}
            onChange={(e) =>
              alterarCampoBarbearia(
                "imagem_capa_url",
                e.target.value
              )
            }
            placeholder="Informe a URL da imagem de capa"
            style={inputPadraoStyle}
          />

          <div
            style={{
              minHeight: "150px",
              border: "1px dashed #d1d5db",
              borderRadius: "10px",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f9fafb",
            }}
          >
            {barbearia.imagem_capa_url ? (
              <img
                src={barbearia.imagem_capa_url}
                alt="Imagem de capa da barbearia"
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <span style={{ color: "#9ca3af" }}>
                Nenhuma imagem de capa informada
              </span>
            )}
          </div>
        </div>
      </div>

      <p
        style={{
          color: "#6b7280",
          fontSize: "13px",
          marginTop: "25px",
          marginBottom: "18px",
        }}
      >
        * Campo obrigatório.
      </p>

      <button
        type="button"
        onClick={salvarBarbearia}
        disabled={salvandoBarbearia}
        style={{
          ...buttonStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          minWidth: "230px",
          opacity: salvandoBarbearia ? 0.65 : 1,
          cursor: salvandoBarbearia
            ? "not-allowed"
            : "pointer",
        }}
      >
        {salvandoBarbearia
          ? "Salvando alterações..."
          : "💾 Salvar Alterações"}
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