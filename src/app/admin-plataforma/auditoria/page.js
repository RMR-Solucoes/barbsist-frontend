"use client";

import { useEffect, useMemo, useState } from "react";

import {
  listarAuditoriaSaas,
  listarBarbearias,
  listarAssinaturasSaas,
} from "@/services/adminPlataformaService";

const estilos = {
  pagina: {
    padding: 30,
    background: "#f8fafc",
    minHeight: "100vh",
  },
  subtitulo: {
    color: "#64748b",
    marginTop: 6,
    marginBottom: 28,
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 16,
    marginBottom: 26,
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 15,
    padding: 20,
    boxShadow: "0 1px 3px rgba(15,23,42,0.03)",
  },
  cardLabel: {
    color: "#64748b",
    fontSize: 16,
    marginBottom: 10,
  },
  cardValor: {
    color: "#0f172a",
    fontSize: 28,
    fontWeight: 700,
  },
  painel: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 15,
    padding: 22,
  },
  tituloPainel: {
    fontSize: 21,
    margin: "0 0 14px 0",
    color: "#0f172a",
  },
  filtros: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: 12,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    minHeight: 48,
    padding: "10px 13px",
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    fontSize: 15,
    background: "#fff",
    boxSizing: "border-box",
  },
  tabelaWrap: {
    overflowX: "auto",
  },
  tabela: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 1050,
  },
  th: {
    textAlign: "left",
    padding: "13px 10px",
    borderBottom: "1px solid #e2e8f0",
    color: "#1e293b",
    fontSize: 14,
    whiteSpace: "nowrap",
  },
  td: {
    padding: "14px 10px",
    borderBottom: "1px solid #f1f5f9",
    color: "#0f172a",
    fontSize: 14,
    verticalAlign: "top",
  },
  secundario: {
    display: "block",
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
  },
  badge: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: "#e0f2fe",
    color: "#075985",
  },
  badgeStatus: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: "#f1f5f9",
    color: "#334155",
  },
  erro: {
    padding: 13,
    borderRadius: 10,
    background: "#fee2e2",
    color: "#991b1b",
    marginBottom: 18,
  },
  vazio: {
    padding: "38px 15px",
    textAlign: "center",
    color: "#64748b",
  },
};

function normalizar(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatarData(valor) {
  if (!valor) return "-";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return String(valor);
  }

  return data.toLocaleString("pt-BR");
}

function textoAcao(acao) {
  if (!acao) return "-";

  const chave = normalizar(acao).toUpperCase();

  const mapa = {
    BLOQUEIO: "Bloqueio",
    LIBERACAO: "Liberacao",
    ATIVACAO: "Ativacao",
    CANCELAMENTO: "Cancelamento",
    SUSPENSAO: "Suspensao",
    REATIVACAO: "Reativacao",
    ALTERACAO: "Alteracao",
  };

  return mapa[chave] || String(acao);
}

function obterNomeBarbearia(item) {
  return (
    item?.nome ||
    item?.nome_fantasia ||
    item?.razao_social ||
    `Barbearia #${item?.id}`
  );
}

