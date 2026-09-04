"use client";

export function moeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function dataBr(valor) {
  if (!valor) return "-";
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return String(valor);
  return d.toLocaleString("pt-BR");
}

export function Card({ titulo, valor, detalhe }) {
  return (
    <article
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 14,
        padding: 20,
        boxShadow: "0 8px 22px rgba(15,23,42,.05)",
      }}
    >
      <div style={{ color: "#64748b", marginBottom: 8 }}>{titulo}</div>
      <strong style={{ fontSize: 26 }}>{valor ?? "-"}</strong>
      {detalhe ? (
        <div style={{ color: "#64748b", marginTop: 8, fontSize: 13 }}>
          {detalhe}
        </div>
      ) : null}
    </article>
  );
}

export function Status({ valor }) {
  const texto = String(valor ?? "-");
  const ok = ["ativo", "pago", "conectado", "aprovado", "liberado", "true"].includes(
    texto.toLowerCase()
  );

  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 9px",
        borderRadius: 999,
        background: ok ? "#dcfce7" : "#fee2e2",
        color: ok ? "#166534" : "#991b1b",
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      {texto}
    </span>
  );
}

export function JsonBox({ dados }) {
  return (
    <pre
      style={{
        margin: 0,
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        background: "#0f172a",
        color: "#e2e8f0",
        borderRadius: 12,
        padding: 16,
        fontSize: 13,
      }}
    >
      {JSON.stringify(dados, null, 2)}
    </pre>
  );
}

export function Painel({ titulo, children, acoes }) {
  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 14,
        padding: 20,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>{titulo}</h2>
        {acoes}
      </div>
      {children}
    </section>
  );
}

export function Botao({ children, onClick, tipo = "primario", disabled = false }) {
  const estilos = {
    primario: { background: "#2563eb", color: "#fff", border: "1px solid #2563eb" },
    neutro: { background: "#fff", color: "#0f172a", border: "1px solid #cbd5e1" },
    perigo: { background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3" },
    sucesso: { background: "#16a34a", color: "#fff", border: "1px solid #16a34a" },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...estilos[tipo],
        borderRadius: 9,
        padding: "10px 14px",
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {children}
    </button>
  );
}
