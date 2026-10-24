"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SONS_BARBSIST, tocarSomBarbSist } from "@/utils/catalogoSonsBarbSist";

const PREFIXO_ATIVO = "barbsist:notificacoes:som:";
const PREFIXO_TIPO = "barbsist:notificacoes:tipo:";
const PREFIXO_VOLUME = "barbsist:notificacoes:volume:";
const EVENTO = "barbsist:preferencias-som-alteradas";
const PADRAO = { ativo: false, tipo: "classica", volume: 100 };

function lerPreferencias(identidade) {
  if (!identidade || typeof window === "undefined") return PADRAO;
  try {
    const tipo = window.localStorage.getItem(PREFIXO_TIPO + identidade);
    const volumeArmazenado = window.localStorage.getItem(PREFIXO_VOLUME + identidade);
    const volume = volumeArmazenado === null ? 100 : Number(volumeArmazenado);
    return {
      ativo: window.localStorage.getItem(PREFIXO_ATIVO + identidade) === "1",
      tipo: SONS_BARBSIST.some((som) => som.id === tipo) ? tipo : "classica",
      volume: Number.isFinite(volume) ? Math.max(0, Math.min(100, volume)) : 100,
    };
  } catch {
    return PADRAO;
  }
}

const caixa = {
  background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
  padding: 22, maxWidth: 850, boxShadow: "0 1px 5px #0f172a0a",
};
const botao = {
  background: "#1e293b", border: 0, borderRadius: 8, color: "white",
  padding: "10px 15px", cursor: "pointer", fontWeight: 600,
};

export default function PreferenciasAlertasBarbSist() {
  const { usuario } = useAuth();
  const identidade = usuario
    ? `${usuario.id ?? ""}:${usuario.barbearia_id ?? ""}:${usuario.contexto_barbearia_id ?? ""}`
    : "";
  const [preferencias, setPreferencias] = useState(PADRAO);
  const [mensagem, setMensagem] = useState("");
  const [alteradas, setAlteradas] = useState(false);

  useEffect(() => {
    setPreferencias(lerPreferencias(identidade));
    setAlteradas(false);
    setMensagem("");
  }, [identidade]);

  function editar(campo, valor) {
    setPreferencias((anteriores) => ({ ...anteriores, [campo]: valor }));
    setAlteradas(true);
    setMensagem("");
  }

  async function experimentar(tipo = preferencias.tipo) {
    setMensagem("");
    const reproduziu = await tocarSomBarbSist(tipo, preferencias.volume);
    if (!reproduziu) {
      setMensagem("O navegador não conseguiu reproduzir o som. Verifique a permissão de áudio.");
    } else if (preferencias.volume === 0) {
      setMensagem("Volume em 0%: a prévia ficará silenciosa.");
    }
  }

  function salvar() {
    if (!identidade) {
      setMensagem("Aguarde o carregamento da sua conta para salvar.");
      return;
    }
    try {
      window.localStorage.setItem(PREFIXO_ATIVO + identidade, preferencias.ativo ? "1" : "0");
      window.localStorage.setItem(PREFIXO_TIPO + identidade, preferencias.tipo);
      window.localStorage.setItem(PREFIXO_VOLUME + identidade, String(preferencias.volume));
      window.dispatchEvent(new CustomEvent(EVENTO, { detail: { identidade } }));
      setAlteradas(false);
      setMensagem("Preferências salvas neste navegador para esta conta e barbearia.");
    } catch {
      setMensagem("Não foi possível salvar. Verifique se o armazenamento local está habilitado.");
    }
  }

  return (
    <section style={caixa} aria-label="Configurações de alertas sonoros">
      <h2 style={{ marginTop: 0 }}>🔔 Notificações e alertas sonoros</h2>
      <p style={{ color: "#475569", lineHeight: 1.5 }}>
        Escolha um toque inspirado em barbearias e ajuste o volume da campainha.
        As preferências serão usadas nos novos alertas deste navegador.
      </p>
      <label style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600, marginBottom: 22 }}>
        <input type="checkbox" checked={preferencias.ativo}
          onChange={(e) => editar("ativo", e.target.checked)} />
        Ativar alertas sonoros
      </label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
        {SONS_BARBSIST.map((som, indice) => (
          <div key={som.id} style={{
            border: preferencias.tipo === som.id ? "2px solid #2563eb" : "1px solid #cbd5e1",
            borderRadius: 10, padding: 12, background: preferencias.tipo === som.id ? "#eff6ff" : "#fff",
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            <label style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
              <input type="radio" name="tipo-alerta-barbsist" value={som.id}
                checked={preferencias.tipo === som.id}
                onChange={() => editar("tipo", som.id)} />
              <span><strong>{String(indice + 1).padStart(2, "0")}.</strong> {som.nome}</span>
            </label>
            <button type="button" onClick={() => experimentar(som.id)}
              style={{ ...botao, background: "#475569", fontSize: 13, padding: "8px 11px" }}>
              ▶ Ouvir toque
            </button>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, maxWidth: 640 }}>
        <label htmlFor="volume-barbsist" style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
          <span>Volume da campainha</span><strong>{preferencias.volume}%</strong>
        </label>
        <input id="volume-barbsist" type="range" min="0" max="100" step="5"
          value={preferencias.volume}
          onChange={(e) => editar("volume", Number(e.target.value))}
          style={{ width: "100%", marginTop: 12, accentColor: "#2563eb" }} />
        <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: 12 }}>
          <span>Silencioso</span><span>Máximo</span>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 }}>
        <button type="button" style={botao} onClick={salvar} disabled={!identidade}>
          💾 Salvar preferências
        </button>
        <button type="button" style={{ ...botao, background: "#0369a1" }}
          onClick={() => experimentar()}>
          ▶ Testar seleção
        </button>
        <button type="button" style={{ ...botao, background: "#e2e8f0", color: "#0f172a" }}
          onClick={() => { setPreferencias({ ativo: true, tipo: "classica", volume: 100 }); setAlteradas(true); setMensagem("Padrão selecionado. Clique em Salvar preferências para confirmar."); }}>
          Restaurar padrão
        </button>
      </div>
      {alteradas && <p style={{ color: "#92400e", marginBottom: 0 }}>Há alterações ainda não salvas.</p>}
      {mensagem && <p role="status" style={{ color: "#334155", marginBottom: 0 }}>{mensagem}</p>}
      <p style={{ color: "#64748b", fontSize: 12, marginBottom: 0, marginTop: 18 }}>
        Preferência por usuário, barbearia e navegador. Notificações push em dispositivos fechados
        seguem os controles de som do sistema operacional.
      </p>
    </section>
  );
}
