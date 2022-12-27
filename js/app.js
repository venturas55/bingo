var app = new Vue({
    el: "#app",
    data: {
        tiempo: 3,
        bolasEnSaco: [],
        bolasSacadas: [],
        verOpciones: false,
        intervalId: 0,
        lineaCantada: false,
        bingoCantado: false,
        gameState: 0,
        ronda: 0,
        num_partidas: -1,
        precioCarton: 0.5,
        cartonesVendidos: 4,
        dobleLinea: false,
        acumuladoPorcentaje: 0,
        premioAcumulado: 0,



        //0 partida sin empezar o acabado
        //1 partida 0N
        //2 partida PAUSE
        //3 partida VERIFICANDO

        //4 verificando bingo =>PAUSE
        //5 bingo correcto   =>PAUSE
        //6 juego pausado     =>PAUSE
    },
    mounted: function() {
        this.reseteo();
    },
    computed: {
        numBolasFaltan() {
            return 90 - this.bolasSacadas.length;
        },
        recaudadoRonda() {
            return this.cartonesVendidos * this.precioCarton;
        },
        premioLinea() {
            if (this.dobleLinea) {
                if (this.acumuladoPorcentaje == 0)
                    return this.recaudadoRonda * 0.15;
                else
                    return this.recaudadoRonda * 0.15 - this.recaudadoRonda * this.acumuladoPorcentaje / 200;
            } else {
                if (this.acumuladoPorcentaje == 0)
                    return this.recaudadoRonda * 0.3;
                else
                    return this.recaudadoRonda * 0.3 - this.recaudadoRonda * this.acumuladoPorcentaje / 200;
            }

        },
        premio2Lineas() {

            if (this.acumuladoPorcentaje == 0)
                return this.recaudadoRonda * 0.25;
            else
                return this.recaudadoRonda * 0.25 - this.recaudadoRonda * this.acumuladoPorcentaje / 200;



        },
        premioBingo() {
            if (this.dobleLinea) {
                if (this.acumuladoPorcentaje == 0)
                    return this.recaudadoRonda * 0.60;
                else
                    return this.recaudadoRonda * 0.6 - this.recaudadoRonda * this.acumuladoPorcentaje / 200;
            } else {
                if (this.acumuladoPorcentaje == 0)
                    return this.recaudadoRonda * 0.7;
                else
                    return this.recaudadoRonda * 0.7 - this.recaudadoRonda * this.acumuladoPorcentaje / 200;
            }

        },
        premioBingoPlus() {
            return this.premioBingo + this.premioAcumulado;

        },
        premioAcumuladoRonda() {
            return this.recaudadoRonda * this.acumuladoPorcentaje / 100;
        },
    },
    methods: {
        sacarBola: async function() {
            {

                if (this.bolasEnSaco.length > 0 && this.gameState == 1) {
                    this.ronda++;
                    //Veo las bolas que hay en el cesto antes de sacar la nueva
                    var marcador = document.getElementById("marcador");
                    var bolasenMarcador = marcador.childNodes;

                    if (bolasenMarcador.length >= 1) {
                        bolasenMarcador[bolasenMarcador.length - 1].classList.remove("saleBola");
                    }

                    //Para sacar una bola
                    var ultimaBola = this.BolaAleatoria(); //indice de bolasEnSaco
                    //La meto en las bolas sacadas
                    this.bolasSacadas.push(ultimaBola);

                    //La pinto en el panel de bolas
                    document.getElementById("bola" + ultimaBola).style.opacity = 1;
                    //texto para cantar
                    await this.decir(ultimaBola, "Spanish Female");
                    //--------------------
                    //Creo la bola en el diseño grafico
                    var bola = document.createElement("div");
                    bola.appendChild(document.createTextNode(this.bolasSacadas[this.bolasSacadas.length - 1]));
                    bola.className = "bola saleBola";
                    bola.innerHTML = this.bolasSacadas[this.bolasSacadas.length - 1];
                    marcador.appendChild(bola);
                    //------------
                    //Para que vayan rodando para atras
                    //cuando hay más de 4, las bolas en la cesta las roto
                    if (bolasenMarcador.length > 3) {
                        this.rotar(bolasenMarcador);
                    }

                    //Para ir eliminado bolas visuales.
                    if (marcador.childElementCount > 4) {
                        marcador.removeChild(marcador.firstElementChild);
                        //console.log(marcador.childElementCount);
                    }
                } else {
                    console.log("Bingo finalizado");
                    await this.decir("Imposible que nadie haya cantado bingo. Menuda panda de subnormales", "Spanish Female");

                }


            }
        },
        sacarBolas: async function() {
            this.gameState = 1;
            this.intervalId = setInterval(this.sacarBola, this.tiempo * 1000);
        },
        comenzarBingo: async function() {
            if (this.gameState != 1) {
                this.sacarBolas();
            }
        },
        pausar: function() {
            this.gameState = 2;
            clearInterval(this.intervalId);

        },
        reanudar: function() {
            this.sacarBolas();

        },
        cantar: async function() {
            this.gameState = 3;
            if (!this.lineaCantada)
                await this.decir("Han cantado linea", "Spanish Female");
            else {
                await this.decir("Han cantado bingo", "Spanish Female");
            }
        },
        cantadoEs: async function(tipo, flag) {
            if (tipo == "linea") {
                if (flag) {
                    await this.decir(
                        "La linea es correcta. Continuamos para bingo!",
                        "Spanish Female"
                    );
                    this.lineaCantada = !this.lineaCantada;
                    this.gameState = 1;
                } else {
                    await this.decir(
                        "La linea no es correcta. Hay que estar más atento, ¡Capullo!",
                        "Spanish Female"
                    );
                    this.gameState = 1;
                }

                console.log("Game state " + this.gameState);
            }
            if (tipo == "bingo") {
                if (flag) {
                    await this.decir(
                        "El bingo es correcto, TENEMOS GANADOR!",
                        "Spanish Female"
                    );
                    this.bingoCantado = true;
                    this.reseteo();
                } else {
                    await this.decir(
                        "El bingo no es correcto. Hay que estar más atento, Subnormal!",
                        "Spanish Female"
                    );
                    this.gameState = 1;
                }
            }

            //Si no es bingo, seguimos sacando bolas
            if (!this.bingoCantado) {
                await this.sleep(2000);
                this.sacarBolas();
            }
        },

        BolaAleatoria: function() {
            var indice = Math.floor(Math.random() * this.bolasEnSaco.length);
            var ultimaBola = this.bolasEnSaco[indice];
            //la saco del saco
            this.bolasEnSaco.splice(indice, 1);
            return ultimaBola;
        },
        rellenarSaco: function() {
            this.bolasEnSaco = [];
            for (var i = 1; i <= 90; i++) {
                this.bolasEnSaco.push(i);
            }
        },
        reseteo: function() {
            console.log("Partida acabada");
            this.num_partidas++;
            this.gameState = 0;
            this.ronda = 0;
            this.lineaCantada = false;
            this.bingoCantado = false;
            this.bolasSacadas = [];

            var marc = document.getElementById("marcador");
            marc.innerText = "";
            var sel = document.getElementById("panelBolas");
            sel.innerText = "";
            this.rellenarSaco();
            for (var i = 1; i <= 90; i++) {
                var div = document.createElement("div");
                div.appendChild(document.createTextNode(i));
                div.className = "bola";
                div.id = "bola" + i;
                div.innerHTML = i;
                div.style.opacity = 0.3;
                sel.appendChild(div);
            }
            clearInterval(this.intervalId);
            // this.pausar();
        },
        decir: async function(bolaAcantar, idioma) {
            var cantar;
            const FRASES = {
                '2': '2...tocamelos',
                '5': '5 ...por el culo te la inco',
                '8': '8 ...por el culo te la empocho',
                '13': '13 ...agarramela que me crece',
                '22': '22 ...los dos patitos',
                '15': '15...la niña bonita',
            }
            cantar = FRASES[bolaAcantar] || bolaAcantar.toString();
            let a = cantar.charAt(0);
            let b = cantar.charAt(1);
            let extra = a + " " + b;
            if (a === '6' || a === '7') {
                cantar = cantar + " ... " + extra;
            }
            await responsiveVoice.speak(cantar, idioma);
        },
        aplicar: function() {
            this.pausar();
            this.sacarBolas();
            this.verOpciones = false;
        },
        sleep: function(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
            //use as    await sleep(<duration>);
        },
        rotar: async function(bolas) {
            for (var i = 0; i < bolas.length - 1; i++) {
                //console.log("ruedaBola " + bolas[i].innerHTML);
                bolas[i].classList.add("ruedaBola");
            }
            //console.log("------------------ ");
            await this.sleep(500);

            for (var i = 0; i < bolas.length - 1; i++) {
                bolas[i].classList.remove("ruedaBola");
            }

        }
    },
});