// F2.4A5 - campainha digital de notificacoes do BarbSist.
// Som local: requer autorizacao de audio do navegador.

export async function tocarAlertaBarbSist() {
  if (typeof window === "undefined") return false;

  const AudioContexto =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContexto) return false;

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

    const inicio = contexto.currentTime + 0.03;

    const notas = [
      { frequencia: 784, inicio: 0.00, duracao: 0.24 },
      { frequencia: 988, inicio: 0.34, duracao: 0.24 },
      { frequencia: 1175, inicio: 0.68, duracao: 0.36 },
    ];

    for (const nota of notas) {
      const oscilador = contexto.createOscillator();
      const ganho = contexto.createGain();

      const t = inicio + nota.inicio;
      const fim = t + nota.duracao;

      oscilador.type = "triangle";
      oscilador.frequency.setValueAtTime(
        nota.frequencia,
        t
      );

      ganho.gain.setValueAtTime(0.0001, t);
      ganho.gain.linearRampToValueAtTime(0.336, t + 0.025);
      ganho.gain.setValueAtTime(0.336, fim - 0.06);
      ganho.gain.exponentialRampToValueAtTime(
        0.0001,
        fim
      );

      oscilador.connect(ganho);
      ganho.connect(contexto.destination);

      oscilador.start(t);
      oscilador.stop(fim + 0.01);
    }

    window.setTimeout(() => {
      contexto.close().catch(() => {});
    }, 1700);

    return true;
  } catch {
    if (contexto) {
      contexto.close().catch(() => {});
    }

    return false;
  }
}