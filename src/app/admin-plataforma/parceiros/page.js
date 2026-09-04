"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  aprovarResgate,
  criarParceiro,
  listarComissoes,
  listarCreditos,
  listarIndicacoes,
  listarParceiros,
  listarResgates,
  processarBeneficioPagamento,
  registrarIndicacao,
} from "@/services/parceirosAdminService";

const estadoInicial = {
  tipo: "VENDEDOR",
  nome: "",
  email: "",
  telefone: "",
  barbearia_id: "",
  codigo_ref: "",
  tipo_beneficio: "COMISSAO",
  regra_beneficio: "PERCENTUAL",
  percentual_beneficio: "10",
  valor_fixo_beneficio: "",
  ativo: true,
  observacao: "",
};

function moeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function dataHora(valor) {
  if (!valor) return "—";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return valor;
  }

  return data.toLocaleString("pt-BR");
}

function erroApi(erro, mensagem) {
  const detalhe = erro?.response?.data?.detail;

  if (Array.isArray(detalhe)) {
    return detalhe
      .map((item) => item?.msg || JSON.stringify(item))
      .join(" | ");
  }

  return detalhe || mensagem;
}

const estiloCard = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 18,
  boxShadow: "0 8px 22px rgba(15,23,42,.05)",
};

const estiloInput = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  background: "#fff",
  boxSizing: "border-box",
};

const estiloBotao = {
  border: 0,
  borderRadius: 8,
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 700,
};

