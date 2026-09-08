"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginCliente } from "@/services/portalClienteService";

export default function LoginClientePage() {
  const router = useRouter();
  const [form, setForm] = useState({ barbeariaSlug: "", email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(event) {
    event.preventDefault(); setErro(""); setEnviando(true);
    try {
      await loginCliente(form.barbeariaSlug, form.email, form.senha);
      router.push("/cliente/inicio");
    } catch (error) {
      setErro(error?.response?.data?.detail || "Não foi possível entrar.");
    } finally { setEnviando(false); }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <form onSubmit={entrar} className="mx-auto max-w-md rounded-2xl bg-white p-7 text-slate-900 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">BarbSist</p>
        <h1 className="mt-2 text-2xl font-bold">Portal do cliente</h1>
        <p className="mt-2 text-sm text-slate-600">Consulte seu acesso na barbearia.</p>
        <div className="mt-7 space-y-4">
          <label className="block text-sm font-medium">Barbearia
            <input required value={form.barbeariaSlug} onChange={(e) => setForm({ ...form, barbeariaSlug: e.target.value })} placeholder="slug-da-barbearia" className="mt-1 w-full rounded-lg border p-3" />
          </label>
          <label className="block text-sm font-medium">E-mail
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-lg border p-3" />
          </label>
          <label className="block text-sm font-medium">Senha
            <input required type="password" minLength={8} value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} className="mt-1 w-full rounded-lg border p-3" />
          </label>
        </div>
        {erro && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{erro}</p>}
        <button disabled={enviando} className="mt-6 w-full rounded-lg bg-blue-600 p-3 font-semibold text-white disabled:opacity-60">{enviando ? "Entrando..." : "Entrar"}</button>
      </form>
    </main>
  );
}
