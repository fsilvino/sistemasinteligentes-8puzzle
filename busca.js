function Busca() {

    this.maiorTamanhoFronteira = 0;
    this.quantidadeNodosAbertos = 0;
    this.fronteira = [];
    this.mapFronteira = new Map();
    this.estadosVisitados = new Map();
    this.solucao = [];
    this.fnCalcularHeuristica = null;
    this.fnEhEstadoFinal = null;
    this.fnCalcularCustoAresta = null;
    this.fnRetornarChaveDoEstado = null;

    this.reset = function () {
        this.maiorTamanhoFronteira = 0;
        this.quantidadeNodosAbertos = 0;
        this.fronteira = [];
        this.mapFronteira = new Map();
        this.estadosVisitados = new Map();
        this.solucao = [];
    };

    this.calcularHeuristica = function (estado) {
        if (this.fnCalcularHeuristica) {
            return this.fnCalcularHeuristica(estado);
        }
        return 0;
    };

    this.ehEstadoFinal = function (estado) {
        if (!this.fnEhEstadoFinal) {
            throw "Informe a função de verificação do estado final (fnEhEstadoFinal)!";
        }
        return this.fnEhEstadoFinal(estado);
    };

    this.calcularCustoAresta = function (estadoOrigem, estadoDestino) {
        if (this.fnCalcularCustoAresta) {
            return this.fnCalcularCustoAresta(estadoOrigem, estadoDestino);
        }
        return 1;
    };

    this.produzirNodosFilhos = function (nodo) {

        if (!this.fnProduzirNodosFilhos) {
            throw "Informe a função de produção de nodos filhos (fnProduzirNodosFilhos)!";
        }

        var proxEstados = this.fnProduzirNodosFilhos(nodo.estado);

        var nodosFilhos = [];

        for (var i = 0; i < proxEstados.length; i++) {
            var caminho = nodo.caminho.slice();
            caminho.push(proxEstados[i]);

            var h = this.calcularHeuristica(proxEstados[i]);
            var custo = nodo.custo + this.calcularCustoAresta(nodo.estado, proxEstados[i]);

            nodosFilhos.push({
                custo: custo,
                estado: proxEstados[i],
                caminho: caminho,
                heuristica: h,
                custoTotal: custo + h
            });
        }

        for (i = 0; i < nodosFilhos.length; i++) {
            var chaveEstado = this.gerarChaveDoEstado(nodosFilhos[i].estado);
            if (this.mapFronteira.get(chaveEstado)) {
                var posNaFronteira = this.encontrarEstadoNaFronteira(chaveEstado);
                if (this.fronteira[posNaFronteira].custoTotal > nodosFilhos[i].custoTotal) {
                    this.fronteira[posNaFronteira] = nodosFilhos[i];
                }
            } else if (!this.estadosVisitados.get(chaveEstado)) {
                this.quantidadeNodosAbertos++;
                this.fronteira.push(nodosFilhos[i]);
                this.mapFronteira.set(chaveEstado, true);
            }
        }

        this.fronteira.sort(this.ordenarFronteira);
    };

    this.buscar = function (estadoInicial) {
        this.reset();

        var custo = 1;
        var h = this.calcularHeuristica(estadoInicial);

        this.fronteira.push({
            custo: custo,
            caminho: [estadoInicial.slice()],
            estado: estadoInicial.slice(),
            heuristica: h,
            custoTotal: custo + h
        });

        this.mapFronteira.set(this.gerarChaveDoEstado(estadoInicial), true);

        return this._realizarBusca();
    };

    this._realizarBusca = function () {
        while (this.fronteira.length) {

            this.maiorTamanhoFronteira = Math.max(this.maiorTamanhoFronteira, this.fronteira.length);

            var nodo = this.fronteira.shift();
            var chaveEstado = this.gerarChaveDoEstado(nodo.estado);
            this.mapFronteira.delete(chaveEstado);

            if (this.ehEstadoFinal(nodo.estado)) {
                return nodo.caminho;
            }

            this.produzirNodosFilhos(nodo);
            this.estadosVisitados.set(chaveEstado, true);
        }
        return null;
    };

    this.ordenarFronteira = function (x, y) {
        if (x.custoTotal > y.custoTotal) {
            return 1;
        } else if (x.custoTotal < y.custoTotal) {
            return -1;
        }
        return 0;
    };

    this.gerarChaveDoEstado = function (estado) {
        if (this.fnRetornarChaveDoEstado) {
            return this.fnRetornarChaveDoEstado(estado);
        }
        return estado.toString();
    };

    this.encontrarEstadoNaFronteira = function (chaveEstado) {
        var idx = -1;
        for (var i = 0; i < this.fronteira.length; i++) {
            if (this.gerarChaveDoEstado(this.fronteira[i].estado) === chaveEstado) {
                idx = i;
                break;
            }
        }
        return idx;
    };
}



