import api from "./api";

export async function listarBarbeariasProximas({
  latitude,
  longitude,
  raioKm = 5,
  limite = 50,
}) {
  const params = new URLSearchParams();
  params.set("latitude", String(latitude));
  params.set("longitude", String(longitude));
  params.set("raio_km", String(raioKm));
  params.set("limite", String(limite));

  const response = await api.get(
    `/publico/barbearias/proximas?${params.toString()}`
  );

  return response.data;
}
