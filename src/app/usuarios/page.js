"use client";

import { useEffect, useMemo, useState } from "react";
import {
  alterarSenhaUsuario,
  atualizarUsuario,
  criarUsuario,
  inativarUsuario,
  listarUsuarios,
  reativarUsuario,
} from "@/services/usuarioService";
import { listarBarbeiros } from "@/services/barbeiroService";
import { Botao, Painel, Status } from "@/components/DataView";

const PERFIS = [
  { valor: "admin", rotulo: "Administrador" },
  { valor: "gerente", rotulo: "Gerente" },
  { valor: "recepcao", rotulo: "Recepção" },
  { valor: "barbeiro", rotulo: "Barbeiro" },
];

const FORMULARIO_INICIAL = {
  nome: "",
  email: "",
  perfil: "gerente",
  barbeiro_id: "",
  senha: "",
  confirmarSenha: "",
};

function nomePerfil(perfil) {
  return (
    PERFIS.find(
      (item) => item.valor === String(perfil || "").toLowerCase()
    )?.rotulo ||
    perfil ||
    "-"
  );
}

function extrairMensagemErro(erro, mensagemPadrao) {
  const detalhe = erro?.response?.data?.detail;

  if (typeof detalhe === "string") {
    return detalhe;
  }

  if (Array.isArray(detalhe)) {
    const mensagens = detalhe
      .map((item) => item?.msg)
      .filter(Boolean)
      .join(" ");

    if (mensagens) {
      return mensagens;
    }
  }

  return erro?.message || mensagemPadrao;
}

