"use client";

import styles from "../../app/dashboard.module.css";

const CORES = ["#2563eb", "#0f766e", "#7c3aed", "#d97706", "#dc2626", "#64748b"];

export default function GraficoRosca({ dados = [], chaveValor = "valor" }) {
  const normalizados = dados
    .map((item) => ({ ...item, valorGrafico: Number(item[chaveValor] || 0) }))
    .filter((item) => item.valorGrafico > 0);

  const total = normalizados.reduce((soma, item) => soma + item.valorGrafico, 0);

  if (!normalizados.length || total <= 0) {
    return <div className={styles.graficoVazio}>Sem dados para o período selecionado.</div>;
  }

  let acumulado = 0;
  const segmentos = normalizados.map((item, indice) => {
    const inicio = (acumulado / total) * 100;
    acumulado += item.valorGrafico;
    const fim = (acumulado / total) * 100;
    return {
      ...item,
      cor: CORES[indice % CORES.length],
      inicio,
      fim,
      percentual: (item.valorGrafico / total) * 100,
    };
  });

  const gradiente = segmentos
    .map((item) => `${item.cor} ${item.inicio}% ${item.fim}%`)
    .join(", ");

  return (
    <div className={styles.roscaWrap}>
      <div
        className={styles.rosca}
        style={{ background: `conic-gradient(${gradiente})` }}
        aria-label="Distribuição percentual"
      >
        <div className={styles.roscaCentro}>
          <strong>100%</strong>
          <span>do período</span>
        </div>
      </div>

      <div className={styles.roscaLegenda}>
        {segmentos.map((item, indice) => (
          <div className={styles.roscaLegendaItem} key={`${item.nome}-${indice}`}>
            <span className={styles.roscaCor} style={{ background: item.cor }} />
            <span>{item.nome}</span>
            <strong>{item.percentual.toFixed(1)}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