export default function ParceirosAdminPage() {
  const [parceiros, setParceiros] = useState([]);
  const [resgates, setResgates] = useState([]);

  const [selecionado, setSelecionado] = useState(null);
  const [indicacoes, setIndicacoes] = useState([]);
  const [comissoes, setComissoes] = useState([]);
  const [creditos, setCreditos] = useState([]);

  const [form, setForm] = useState(estadoInicial);

  const [barbeariaIndicadaId, setBarbeariaIndicadaId] =
    useState("");

  const [pagamentoId, setPagamentoId] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const carregarBase = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const [listaParceiros, listaResgates] =
        await Promise.all([
          listarParceiros(true),
          listarResgates(),
        ]);

      setParceiros(listaParceiros || []);
      setResgates(listaResgates || []);
    } catch (e) {
      setErro(
        erroApi(
          e,
          "Erro ao carregar a administração de parceiros."
        )
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarBase();
  }, [carregarBase]);

  const resumo = useMemo(() => {
    const ativos = parceiros.filter((p) => p.ativo).length;

    const vendedores = parceiros.filter(
      (p) =>
        p.tipo === "VENDEDOR" ||
        p.tipo === "COLABORADOR"
    ).length;

    const barbearias = parceiros.filter(
      (p) => p.tipo === "BARBEARIA"
    ).length;

    const resgatesPendentes = resgates.filter(
      (r) =>
        r.status === "SOLICITADO" ||
        r.status === "APROVADO"
    ).length;

    return {
      ativos,
      vendedores,
      barbearias,
      resgatesPendentes,
    };
  }, [parceiros, resgates]);

  function alterarCampo(nome, valor) {
    setForm((anterior) => ({
      ...anterior,
      [nome]: valor,
    }));
  }

  function alterarTipo(tipo) {
    setForm((anterior) => ({
      ...anterior,
      tipo,
      tipo_beneficio:
        tipo === "BARBEARIA"
          ? "CREDITO"
          : "COMISSAO",
      barbearia_id:
        tipo === "BARBEARIA"
          ? anterior.barbearia_id
          : "",
    }));
  }

  async function cadastrarParceiro(evento) {
    evento.preventDefault();

    setSalvando(true);
    setErro("");
    setSucesso("");

    try {
      const dados = {
        tipo: form.tipo,
        nome: form.nome.trim(),
        email: form.email.trim(),
        telefone:
          form.telefone.trim() || null,
        barbearia_id:
          form.tipo === "BARBEARIA"
            ? Number(form.barbearia_id)
            : null,
        codigo_ref: form.codigo_ref
          .trim()
          .toUpperCase(),
        tipo_beneficio:
          form.tipo === "BARBEARIA"
            ? "CREDITO"
            : "COMISSAO",
        regra_beneficio: form.regra_beneficio,
        percentual_beneficio:
          form.regra_beneficio === "PERCENTUAL"
            ? Number(form.percentual_beneficio)
            : null,
        valor_fixo_beneficio:
          form.regra_beneficio === "VALOR_FIXO"
            ? Number(form.valor_fixo_beneficio)
            : null,
        ativo: Boolean(form.ativo),
        observacao:
          form.observacao.trim() || null,
      };

      await criarParceiro(dados);

      setForm(estadoInicial);
      setSucesso("Parceiro cadastrado com sucesso.");

      await carregarBase();
    } catch (e) {
      setErro(
        erroApi(
          e,
          "Não foi possível cadastrar o parceiro."
        )
      );
    } finally {
      setSalvando(false);
    }
  }

  async function abrirParceiro(parceiro) {
    setSelecionado(parceiro);
    setIndicacoes([]);
    setComissoes([]);
    setCreditos([]);
    setErro("");
    setSucesso("");

    try {
      const [
        listaIndicacoes,
        listaComissoes,
        listaCreditos,
      ] = await Promise.all([
        listarIndicacoes(parceiro.id),
        listarComissoes(parceiro.id),
        listarCreditos(parceiro.id),
      ]);

      setIndicacoes(listaIndicacoes || []);
      setComissoes(listaComissoes || []);
      setCreditos(listaCreditos || []);
    } catch (e) {
      setErro(
        erroApi(
          e,
          "Erro ao consultar os dados do parceiro."
        )
      );
    }
  }

  async function incluirIndicacao() {
    if (
      !selecionado ||
      !barbeariaIndicadaId
    ) {
      setErro(
        "Selecione o parceiro e informe a barbearia indicada."
      );
      return;
    }

    setErro("");
    setSucesso("");

    try {
      await registrarIndicacao(
        selecionado.id,
        Number(barbeariaIndicadaId)
      );

      setBarbeariaIndicadaId("");
      setSucesso("Indicação registrada.");

      await abrirParceiro(selecionado);
    } catch (e) {
      setErro(
        erroApi(
          e,
          "Não foi possível registrar a indicação."
        )
      );
    }
  }

  async function aprovar(id) {
    const confirmado = window.confirm(
      `Aprovar administrativamente o resgate ${id}?`
    );

    if (!confirmado) return;

    setErro("");
    setSucesso("");

    try {
      await aprovarResgate(id);
      setSucesso(`Resgate ${id} aprovado.`);
      await carregarBase();
    } catch (e) {
      setErro(
        erroApi(
          e,
          "Não foi possível aprovar o resgate."
        )
      );
    }
  }

  async function reprocessarPagamento() {
    if (!pagamentoId) {
      setErro(
        "Informe o ID do pagamento SaaS."
      );
      return;
    }

    const confirmado = window.confirm(
      "Esta é uma ação administrativa de contingência. " +
        `Reprocessar o benefício do pagamento ${pagamentoId}?`
    );

    if (!confirmado) return;

    setErro("");
    setSucesso("");

    try {
      const resultado =
        await processarBeneficioPagamento(
          Number(pagamentoId)
        );

      setSucesso(
        resultado?.gerado
          ? "Benefício processado."
          : resultado?.motivo ||
              "Pagamento processado sem novo benefício."
      );

      setPagamentoId("");
      await carregarBase();
    } catch (e) {
      setErro(
        erroApi(
          e,
          "Não foi possível processar o pagamento."
        )
      );
    }
  }

  return (
    <main
      style={{
        padding: 30,
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <h1>Parceiros da Plataforma</h1>

      <p style={{ color: "#64748b" }}>
        Administração global de vendedores,
        colaboradores, barbearias parceiras,
        indicações, comissões, créditos e resgates.
      </p>

      {erro ? (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: 12,
            borderRadius: 8,
            margin: "18px 0",
          }}
        >
          {erro}
        </div>
      ) : null}

      {sucesso ? (
        <div
          style={{
            background: "#dcfce7",
            color: "#166534",
            padding: 12,
            borderRadius: 8,
            margin: "18px 0",
          }}
        >
          {sucesso}
        </div>
      ) : null}

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",
          gap: 14,
          margin: "24px 0",
        }}
      >
        {[
          ["Parceiros ativos", resumo.ativos],
          [
            "Vendedores / colaboradores",
            resumo.vendedores,
          ],
          [
            "Barbearias parceiras",
            resumo.barbearias,
          ],
          [
            "Resgates pendentes",
            resumo.resgatesPendentes,
          ],
        ].map(([titulo, valor]) => (
          <div key={titulo} style={estiloCard}>
            <div
              style={{
                color: "#64748b",
                fontSize: 14,
              }}
            >
              {titulo}
            </div>

            <div
              style={{
                fontSize: 30,
                fontWeight: 800,
                marginTop: 6,
              }}
            >
              {carregando ? "..." : valor}
            </div>
          </div>
        ))}
      </section>

      <section style={estiloCard}>
        <h2 style={{ marginTop: 0 }}>
          Cadastrar parceiro
        </h2>

        <form
          onSubmit={cadastrarParceiro}
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: 14,
          }}
        >
          <label>
            Tipo
            <select
              value={form.tipo}
              onChange={(e) =>
                alterarTipo(e.target.value)
              }
              style={estiloInput}
            >
              <option value="VENDEDOR">
                Vendedor
              </option>
              <option value="COLABORADOR">
                Colaborador
              </option>
              <option value="BARBEARIA">
                Barbearia
              </option>
            </select>
          </label>

          <label>
            Nome
            <input
              required
              value={form.nome}
              onChange={(e) =>
                alterarCampo(
                  "nome",
                  e.target.value
                )
              }
              style={estiloInput}
            />
          </label>

          <label>
            E-mail
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) =>
                alterarCampo(
                  "email",
                  e.target.value
                )
              }
              style={estiloInput}
            />
          </label>

          <label>
            Telefone
            <input
              value={form.telefone}
              onChange={(e) =>
                alterarCampo(
                  "telefone",
                  e.target.value
                )
              }
              style={estiloInput}
            />
          </label>

          {form.tipo === "BARBEARIA" ? (
            <label>
              ID da barbearia parceira
              <input
                required
                type="number"
                min="1"
                value={form.barbearia_id}
                onChange={(e) =>
                  alterarCampo(
                    "barbearia_id",
                    e.target.value
                  )
                }
                style={estiloInput}
              />
            </label>
          ) : null}

          <label>
            Código de indicação
            <input
              required
              value={form.codigo_ref}
              onChange={(e) =>
                alterarCampo(
                  "codigo_ref",
                  e.target.value
                )
              }
              style={estiloInput}
              placeholder="EX.: PARCEIRO10"
            />
          </label>

          <label>
            Benefício
            <input
              readOnly
              value={
                form.tipo === "BARBEARIA"
                  ? "CRÉDITO"
                  : "COMISSÃO"
              }
              style={{
                ...estiloInput,
                background: "#f1f5f9",
              }}
            />
          </label>

          <label>
            Regra
            <select
              value={form.regra_beneficio}
              onChange={(e) =>
                alterarCampo(
                  "regra_beneficio",
                  e.target.value
                )
              }
              style={estiloInput}
            >
              <option value="PERCENTUAL">
                Percentual
              </option>
              <option value="VALOR_FIXO">
                Valor fixo
              </option>
            </select>
          </label>

          {form.regra_beneficio ===
          "PERCENTUAL" ? (
            <label>
              Percentual (%)
              <input
                required
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={
                  form.percentual_beneficio
                }
                onChange={(e) =>
                  alterarCampo(
                    "percentual_beneficio",
                    e.target.value
                  )
                }
                style={estiloInput}
              />
            </label>
          ) : (
            <label>
              Valor fixo (R$)
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={
                  form.valor_fixo_beneficio
                }
                onChange={(e) =>
                  alterarCampo(
                    "valor_fixo_beneficio",
                    e.target.value
                  )
                }
                style={estiloInput}
              />
            </label>
          )}

          <label
            style={{
              gridColumn: "1 / -1",
            }}
          >
            Observação
            <textarea
              value={form.observacao}
              onChange={(e) =>
                alterarCampo(
                  "observacao",
                  e.target.value
                )
              }
              style={{
                ...estiloInput,
                minHeight: 80,
              }}
            />
          </label>

          <div
            style={{
              gridColumn: "1 / -1",
            }}
          >
            <button
              type="submit"
              disabled={salvando}
              style={{
                ...estiloBotao,
                background: "#0f172a",
                color: "#fff",
              }}
            >
              {salvando
                ? "Salvando..."
                : "Cadastrar parceiro"}
            </button>
          </div>
        </form>
      </section>

      <section
        style={{
          ...estiloCard,
          marginTop: 20,
          overflowX: "auto",
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          Parceiros cadastrados
        </h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              {[
                "ID",
                "Nome",
                "Tipo",
                "Código",
                "Benefício",
                "Regra",
                "Situação",
                "Ação",
              ].map((item) => (
                <th
                  key={item}
                  style={{
                    textAlign: "left",
                    padding: 10,
                    borderBottom:
                      "1px solid #e2e8f0",
                  }}
                >
                  {item}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {parceiros.map((p) => (
              <tr key={p.id}>
                <td style={{ padding: 10 }}>
                  {p.id}
                </td>
                <td style={{ padding: 10 }}>
                  {p.nome}
                </td>
                <td style={{ padding: 10 }}>
                  {p.tipo}
                </td>
                <td style={{ padding: 10 }}>
                  {p.codigo_ref}
                </td>
                <td style={{ padding: 10 }}>
                  {p.tipo_beneficio}
                </td>
                <td style={{ padding: 10 }}>
                  {p.regra_beneficio ===
                  "PERCENTUAL"
                    ? `${p.percentual_beneficio}%`
                    : moeda(
                        p.valor_fixo_beneficio
                      )}
                </td>
                <td style={{ padding: 10 }}>
                  {p.ativo
                    ? "ATIVO"
                    : "INATIVO"}
                </td>
                <td style={{ padding: 10 }}>
                  <button
                    type="button"
                    onClick={() =>
                      abrirParceiro(p)
                    }
                    style={{
                      ...estiloBotao,
                      background: "#e2e8f0",
                      color: "#0f172a",
                    }}
                  >
                    Administrar
                  </button>
                </td>
              </tr>
            ))}

            {!carregando &&
            parceiros.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{ padding: 16 }}
                >
                  Nenhum parceiro cadastrado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      {selecionado ? (
        <section
          style={{
            ...estiloCard,
            marginTop: 20,
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            Administração — {selecionado.nome}
          </h2>

          <p>
            <strong>Código:</strong>{" "}
            {selecionado.codigo_ref}
            {" · "}
            <strong>Tipo:</strong>{" "}
            {selecionado.tipo}
            {" · "}
            <strong>Benefício:</strong>{" "}
            {selecionado.tipo_beneficio}
          </p>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "end",
              margin: "20px 0",
            }}
          >
            <label>
              ID da barbearia indicada
              <input
                type="number"
                min="1"
                value={barbeariaIndicadaId}
                onChange={(e) =>
                  setBarbeariaIndicadaId(
                    e.target.value
                  )
                }
                style={estiloInput}
              />
            </label>

            <button
              type="button"
              onClick={incluirIndicacao}
              style={{
                ...estiloBotao,
                background: "#0f172a",
                color: "#fff",
              }}
            >
              Registrar indicação
            </button>
          </div>

          <h3>Indicações</h3>

          {indicacoes.length === 0 ? (
            <p style={{ color: "#64748b" }}>
              Nenhuma indicação.
            </p>
          ) : (
            indicacoes.map((i) => (
              <div
                key={i.id}
                style={{
                  padding: "9px 0",
                  borderBottom:
                    "1px solid #e2e8f0",
                }}
              >
                #{i.id} · Barbearia{" "}
                {i.barbearia_indicada_id} ·{" "}
                {i.status} ·{" "}
                {dataHora(i.data_cadastro)}
              </div>
            ))
          )}

          <h3>Comissões</h3>

          {comissoes.length === 0 ? (
            <p style={{ color: "#64748b" }}>
              Nenhuma comissão.
            </p>
          ) : (
            comissoes.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: "9px 0",
                  borderBottom:
                    "1px solid #e2e8f0",
                }}
              >
                #{c.id} · Base{" "}
                {moeda(c.valor_base)} · Comissão{" "}
                {moeda(c.valor_comissao)} ·{" "}
                {c.status}
              </div>
            ))
          )}

          <h3>Créditos</h3>

          {creditos.length === 0 ? (
            <p style={{ color: "#64748b" }}>
              Nenhum crédito.
            </p>
          ) : (
            creditos.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: "9px 0",
                  borderBottom:
                    "1px solid #e2e8f0",
                }}
              >
                #{c.id} · Base{" "}
                {moeda(c.valor_base)} · Crédito{" "}
                {moeda(c.valor_credito)} ·{" "}
                {c.status}
              </div>
            ))
          )}
        </section>
      ) : null}

      <section
        style={{
          ...estiloCard,
          marginTop: 20,
          overflowX: "auto",
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          Resgates de créditos
        </h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              {[
                "ID",
                "Parceiro",
                "Solicitado",
                "Aplicado",
                "Status",
                "Ação",
              ].map((item) => (
                <th
                  key={item}
                  style={{
                    textAlign: "left",
                    padding: 10,
                    borderBottom:
                      "1px solid #e2e8f0",
                  }}
                >
                  {item}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {resgates.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: 10 }}>
                  {r.id}
                </td>
                <td style={{ padding: 10 }}>
                  {r.parceiro_id}
                </td>
                <td style={{ padding: 10 }}>
                  {moeda(r.valor_solicitado)}
                </td>
                <td style={{ padding: 10 }}>
                  {moeda(r.valor_aplicado)}
                </td>
                <td style={{ padding: 10 }}>
                  {r.status}
                </td>
                <td style={{ padding: 10 }}>
                  {r.status ===
                    "SOLICITADO" ? (
                    <button
                      type="button"
                      onClick={() =>
                        aprovar(r.id)
                      }
                      style={{
                        ...estiloBotao,
                        background: "#0f172a",
                        color: "#fff",
                      }}
                    >
                      Aprovar
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section
        style={{
          ...estiloCard,
          marginTop: 20,
          border: "1px solid #f59e0b",
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          Contingência administrativa
        </h2>

        <p style={{ color: "#64748b" }}>
          O benefício é normalmente gerado
          automaticamente após a confirmação do
          pagamento. Utilize o reprocessamento
          somente para conferência ou contingência.
        </p>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "end",
          }}
        >
          <label>
            ID do pagamento SaaS
            <input
              type="number"
              min="1"
              value={pagamentoId}
              onChange={(e) =>
                setPagamentoId(e.target.value)
              }
              style={estiloInput}
            />
          </label>

          <button
            type="button"
            onClick={reprocessarPagamento}
            style={{
              ...estiloBotao,
              background: "#f59e0b",
              color: "#111827",
            }}
          >
            Reprocessar benefício
          </button>
        </div>
      </section>
    </main>
  );
}