export default function Page() {
  const [auditoria, setAuditoria] = useState([]);
  const [barbearias, setBarbearias] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);

  const [busca, setBusca] = useState("");
  const [acao, setAcao] = useState("");
  const [barbeariaId, setBarbeariaId] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregar() {
    setCarregando(true);
    setErro("");

    try {
      const [dadosAuditoria, dadosBarbearias, dadosAssinaturas] =
        await Promise.all([
          listarAuditoriaSaas(),
          listarBarbearias(),
          listarAssinaturasSaas(),
        ]);

      setAuditoria(
        Array.isArray(dadosAuditoria) ? dadosAuditoria : []
      );

      setBarbearias(
        Array.isArray(dadosBarbearias) ? dadosBarbearias : []
      );

      setAssinaturas(
        Array.isArray(dadosAssinaturas) ? dadosAssinaturas : []
      );
    } catch (e) {
      setErro(
        e?.response?.data?.detail ||
          "Erro ao carregar a auditoria da plataforma."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const mapaBarbearias = useMemo(() => {
    const mapa = {};

    barbearias.forEach((item) => {
      mapa[item.id] = item;
    });

    return mapa;
  }, [barbearias]);

  const mapaAssinaturas = useMemo(() => {
    const mapa = {};

    assinaturas.forEach((item) => {
      mapa[item.id] = item;
    });

    return mapa;
  }, [assinaturas]);

  const acoesDisponiveis = useMemo(() => {
    return [
      ...new Set(
        auditoria
          .map((item) => item.acao)
          .filter(Boolean)
      ),
    ].sort();
  }, [auditoria]);

  const registrosFiltrados = useMemo(() => {
    const termo = normalizar(busca);

    return auditoria.filter((item) => {
      const barb = mapaBarbearias[item.barbearia_id];
      const ass = mapaAssinaturas[item.assinatura_id];

      const nomeBarbearia = obterNomeBarbearia(barb);

      const textoBusca = normalizar(
        [
          item.id,
          item.assinatura_id,
          item.barbearia_id,
          item.usuario_id,
          item.acao,
          item.observacao,
          item.status_anterior,
          item.status_novo,
          nomeBarbearia,
          ass?.promocao_codigo,
        ].join(" ")
      );

      const correspondeBusca =
        !termo || textoBusca.includes(termo);

      const correspondeAcao =
        !acao || item.acao === acao;

      const correspondeBarbearia =
        !barbeariaId ||
        String(item.barbearia_id) === String(barbeariaId);

      return (
        correspondeBusca &&
        correspondeAcao &&
        correspondeBarbearia
      );
    });
  }, [
    auditoria,
    busca,
    acao,
    barbeariaId,
    mapaBarbearias,
    mapaAssinaturas,
  ]);

  const total = auditoria.length;

  const totalBloqueios = auditoria.filter(
    (item) =>
      normalizar(item.acao).includes("bloque")
  ).length;

  const totalLiberacoes = auditoria.filter((item) => {
    const valor = normalizar(item.acao);

    return (
      valor.includes("liber") ||
      valor.includes("reativ")
    );
  }).length;

  const barbeariasComHistorico = new Set(
    auditoria.map((item) => item.barbearia_id)
  ).size;

  return (
    <main style={estilos.pagina}>
      <h1>Auditoria SaaS</h1>

      <p style={estilos.subtitulo}>
        Hist&oacute;rico administrativo das altera&ccedil;&otilde;es realizadas nas
        assinaturas da plataforma BarbSist.
      </p>

      {erro ? (
        <div style={estilos.erro}>{erro}</div>
      ) : null}

      <section style={estilos.cards}>
        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Total de registros
          </div>

          <div style={estilos.cardValor}>
            {total}
          </div>
        </div>

        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Bloqueios registrados
          </div>

          <div style={estilos.cardValor}>
            {totalBloqueios}
          </div>
        </div>

        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Libera&ccedil;&otilde;es / reativa&ccedil;&otilde;es
          </div>

          <div style={estilos.cardValor}>
            {totalLiberacoes}
          </div>
        </div>

        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Barbearias com hist&oacute;rico
          </div>

          <div style={estilos.cardValor}>
            {barbeariasComHistorico}
          </div>
        </div>
      </section>

      <section style={estilos.painel}>
        <h2 style={estilos.tituloPainel}>
          Hist&oacute;rico de auditoria
        </h2>

        <div style={estilos.filtros}>
          <input
            style={estilos.input}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por barbearia, a&ccedil;&atilde;o, observa&ccedil;&atilde;o, assinatura ou usu&aacute;rio..."
          />

          <select
            style={estilos.input}
            value={acao}
            onChange={(e) => setAcao(e.target.value)}
          >
            <option value="">Todas as a&ccedil;&otilde;es</option>

            {acoesDisponiveis.map((item) => (
              <option key={item} value={item}>
                {textoAcao(item)}
              </option>
            ))}
          </select>

          <select
            style={estilos.input}
            value={barbeariaId}
            onChange={(e) =>
              setBarbeariaId(e.target.value)
            }
          >
            <option value="">
              Todas as barbearias
            </option>

            {barbearias.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {obterNomeBarbearia(item)}
              </option>
            ))}
          </select>
        </div>

        {carregando ? (
          <div style={estilos.vazio}>
            Carregando auditoria...
          </div>
        ) : registrosFiltrados.length === 0 ? (
          <div style={estilos.vazio}>
            {auditoria.length === 0
              ? "Ainda n&atilde;o existem altera&ccedil;&otilde;es administrativas registradas na auditoria."
              : "Nenhum registro encontrado para os filtros selecionados."}
          </div>
        ) : (
          <div style={estilos.tabelaWrap}>
            <table style={estilos.tabela}>
              <thead>
                <tr>
                  <th style={estilos.th}>ID</th>
                  <th style={estilos.th}>Data / hora</th>
                  <th style={estilos.th}>Barbearia</th>
                  <th style={estilos.th}>Assinatura</th>
                  <th style={estilos.th}>Usu?rio</th>
                  <th style={estilos.th}>A??o</th>
                  <th style={estilos.th}>Altera&ccedil;&atilde;o</th>
                  <th style={estilos.th}>Observa&ccedil;&atilde;o</th>
                </tr>
              </thead>

              <tbody>
                {registrosFiltrados.map((item) => {
                  const barb =
                    mapaBarbearias[item.barbearia_id];

                  return (
                    <tr key={item.id}>
                      <td style={estilos.td}>
                        {item.id}
                      </td>

                      <td style={estilos.td}>
                        {formatarData(item.criado_em)}
                      </td>

                      <td style={estilos.td}>
                        <strong>
                          {obterNomeBarbearia(barb)}
                        </strong>

                        <span style={estilos.secundario}>
                          ID {item.barbearia_id}
                        </span>
                      </td>

                      <td style={estilos.td}>
                        #{item.assinatura_id}
                      </td>

                      <td style={estilos.td}>
                        #{item.usuario_id}
                      </td>

                      <td style={estilos.td}>
                        <span style={estilos.badge}>
                          {textoAcao(item.acao)}
                        </span>
                      </td>

                      <td style={estilos.td}>
                        <span style={estilos.badgeStatus}>
                          {item.status_anterior || "-"}
                        </span>

                        <span
                          style={{
                            margin: "0 7px",
                            color: "#64748b",
                          }}
                        >
                          ?
                        </span>

                        <span style={estilos.badgeStatus}>
                          {item.status_novo || "-"}
                        </span>
                      </td>

                      <td style={estilos.td}>
                        {item.observacao || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

