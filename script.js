// =====================================================
// FASE 1: CLASSE PRODUTO
// =====================================================

class Produto {
    #preco;
    #quantidade;

    constructor(nome, preco, quantidade) {
        nome = String(nome).trim();

        if (!nome) {
            throw new Error("O nome do produto não pode ficar em branco.");
        }

        this.nome = nome;
        this.preco = preco;
        this.quantidade = quantidade;
    }

    get preco() {
        return this.#preco;
    }

    set preco(novoPreco) {
        novoPreco = Number(novoPreco);

        if (!Number.isFinite(novoPreco) || novoPreco <= 0) {
            throw new Error("O preço deve ser maior que zero.");
        }

        this.#preco = novoPreco;
    }

    get quantidade() {
        return this.#quantidade;
    }

    set quantidade(novaQuantidade) {
        novaQuantidade = Number(novaQuantidade);

        if (!Number.isInteger(novaQuantidade) || novaQuantidade <= 0) {
            throw new Error("A quantidade deve ser um inteiro maior que zero.");
        }

        this.#quantidade = novaQuantidade;
    }

    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}


// =====================================================
// FASE 2: GERENCIAMENTO DOS PRODUTOS
// =====================================================

const listaDeProdutos = [];
const CHAVE_STORAGE = "sistema_estoque_produtos";

let indiceEdicao = null;
let indiceAutopreenchido = null;


// =====================================================
// FASE 3: ELEMENTOS DO HTML
// =====================================================

const formProduto = document.getElementById("produto-form");
const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");

const nomeInput = document.getElementById("nome");
const precoInput = document.getElementById("preco");
const quantidadeInput = document.getElementById("quantidade");

const campoBusca = document.getElementById("campo-busca");
const mensagemVazia = document.getElementById("mensagem-vazia");

const tabelaBody = document.querySelector("#tabela-produtos tbody");

// V5: mensagens inline
const mensagemFeedback = document.getElementById("mensagem-feedback");

// V5: modal de confirmação
const modalConfirmacao = document.getElementById("modal-confirmacao");
const modalMensagem = document.getElementById("modal-mensagem");
const modalBtnCancelar = document.getElementById("modal-btn-cancelar");
const modalBtnConfirmar = document.getElementById("modal-btn-confirmar");

// V5: modal Conceito Bootstrap
const btnConceitoBootstrap = document.getElementById("btn-conceito-bootstrap");
const modalBootstrap = document.getElementById("modal-bootstrap");
const modalBsFechar = document.getElementById("modal-bs-fechar");

const btnEnviar = formProduto
    ? formProduto.querySelector('button[type="submit"]')
    : null;

const textoBotaoOriginal = btnEnviar
    ? btnEnviar.textContent.trim()
    : "Adicionar Produto";

function alterarTextoBotao(texto) {
    if (btnEnviar) {
        btnEnviar.textContent = texto;
    }
}


// =====================================================
// FASE 4: MENSAGENS INLINE (SUBSTITUI O alert)
// =====================================================

let temporizadorMensagem = null;

function mostrarMensagem(texto, tipo = "erro") {

    if (!mensagemFeedback) return;

    mensagemFeedback.textContent = texto;
    mensagemFeedback.className = "mensagem-feedback " + tipo;
    mensagemFeedback.hidden = false;

    clearTimeout(temporizadorMensagem);

    // Sucesso some sozinho; erro some depois de mais tempo
    const duracao = tipo === "sucesso" ? 3500 : 6000;

    temporizadorMensagem = setTimeout(esconderMensagem, duracao);
}

function esconderMensagem() {

    if (!mensagemFeedback) return;

    mensagemFeedback.hidden = true;
    mensagemFeedback.textContent = "";
}

function marcarCampoInvalido(campo) {

    campo.classList.add("campo-invalido");
    campo.focus();
}

function limparCamposInvalidos() {

    [nomeInput, precoInput, quantidadeInput].forEach(campo => {
        campo.classList.remove("campo-invalido");
    });
}

// Ao digitar, remove o destaque de erro do campo
[nomeInput, precoInput, quantidadeInput].forEach(campo => {
    campo.addEventListener("input", function() {
        campo.classList.remove("campo-invalido");
    });
});


// =====================================================
// FASE 5: MODAIS (SUBSTITUI O confirm)
// =====================================================