function validarSenha(senha) {
  if (!senha) {
    return "A senha é obrigatória.";
  }

  if (senha.length < 8) {
    return "A senha deve possuir pelo menos 8 caracteres.";
  }

  if (!/[A-Za-zÀ-ÿ]/.test(senha)) {
    return "A senha deve possuir pelo menos uma letra.";
  }

  if (!/\d/.test(senha)) {
    return "A senha deve possuir pelo menos um número.";
  }

  return "";
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [processandoId, setProcessandoId] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const [erroPagina, setErroPagina] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [erroModal, setErroModal] = useState("");

  const [modal, setModal] = useState(null);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [senha, setSenha] = useState({ nova: "", confirmar: "" });
  const [mostrarSenha, setMostrarSenha] = useState(false);

  async function carregar() {
    setErroPagina("");
    setCarregando(true);

    try {
      const [dadosUsuarios, dadosBarbeiros] = await Promise.all([
        listarUsuarios(),
        listarBarbeiros(),
      ]);

      setUsuarios(
        Array.isArray(dadosUsuarios)
          ? dadosUsuarios
          : dadosUsuarios?.items || dadosUsuarios?.usuarios || []
      );

      setBarbeiros(
        Array.isArray(dadosBarbeiros)
          ? dadosBarbeiros
          : dadosBarbeiros?.items || dadosBarbeiros?.barbeiros || []
      );
    } catch (erro) {
      console.error(erro);
      setErroPagina(
        extrairMensagemErro(
          erro,
          "Não foi possível carregar os usuários e barbeiros."
        )
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const barbeirosDisponiveis = useMemo(() => {
    const usuarioIdAtual = Number(usuarioSelecionado?.id || 0);
    const barbeiroIdAtual = Number(usuarioSelecionado?.barbeiro_id || 0);

    const idsOcupados = new Set(
      usuarios
        .filter(
          (usuario) =>
            usuario.ativo !== false &&
            usuario.barbeiro_id &&
            Number(usuario.id) !== usuarioIdAtual
        )
        .map((usuario) => Number(usuario.barbeiro_id))
    );

    return barbeiros.filter((barbeiro) => {
      const barbeiroId = Number(barbeiro.id);
      const eAtual = barbeiroId === barbeiroIdAtual;
      const estaAtivo = barbeiro.ativo !== false;
      const estaLivre = !idsOcupados.has(barbeiroId);

      return (estaAtivo && estaLivre) || eAtual;
    });
  }, [barbeiros, usuarios, usuarioSelecionado]);

  function abrirCadastro() {
    setErroModal("");
    setSucesso("");
    setUsuarioSelecionado(null);
    setFormulario(FORMULARIO_INICIAL);
    setMostrarSenha(false);
    setModal("cadastro");
  }

  function abrirEdicao(usuario) {
    setErroModal("");
    setSucesso("");
    setUsuarioSelecionado(usuario);
    setFormulario({
      nome: usuario.nome || "",
      email: usuario.email || "",
      perfil: String(usuario.perfil || "gerente").toLowerCase(),
      barbeiro_id: usuario.barbeiro_id
        ? String(usuario.barbeiro_id)
        : "",
      senha: "",
      confirmarSenha: "",
    });
    setMostrarSenha(false);
    setModal("edicao");
  }

  function abrirAlteracaoSenha(usuario) {
    setErroModal("");
    setSucesso("");
    setUsuarioSelecionado(usuario);
    setSenha({ nova: "", confirmar: "" });
    setMostrarSenha(false);
    setModal("senha");
  }

  function fecharModal() {
    if (salvando) {
      return;
    }

    setModal(null);
    setUsuarioSelecionado(null);
    setErroModal("");
    setMostrarSenha(false);
  }

  function alterarFormulario(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
      ...(name === "perfil" && value !== "barbeiro"
        ? { barbeiro_id: "" }
        : {}),
    }));
  }

  function validarFormularioUsuario() {
    if (!formulario.nome.trim()) {
      return "Informe o nome do usuário.";
    }

    if (!formulario.email.trim()) {
      return "Informe o e-mail do usuário.";
    }

    if (!PERFIS.some((item) => item.valor === formulario.perfil)) {
      return "Selecione um perfil válido.";
    }

    if (formulario.perfil === "barbeiro" && !formulario.barbeiro_id) {
      return "Selecione o barbeiro que ficará vinculado a este usuário.";
    }

    if (modal === "cadastro") {
      const erroSenha = validarSenha(formulario.senha);

      if (erroSenha) {
        return erroSenha;
      }

      if (formulario.senha !== formulario.confirmarSenha) {
        return "A confirmação da senha não confere.";
      }
    }

    return "";
  }

  async function salvarUsuario(evento) {
    evento.preventDefault();

    const validacao = validarFormularioUsuario();

    if (validacao) {
      setErroModal(validacao);
      return;
    }

    setErroModal("");
    setSalvando(true);

    const dadosBase = {
      nome: formulario.nome.trim(),
      email: formulario.email.trim().toLowerCase(),
      perfil: formulario.perfil,
      barbeiro_id:
        formulario.perfil === "barbeiro"
          ? Number(formulario.barbeiro_id)
          : null,
    };

    try {
      if (modal === "cadastro") {
        await criarUsuario({
          ...dadosBase,
          senha: formulario.senha,
        });
      } else {
        await atualizarUsuario(usuarioSelecionado.id, {
          ...dadosBase,
          ativo: usuarioSelecionado.ativo !== false,
        });
      }

      await carregar();
      setModal(null);
      setUsuarioSelecionado(null);
      setSucesso(
        modal === "cadastro"
          ? "Usuário cadastrado com sucesso."
          : "Usuário atualizado com sucesso."
      );
    } catch (erro) {
      console.error(erro);
      setErroModal(
        extrairMensagemErro(erro, "Não foi possível salvar o usuário.")
      );
    } finally {
      setSalvando(false);
    }
  }

  async function salvarSenha(evento) {
    evento.preventDefault();

    const erroSenha = validarSenha(senha.nova);

    if (erroSenha) {
      setErroModal(erroSenha);
      return;
    }

    if (senha.nova !== senha.confirmar) {
      setErroModal("A confirmação da nova senha não confere.");
      return;
    }

    setErroModal("");
    setSalvando(true);

    try {
      await alterarSenhaUsuario(usuarioSelecionado.id, {
        nova_senha: senha.nova,
      });

      setModal(null);
      setUsuarioSelecionado(null);
      setSucesso("Senha alterada com sucesso.");
    } catch (erro) {
      console.error(erro);
      setErroModal(
        extrairMensagemErro(
          erro,
          "Não foi possível alterar a senha do usuário."
        )
      );
    } finally {
      setSalvando(false);
    }
  }

  async function alternarSituacao(usuario) {
    const reativando = usuario.ativo === false;
    const acao = reativando ? "reativar" : "inativar";

    if (
      !window.confirm(
        `Deseja realmente ${acao} o usuário "${
          usuario.nome || usuario.email
        }"?`
      )
    ) {
      return;
    }

    setErroPagina("");
    setSucesso("");
    setProcessandoId(usuario.id);

    try {
      if (reativando) {
        await reativarUsuario(usuario.id);
      } else {
        await inativarUsuario(usuario.id);
      }

      await carregar();
      setSucesso(
        reativando
          ? "Usuário reativado com sucesso."
          : "Usuário inativado com sucesso."
      );
    } catch (erro) {
      console.error(erro);
      setErroPagina(
        extrairMensagemErro(
          erro,
          "Não foi possível alterar a situação do usuário."
        )
      );
    } finally {
      setProcessandoId(null);
    }
  }

  function nomeBarbeiro(barbeiroId) {
    return (
      barbeiros.find(
        (barbeiro) => Number(barbeiro.id) === Number(barbeiroId)
      )?.nome || "-"
    );
  }

  const ativos = usuarios.filter(
    (usuario) => usuario.ativo !== false
  ).length;
  const inativos = usuarios.length - ativos;

  return (
    <main style={estilos.pagina}>
      <div style={estilos.cabecalho}>
        <div>
          <h1 style={{ marginBottom: 6 }}>Usuários</h1>
          <p style={estilos.subtitulo}>
            Gerencie as contas administrativas e operacionais da barbearia.
          </p>
        </div>

        <div style={estilos.acoes}>
          <Botao tipo="neutro" onClick={carregar} disabled={carregando}>
            Atualizar
          </Botao>
          <Botao onClick={abrirCadastro}>Novo usuário</Botao>
        </div>
      </div>

      {erroPagina ? <Aviso tipo="erro">{erroPagina}</Aviso> : null}
      {sucesso ? <Aviso tipo="sucesso">{sucesso}</Aviso> : null}

      <div style={estilos.resumos}>
        <Resumo titulo="Usuários cadastrados" valor={usuarios.length} />
        <Resumo titulo="Usuários ativos" valor={ativos} destaque />
        <Resumo titulo="Usuários inativos" valor={inativos} />
      </div>

      <Painel titulo="Usuários cadastrados">
        {carregando ? (
          <p style={estilos.textoSecundario}>Carregando usuários...</p>
        ) : usuarios.length === 0 ? (
          <p style={estilos.textoSecundario}>Nenhum usuário cadastrado.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={estilos.tabela}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {[
                    "Nome",
                    "E-mail",
                    "Perfil",
                    "Barbeiro vinculado",
                    "Situação",
                    "Ações",
                  ].map((titulo) => (
                    <th key={titulo} style={estilos.th}>
                      {titulo}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} style={estilos.tr}>
                    <td style={estilos.td}>
                      <strong>{usuario.nome || "-"}</strong>
                    </td>
                    <td style={estilos.td}>{usuario.email || "-"}</td>
                    <td style={estilos.td}>{nomePerfil(usuario.perfil)}</td>
                    <td style={estilos.td}>
                      {usuario.barbeiro_id
                        ? nomeBarbeiro(usuario.barbeiro_id)
                        : "-"}
                    </td>
                    <td style={estilos.td}>
                      <Status valor={usuario.ativo !== false} />
                    </td>
                    <td style={estilos.td}>
                      <div style={estilos.acoesLinha}>
                        <Botao
                          tipo="neutro"
                          onClick={() => abrirEdicao(usuario)}
                        >
                          Editar
                        </Botao>
                        <Botao
                          tipo="neutro"
                          onClick={() => abrirAlteracaoSenha(usuario)}
                        >
                          Alterar senha
                        </Botao>
                        <Botao
                          tipo={
                            usuario.ativo === false ? "sucesso" : "perigo"
                          }
                          disabled={processandoId === usuario.id}
                          onClick={() => alternarSituacao(usuario)}
                        >
                          {processandoId === usuario.id
                            ? "Processando..."
                            : usuario.ativo === false
                            ? "Reativar"
                            : "Inativar"}
                        </Botao>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Painel>

      {(modal === "cadastro" || modal === "edicao") && (
        <Modal
          titulo={
            modal === "cadastro" ? "Cadastrar usuário" : "Editar usuário"
          }
          onClose={fecharModal}
        >
          {erroModal ? <Aviso tipo="erro">{erroModal}</Aviso> : null}

          <form onSubmit={salvarUsuario}>
            <Campo label="Nome" obrigatorio>
              <input
                style={estilos.input}
                name="nome"
                value={formulario.nome}
                onChange={alterarFormulario}
                autoFocus
              />
            </Campo>

            <Campo label="E-mail" obrigatorio>
              <input
                style={estilos.input}
                type="email"
                name="email"
                value={formulario.email}
                onChange={alterarFormulario}
              />
            </Campo>

            <Campo label="Perfil" obrigatorio>
              <select
                style={estilos.input}
                name="perfil"
                value={formulario.perfil}
                onChange={alterarFormulario}
              >
                {PERFIS.map((perfil) => (
                  <option key={perfil.valor} value={perfil.valor}>
                    {perfil.rotulo}
                  </option>
                ))}
              </select>
            </Campo>

            {formulario.perfil === "barbeiro" ? (
              <Campo label="Barbeiro vinculado" obrigatorio>
                <select
                  style={estilos.input}
                  name="barbeiro_id"
                  value={formulario.barbeiro_id}
                  onChange={alterarFormulario}
                >
                  <option value="">Selecione...</option>
                  {barbeirosDisponiveis.map((barbeiro) => (
                    <option key={barbeiro.id} value={barbeiro.id}>
                      {barbeiro.nome}
                      {barbeiro.ativo === false ? " — inativo" : ""}
                    </option>
                  ))}
                </select>

                {barbeirosDisponiveis.filter(
                  (barbeiro) => barbeiro.ativo !== false
                ).length === 0 ? (
                  <small style={estilos.alertaCampo}>
                    Não há barbeiro ativo e sem usuário disponível para vínculo.
                  </small>
                ) : null}
              </Campo>
            ) : null}

            {modal === "cadastro" ? (
              <>
                <Campo label="Senha" obrigatorio>
                  <input
                    style={estilos.input}
                    type={mostrarSenha ? "text" : "password"}
                    name="senha"
                    value={formulario.senha}
                    onChange={alterarFormulario}
                    autoComplete="new-password"
                  />
                </Campo>

                <Campo label="Confirmar senha" obrigatorio>
                  <input
                    style={estilos.input}
                    type={mostrarSenha ? "text" : "password"}
                    name="confirmarSenha"
                    value={formulario.confirmarSenha}
                    onChange={alterarFormulario}
                    autoComplete="new-password"
                  />
                </Campo>

                <AlternarVisibilidadeSenha
                  marcada={mostrarSenha}
                  onChange={setMostrarSenha}
                />

                <p style={estilos.ajuda}>
                  Use no mínimo 8 caracteres, com pelo menos uma letra e um
                  número.
                </p>
              </>
            ) : null}

            <RodapeModal
              salvando={salvando}
              onCancelar={fecharModal}
              textoSalvar="Salvar"
            />
          </form>
        </Modal>
      )}

      {modal === "senha" ? (
        <Modal titulo="Alterar senha do usuário" onClose={fecharModal}>
          {erroModal ? <Aviso tipo="erro">{erroModal}</Aviso> : null}

          <p style={{ color: "#475569", marginTop: 0 }}>
            Defina uma nova senha para{ " "}
            <strong>
              {usuarioSelecionado?.nome || usuarioSelecionado?.email}
            </strong>
            .
          </p>

          <form onSubmit={salvarSenha}>
            <Campo label="Nova senha" obrigatorio>
              <input
                style={estilos.input}
                type={mostrarSenha ? "text" : "password"}
                value={senha.nova}
                onChange={(evento) =>
                  setSenha((anterior) => ({
                    ...anterior,
                    nova: evento.target.value,
                  }))
                }
                autoComplete="new-password"
                autoFocus
              />
            </Campo>

            <Campo label="Confirmar nova senha" obrigatorio>
              <input
                style={estilos.input}
                type={mostrarSenha ? "text" : "password"}
                value={senha.confirmar}
                onChange={(evento) =>
                  setSenha((anterior) => ({
                    ...anterior,
                    confirmar: evento.target.value,
                  }))
                }
                autoComplete="new-password"
              />
            </Campo>

            <AlternarVisibilidadeSenha
              marcada={mostrarSenha}
              onChange={setMostrarSenha}
            />

            <p style={estilos.ajuda}>
              Use no mínimo 8 caracteres, com pelo menos uma letra e um número.
            </p>

            <RodapeModal
              salvando={salvando}
              onCancelar={fecharModal}
              textoSalvar="Alterar senha"
            />
          </form>
        </Modal>
      ) : null}
    </main>
  );
}

function Campo({ label, obrigatorio = false, children }) {
  return (
    <label style={estilos.campo}>
      <span style={estilos.label}>
        {label}
        {obrigatorio ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

function AlternarVisibilidadeSenha({ marcada, onChange }) {
  return (
    <label style={estilos.checkbox}>
      <input
        type="checkbox"
        checked={marcada}
        onChange={(evento) => onChange(evento.target.checked)}
      />
      Mostrar senha
    </label>
  );
}

function RodapeModal({ salvando, onCancelar, textoSalvar }) {
  return (
    <div style={estilos.rodapeModal}>
      <Botao
        tipo="neutro"
        type="button"
        disabled={salvando}
        onClick={(evento) => {
          evento.preventDefault();
          onCancelar();
        }}
      >
        Cancelar
      </Botao>

      <Botao type="submit" disabled={salvando}>
        {salvando ? "Salvando..." : textoSalvar}
      </Botao>
    </div>
  );
}

function Modal({ titulo, onClose, children }) {
  return (
    <div
      style={estilos.fundoModal}
      role="presentation"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        style={estilos.modal}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
      >
        <div style={estilos.tituloModal}>
          <h2 style={{ margin: 0 }}>{titulo}</h2>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            style={estilos.fechar}
          >
            ×
          </button>
        </div>

        {children}
      </section>
    </div>
  );
}

function Aviso({ tipo, children }) {
  const eSucesso = tipo === "sucesso";

  return (
    <div
      style={{
        ...estilos.aviso,
        color: eSucesso ? "#166534" : "#991b1b",
        background: eSucesso ? "#f0fdf4" : "#fef2f2",
        borderColor: eSucesso ? "#bbf7d0" : "#fecaca",
      }}
    >
      {children}
    </div>
  );
}

function Resumo({ titulo, valor, destaque = false }) {
  return (
    <div
      style={{
        ...estilos.resumo,
        border: destaque
          ? "2px solid #2563eb"
          : "1px solid #e2e8f0",
      }}
    >
      <div style={estilos.tituloResumo}>{titulo}</div>
      <div
        style={{
          ...estilos.valorResumo,
          color: destaque ? "#1d4ed8" : "#0f172a",
        }}
      >
        {valor}
      </div>
    </div>
  );
}

const estilos = {
  pagina: {
    padding: 30,
    background: "#f8fafc",
    minHeight: "100vh",
  },
  cabecalho: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 24,
  },
  subtitulo: {
    color: "#64748b",
    margin: 0,
  },
  acoes: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  resumos: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  resumo: {
    background: "#ffffff",
    borderRadius: 14,
    padding: 24,
  },
  tituloResumo: {
    color: "#64748b",
    marginBottom: 10,
    fontSize: 15,
  },
  valorResumo: {
    fontSize: 28,
    fontWeight: 800,
  },
  tabela: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 1050,
  },
  th: {
    textAlign: "left",
    padding: "14px 12px",
    color: "#334155",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid #e2e8f0",
  },
  td: {
    padding: 12,
    verticalAlign: "middle",
  },
  acoesLinha: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  textoSecundario: {
    color: "#64748b",
  },
  aviso: {
    border: "1px solid",
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
  },
  fundoModal: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "rgba(15, 23, 42, 0.58)",
    display: "grid",
    placeItems: "center",
    padding: 20,
    overflowY: "auto",
  },
  modal: {
    width: "min(100%, 560px)",
    maxHeight: "calc(100vh - 40px)",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 24px 70px rgba(15, 23, 42, 0.25)",
  },
  tituloModal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 20,
  },
  fechar: {
    border: 0,
    background: "transparent",
    color: "#64748b",
    fontSize: 30,
    lineHeight: 1,
    cursor: "pointer",
    padding: 2,
  },
  campo: {
    display: "grid",
    gap: 7,
    marginBottom: 16,
  },
  label: {
    color: "#334155",
    fontWeight: 700,
    fontSize: 14,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: 9,
    padding: "11px 12px",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: 15,
  },
  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#475569",
    fontSize: 14,
    cursor: "pointer",
  },
  ajuda: {
    color: "#64748b",
    fontSize: 13,
    margin: "8px 0 0",
  },
  alertaCampo: {
    color: "#b45309",
  },
  rodapeModal: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 24,
  },
};
