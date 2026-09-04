"use client";

import { useEffect, useState } from "react";
import {
  listarUsuarios,
  reativarUsuario,
  inativarUsuario,
} from "@/services/usuarioService";
import { Botao, Painel, Status } from "@/components/DataView";

function nomePerfil(perfil) {
  const nomes = {
    admin: "Administrador",
    gerente: "Gerente",
    recepcao: "Recepção",
    barbeiro: "Barbeiro",
  };

  return nomes[String(perfil || "").toLowerCase()] || perfil || "-";
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [alterandoId, setAlterandoId] = useState(null);

  async function carregar() {
    setErro("");
    setCarregando(true);

    try {
      const dados = await listarUsuarios();

      setUsuarios(
        Array.isArray(dados)
          ? dados
          : dados?.items || dados?.usuarios || []
      );
    } catch (e) {
      console.error(e);
      setErro(
        e?.response?.data?.detail ||
          "Não foi possível carregar os usuários."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function alternar(usuario) {
    const acao = usuario.ativo === false ? "reativar" : "inativar";

    if (
      !window.confirm(
        `Deseja realmente ${acao} o usuário "${usuario.nome || usuario.email}"?`
      )
    ) {
      return;
    }

    setErro("");
    setAlterandoId(usuario.id);

    try {
      if (usuario.ativo === false) {
        await reativarUsuario(usuario.id);
      } else {
        await inativarUsuario(usuario.id);
      }

      await carregar();
    } catch (e) {
      console.error(e);
      setErro(
        e?.response?.data?.detail ||
          "Não foi possível alterar o usuário."
      );
    } finally {
      setAlterandoId(null);
    }
  }

  const ativos = usuarios.filter((u) => u.ativo !== false).length;
  const inativos = usuarios.length - ativos;

  return (
    <main
      style={{
        padding: 30,
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ marginBottom: 6 }}>Usuários</h1>
          <p style={{ color: "#64748b", margin: 0 }}>
            Gerencie as contas administrativas e operacionais da barbearia.
          </p>
        </div>

        <Botao tipo="neutro" onClick={carregar}>
          Atualizar
        </Botao>
      </div>

      {erro ? (
        <div
          style={{
            color: "#991b1b",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 10,
            padding: 14,
            marginBottom: 18,
          }}
        >
          {erro}
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Resumo titulo="Usuários cadastrados" valor={usuarios.length} />
        <Resumo titulo="Usuários ativos" valor={ativos} destaque />
        <Resumo titulo="Usuários inativos" valor={inativos} />
      </div>

      <Painel titulo="Usuários cadastrados">
        {carregando ? (
          <p style={{ color: "#64748b" }}>Carregando usuários...</p>
        ) : usuarios.length === 0 ? (
          <p style={{ color: "#64748b" }}>
            Nenhum usuário cadastrado.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 760,
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {[
                    "Nome",
                    "E-mail",
                    "Perfil",
                    "Situação",
                    "Ação",
                  ].map((titulo) => (
                    <th
                      key={titulo}
                      style={{
                        textAlign: "left",
                        padding: "14px 12px",
                        color: "#334155",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      {titulo}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {usuarios.map((usuario) => (
                  <tr
                    key={usuario.id}
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <td style={{ padding: 12 }}>
                      <strong>{usuario.nome || "-"}</strong>
                    </td>

                    <td style={{ padding: 12 }}>
                      {usuario.email || "-"}
                    </td>

                    <td style={{ padding: 12 }}>
                      {nomePerfil(usuario.perfil)}
                    </td>

                    <td style={{ padding: 12 }}>
                      <Status valor={usuario.ativo !== false} />
                    </td>

                    <td style={{ padding: 12 }}>
                      <Botao
                        tipo={
                          usuario.ativo === false
                            ? "sucesso"
                            : "perigo"
                        }
                        disabled={alterandoId === usuario.id}
                        onClick={() => alternar(usuario)}
                      >
                        {alterandoId === usuario.id
                          ? "Processando..."
                          : usuario.ativo === false
                          ? "Reativar"
                          : "Inativar"}
                      </Botao>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Painel>
    </main>
  );
}

function Resumo({ titulo, valor, destaque = false }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: destaque
          ? "2px solid #2563eb"
          : "1px solid #e2e8f0",
        borderRadius: 14,
        padding: 24,
      }}
    >
      <div
        style={{
          color: "#64748b",
          marginBottom: 10,
          fontSize: 15,
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: destaque ? "#1d4ed8" : "#0f172a",
        }}
      >
        {valor}
      </div>
    </div>
  );
}