let resolverConfirmacao = null;
let elementoFocoAnterior = null;

// Retorna uma Promise: true (Confirmar) ou false (Cancelar)
function confirmarAcao(mensagem) {

    return new Promise(function(resolve) {

        elementoFocoAnterior = document.activeElement;

        modalMensagem.textContent = mensagem;
        modalConfirmacao.hidden = false;

        resolverConfirmacao = resolve;

        modalBtnCancelar.focus();
    });
}

function fecharModalConfirmacao(resultado) {

    modalConfirmacao.hidden = true;

    if (resolverConfirmacao) {
        const resolver = resolverConfirmacao;
        resolverConfirmacao = null;
        resolver(resultado);
    }

    if (elementoFocoAnterior && elementoFocoAnterior.focus) {
        elementoFocoAnterior.focus();
    }
}

modalBtnConfirmar.addEventListener("click", function() {
    fecharModalConfirmacao(true);
});

modalBtnCancelar.addEventListener("click", function() {
    fecharModalConfirmacao(false);
});

// Clicar fora da caixa cancela
modalConfirmacao.addEventListener("click", function(event) {
    if (event.target === modalConfirmacao) {
        fecharModalConfirmacao(false);
    }
});

// Modal Conceito Bootstrap

function abrirModalBootstrap() {
    modalBootstrap.hidden = false;
    modalBsFechar.focus();
}

function fecharModalBootstrap() {
    modalBootstrap.hidden = true;
    btnConceitoBootstrap.focus();
}

btnConceitoBootstrap.addEventListener("click", abrirModalBootstrap);
modalBsFechar.addEventListener("click", fecharModalBootstrap);

modalBootstrap.addEventListener("click", function(event) {
    if (event.target === modalBootstrap) {
        fecharModalBootstrap();
    }
});

// Tecla ESC fecha os modais
document.addEventListener("keydown", function(event) {

    if (event.key !== "Escape") return;

    if (!modalConfirmacao.hidden) {
        fecharModalConfirmacao(false);
    } else if (!modalBootstrap.hidden) {
        fecharModalBootstrap();
    }
});


// =====================================================
// FASE 6: AUTOPREENCHIMENTO DE PRODUTOS
// =====================================================

nomeInput.addEventListener("input", function() {

    const nomeDigitado = nomeInput.value.trim().toLowerCase();

    const indiceEncontrado = listaDeProdutos.findIndex(produto =>
        produto.nome.toLowerCase() === nomeDigitado
    );

    if (indiceEncontrado !== -1) {

        const produto = listaDeProdutos[indiceEncontrado];

        // Preencher informações automaticamente
        precoInput.value = produto.preco;
        quantidadeInput.value = produto.quantidade;

        // Ativar edição do produto encontrado
        indiceEdicao = indiceEncontrado;
        indiceAutopreenchido = indiceEncontrado;

        alterarTextoBotao("Salvar Alterações");

    } else if (indiceAutopreenchido !== null) {

        // O nome digitado não corresponde mais ao produto
        indiceEdicao = null;
        indiceAutopreenchido = null;

        precoInput.value = "";
        quantidadeInput.value = "";

        alterarTextoBotao(textoBotaoOriginal);
    }
});


// =====================================================
// FASE 7: SALVAR NO LOCALSTORAGE
// =====================================================

function salvarNoLocalStorage() {

    const dadosParaSalvar = listaDeProdutos.map(produto => ({
        nome: produto.nome,
        preco: produto.preco,
        quantidade: produto.quantidade
    }));

    localStorage.setItem(
        CHAVE_STORAGE,
        JSON.stringify(dadosParaSalvar)
    );
}


// =====================================================
// FASE 8: CARREGAR DO LOCALSTORAGE
// =====================================================

function carregarDoLocalStorage() {

    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (!dadosSalvos) return;

    try {

        const produtosSalvos = JSON.parse(dadosSalvos);

        if (!Array.isArray(produtosSalvos)) {
            throw new Error("Formato de dados inválido.");
        }

        produtosSalvos.forEach(dados => {

            try {

                listaDeProdutos.push(
                    new Produto(
                        dados.nome,
                        dados.preco,
                        dados.quantidade
                    )
                );

            } catch (erro) {
                console.warn("Produto inválido ignorado:", erro.message);
            }
        });

    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);
    }
}