function Jogo() {
    this.solucao = [];
    this.estadoAtual = [];
    this.heuristica = 0;
    this.tempoPadraoMovimento = 1500;
    this.movimentos = [
        [1, 3], [-1, 1, 3], [-1, 3],
        [-3, 1, 3], [-3, -1, 1, 3], [-3, -1, 3],
        [-3, 1], [-3, -1, 1], [-3, -1]
    ];

    this.retornarChaveEstado = function (estado) {
        return estado.toString();
    };

    var self = this;
    this.busca = new Busca();
    this.busca.fnRetornarChaveDoEstado = this.retornarChaveEstado;

    this.busca.fnCalcularHeuristica = function (estado) {
        if (self.heuristica === 1) {
            return self.contarPecasForaDoLugar(estado);
        } else if (self.heuristica === 2) {
            return self.calcularDistanciaAteObjetivo(estado);
        } else {
            return 0;
        }
    };

    this.busca.fnCalcularCustoAresta = function (estadoOrigem, estadoDestino) {
        return 1;
    };

    this.busca.fnEhEstadoFinal = function (estado) {
        return "1,2,3,4,5,6,7,8,0" === self.retornarChaveEstado(estado);
    };

    this.busca.fnProduzirNodosFilhos = function (estado) {
        var posVazia = estado.indexOf(0);
        var movimentosPossiveis = self.movimentos[posVazia];

        var proxEstados = [];

        for (var i = 0; i < movimentosPossiveis.length; i++) {
            var novo = estado.slice();
            var pos = posVazia + movimentosPossiveis[i];

            novo[posVazia] = estado[pos];
            novo[pos] = 0;

            proxEstados.push(novo);
        }

        return proxEstados;
    };

    this.reset = function () {

        var nums = [1, 2, 3, 4, 5, 6, 7, 8, 0];
        this.solucao = [];
        this.estadoAtual = [];

        for (var i = 0; i < 9; i++) {
            var pos = Math.floor(Math.random() * nums.length);
            var num = nums.splice(pos, 1)[0];
            this.estadoAtual[i] = num;
        }

        if (this.ehEstadoFinal(this.estadoAtual)) {
            this.reset();
            return;
        }

        this.desenharTabuleiro(this.estadoAtual);
    };

    this.desenharTabuleiro = function (estadoAtual) {
        var $blocos = $("#tabuleiro > .bloco");
        $blocos.removeClass("vazio");
        $blocos.each(function (i, e) {
            var valor = "";
            var num = estadoAtual[i];
            if (num > 0) {
                valor = num;
            } else {
                $(this).addClass("vazio");
            }
            $(this).html(valor);
        });
    };

    this.iniciar = function (vel) {
        this.velocidade = vel;
        this.mostrarResolvendo();
        this.solucao = this.busca.buscar(this.estadoAtual);
        this.mostrarSolucao(this.solucao, this.busca.maiorTamanhoFronteira);
    };

    this.ehEstadoFinal = function (estado) {
        return "1,2,3,4,5,6,7,8,0" === estado.toString();
    };

    this.contarPecasForaDoLugar = function (estado) {
        var count = 0;
        for (var i = 0; i < estado.length - 1; i++) {
            if (estado[i] !== i + 1) {
                count++;
            }
        }
        return count;
    };

    this.calcularDistanciaAteObjetivo = function (estado) {
        var h = 0;
        for (var i = 0; i < estado.length; i++) {
            var num = estado[i];
            var linhaAtual = Math.floor(i / 3);
            var linhaObjetivo = Math.floor((num - 1) / 3);
            var colunaAtual = (i % 3) + 1;
            var colunaObjetivo = ((num - 1) % 3) + 1;
            if (num === 0) {
                linhaObjetivo = 2;
                colunaObjetivo = 3;
            }
            var hNum = Math.abs(linhaObjetivo - linhaAtual) + Math.abs(colunaObjetivo - colunaAtual);
            h += hNum;
        }
        return h;
    };

    this.mostrarResolvendo = function () {
        $("#status").html("Resolvendo...");
        $("#controles").hide();
    };

    this.mostrarSolucao = function (solucao, maiorTamanhoFronteira) {
        iniciarExibicaoSolucao(solucao, maiorTamanhoFronteira, this.tempoPadraoMovimento / this.velocidade);
    };
}