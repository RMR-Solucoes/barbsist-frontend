"use client";

import { useState } from "react";
import { alterarMinhaSenha } from "@/services/authService";
import { Botao, Painel } from "@/components/DataView";

export default function MinhaContaPage() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [processando, setProcessando] = useState(false);

  async function salvar() {
    setErro("");
    setMensagem("");

    if (!novaSenha || novaSenha !== confirmacao) {
      setErro("A confirmação da nova senha não confere.");
      return;
    }

    setProcessando(true);

    try {
      await alterarMinhaSenha({
        senha_atual: senhaAtual,
        nova_senha: novaSenha,
      });

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmacao("");
      setMensagem("Senha alterada com sucesso.");
    } catch (e) {
      console.error(e);
      setErro(
        e?.response?.data?.detail ||
          "Não foi possível alterar a senha."
      );
    } finally {
      setProcessando(false);
    }
  }

  const field = {
    width: "100%",
    minHeight: 42,
    border: "1px solid #cbd5e1",
    borderRadius: 9,
    padding: "9px 11px",
    boxSizing: "border-box",
  };

  return (
    <main style={{ padding: 30, background: "#f8fafc", minHeight: "100vh" }}>
      <h1>Minha Conta</h1>
      <p style={{ color: "#64748b" }}>
        Segurança e configurações pessoais do usuário autenticado.
      </p>

      {erro ? <div style={{ color: "#991b1b", margin: "18px 0" }}>{erro}</div> : null}
      {mensagem ? <div style={{ color: "#166534", margin: "18px 0" }}>{mensagem}</div> : null}

      <Painel titulo="Alterar minha senha">
        <div style={{ maxWidth: 520, display: "grid", gap: 14 }}>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Senha atual</div>
            <input
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              style={field}
            />
          </label>

          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Nova senha</div>
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              style={field}
            />
          </label>

          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Confirmar nova senha</div>
            <input
              type="password"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              style={field}
            />
          </label>

          <div>
            <Botao onClick={salvar} disabled={processando}>
              {processando ? "Salvando..." : "Alterar senha"}
            </Botao>
          </div>
        </div>
      </Painel>
    </main>
  );
}
