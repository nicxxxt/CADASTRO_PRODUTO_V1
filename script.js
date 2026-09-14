//
// FASE 1: Modelagem dos dados (Classe Base)
//

// A classe funciona como um molde para criar produtos
class Produto {

    // atributos privados
    #preco;
    #quantidade;

    constructor(nome, preco, quantidade) {

        // verifica se o nome está vazio
        if (nome.trim() === "") {
            throw new Error("O nome do produto não pode ficar vazio!");
        }

        // transforma o preço e a quantidade em números
        preco = parseFloat(preco);
        quantidade = parseInt(quantidade);

        // verifica se o preço é válido
        if (preco <= 0) {
            throw new Error("O preço deve ser maior que zero!");
        }

        // verifica se a quantidade é válida
        if (quantidade <= 0) {
            throw new Error("A quantidade deve ser maior que zero!");
        }

        // salva os dados
        this.nome = nome;
        this.#preco = preco;
        this.#quantidade = quantidade;
    }

    // getter para conseguir pegar o preço
    get preco() {
        return this.#preco;
    }

    // getter para conseguir pegar a quantidade
    get quantidade() {
        return this.#quantidade;
    }

    // método que calcula o subtotal
    calcularSubtotal() {
        return this.#preco * this.#quantidade;
    }
}


//
// FASE 2: Gerenciamento de Estado (memória)
//

// Array que vai guardar os produtos
const listaDeProdutos = [];


//
// FASE 3: Escuta de Eventos do DOM
//

// seleciona o formulário
const formProduto = document.getElementById("produto-form");

// quando o formulário for enviado
formProduto.addEventListener("submit", function(event) {

    event.preventDefault();

    // pega os valores digitados
    const nomeInput = document.getElementById("nome").value;
    const precoInput = document.getElementById("preco").value;
    const quantidadeInput = document.getElementById("quantidade").value;

    // try tenta executar o código
    try {

        // cria um novo produto
        const novoProduto = new Produto(
            nomeInput,
            precoInput,
            quantidadeInput
        );

        // coloca o produto na lista
        listaDeProdutos.push(novoProduto);

        // atualiza a tabela
        renderizarTabela();

        // atualiza o valor total do estoque
        atualizarTotalEstoque();

        // limpa o formulário
        formProduto.reset();

    } catch (erro) {

        // mostra o erro para o usuário
        alert(erro.message);
    }
});


//
// FASE 4: Renderização da Interface DOM
//

// função que mostra os produtos na tabela
function renderizarTabela() {

    // pega o corpo da tabela
    const tabelaBody = document.querySelector("#tabela-produtos tbody");

    // limpa a tabela
    tabelaBody.innerHTML = "";

    // percorre todos os produtos
    listaDeProdutos.forEach((produto, index) => {

        // cria uma nova linha
        const linha = document.createElement("tr");

        // coloca as informações do produto na linha
        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.calcularSubtotal().toFixed(2)}</td>
            <td>
                <button class="btn-remover" onclick="removerProduto(${index})">
                    Remover
                </button>
            </td>
        `;

        // coloca a linha dentro da tabela
        tabelaBody.appendChild(linha);
    });
}


//
// FASE 5: Total do Estoque
//

// função que calcula o valor total do estoque
function atualizarTotalEstoque() {

    // soma o subtotal de todos os produtos
    const total = listaDeProdutos.reduce((soma, produto) => {
        return soma + produto.calcularSubtotal();
    }, 0);

    // pega o h3 onde vai aparecer o total
    const totalEstoque = document.getElementById("total-estoque");

    // mostra o total formatado em reais
    totalEstoque.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


//
// FASE 6: Remover Produto
//

// função que remove um produto da lista
function removerProduto(index) {

    // remove 1 produto a partir do índice informado
    listaDeProdutos.splice(index, 1);

    // atualiza a tabela
    renderizarTabela();

    // atualiza o total do estoque
    atualizarTotalEstoque();
}


//
// FASE 7: Limpar Todo o Estoque
//

// seleciona o botão de limpar a tabela
const botaoLimpar = document.getElementById("limpar-tabela");

// adiciona um evento de clique no botão
botaoLimpar.addEventListener("click", function() {

    // esvazia a lista de produtos
    listaDeProdutos.length = 0;

    // atualiza a tabela
    renderizarTabela();

    // atualiza o total do estoque
    atualizarTotalEstoque();
});

