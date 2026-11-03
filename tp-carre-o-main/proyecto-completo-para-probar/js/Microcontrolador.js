import { ComponenteRobotica } from './ComponenteRobotica.js';

// Un Microcontrolador es un ComponenteRobotica "especial": además de
// nombre, stock y precio, tiene datos propios de placa (pines GPIO y
// si soporta WiFi o no). Por eso hereda de la clase base en vez de
// repetir todo de cero.
//
// Conceptos de la Clase 14 (herencia y polimorfismo) concentrados acá:
// el "extends" de más abajo es la herencia, y el método obtenerInfo()
// reescrito al final es el polimorfismo.
export class Microcontrolador extends ComponenteRobotica {
  #pinesGPIO;
  #soportaWifi;

  constructor(id, nombre, stockQuantity, precioUnitario, pinesGPIO, soportaWifi) {
    super(id, nombre, stockQuantity, precioUnitario);
    this.pinesGPIO = pinesGPIO;
    this.soportaWifi = soportaWifi;
  }

  get pinesGPIO() {
    return this.#pinesGPIO;
  }

  set pinesGPIO(valor) {
    const pines = Number(valor);
    if (Number.isNaN(pines) || pines < 0) {
      throw new Error('La cantidad de pines GPIO no puede ser negativa.');
    }
    this.#pinesGPIO = pines;
  }

  get soportaWifi() {
    return this.#soportaWifi;
  }

  set soportaWifi(valor) {
    this.#soportaWifi = Boolean(valor);
  }

  // Polimorfismo: pisamos obtenerInfo() de la clase base para agregar
  // los datos propios de la placa, pero reaprovechamos lo que ya arma
  // el padre con super.obtenerInfo() en vez de repetirlo.
  obtenerInfo() {
    const infoBase = super.obtenerInfo();
    const wifi = this.#soportaWifi ? 'sí' : 'no';
    return `${infoBase} — GPIO: ${this.#pinesGPIO} pines — WiFi: ${wifi}`;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      tipo: 'Microcontrolador',
      pinesGPIO: this.#pinesGPIO,
      soportaWifi: this.#soportaWifi,
    };
  }

  // Ojo: no hace falta escribir generarIdUnico() ni obtenerTotalInstancias()
  // acá. Los métodos estáticos de ComponenteRobotica también se heredan,
  // así que Microcontrolador.generarIdUnico() ya funciona solo.
}
