"use client";

import { useEffect, useMemo, useState } from "react";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";

import {
  listarComandas,
  criarComanda,
  buscarComanda,
  adicionarServicoComanda,
  adicionarProdutoComanda,
  adicionarMensalidadePlanoComanda,
  consultarAssinaturaComanda,
  usarPlanoNoItem,
  fecharComanda,
  cancelarComanda,
  cancelarCobrancaOnlineComanda,
  excluirComandaTeste,
} from "@/services/comandaService";

import { listarServicos } from "@/services/servicoService";
import { listarProdutos } from "@/services/produtoService";
import { listarClientes } from "@/services/clienteService";
import { listarBarbeiros } from "@/services/barbeiroService";
import { useAuth } from "@/contexts/AuthContext";
import {
  criarCobrancaPix,
  criarCobrancaCartao,
  obterConfiguracaoMercadoPago,
} from "@/services/mercadoPagoService";


export default function ComandasPage() {
  const {
    usuario,
    carregando: carregandoAutenticacao,
  } = useAuth();

  const perfilUsuario = String(
    usuario?.perfil || ""
  ).toLowerCase();

  const usuarioEhBarbeiro =
    perfilUsuario === "barbeiro";

  const [comandas, setComandas] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);

  const [novoClienteId, setNovoClienteId] = useState("");
  const [novoBarbeiroId, setNovoBarbeiroId] = useState("");
  const [abrindoComanda, setAbrindoComanda] = useState(false);

  const [
    comandaSelecionada,
    setComandaSelecionada,
  ] = useState(null);

  const [
    assinaturaComanda,
    setAssinaturaComanda,
  ] = useState(null);

  const [
    carregandoAssinatura,
    setCarregandoAssinatura,
  ] = useState(false);

  const [
    usandoPlanoItemId,
    setUsandoPlanoItemId,
  ] = useState(null);

  const [servicoId, setServicoId] = useState("");
  const [produtoId, setProdutoId] = useState("");
  const [adicionandoMensalidade, setAdicionandoMensalidade] = useState(false);

  const [
    quantidadeServico,
    setQuantidadeServico,
  ] = useState(1);

  const [
    quantidadeProduto,
    setQuantidadeProduto,
  ] = useState(1);

  const [
    formaPagamento,
    setFormaPagamento,
  ] = useState("mp_pix");

  const [processandoPagamento, setProcessandoPagamento] = useState(false);
  const [mercadoPagoPublicKey, setMercadoPagoPublicKey] = useState("");
  const [cartaoAberto, setCartaoAberto] = useState(false);
  const [pixCobranca, setPixCobranca] = useState(null);
  const [payerEmail, setPayerEmail] = useState("");

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);


  useEffect(() => {
    if (!carregandoAutenticacao && usuario) {
      carregarDadosIniciais();
    }
  }, [carregandoAutenticacao, usuario]);

  useEffect(() => {
    obterConfiguracaoMercadoPago()
      .then((configuracao) => {
        const publicKey = configuracao?.public_key || "";
        if (publicKey) {
          initMercadoPago(publicKey, { locale: "pt-BR" });
          setMercadoPagoPublicKey(publicKey);
        }
      })
      .catch((error) => console.warn("Mercado Pago indisponível:", error));
  }, []);


  function obterDetalheErro(error, mensagemPadrao) {
    return (
      error?.response?.data?.detail ||
      mensagemPadrao
    );
  }


  async function carregarDadosIniciais() {
    try {
      setErro("");
      setCarregando(true);

      if (
        usuarioEhBarbeiro &&
        !usuario?.barbeiro_id
      ) {
        setComandas([]);
        setServicos([]);
        setProdutos([]);
        setClientes([]);
        setBarbeiros([]);
        setNovoBarbeiroId("");
        setErro(
          "Seu usuário barbeiro não possui vínculo com um cadastro de barbeiro. Solicite ao administrador que corrija o vínculo."
        );
        return;
      }

      const dadosComandas = await listarComandas();
      setComandas(dadosComandas || []);

      const dadosServicos = await listarServicos();
      setServicos(dadosServicos || []);

      const dadosClientes = await listarClientes();
      setClientes(
        Array.isArray(dadosClientes)
          ? dadosClientes
          : []
      );

      if (usuarioEhBarbeiro) {
        const barbeiroVinculado = {
          id: Number(usuario.barbeiro_id),
          nome:
            usuario.barbeiro_nome ||
            usuario.nome ||
            "Meu cadastro",
          ativo: true,
        };

        setBarbeiros([barbeiroVinculado]);
        setNovoBarbeiroId(
          String(usuario.barbeiro_id)
        );
      } else {
        const dadosBarbeiros =
          await listarBarbeiros();

        setBarbeiros(
          Array.isArray(dadosBarbeiros)
            ? dadosBarbeiros
            : []
        );
      }

      try {
        const dadosProdutos = await listarProdutos();
        setProdutos(dadosProdutos || []);
      } catch (errorProdutos) {
        console.warn(
          "Produtos não carregados:",
          errorProdutos
        );

        setProdutos([]);

        setErro(
          "Comandas e serviços carregados. " +
          "Produtos não carregados por falta de permissão."
        );
      }
    } catch (error) {
      console.error(error);

      setErro(
        obterDetalheErro(
          error,
          "Erro ao carregar dados da tela de comandas."
        )
      );
    } finally {
      setCarregando(false);
    }
  }


  async function carregarComandas() {
    try {
      const dados = await listarComandas();
      setComandas(dados || []);
    } catch (error) {
      console.error(error);

      setErro(
        obterDetalheErro(
          error,
          "Erro ao carregar comandas."
        )
      );
    }
  }


  async function abrirNovaComanda() {
    try {
      setErro("");
      setMensagem("");
      setAbrindoComanda(true);

      const novaComanda = await criarComanda({
        cliente_id: novoClienteId
          ? Number(novoClienteId)
          : null,
        barbeiro_id: novoBarbeiroId
          ? Number(novoBarbeiroId)
          : null,
      });

      setNovoClienteId("");
      setNovoBarbeiroId(
        usuarioEhBarbeiro
          ? String(usuario.barbeiro_id)
          : ""
      );

      await carregarComandas();
      await selecionarComanda(novaComanda.id);

      setMensagem(
        `Comanda #${novaComanda.id} aberta com sucesso.`
      );
    } catch (error) {
      console.error(error);

      setErro(
        obterDetalheErro(
          error,
          "Erro ao abrir nova comanda."
        )
      );
    } finally {
      setAbrindoComanda(false);
    }
  }


  async function carregarAssinaturaComanda(
    comandaId,
    mostrarErro = true
  ) {
    if (!comandaId) {
      setAssinaturaComanda(null);
      return;
    }

    try {
      setCarregandoAssinatura(true);

      const dados = await consultarAssinaturaComanda(
        comandaId
      );

      setAssinaturaComanda(dados);
    } catch (error) {
      console.error(error);
      setAssinaturaComanda(null);

      if (mostrarErro) {
        setErro(
          obterDetalheErro(
            error,
            "Erro ao consultar a assinatura do cliente."
          )
        );
      }
    } finally {
      setCarregandoAssinatura(false);
    }
  }


  async function selecionarComanda(id) {
    try {
      setErro("");
      setMensagem("");
      setAssinaturaComanda(null);

      const dados = await buscarComanda(id);

      setComandaSelecionada(dados);

      setServicoId("");
      setProdutoId("");
      setQuantidadeServico(1);
      setQuantidadeProduto(1);
      setFormaPagamento("mp_pix");
      const cliente = clientes.find(
        (item) => Number(item.id) === Number(dados.cliente_id)
      );
      setPayerEmail(cliente?.email || "");

      await carregarAssinaturaComanda(
        id,
        false
      );
    } catch (error) {
      console.error(error);

      setErro(
        obterDetalheErro(
          error,
          "Erro ao buscar detalhes da comanda."
        )
      );
    }
  }


  async function atualizarComandaSelecionada(
    comandaId = comandaSelecionada?.id
  ) {
    if (!comandaId) return;

    const dados = await buscarComanda(comandaId);
    setComandaSelecionada(dados);
  }


  async function atualizarFluxoComanda(
    comandaId = comandaSelecionada?.id
  ) {
    if (!comandaId) return;

    await Promise.all([
      atualizarComandaSelecionada(comandaId),
      carregarComandas(),
      carregarAssinaturaComanda(
        comandaId,
        false
      ),
    ]);
  }


  async function adicionarServico() {
    if (!comandaSelecionada) {
      setErro("Selecione uma comanda.");
      return;
    }

    if (!servicoId) {
      setErro("Selecione um serviço.");
      return;
    }

    const quantidade = Number(
      quantidadeServico || 1
    );

    if (quantidade <= 0) {
      setErro(
        "A quantidade do serviço deve ser maior que zero."
      );

      return;
    }

    try {
      setErro("");
      setMensagem("");

      await adicionarServicoComanda(
        comandaSelecionada.id,
        {
          servico_id: Number(servicoId),
          quantidade,
        }
      );

      setMensagem(
        "Serviço adicionado à comanda."
      );

      await atualizarFluxoComanda(
        comandaSelecionada.id
      );

      setServicoId("");
      setQuantidadeServico(1);
    } catch (error) {
      console.error(error);

      setErro(
        obterDetalheErro(
          error,
          "Erro ao adicionar serviço na comanda."
        )
      );
    }
  }


  async function adicionarProduto() {
    if (!comandaSelecionada) {
      setErro("Selecione uma comanda.");
      return;
    }

    if (!produtoId) {
      setErro("Selecione um produto.");
      return;
    }

    const quantidade = Number(
      quantidadeProduto || 1
    );

    if (quantidade <= 0) {
      setErro(
        "A quantidade do produto deve ser maior que zero."
      );

      return;
    }

    try {
      setErro("");
      setMensagem("");
      await adicionarProdutoComanda(
        comandaSelecionada.id,
        {
          produto_id: Number(produtoId),
          quantidade,
        }
      );

      setMensagem(
        "Produto adicionado à comanda."
      );

      await atualizarFluxoComanda(
        comandaSelecionada.id
      );

      setProdutoId("");
      setQuantidadeProduto(1);
    } catch (error) {
      console.error(error);

      setErro(
        obterDetalheErro(
          error,
          "Erro ao adicionar produto. Verifique o estoque."
        )
      );
    }
  }


  async function adicionarMensalidadePlano() {
    const assinatura = assinaturaComanda?.assinatura;
    if (!comandaSelecionada || !assinatura?.id) {
      setErro("A comanda não possui uma assinatura disponível.");
      return;
    }

    try {
      setErro("");
      setMensagem("");
      setAdicionandoMensalidade(true);
      await adicionarMensalidadePlanoComanda(
        comandaSelecionada.id,
        assinatura.id
      );
      setMensagem("Mensalidade adicionada à comanda.");
      await atualizarFluxoComanda(comandaSelecionada.id);
    } catch (error) {
      console.error(error);
      setErro(
        obterDetalheErro(
          error,
          "Erro ao adicionar a mensalidade à comanda."
        )
      );
    } finally {
      setAdicionandoMensalidade(false);
    }
  }


  async function utilizarPlanoNoItem(item) {
    if (!comandaSelecionada) {
      setErro("Selecione uma comanda.");
      return;
    }

    const assinatura =
      assinaturaComanda?.assinatura;

    if (!assinatura?.id) {
      setErro(
        "Não foi encontrada uma assinatura válida."
      );

      return;
    }

    if (!assinaturaComanda?.pode_usar_plano) {
      setErro(
        assinaturaComanda?.motivo ||
        "O plano não está disponível para uso."
      );

      return;
    }

    if (item.tipo !== "servico") {
      setErro(
        "Somente serviços podem ser utilizados pelo plano."
      );

      return;
    }

    if (item.quantidade !== 1) {
      setErro(
        "O serviço deve possuir quantidade 1 para utilizar o plano."
      );

      return;
    }

    if (item.pago_com_plano) {
      setErro(
        "Este serviço já foi utilizado pelo plano."
      );

      return;
    }

    const confirmar = window.confirm(
      `Deseja utilizar um uso do plano no serviço "${item.descricao}"?`
    );

    if (!confirmar) return;

    try {
      setErro("");
      setMensagem("");
      setUsandoPlanoItemId(item.id);

      const resultado = await usarPlanoNoItem(
        comandaSelecionada.id,
        item.id,
        assinatura.id
      );

      setMensagem(
        resultado?.mensagem ||
        "Serviço utilizado pelo plano com sucesso."
      );

      await atualizarFluxoComanda(
        comandaSelecionada.id
      );
    } catch (error) {
      console.error(error);

      setErro(
        obterDetalheErro(
          error,
          "Erro ao utilizar o plano neste serviço."
        )
      );
    } finally {
      setUsandoPlanoItemId(null);
    }
  }

  async function utilizarPlanoNosItensElegiveis() {
  if (!comandaSelecionada) {
    setErro("Selecione uma comanda.");
    return;
  }

  const assinatura = assinaturaComanda?.assinatura;

  if (!assinatura?.id) {
    setErro("Não foi encontrada uma assinatura válida.");
    return;
  }

  if (!assinaturaComanda?.pode_usar_plano) {
    setErro(
      assinaturaComanda?.motivo ||
        "O plano não está disponível para uso."
    );
    return;
  }

  const servicosPermitidosIds =
  assinatura.servicos_permitidos_ids || [];

  const itensElegiveis =
    comandaSelecionada.itens?.filter(
      (item) =>
        item.tipo === "servico" &&
        !item.pago_com_plano &&
        item.quantidade === 1 &&
        servicosPermitidosIds.includes(
          Number(item.servico_id)
        )
    ) || [];

  if (itensElegiveis.length === 0) {
    setErro(
      "Não existem serviços elegíveis para uso do plano."
    );
    return;
  }

  const quantidadeUsos = Number(
    assinatura.usos_disponiveis || 0
  );

  const itensQueReceberaoPlano = itensElegiveis.slice(
    0,
    quantidadeUsos
  );

  if (itensQueReceberaoPlano.length === 0) {
    setErro("O plano não possui usos disponíveis.");
    return;
  }

  const confirmar = window.confirm(
    `Deseja utilizar o plano em ${
      itensQueReceberaoPlano.length
    } serviço(s) elegível(is)?`
  );

  if (!confirmar) return;

  try {
    setErro("");
    setMensagem("");
    setUsandoPlanoItemId("todos");

    for (const item of itensQueReceberaoPlano) {
      await usarPlanoNoItem(
        comandaSelecionada.id,
        item.id,
        assinatura.id
      );
    }

    setMensagem(
      `${itensQueReceberaoPlano.length} serviço(s) utilizado(s) pelo plano.`
    );

    await atualizarFluxoComanda(
      comandaSelecionada.id
    );
  } catch (error) {
    console.error(error);

    setErro(
      obterDetalheErro(
        error,
        "Erro ao utilizar o plano nos serviços."
      )
    );

    await atualizarFluxoComanda(
      comandaSelecionada.id
    );
  } finally {
    setUsandoPlanoItemId(null);
  }
}


  async function fecharComandaSelecionada() {
    if (!comandaSelecionada) {
      setErro("Selecione uma comanda.");
      return;
    }

    if (comandaSelecionada.status !== "aberta") {
      setErro("Esta comanda já está fechada.");
      return;
    }

    const totalComanda = Number(comandaSelecionada.total || 0);

    if (totalComanda <= 0) {
      try {
        setErro("");
        setProcessandoPagamento(true);
        const resultado = await fecharComanda(comandaSelecionada.id, {
          forma_pagamento: null,
        });
        setMensagem(resultado?.mensagem || "Comanda fechada com sucesso.");
        await atualizarFluxoComanda(comandaSelecionada.id);
      } catch (error) {
        setErro(obterDetalheErro(error, "Erro ao fechar comanda."));
      } finally {
        setProcessandoPagamento(false);
      }
      return;
    }

    if (formaPagamento === "mp_cartao") {
      if (!mercadoPagoPublicKey) {
        setErro("O Mercado Pago não está configurado para pagamento com cartão.");
        return;
      }
      if (!payerEmail || !payerEmail.includes("@")) {
        setErro("Informe um e-mail válido do pagador.");
        return;
      }
      setCartaoAberto(true);
      return;
    }

    if (formaPagamento === "mp_pix") {
      if (!payerEmail || !payerEmail.includes("@")) {
        setErro("Informe um e-mail válido do pagador.");
        return;
      }
      try {
        setErro("");
        setMensagem("");
        setProcessandoPagamento(true);
        const cobranca = await criarCobrancaPix({
          origem_negocio: "COMANDA",
          origem_id: comandaSelecionada.id,
          payer_email: payerEmail,
        });
        setPixCobranca(cobranca);
        setMensagem("Cobrança PIX criada. A comanda continuará aberta até a confirmação do Mercado Pago.");
        await atualizarFluxoComanda(comandaSelecionada.id);
      } catch (error) {
        setErro(obterDetalheErro(error, "Erro ao gerar cobrança PIX."));
      } finally {
        setProcessandoPagamento(false);
      }
      return;
    }

    const confirmar = window.confirm(
      `Deseja fechar a comanda #${comandaSelecionada.id} ` +
      `no valor de ${formatarMoeda(
        comandaSelecionada.total
      )} como pagamento já recebido?`
    );

    if (!confirmar) return;

    try {
      setErro("");
      setMensagem("");

      const resultado = await fecharComanda(
        comandaSelecionada.id,
        {
          forma_pagamento: formaPagamento,
        }
      );

      setMensagem(
        resultado?.mensagem ||
        "Comanda fechada com sucesso."
      );

      await carregarComandas();

      const atualizada = await buscarComanda(
        comandaSelecionada.id
      );

      setComandaSelecionada(atualizada);

      await carregarAssinaturaComanda(
        comandaSelecionada.id,
        false
      );
    } catch (error) {
      console.error(error);

      setErro(
        obterDetalheErro(
          error,
          "Erro ao fechar comanda."
        )
      );
    }
  }

  async function processarCartao(formData) {
    try {
      setErro("");
      setProcessandoPagamento(true);
      const cobranca = await criarCobrancaCartao({
        origem_negocio: "COMANDA",
        origem_id: comandaSelecionada.id,
        token: formData.token,
        payment_method_id: formData.payment_method_id,
        installments: Number(formData.installments || 1),
        issuer_id: formData.issuer_id ? Number(formData.issuer_id) : null,
        payer_email: formData.payer?.email || payerEmail,
        identification_type: formData.payer?.identification?.type || null,
        identification_number: formData.payer?.identification?.number || null,
      });
      setCartaoAberto(false);
      setMensagem(
        cobranca?.processado
          ? "Pagamento aprovado e comanda fechada."
          : "Pagamento enviado. A comanda será fechada somente após a confirmação do Mercado Pago."
      );
      await atualizarFluxoComanda(comandaSelecionada.id);
      return cobranca;
    } catch (error) {
      setErro(obterDetalheErro(error, "Pagamento recusado ou não processado."));
      throw error;
    } finally {
      setProcessandoPagamento(false);
    }
  }

  async function cancelarPagamentoOnline() {
    if (!comandaSelecionada) return;
    if (!window.confirm(
      `Cancelar a cobrança online pendente da comanda #${comandaSelecionada.id}?`
    )) return;

    try {
      setErro("");
      setMensagem("");
      setProcessandoPagamento(true);
      const resultado = await cancelarCobrancaOnlineComanda(comandaSelecionada.id);
      setPixCobranca(null);
      setMensagem(resultado?.mensagem || "Cobrança online cancelada.");
      await atualizarFluxoComanda(comandaSelecionada.id);
    } catch (error) {
      setErro(obterDetalheErro(error, "Erro ao cancelar a cobrança online."));
    } finally {
      setProcessandoPagamento(false);
    }
  }

  async function cancelarComandaSelecionada() {
    if (!comandaSelecionada) return;
    if (!window.confirm(
      `Cancelar a comanda #${comandaSelecionada.id}? Os itens serão desfeitos e o histórico será mantido.`
    )) return;

    try {
      setErro("");
      setMensagem("");
      setProcessandoPagamento(true);
      await cancelarCobrancaOnlineComanda(comandaSelecionada.id);
      const resultado = await cancelarComanda(comandaSelecionada.id);
      setPixCobranca(null);
      setMensagem(resultado?.mensagem || "Comanda cancelada.");
      await atualizarFluxoComanda(comandaSelecionada.id);
    } catch (error) {
      setErro(obterDetalheErro(error, "Erro ao cancelar a comanda."));
    } finally {
      setProcessandoPagamento(false);
    }
  }

  async function excluirComandaSelecionada() {
    if (!comandaSelecionada) return;
    const confirmacao = window.prompt(
      `Exclusão definitiva da comanda #${comandaSelecionada.id}. Digite EXCLUIR para confirmar.`
    );
    if (confirmacao !== "EXCLUIR") return;

    try {
      setErro("");
      setMensagem("");
      setProcessandoPagamento(true);
      if (comandaSelecionada.status === "aberta") {
        await cancelarCobrancaOnlineComanda(comandaSelecionada.id);
      }
      const resultado = await excluirComandaTeste(comandaSelecionada.id);
      setPixCobranca(null);
      setComandaSelecionada(null);
      setAssinaturaComanda(null);
      setMensagem(resultado?.mensagem || "Comanda de teste excluída.");
      await carregarComandas();
    } catch (error) {
      setErro(obterDetalheErro(error, "Erro ao excluir a comanda de teste."));
    } finally {
      setProcessandoPagamento(false);
    }
  }


  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
  }


  function formatarData(data) {
    if (!data) return "-";

    return new Date(data).toLocaleString(
      "pt-BR",
      {
        dateStyle: "short",
        timeStyle: "short",
      }
    );
  }


  function formatarPagamento(valor) {
    if (!valor) return "-";

    return valor
      .replaceAll("_", " ")
      .toUpperCase();
  }


  const resumo = useMemo(() => {
    const abertas = comandas.filter(
      (comanda) => comanda.status === "aberta"
    );

    const fechadas = comandas.filter(
      (comanda) => comanda.status === "fechada"
    );

    const totalAberto = abertas.reduce(
      (soma, comanda) =>
        soma + Number(comanda.total || 0),
      0
    );

    const totalFechado = fechadas.reduce(
      (soma, comanda) =>
        soma + Number(comanda.total || 0),
      0
    );

    return {
      abertas: abertas.length,
      fechadas: fechadas.length,
      totalAberto,
      totalFechado,
    };
  }, [comandas]);


  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
  };


  const buttonStyle = {
    background: "#111827",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  };


  const dangerButtonStyle = {
    ...buttonStyle,
    background: "#dc2626",
  };


  const cardStyle = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "18px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
  };


  const assinatura = assinaturaComanda?.assinatura;


  return (
    <main
      style={{
        padding: "30px",
        background: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ marginBottom: "5px" }}>
        Comandas
      </h1>

      <p
        style={{
          marginBottom: "25px",
          color: "#4b5563",
        }}
      >
        Atendimentos e vendas de produtos em um único fluxo.
      </p>

      {mensagem && (
        <div
          style={{
            background: "#dcfce7",
            color: "#166534",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "8px",
          }}
        >
          {mensagem}
        </div>
      )}

      {erro && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "8px",
          }}
        >
          {erro}
        </div>
      )}

      <section
        style={{
          ...cardStyle,
          marginBottom: "25px",
        }}
      >
        <div style={{ marginBottom: "18px" }}>
          <h2 style={{ margin: 0 }}>
            Abrir nova comanda
          </h2>

          <p
            style={{
              color: "#6b7280",
              margin: "6px 0 0",
            }}
          >
            Use a mesma comanda para atendimento,
            venda de produtos ou ambos.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "15px",
            alignItems: "end",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
              }}
            >
              Cliente
            </label>

            <select
              value={novoClienteId}
              onChange={(event) =>
                setNovoClienteId(event.target.value)
              }
              style={inputStyle}
            >
              <option value="">
                Cliente avulso
              </option>

              {clientes
                .filter(
                  (cliente) =>
                    cliente.ativo !== false
                )
                .map((cliente) => (
                  <option
                    key={cliente.id}
                    value={cliente.id}
                  >
                    {cliente.nome}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
              }}
            >
              Barbeiro
            </label>

            <select
              value={novoBarbeiroId}
              onChange={(event) =>
                setNovoBarbeiroId(event.target.value)
              }
              disabled={usuarioEhBarbeiro}
              style={inputStyle}
            >
              {!usuarioEhBarbeiro && (
                <option value="">
                  Sem barbeiro
                </option>
              )}

              {barbeiros
                .filter(
                  (barbeiro) =>
                    barbeiro.ativo !== false
                )
                .map((barbeiro) => (
                  <option
                    key={barbeiro.id}
                    value={barbeiro.id}
                  >
                    {barbeiro.nome}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <button
              type="button"
              onClick={abrirNovaComanda}
              disabled={abrindoComanda}
              style={{
                ...buttonStyle,
                width: "100%",
                opacity: abrindoComanda
                  ? 0.6
                  : 1,
              }}
            >
              {abrindoComanda
                ? "Abrindo..."
                : "Abrir Comanda"}
            </button>
          </div>
        </div>

        {usuarioEhBarbeiro && (
          <div
            style={{
              background: "#eff6ff",
              color: "#1e40af",
              borderRadius: "8px",
              padding: "12px 14px",
              marginTop: "15px",
            }}
          >
            A comanda será vinculada automaticamente ao seu cadastro de barbeiro.
          </div>
        )}

        <div
          style={{
            marginTop: "12px",
            padding: "10px 12px",
            borderRadius: "8px",
            background: "#f3f4f6",
            color: "#4b5563",
            fontSize: "13px",
          }}
        >
          {usuarioEhBarbeiro
            ? "Você pode abrir a comanda para cliente cadastrado ou cliente avulso. Serviços e produtos lançados ficarão vinculados à sua própria comanda."
            : "Para venda somente de produtos, cliente e barbeiro podem ficar em branco. Para serviços, selecione um barbeiro."}
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <div style={cardStyle}>
          <h2>{resumo.abertas}</h2>
          <p>Comandas abertas</p>
        </div>

        <div style={cardStyle}>
          <h2>{resumo.fechadas}</h2>
          <p>Comandas fechadas</p>
        </div>

        <div style={cardStyle}>
          <h2>
            {formatarMoeda(resumo.totalAberto)}
          </h2>
          <p>Total em aberto</p>
        </div>

        <div style={cardStyle}>
          <h2>
            {formatarMoeda(resumo.totalFechado)}
          </h2>
          <p>Total fechado</p>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1.65fr 1fr",
          gap: "20px",
          alignItems: "start",
        }}
      >
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <h2>Lista de Comandas</h2>

            <button
              onClick={carregarDadosIniciais}
              style={buttonStyle}
              disabled={carregando}
            >
              {carregando
                ? "Carregando..."
                : "Atualizar"}
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              width="100%"
              cellPadding="10"
              style={{
                borderCollapse: "collapse",
                background: "#fff",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#334155",
                    color: "#ffffff",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "14px 12px" }}>ID</th>
                  <th style={{ padding: "14px 12px" }}>Cliente</th>
                  <th style={{ padding: "14px 12px" }}>Barbeiro</th>
                  <th style={{ padding: "14px 12px" }}>Status</th>
                  <th style={{ padding: "14px 12px", textAlign: "right" }}>Total</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {comandas.map((comanda, index) => (
                  <tr
                    key={comanda.id}
                    style={{
                      borderBottom:
                        "1px solid #e5e7eb",
                      background:
                        comandaSelecionada?.id ===
                        comanda.id
                          ? "#dbeafe"
                          : index % 2 === 0
                            ? "#ffffff"
                            : "#f1f5f9",
                    }}
                  >
                    <td>#{comanda.id}</td>

                    <td>
                      {comanda.cliente_nome ||
                        "CLIENTE AVULSO"}
                    </td>

                    <td>
                      {comanda.barbeiro_nome || "-"}
                    </td>

                    <td>
                      <span
                        style={{
                          padding: "5px 8px",
                          borderRadius: "999px",
                          fontSize: "13px",
                          fontWeight: "700",
                          background:
                            comanda.status === "aberta"
                              ? "#dcfce7"
                              : "#e5e7eb",
                          color:
                            comanda.status === "aberta"
                              ? "#166534"
                              : "#374151",
                        }}
                      >
                        {comanda.status?.toUpperCase()}
                      </span>
                    </td>

                    <td>
                      {formatarMoeda(comanda.total)}
                    </td>

                    <td>
                      <button
                        onClick={() =>
                          selecionarComanda(
                            comanda.id
                          )
                        }
                        style={{
                          ...buttonStyle,
                          padding: "8px 10px",
                          fontSize: "13px",
                          background:
                            comanda.status ===
                            "fechada"
                              ? "#6b7280"
                              : "#111827",
                        }}
                      >
                        {comanda.status === "fechada"
                          ? "Visualizar"
                          : "Operar"}
                      </button>
                    </td>
                  </tr>
                ))}

                {comandas.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      align="center"
                      style={{ padding: "20px" }}
                    >
                      Nenhuma comanda encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside
          style={{
            ...cardStyle,
            fontSize: "13px",
          }}
        >
          {!comandaSelecionada ? (
            <div>
              <h2>Operação da Comanda</h2>

              <p style={{ color: "#6b7280" }}>
                Selecione uma comanda para visualizar
                itens, adicionar serviços ou produtos e
                fechar o atendimento.
              </p>
            </div>
          ) : (
            <div>
              <h2>
                Comanda #{comandaSelecionada.id}
              </h2>

              <p>
                <strong>Cliente:</strong>{" "}
                {comandaSelecionada.cliente_nome ||
                  "CLIENTE AVULSO"}
              </p>

              <p>
                <strong>Barbeiro:</strong>{" "}
                {comandaSelecionada.barbeiro_nome ||
                  "-"}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {comandaSelecionada.status?.toUpperCase()}
              </p>

              <p>
                <strong>Abertura:</strong>{" "}
                {formatarData(
                  comandaSelecionada.data_abertura
                )}
              </p>

              <hr style={{ margin: "15px 0" }} />

              {carregandoAssinatura && (
                <p style={{ color: "#6b7280" }}>
                  Consultando assinatura...
                </p>
              )}

              {!carregandoAssinatura &&
                assinaturaComanda?.possui_assinatura &&
                assinatura && (
                  <div
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      marginBottom: "15px",
                      background:
                        assinaturaComanda.pode_usar_plano
                          ? "#eff6ff"
                          : "#fff7ed",
                      border:
                        assinaturaComanda.pode_usar_plano
                          ? "1px solid #93c5fd"
                          : "1px solid #fdba74",
                    }}
                  >
                    <strong>
                      CLIENTE ASSINANTE
                    </strong>

                    <p style={{ margin: "8px 0 0" }}>
                      <strong>Plano:</strong>{" "}
                      {assinatura.plano_nome || "-"}
                    </p>

                    <p style={{ margin: "6px 0 0" }}>
                      <strong>Status:</strong>{" "}
                      {assinatura.status}
                    </p>

                    <p style={{ margin: "6px 0 0" }}>
                      <strong>Pagamento:</strong>{" "}
                      {assinatura.status_pagamento}
                    </p>

                    <p style={{ margin: "6px 0 0" }}>
                      <strong>Usos restantes:</strong>{" "}
                      {assinatura.usos_disponiveis}
                    </p>

                    <p style={{ margin: "6px 0 0" }}>
                      <strong>Vencimento:</strong>{" "}
                      {formatarData(
                        assinatura.data_proximo_vencimento
                      )}
                    </p>

                    {!assinaturaComanda.pode_usar_plano &&
                      assinaturaComanda.motivo && (
                        <p
                          style={{
                            color: "#9a3412",
                            margin: "8px 0 0",
                          }}
                        >
                          {assinaturaComanda.motivo}
                        </p>
                      )}
                  </div>
                )}

              {!carregandoAssinatura &&
                assinaturaComanda &&
                !assinaturaComanda.possui_assinatura && (
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      marginBottom: "15px",
                      background: "#f3f4f6",
                      color: "#4b5563",
                    }}
                  >
                    Cliente sem assinatura disponível.
                  </div>
                )}

              <h3>Itens</h3>

              {comandaSelecionada.itens?.length > 0 ? (
                <table
                  width="100%"
                  cellPadding="8"
                  style={{
                    borderCollapse: "collapse",
                    marginBottom: "15px",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#f3f4f6",
                        textAlign: "left",
                      }}
                    >
                      <th>Descrição</th>
                      <th>Qtd.</th>
                      <th>Subtotal</th>
                      <th>Situação</th>
                    </tr>
                  </thead>

                  <tbody>
                    {comandaSelecionada.itens.map(
                      (item) => (
                        <tr
                          key={item.id}
                          style={{
                            borderBottom:
                              "1px solid #eee",
                          }}
                        >
                          <td>
                            <strong>
                              {item.descricao}
                            </strong>

                            <br />

                            <small>
                              {item.tipo}
                            </small>
                          </td>

                          <td>{item.quantidade}</td>

                          <td>
                            {formatarMoeda(
                              item.subtotal
                            )}
                          </td>

                          <td>
                            {item.tipo === "servico" &&
                            item.pago_com_plano ? (
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "5px 8px",
                                  borderRadius: "999px",
                                  background: "#dbeafe",
                                  color: "#1d4ed8",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                }}
                              >
                                PLANO
                              </span>
                            ) : item.tipo ===
                              "servico" ? (
                              <div>
                                <span
                                  style={{
                                    display:
                                      "inline-block",
                                    padding:
                                      "5px 8px",
                                    borderRadius:
                                      "999px",
                                    background:
                                      "#f3f4f6",
                                    color: "#374151",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    marginBottom:
                                      "6px",
                                  }}
                                >
                                  AVULSO
                                </span>

                                {comandaSelecionada.status === "aberta" &&
                                assinaturaComanda?.pode_usar_plano &&
                                item.quantidade === 1 &&
                                (
                                  assinatura?.servicos_permitidos_ids || []
                                ).includes(Number(item.servico_id)) && (
                                    <div>
                                      <button
                                        onClick={() =>
                                          utilizarPlanoNoItem(
                                            item
                                          )
                                        }
                                        disabled={
                                          usandoPlanoItemId ===
                                          item.id
                                        }
                                        style={{
                                          ...buttonStyle,
                                          padding:
                                            "6px 8px",
                                          fontSize:
                                            "11px",
                                          background:
                                            "#2563eb",
                                          opacity:
                                            usandoPlanoItemId ===
                                            item.id
                                              ? 0.6
                                              : 1,
                                        }}
                                      >
                                        {usandoPlanoItemId ===
                                        item.id
                                          ? "Utilizando..."
                                          : "Usar Plano"}
                                      </button>
                                    </div>
                                  )}
                              </div>
                            ) : item.tipo === "mensalidade_plano" ? (
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "5px 8px",
                                  borderRadius: "999px",
                                  background: "#ede9fe",
                                  color: "#6d28d9",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                }}
                              >
                                MENSALIDADE
                              </span>
                            ) : (
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "5px 8px",
                                  borderRadius: "999px",
                                  background: "#fef3c7",
                                  color: "#92400e",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                }}
                              >
                                PRODUTO
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: "#6b7280" }}>
                  Nenhum item adicionado.
                </p>
              )}

              <h2>
                Total a pagar:{" "}
                {formatarMoeda(
                  comandaSelecionada.total
                )}
              </h2>

              {comandaSelecionada.status ===
                "aberta" && (
                <>
                  <hr
                    style={{ margin: "15px 0" }}
                  />

                  <h3>Adicionar Serviço</h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "1fr 90px",
                      gap: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <select
                      value={servicoId}
                      onChange={(event) =>
                        setServicoId(
                          event.target.value
                        )
                      }
                      style={inputStyle}
                    >
                      <option value="">
                        Selecione o serviço
                      </option>

                      {servicos.map((servico) => (
                        <option
                          key={servico.id}
                          value={servico.id}
                        >
                          {servico.nome} -{" "}
                          {formatarMoeda(
                            servico.preco
                          )}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={quantidadeServico}
                      onChange={(event) =>
                        setQuantidadeServico(
                          event.target.value
                        )
                      }
                      style={inputStyle}
                    />
                  </div>

                  <button
                    onClick={adicionarServico}
                    style={buttonStyle}
                  >
                    Adicionar Serviço
                  </button>

                  <hr
                    style={{ margin: "15px 0" }}
                  />

                  <h3>Adicionar Produto</h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "1fr 90px",
                      gap: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <select
                      value={produtoId}
                      onChange={(event) =>
                        setProdutoId(
                          event.target.value
                        )
                      }
                      style={inputStyle}
                    >
                      <option value="">
                        Selecione o produto
                      </option>

                      {produtos.map((produto) => (
                        <option
                          key={produto.id}
                          value={produto.id}
                        >
                          {produto.nome} -{" "}
                          {formatarMoeda(
                            produto.preco_venda
                          )}{" "}
                          | Estoque: {produto.estoque}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={quantidadeProduto}
                      onChange={(event) =>
                        setQuantidadeProduto(
                          event.target.value
                        )
                      }
                      style={inputStyle}
                    />
                  </div>

                  <button
                    onClick={adicionarProduto}
                    style={buttonStyle}
                  >
                    Adicionar Produto
                  </button>

                  <hr
                    style={{ margin: "15px 0" }}
                  />

                  <h3>Adicionar Pagamento do Plano</h3>

                  {!assinaturaComanda?.possui_assinatura ? (
                    <div style={{ background: "#f3f4f6", padding: "10px", borderRadius: "8px", marginBottom: "10px" }}>
                      Cliente sem assinatura cadastrada. A contratação deve ser feita em Assinaturas.
                    </div>
                  ) : assinaturaComanda?.pode_pagar_mensalidade ? (
                    <div style={{ marginBottom: "10px" }}>
                      <p style={{ margin: "0 0 6px" }}>
                        <strong>Plano:</strong>{" "}
                        {assinaturaComanda.assinatura?.plano_nome || "Plano do cliente"}
                      </p>
                      <p style={{ margin: "0 0 6px" }}>
                        <strong>Situação:</strong>{" "}
                        {assinaturaComanda.assinatura?.status} /{" "}
                        {assinaturaComanda.assinatura?.status_pagamento}
                      </p>
                      <p style={{ margin: "0 0 10px" }}>
                        <strong>Mensalidade:</strong>{" "}
                        {formatarMoeda(assinaturaComanda.valor_mensalidade)}{" "}
                        ({assinaturaComanda.referencia_mensalidade})
                      </p>
                      <button
                        onClick={adicionarMensalidadePlano}
                        disabled={
                          adicionandoMensalidade ||
                          comandaSelecionada.itens?.some(
                            (item) => item.tipo === "mensalidade_plano"
                          )
                        }
                        style={{
                          ...buttonStyle,
                          background: "#7c3aed",
                          opacity: adicionandoMensalidade ? 0.6 : 1,
                        }}
                      >
                        {adicionandoMensalidade
                          ? "Adicionando..."
                          : "Adicionar Mensalidade"}
                      </button>
                    </div>
                  ) : (
                    <div style={{ background: "#dcfce7", color: "#166534", padding: "10px", borderRadius: "8px", marginBottom: "10px" }}>
                      A assinatura não possui mensalidade pendente.
                    </div>
                  )}

                  <hr
                    style={{ margin: "15px 0" }}
                  />

                 <h3>Fechar Comanda</h3>

                {assinaturaComanda?.pode_usar_plano &&
                  comandaSelecionada.itens?.some(
                    (item) =>
                      item.tipo === "servico" &&
                      !item.pago_com_plano &&
                      item.quantidade === 1
                  ) && (
                    <button
                      onClick={utilizarPlanoNosItensElegiveis}
                      disabled={usandoPlanoItemId === "todos"}
                      style={{
                        ...buttonStyle,
                        width: "100%",
                        marginBottom: "10px",
                        background: "#2563eb",
                        opacity:
                          usandoPlanoItemId === "todos"
                            ? 0.6
                            : 1,
                      }}
                    >
                      {usandoPlanoItemId === "todos"
                        ? "Utilizando plano..."
                        : "Usar plano nos serviços elegíveis"}
                    </button>
                  )}

                {Number(comandaSelecionada.total || 0) > 0 ? (
                  <>
                  <select
                    value={formaPagamento}
                    onChange={(event) =>
                      setFormaPagamento(event.target.value)
                    }
                    style={{
                      ...inputStyle,
                      marginBottom: "10px",
                    }}
                  >
                    <option value="mp_pix">PIX pelo Mercado Pago</option>

                    <option value="mp_cartao">Cartão pelo Mercado Pago</option>

                    <option value="pix_manual">PIX já recebido fora do sistema</option>

                    <option value="dinheiro">
                      Dinheiro
                    </option>

                    <option value="debito">
                      Débito já recebido na maquininha
                    </option>

                    <option value="credito">
                      Crédito já recebido na maquininha
                    </option>
                  </select>
                  {(formaPagamento === "mp_pix" || formaPagamento === "mp_cartao") && (
                    <input
                      type="email"
                      value={payerEmail}
                      onChange={(event) => setPayerEmail(event.target.value)}
                      placeholder="E-mail do pagador"
                      style={{ ...inputStyle, marginBottom: "10px" }}
                    />
                  )}
                  </>
                ) : (
                  <div
                    style={{
                      background: "#dbeafe",
                      color: "#1d4ed8",
                      padding: "10px",
                      borderRadius: "8px",
                      marginBottom: "10px",
                    }}
                  >
                    Comanda integralmente coberta pelo plano.
                  </div>
                )}

                <button
                  onClick={fecharComandaSelecionada}
                  disabled={processandoPagamento}
                  style={{
                    ...dangerButtonStyle,
                    opacity: processandoPagamento ? 0.6 : 1,
                  }}
                >
                  {processandoPagamento
                    ? "Processando..."
                    : formaPagamento === "mp_pix"
                      ? "Gerar PIX Mercado Pago"
                      : formaPagamento === "mp_cartao"
                        ? "Pagar com cartão"
                        : "Confirmar recebimento e fechar"}
                </button>

                <div style={{ display: "grid", gap: "8px", marginTop: "12px" }}>
                  {!usuarioEhBarbeiro && (
                    <button
                      onClick={cancelarPagamentoOnline}
                      disabled={processandoPagamento}
                      style={{ ...buttonStyle, opacity: processandoPagamento ? 0.6 : 1 }}
                    >
                      Cancelar pagamento online pendente
                    </button>
                  )}

                  <button
                    onClick={cancelarComandaSelecionada}
                    disabled={processandoPagamento}
                    style={{ ...buttonStyle, opacity: processandoPagamento ? 0.6 : 1 }}
                  >
                    Cancelar comanda
                  </button>

                  {["admin", "gerente", "superadmin"].includes(perfilUsuario) && (
                    <button
                      onClick={excluirComandaSelecionada}
                      disabled={processandoPagamento}
                      style={{ ...dangerButtonStyle, opacity: processandoPagamento ? 0.6 : 1 }}
                    >
                      Excluir comanda de teste
                    </button>
                  )}
                </div>
                </>
              )}

              {comandaSelecionada.status ===
                "fechada" && (
                <div
                  style={{
                    background: "#f3f4f6",
                    borderRadius: "8px",
                    padding: "14px",
                    marginTop: "15px",
                  }}
                >
                  <strong>Comanda fechada.</strong>

                  <p style={{ margin: "8px 0 0" }}>
                    <strong>Pagamento:</strong>{" "}
                    {formatarPagamento(
                      comandaSelecionada.forma_pagamento
                    )}
                  </p>

                  <p style={{ margin: "8px 0 0" }}>
                    <strong>Fechamento:</strong>{" "}
                    {formatarData(
                      comandaSelecionada.data_fechamento
                    )}
                  </p>
                </div>
              )}

              {comandaSelecionada.status === "cancelada" && (
                <div style={{ marginTop: "15px" }}>
                  <div style={{ background: "#f3f4f6", borderRadius: "8px", padding: "14px" }}>
                    <strong>Comanda cancelada.</strong>
                    <p style={{ margin: "8px 0 0" }}>O histórico foi preservado.</p>
                  </div>
                  {["admin", "gerente", "superadmin"].includes(perfilUsuario) && (
                    <button
                      onClick={excluirComandaSelecionada}
                      disabled={processandoPagamento}
                      style={{ ...dangerButtonStyle, marginTop: "10px", opacity: processandoPagamento ? 0.6 : 1 }}
                    >
                      Excluir comanda de teste
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </aside>
      </section>

      {cartaoAberto && comandaSelecionada && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.55)", display: "flex",
          alignItems: "center", justifyContent: "center", padding: "20px",
        }}>
          <div style={{ ...cardStyle, width: "100%", maxWidth: "720px", maxHeight: "90vh", overflow: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>Pagamento da comanda #{comandaSelecionada.id}</h2>
              <button type="button" onClick={() => setCartaoAberto(false)} style={buttonStyle}>X</button>
            </div>
            <p>Total: <strong>{formatarMoeda(comandaSelecionada.total)}</strong></p>
            <CardPayment
              initialization={{ amount: Number(comandaSelecionada.total || 0) }}
              customization={{ paymentMethods: { minInstallments: 1, maxInstallments: 12 } }}
              onSubmit={processarCartao}
              onReady={() => {}}
              onError={(error) => {
                console.error("Erro CardPayment:", error);
                setErro("Erro ao carregar o pagamento com cartão.");
              }}
            />
          </div>
        </div>
      )}

      {pixCobranca && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.55)", display: "flex",
          alignItems: "center", justifyContent: "center", padding: "20px",
        }}>
          <div style={{ ...cardStyle, width: "100%", maxWidth: "560px", textAlign: "center" }}>
            <h2>PIX Mercado Pago</h2>
            <p>Valor: <strong>{formatarMoeda(pixCobranca.valor)}</strong></p>
            {pixCobranca.qr_code_base64 && (
              <img
                src={`data:image/png;base64,${pixCobranca.qr_code_base64}`}
                alt="QR Code PIX"
                style={{ width: "260px", maxWidth: "100%" }}
              />
            )}
            {pixCobranca.qr_code && (
              <>
                <textarea readOnly value={pixCobranca.qr_code} style={{ ...inputStyle, minHeight: "90px", marginTop: "12px" }} />
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(pixCobranca.qr_code)}
                  style={{ ...buttonStyle, marginTop: "10px", marginRight: "10px" }}
                >
                  Copiar PIX
                </button>
              </>
            )}
            {pixCobranca.ticket_url && (
              <a href={pixCobranca.ticket_url} target="_blank" rel="noreferrer" style={{ display: "block", margin: "12px 0" }}>
                Abrir pagamento no Mercado Pago
              </a>
            )}
            <button type="button" onClick={() => setPixCobranca(null)} style={{ ...buttonStyle, marginTop: "10px" }}>
              Fechar janela
            </button>
            <p style={{ color: "#92400e", marginTop: "14px" }}>
              A comanda permanecerá aberta até o pagamento ser confirmado.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
