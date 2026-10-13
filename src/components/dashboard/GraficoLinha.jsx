"use client";

import styles from "../../app/dashboard.module.css";

function formatarNumero(valor, formato) {
  const numero = Number(valor || 0);
  if (formato === "moeda") {
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  }
  return numero.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

export default function GraficoLinha({ dados = [], series = [], formato = "numero" }) {
  if (!dados.length || !series.length) {
    return <div className={styles.graficoVazio}>Sem dados para o período selecionado.</div>;
  }

  const largura = 760;
  const altura = 260;
  const margem = { topo: 18, direita: 18, baixo: 48, esquerda: 62 };
  const valores = dados.flatMap((item) =>
    series.map((serie) => Number(item[serie.chave] || 0))
  );
  const maximo = Math.max(1, ...valores);
  const larguraUtil = largura - margem.esquerda - margem.direita;
  const alturaUtil = altura - margem.topo - margem.baixo;

  const pontoX = (indice) =>
    dados.length <= 1
      ? margem.esquerda + larguraUtil / 2
      : margem.esquerda + (indice / (dados.length - 1)) * larguraUtil;

  const pontoY = (valor) =>
    margem.topo + alturaUtil - (Number(valor || 0) / maximo) * alturaUtil;

  const passoRotulo = Math.max(1, Math.ceil(dados.length / 8));

  return (
    <div className={styles.graficoLinhaWrap}>
      <div className={styles.graficoLegenda}>
        {series.map((serie) => (
          <span key={serie.chave}>
            <i style={{ background: serie.cor }} />
            {serie.rotulo}
          </span>
        ))}
      </div>

      <svg className={styles.svgChart} viewBox={`0 0 ${largura} ${altura}`} role="img" aria-label="Gráfico de evolução">
        {[0, 1, 2, 3, 4].map((indice) => {
          const proporcao = indice / 4;
          const y = margem.topo + proporcao * alturaUtil;
          const valor = maximo * (1 - proporcao);
          return (
            <g key={indice}>
              <line x1={margem.esquerda} y1={y} x2={largura - margem.direita} y2={y} className={styles.gridLine} />
              <text x={margem.esquerda - 10} y={y + 4} textAnchor="end" className={styles.axisText}>
                {formatarNumero(valor, formato)}
              </text>
            </g>
          );
        })}

        {series.map((serie) => {
          const pontos = dados
            .map((item, indice) => `${pontoX(indice)},${pontoY(item[serie.chave])}`)
            .join(" ");
          return (
            <g key={serie.chave}>
              <polyline
                points={pontos}
                fill="none"
                stroke={serie.cor}
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {dados.map((item, indice) => (
                <circle
                  key={`${serie.chave}-${indice}`}
                  cx={pontoX(indice)}
                  cy={pontoY(item[serie.chave])}
                  r="4"
                  fill={serie.cor}
                >
                  <title>
                    {`${item.label}: ${serie.rotulo} ${formatarNumero(item[serie.chave], formato)}`}
                  </title>
                </circle>
              ))}
            </g>
          );
        })}

        {dados.map((item, indice) => {
          if (indice % passoRotulo !== 0 && indice !== dados.length - 1) return null;
          return (
            <text
              key={`${item.label}-${indice}`}
              x={pontoX(indice)}
              y={altura - 16}
              textAnchor="middle"
              className={styles.axisText}
            >
              {item.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
