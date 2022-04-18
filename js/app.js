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

    //0 partida sin empezar o acabado
    //1 partida 0N
    //2 partida PAUSE
    //3 partida VERIFICANDO

    //4 verificando bingo =>PAUSE
    //5 bingo correcto   =>PAUSE
    //6 juego pausado     =>PAUSE
  },
  mounted: function () {
    this.reseteo();
  },
  computed: {},
  methods: {
    sacarBola: async function () {
      {
        var i = this.aleatorio();
        this.bolasSacadas.push(i + 1);
        document.getElementById("bola" + this.bolasEnSaco[i]).style.opacity = 1;
        await this.decir(this.bolasEnSaco[i].toString(), "Spanish Female");
        this.bolasEnSaco.splice(i, 1);
        // console.log(i);
      }
    },
    sacarBolas: async function () {
 
      this.gameState = 1;
      this.intervalId = setInterval(this.sacarBola, this.tiempo * 1000);
    },
    comenzarBingo: async function () {
      this.reseteo();
      if(this.gameState!=1){
        await this.sleep(2000);
        this.sacarBolas();
      }
   
    },
    pausar: async function () {
      clearInterval(this.intervalId);
      this.intervalId = 0;
      this.gameState == 2;
    },
    cantar: async function () {
      this.gameState = 3;
      if (!this.lineaCantada)
        await this.decir("Han cantado linea", "Spanish Female");
      else {
        await this.decir("Han cantado bingo", "Spanish Female");
      }
    },
    cantadoEs: async function (tipo, flag) {
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
          this.gameState = 0;
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

    aleatorio: function () {
      var numero =
        Math.floor(Math.random() * (this.bolasEnSaco.length - 0)) + 0;
      return numero;
    },
    rellenarSaco: function () {
      this.bolasEnSaco = [];
      for (var i = 1; i < 100; i++) {
        this.bolasEnSaco.push(i);
      }
    },
    reseteo: function () {
      this.pausar();
      this.gameState = 0;
      this.lineaCantada = false;
      this.bingoCantado = false;
      this.bolasSacadas = [];
      var sel = document.getElementById("numeros");
      sel.innerText = "";
      for (var i = 1; i < 100; i++) {
        var div = document.createElement("div");
        div.appendChild(document.createTextNode(i));
        div.className = "bola";
        div.id = "bola" + i;
        div.innerHTML = i;
        div.style.opacity = 0.4;
        sel.appendChild(div);
      }
      this.rellenarSaco();
    },
    decir: async function (texto, idioma) {
      await responsiveVoice.speak(texto, idioma);
    },
    aplicar: function () {
      this.pausar();
      this.sacarBolas();
      this.verOpciones = false;
    },
    sleep: function (ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
      //use as    await sleep(<duration>);
    },
  },
});
