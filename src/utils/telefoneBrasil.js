/**
 * Converte telefone brasileiro para o formato exigido por wa.me.
 * Aceita DDD + numero com ou sem DDI 55.
 * Nao altera os dados armazenados no banco.
 */
export function numeroWhatsAppBrasil(valor) {
  let numeros = String(valor ?? "").replace(/\D/g, "");

  if (
    numeros.startsWith("55") &&
    (numeros.length === 12 || numeros.length === 13)
  ) {
    numeros = numeros.slice(2);
  }

  if (!/^\d{10,11}$/.test(numeros)) {
    return "";
  }

  const ddd = Number(numeros.slice(0, 2));

  if (ddd < 11 || ddd > 99) {
    return "";
  }

  const numeroLocal = numeros.slice(2);

  if (numeroLocal.length === 9 && numeroLocal[0] !== "9") {
    return "";
  }

  if (numeroLocal.length === 8 && numeroLocal[0] === "0") {
    return "";
  }

  return `55${numeros}`;
}
