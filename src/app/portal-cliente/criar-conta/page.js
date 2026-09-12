"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { obterBarbeariaPublica } from "@/services/barbeariaService";
import { criarContaCliente, obterBarbeariaPortal, salvarBarbeariaPortal } from "@/services/portalClienteService";

function Cadastro() {
  const router = useRouter();
  const params = useSearchParams();
  const [slug, setSlug] = useState("");
  const [barbeariaNome, setBarbeariaNome] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [linkInvalido, setLinkInvalido] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState({ nome: "", telefone: "", email: "", senha: "", confirmacao: "" });

  useEffect(() => {
    let ativo = true;
    const valor = (params.get("barbearia") || obterBarbeariaPortal() || "").trim().toLowerCase();
    setSlug(valor);
    if (!valor) {
      setLinkInvalido(true);
      setCarregando(false);
      return () => { ativo = false; };
    }
    obterBarbeariaPublica(valor)
      .then((dados) => {
        if (!ativo) return;
        setBarbeariaNome(dados?.nome || "Barbearia");
        salvarBarbeariaPortal(valor);
      })
      .catch(() => { if (ativo) setLinkInvalido(true); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [params]);

  async function enviar(event) {
    event.preventDefault();
    setErro("");
    if (form.senha !== form.confirmacao) {
      setErro("As senhas não coincidem.");
      return;
    }
    setEnviando(true);
    try {
      await criarContaCliente({ ...form, barbeariaSlug: slug });
      router.push(`/portal-cliente/confirmar-email?barbearia=${encodeURIComponent(slug)}&email=${encodeURIComponent(form.email)}`);
    } catch (error) {
      setErro(error?.response?.data?.detail || "Não foi possível criar a conta.");
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) return <main className="min-h-screen bg-slate-950 p-8 text-center text-white">Carregando barbearia...</main>;
  if (linkInvalido) return <main className="min-h-screen bg-slate-950 p-8 text-center text-white">Barbearia não encontrada ou indisponível. Solicite o link correto à barbearia.</main>;

  const campos = [["nome", "Nome completo", "text"], ["telefone", "Telefone com DDD", "tel"], ["email", "E-mail", "email"], ["senha", "Senha (mínimo 8 caracteres)", "password"], ["confirmacao", "Confirmar senha", "password"]];

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <form onSubmit={enviar} className="mx-auto max-w-lg rounded-2xl bg-white p-7 text-slate-900">
        <h1 className="text-2xl font-bold">Criar minha conta</h1>
        <p className="mt-1 text-base font-semibold text-blue-700">{barbeariaNome}</p>
        <p className="mt-2 text-sm text-slate-600">Se você já estiver cadastrado, vincularemos a conta ao seu cadastro.</p>
        <div className="mt-6 space-y-4">
          {campos.map(([chave, rotulo, tipo]) => (
            <label key={chave} className="block text-sm font-medium">{rotulo}
              <input required type={tipo} minLength={chave === "senha" || chave === "confirmacao" ? 8 : undefined} value={form[chave]} onChange={(event) => setForm({ ...form, [chave]: event.target.value })} className="mt-1 w-full rounded-lg border p-3" />
            </label>
          ))}
        </div>
        {erro && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{erro}</p>}
        <button disabled={enviando} className="mt-6 w-full rounded-lg bg-blue-600 p-3 font-semibold text-white">{enviando ? "Enviando código..." : "Criar conta"}</button>
        <button type="button" onClick={() => router.push(`/portal-cliente?barbearia=${encodeURIComponent(slug)}`)} className="mt-3 w-full p-2 text-blue-700">Voltar</button>
      </form>
    </main>
  );
}

export default function Page() {
  return <Suspense fallback={<main>Carregando...</main>}><Cadastro /></Suspense>;
}