// =====================================================
// FASE 9: VALIDAR E ENVIAR O FORMULÁRIO
// =====================================================

if (formProduto) {

    formProduto.addEventListener("submit", function(event) {

        event.preventDefault();

        limparCamposInvalidos();

        const nome = nomeInput.value.trim();
        const preco = Number(precoInput.value);
        const quantidade = Number(quantidadeInput.value);

        // CLÁUSULAS DE GUARDA

        if (nome === "") {
            mostrarMensagem("Digite o nome do produto.", "erro");
            marcarCampoInvalido(nomeInput);
            return;
        }

        if (
            precoInput.value.trim() === "" ||
            !Number.isFinite(preco) ||
            preco <= 0
        ) {
            mostrarMensagem("Digite um preço válido (maior que zero).", "erro");
            marcarCampoInvalido(precoInput);
            return;
        }

        if (
            quantidadeInput.value.trim() === "" ||
            !Number.isInteger(quantidade) ||
            quantidade <= 0
        ) {
            mostrarMensagem("Digite uma quantidade inteira válida (maior que zero).", "erro");
            marcarCampoInvalido(quantidadeInput);
            return;
        }

        try {

            const novoProduto = new Produto(nome, preco, quantidade);

            let textoSucesso;

            if (indiceEdicao === null) {

                // CADASTRAR PRODUTO
                listaDeProdutos.push(novoProduto);
                textoSucesso = "Produto cadastrado com sucesso!";

            } else {

                // ATUALIZAR PRODUTO EXISTENTE
                listaDeProdutos[indiceEdicao] = novoProduto;
                textoSucesso = "Produto atualizado com sucesso!";
            }

            salvarNoLocalStorage();
            atualizarInterface();

            // VOLTAR AO MODO DE CADASTRO
            indiceEdicao = null;
            indiceAutopreenchido = null;

            formProduto.reset();

            alterarTextoBotao(textoBotaoOriginal);

            mostrarMensagem(textoSucesso, "sucesso");

        } catch (erro) {
            mostrarMensagem(erro.message, "erro");
        }
    });
}


// =====================================================
// FASE 10: PREPARAR EDIÇÃO
// =====================================================

function prepararEdicao(index) {

    if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= listaDeProdutos.length
    ) {
        mostrarMensagem("Não foi possível encontrar esse produto.", "erro");
        return;
    }

    const produto = listaDeProdutos[index];

    limparCamposInvalidos();
    esconderMensagem();

    nomeInput.value = produto.nome;
    precoInput.value = produto.preco;
    quantidadeInput.value = produto.quantidade;

    indiceEdicao = index;
    indiceAutopreenchido = null;

    alterarTextoBotao("Salvar Alterações");

    nomeInput.focus();
}


// =====================================================
// FASE 11: REMOVER UM PRODUTO (COM MODAL)
// =====================================================

async function removerProduto(index) {

    if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= listaDeProdutos.length
    ) {
        return;
    }

    const nomeProduto = listaDeProdutos[index].nome;

    // Aguarda a resposta do usuário no modal
    const confirmou = await confirmarAcao(
        `Deseja realmente remover "${nomeProduto}"? Essa ação não pode ser desfeita.`
    );

    if (!confirmou) return;

    listaDeProdutos.splice(index, 1);

    if (indiceEdicao === index) {

        indiceEdicao = null;
        indiceAutopreenchido = null;

        formProduto.reset();

        alterarTextoBotao(textoBotaoOriginal);

    } else if (indiceEdicao !== null && index < indiceEdicao) {

        indiceEdicao--;
    }

    // Ajustar índice do autopreenchimento

    if (indiceAutopreenchido === index) {

        indiceAutopreenchido = null;

    } else if (
        indiceAutopreenchido !== null &&
        index < indiceAutopreenchido
    ) {

        indiceAutopreenchido--;
    }

    salvarNoLocalStorage();
    atualizarInterface();

    mostrarMensagem("Produto removido com sucesso!", "sucesso");
}


// =====================================================
// FASE 12: LIMPAR TODOS OS PRODUTOS (COM MODAL)
// =====================================================

