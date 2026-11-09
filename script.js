

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

const btnEnviar = formProduto
    ? formProduto.querySelector('button[type="submit"]')
    : null;

const textoBotaoOriginal = btnEnviar
    ? btnEnviar.textContent
    : "Adicionar Produto";

function alterarTextoBotao(texto) {
    if (btnEnviar) {
        btnEnviar.textContent = texto;
    }
}


// =====================================================
// FASE 4: AUTOPREENCHIMENTO DE PRODUTOS
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
// FASE 5: SALVAR NO LOCALSTORAGE
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
// FASE 6: CARREGAR DO LOCALSTORAGE
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
// FASE 7: VALIDAR E ENVIAR O FORMULÁRIO
// =====================================================

if (formProduto) {

    formProduto.addEventListener("submit", function(event) {

        event.preventDefault();

        const nome = nomeInput.value.trim();
        const preco = Number(precoInput.value);
        const quantidade = Number(quantidadeInput.value);

        // VALIDAR NOME

        if (nome === "") {
            alert("Digite o nome do produto.");
            nomeInput.focus();
            return;
        }

        // VALIDAR PREÇO

        if (
            precoInput.value.trim() === "" ||
            !Number.isFinite(preco) ||
            preco <= 0
        ) {
            alert("Digite um preço válido.");
            precoInput.focus();
            return;
        }

        // VALIDAR QUANTIDADE

        if (
            quantidadeInput.value.trim() === "" ||
            !Number.isInteger(quantidade) ||
            quantidade <= 0
        ) {
            alert("Digite uma quantidade inteira válida.");
            quantidadeInput.focus();
            return;
        }

        try {

            const novoProduto = new Produto(
                nome,
                preco,
                quantidade
            );

            if (indiceEdicao === null) {

                // CADASTRAR PRODUTO
                listaDeProdutos.push(novoProduto);

                alert("Produto cadastrado com sucesso!");

            } else {

                // ATUALIZAR PRODUTO EXISTENTE
                listaDeProdutos[indiceEdicao] = novoProduto;

                alert("Produto atualizado com sucesso!");
            }

            // SALVAR E ATUALIZAR

            salvarNoLocalStorage();
            atualizarInterface();

            // VOLTAR AO MODO DE CADASTRO

            indiceEdicao = null;
            indiceAutopreenchido = null;

            formProduto.reset();

            alterarTextoBotao(textoBotaoOriginal);

        } catch (erro) {
            alert(erro.message);
        }
    });
}


// =====================================================
// FASE 8: PREPARAR EDIÇÃO
// =====================================================

function prepararEdicao(index) {

    if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= listaDeProdutos.length
    ) {
        alert("Não foi possível encontrar esse produto.");
        return;
    }

    const produto = listaDeProdutos[index];

    // PREENCHER OS CAMPOS

    nomeInput.value = produto.nome;
    precoInput.value = produto.preco;
    quantidadeInput.value = produto.quantidade;

    // ATIVAR MODO DE EDIÇÃO

    indiceEdicao = index;
    indiceAutopreenchido = null;

    alterarTextoBotao("Salvar Alterações");

    nomeInput.focus();
}


// =====================================================
// FASE 9: REMOVER UM PRODUTO
// =====================================================

function removerProduto(index) {

    if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= listaDeProdutos.length
    ) {
        return;
    }

    const confirmar = confirm(
        "Deseja realmente remover este produto?"
    );

    if (!confirmar) return;

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
}


// =====================================================
// FASE 10: LIMPAR TODOS OS PRODUTOS
// =====================================================

if (btnLimparTudo) {

    btnLimparTudo.addEventListener("click", function() {

        const confirmar = confirm(
            "Deseja realmente excluir todos os produtos?"
        );

        if (!confirmar) return;

        listaDeProdutos.length = 0;

        indiceEdicao = null;
        indiceAutopreenchido = null;

        localStorage.removeItem(CHAVE_STORAGE);

        formProduto.reset();

        if (campoBusca) {
            campoBusca.value = "";
        }

        alterarTextoBotao(textoBotaoOriginal);

        atualizarInterface();
    });
}


// =====================================================
// FASE 11: FILTRAR PRODUTOS COM FILTER()
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
// FASE 12: CALCULAR TOTAL COM REDUCE()
// =====================================================

function atualizarTotalEstoque(produtosVisiveis) {

    const valorTotal = produtosVisiveis.reduce(
        (acumulador, item) => {

            return acumulador +
                item.produto.calcularSubtotal();

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
// FASE 13: RENDERIZAR A TABELA
// =====================================================

function renderizarTabela(produtosVisiveis) {

    tabelaBody.innerHTML = "";

    // VERIFICAR SE EXISTEM PRODUTOS

    if (produtosVisiveis.length === 0) {

        mensagemVazia.hidden = false;

    } else {

        mensagemVazia.hidden = true;
    }

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
            {
                style: "currency",
                currency: "BRL"
            }
        );

        // QUANTIDADE

        const celulaQuantidade = document.createElement("td");
        celulaQuantidade.textContent = produto.quantidade;

        // SUBTOTAL

        const celulaSubtotal = document.createElement("td");

        celulaSubtotal.textContent =
            produto.calcularSubtotal().toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );

        // AÇÕES

        const celulaAcoes = document.createElement("td");

        // BOTÃO EDITAR

        const btnEditar = document.createElement("button");

        btnEditar.type = "button";
        btnEditar.className = "btn-editar";
        btnEditar.textContent = "Editar";

        btnEditar.addEventListener("click", function() {
            prepararEdicao(index);
        });

        // BOTÃO REMOVER

        const btnRemover = document.createElement("button");

        btnRemover.type = "button";
        btnRemover.className = "btn-remover";
        btnRemover.textContent = "Remover";

        btnRemover.addEventListener("click", function() {
            removerProduto(index);
        });

        // ADICIONAR BOTÕES

        celulaAcoes.append(btnEditar, btnRemover);

        // MONTAR LINHA

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
// FASE 14: ATUALIZAR INTERFACE
// =====================================================

function atualizarInterface() {

    // Obter produtos correspondentes à pesquisa

    const produtosVisiveis = obterProdutosFiltrados();

    // Atualizar tabela

    renderizarTabela(produtosVisiveis);

    // Atualizar total do estoque

    atualizarTotalEstoque(produtosVisiveis);
}


// =====================================================
// FASE 15: PESQUISA DINÂMICA COM EVENTO INPUT
// =====================================================

if (campoBusca) {

    campoBusca.addEventListener("input", function() {

        atualizarInterface();

    });
}


// =====================================================
// FASE 16: INICIAR O SISTEMA
// =====================================================

carregarDoLocalStorage();

atualizarInterface();
