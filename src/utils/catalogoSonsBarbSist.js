// F2.4C2 - Biblioteca local de alertas sonoros BarbSist.
// Sons sintetizados, sem downloads ou dependencias externas.

export const SONS_BARBSIST = [
  { id: "classica", nome: "Campainha Classica" },
  { id: "tesoura", nome: "Tesoura" },
  { id: "maquina", nome: "Maquina de Corte" },
  { id: "navalha", nome: "Navalha Premium" },
  { id: "barberpole", nome: "Barber Pole" },
  { id: "vintage", nome: "Barbearia Vintage" },
  { id: "cadeira", nome: "Cadeira do Barbeiro" },
  { id: "vip", nome: "Agendamento VIP" },
  { id: "digital", nome: "BarbSist Digital" },
  { id: "urgente", nome: "BarbSist Urgente" },
  // F2.4C4 - sons expandidos inspirados em barbearia.
  { id: "borrifador", nome: "Borrifador" },
  { id: "navalharetro", nome: "Navalha Retro" },
  { id: "caixa", nome: "Caixa do Balcao" },
  { id: "porta", nome: "Campainha de Porta" },
  { id: "executivo", nome: "Toque Executivo" },
  { id: "rapido", nome: "Alerta Rapido" },
];

const PADROES = {
  // F2.4C4 - seis sequencias com caracteristicas distintas.
  borrifador: [
    [1850, 0.00, 0.055, "sawtooth"],
    [2100, 0.11, 0.045, "sawtooth"],
    [620, 0.26, 0.13, "sine"],
  ],
  navalharetro: [
    [280, 0.00, 0.10, "square"],
    [1430, 0.12, 0.18, "triangle"],
    [1020, 0.30, 0.42, "sine"],
  ],
  caixa: [
    [420, 0.00, 0.09, "square"],
    [880, 0.12, 0.13, "triangle"],
    [1320, 0.28, 0.48, "sine"],
  ],
  porta: [
    [659, 0.00, 0.65, "sine"],
    [988, 0.22, 0.75, "sine"],
  ],
  executivo: [
    [392, 0.00, 0.34, "sine"],
    [587, 0.28, 0.34, "sine"],
    [880, 0.56, 0.55, "triangle"],
  ],
  rapido: [
    [1250, 0.00, 0.085, "square"],
    [990, 0.12, 0.085, "square"],
    [1250, 0.24, 0.085, "square"],
    [1760, 0.40, 0.13, "triangle"],
  ],

  classica: [
    [784, 0, 0.24, "triangle"],
    [988, 0.34, 0.24, "triangle"],
    [1175, 0.68, 0.36, "triangle"],
  ],
  tesoura: [
    [1800, 0, 0.065, "square"],
    [2400, 0.14, 0.065, "square"],
    [880, 0.30, 0.28, "triangle"],
  ],
  maquina: [
    [140, 0, 0.45, "sawtooth"],
    [280, 0.06, 0.35, "triangle"],
    [740, 0.52, 0.20, "sine"],
  ],
  navalha: [
    [1320, 0, 0.17, "sine"],
    [1760, 0.08, 0.30, "triangle"],
    [2200, 0.26, 0.38, "sine"],
  ],
  barberpole: [
    [523, 0, 0.18, "triangle"],
    [659, 0.22, 0.18, "triangle"],
    [784, 0.44, 0.18, "triangle"],
    [1047, 0.66, 0.30, "triangle"],
  ],
  vintage: [
    [660, 0, 0.40, "square"],
    [880, 0.05, 0.36, "sine"],
    [660, 0.58, 0.32, "square"],
    [880, 0.63, 0.28, "sine"],
  ],
  cadeira: [
    [320, 0, 0.09, "square"],
    [587, 0.21, 0.25, "triangle"],
    [784, 0.51, 0.29, "triangle"],
  ],
  vip: [
    [523, 0, 0.50, "sine"],
    [659, 0.12, 0.50, "sine"],
    [784, 0.24, 0.56, "sine"],
  ],
  digital: [
    [1047, 0, 0.12, "square"],
    [1319, 0.18, 0.12, "square"],
    [1568, 0.36, 0.23, "sine"],
  ],
  urgente: [
    [880, 0, 0.20, "square"],
    [660, 0.26, 0.20, "square"],
    [880, 0.59, 0.20, "square"],
    [660, 0.85, 0.27, "square"],
  ],
};

export async function tocarSomBarbSist(tipo = "classica", volume = 100) {
  if (typeof window === "undefined") return false;

  const AudioContexto = window.AudioContext || window.webkitAudioContext;
  if (!AudioContexto) return false;

  const selecionado = PADROES[tipo] ? tipo : "classica";
  const intensidade = Math.max(0, Math.min(100, Number(volume) || 0)) / 100;

  if (intensidade === 0) return true;

  let contexto;

  try {
    contexto = new AudioContexto();

    if (contexto.state === "suspended") {
      await contexto.resume();
    }

    if (contexto.state !== "running") {
      await contexto.close();
      return false;
    }

    const inicio = contexto.currentTime + 0.035;
    const notas = PADROES[selecionado];

    // Limitador de pico proporcional ao numero de notas simultaneas.
    const ganhoPrincipal = contexto.createGain();
    // F2.4C4 - ganho 60% maior que o motor anterior.
    // Compressor impede picos excessivos quando notas se sobrepoem.
    ganhoPrincipal.gain.value = 0.336 * 1.6 * intensidade;
    const limitador = contexto.createDynamicsCompressor();
    limitador.threshold.setValueAtTime(-8, contexto.currentTime);
    limitador.knee.setValueAtTime(6, contexto.currentTime);
    limitador.ratio.setValueAtTime(4, contexto.currentTime);
    limitador.attack.setValueAtTime(0.004, contexto.currentTime);
    limitador.release.setValueAtTime(0.14, contexto.currentTime);
    ganhoPrincipal.connect(limitador);
    limitador.connect(contexto.destination);

    let ultimoFim = inicio;

    for (const [frequencia, atraso, duracao, forma] of notas) {
      const oscilador = contexto.createOscillator();
      const envelope = contexto.createGain();

      const t = inicio + atraso;
      const fim = t + duracao;
      ultimoFim = Math.max(ultimoFim, fim);

      oscilador.type = forma;
      oscilador.frequency.setValueAtTime(frequencia, t);

      const sobreposicoes = selecionado === "vip" ? 3 : 2;
      const amplitude = selecionado === "classica" ? 1 : 0.85 / sobreposicoes; // F2.4C3B: preservar ganho aprovado

      envelope.gain.setValueAtTime(0.0001, t);
      envelope.gain.linearRampToValueAtTime(
        amplitude, t + Math.min(0.022, duracao / 3)
      );
      envelope.gain.setValueAtTime(
        amplitude, t + Math.max(0.025, duracao - 0.07)
      );
      envelope.gain.exponentialRampToValueAtTime(0.0001, fim);

      oscilador.connect(envelope);
      envelope.connect(ganhoPrincipal);

      oscilador.start(t);
      oscilador.stop(fim + 0.01);
    }

    window.setTimeout(() => {
      contexto.close().catch(() => {});
    }, Math.ceil((ultimoFim - contexto.currentTime + 0.4) * 1000));

    return true;
  } catch {
    if (contexto) contexto.close().catch(() => {});
    return false;
  }
}