if (btnLimparTudo) {

    btnLimparTudo.addEventListener("click", async function() {

        if (listaDeProdutos.length === 0) {
            mostrarMensagem("Não há produtos para excluir.", "erro");
            return;
        }

        const confirmou = await confirmarAcao(
            "Deseja realmente excluir TODOS os produtos? Essa ação não pode ser desfeita."
        );

        if (!confirmou) return;

        listaDeProdutos.length = 0;

        indiceEdicao = null;
        indiceAutopreenchido = null;

        localStorage.removeItem(CHAVE_STORAGE);

        formProduto.reset();
        limparCamposInvalidos();

        if (campoBusca) {
            campoBusca.value = "";
        }

        alterarTextoBotao(textoBotaoOriginal);

        atualizarInterface();

        mostrarMensagem("Todos os produtos foram excluídos.", "sucesso");
    });
}


// =====================================================
// FASE 13: FILTRAR PRODUTOS COM FILTER()
// =====================================================

function obterProdutosFiltrados() {

    const termoBusca = campoBusca.value
        .trim()
        .toLowerCase();

    return listaDeProdutos

        .map((produto, index) => ({
            produto: produto,
            index: index
        }))

        .filter(item => {

            return item.produto.nome
                .toLowerCase()
                .includes(termoBusca);
        });
}


// =====================================================
// FASE 14: CALCULAR TOTAL COM REDUCE()
// =====================================================

function atualizarTotalEstoque(produtosVisiveis) {

    const valorTotal = produtosVisiveis.reduce(
        (acumulador, item) => {
            return acumulador + item.produto.calcularSubtotal();
        },
        0
    );

    const valorFormatado = valorTotal.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    totalEstoqueEl.textContent =
        `Total em Estoque: ${valorFormatado}`;
}


// =====================================================
// FASE 15: RENDERIZAR A TABELA
// =====================================================

function renderizarTabela(produtosVisiveis) {

    tabelaBody.innerHTML = "";

    // VERIFICAR SE EXISTEM PRODUTOS

    mensagemVazia.hidden = produtosVisiveis.length !== 0;

    produtosVisiveis.forEach(item => {

        const produto = item.produto;
        const index = item.index;

        const linha = document.createElement("tr");

        // NOME

        const celulaNome = document.createElement("td");
        celulaNome.textContent = produto.nome;

        // PREÇO

        const celulaPreco = document.createElement("td");

        celulaPreco.textContent = produto.preco.toLocaleString(
            "pt-BR",
            { style: "currency", currency: "BRL" }
        );

        // QUANTIDADE

        const celulaQuantidade = document.createElement("td");
        celulaQuantidade.textContent = produto.quantidade;

        // SUBTOTAL

        const celulaSubtotal = document.createElement("td");

        celulaSubtotal.textContent =
            produto.calcularSubtotal().toLocaleString(
                "pt-BR",
                { style: "currency", currency: "BRL" }
            );

        // AÇÕES

        const celulaAcoes = document.createElement("td");

        const btnEditar = document.createElement("button");

        btnEditar.type = "button";
        btnEditar.className = "btn-editar";
        btnEditar.textContent = "Editar";

        btnEditar.addEventListener("click", function() {
            prepararEdicao(index);
        });

        const btnRemover = document.createElement("button");

        btnRemover.type = "button";
        btnRemover.className = "btn-remover";
        btnRemover.textContent = "Remover";

        btnRemover.addEventListener("click", function() {
            removerProduto(index);
        });

        celulaAcoes.append(btnEditar, btnRemover);

        linha.append(
            celulaNome,
            celulaPreco,
            celulaQuantidade,
            celulaSubtotal,
            celulaAcoes
        );

        tabelaBody.appendChild(linha);
    });
}


// =====================================================
// FASE 16: ATUALIZAR INTERFACE
// =====================================================

function atualizarInterface() {

    const produtosVisiveis = obterProdutosFiltrados();

    renderizarTabela(produtosVisiveis);

    atualizarTotalEstoque(produtosVisiveis);
}


// =====================================================
// FASE 17: PESQUISA DINÂMICA COM EVENTO INPUT
// =====================================================

if (campoBusca) {

    campoBusca.addEventListener("input", function() {
        atualizarInterface();
    });
}


// =====================================================
// FASE 18: INICIAR O SISTEMA
// =====================================================

carregarDoLocalStorage();

atualizarInterface();