"use client";

import styles from "../../app/dashboard.module.css";

function dinheiro(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function GraficoBarras({
  dados = [],
  chaveValor = "quantidade",
  secundaria = null,
  secundariaTipo = "numero",
}) {
  if (!dados.length) {
    return <div className={styles.graficoVazio}>Sem dados para o período selecionado.</div>;
  }

  const maximo = Math.max(1, ...dados.map((item) => Number(item[chaveValor] || 0)));

  return (
    <div className={styles.barras}>
      {dados.map((item, indice) => {
        const valor = Number(item[chaveValor] || 0);
        const largura = Math.max(4, (valor / maximo) * 100);
        let textoSecundario = "";

        if (secundaria) {
          const valorSecundario = item[secundaria.chave];
          textoSecundario =
            secundariaTipo === "moeda"
              ? dinheiro(valorSecundario)
              : Number(valorSecundario || 0).toLocaleString("pt-BR");
        }

        return (
          <div className={styles.barraLinha} key={item.id ?? `${item.nome}-${indice}`}>
            <div className={styles.barraCabecalho}>
              <strong>{item.nome}</strong>
              <span>
                {valor.toLocaleString("pt-BR")}
                {secundaria ? ` · ${secundaria.rotulo}: ${textoSecundario}` : ""}
              </span>
            </div>
            <div className={styles.barraTrilho}>
              <div className={styles.barraPreenchimento} style={{ width: `${largura}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
