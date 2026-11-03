// Clase base del inventario. Representa cualquier pieza suelta del kit
// de robótica (sensores, cables, motores, etc). Las propiedades son
// privadas (#) para que nadie pueda pisarlas desde afuera sin pasar
// por los setters, que son los que validan los datos.
//
// Conceptos de la materia que se ponen en juego acá:
//  - Clase 15 (creación de clases y constructores)
//  - Clase 14 (encapsulamiento: los # y los get/set)
//  - Clase 16 (métodos estáticos vs. dinámicos: al final del archivo)

export class ComponenteRobotica {
  // Propiedad ESTÁTICA: es de la clase, no de cada objeto. No existe
  // "un" total por componente, existe un solo contador compartido por
  // todos. Por eso no lleva "this." sino el nombre de la clase.
  static #totalInstancias = 0;

  #id;
  #nombre;
  #stockQuantity;
  #precioUnitario;

  constructor(id, nombre, stockQuantity, precioUnitario) {
    this.#id = id;
    // Usamos los setters (this.nombre = ...) en vez de asignar directo
    // a la propiedad privada, para que la validación corra también
    // al crear el objeto y no solo cuando se lo edita después.
    this.nombre = nombre;
    this.stockQuantity = stockQuantity;
    this.precioUnitario = precioUnitario;
    ComponenteRobotica.#totalInstancias += 1;
  }

  get id() {
    return this.#id;
  }

  get nombre() {
    return this.#nombre;
  }

  set nombre(valor) {
    if (typeof valor !== 'string' || valor.trim().length === 0) {
      throw new Error('El nombre del componente no puede estar vacío.');
    }
    this.#nombre = valor.trim();
  }

  get stockQuantity() {
    return this.#stockQuantity;
  }

  set stockQuantity(valor) {
    const cantidad = Number(valor);
    if (Number.isNaN(cantidad) || cantidad < 0) {
      throw new Error('El stock no puede ser un número negativo.');
    }
    this.#stockQuantity = cantidad;
  }

  get precioUnitario() {
    return this.#precioUnitario;
  }

  set precioUnitario(valor) {
    const precio = Number(valor);
    if (Number.isNaN(precio) || precio < 0) {
      throw new Error('El precio unitario no puede ser negativo.');
    }
    this.#precioUnitario = precio;
  }

  // Valor total que representa este componente dentro del inventario.
  // Lo usa la Colección para el cálculo con reduce.
  calcularValorEnStock() {
    return this.#stockQuantity * this.#precioUnitario;
  }

  // Método "base" que la clase derivada va a sobrescribir (polimorfismo).
  obtenerInfo() {
    return `${this.#nombre} — Stock: ${this.#stockQuantity} u. — Precio: $${this.#precioUnitario.toFixed(2)}`;
  }

  // Forma en la que este objeto se guarda en localStorage. El campo
  // "tipo" es clave: al volver a leer el JSON, es lo único que nos
  // permite saber si hay que reconstruir un ComponenteRobotica o un
  // Microcontrolador.
  toJSON() {
    return {
      tipo: 'ComponenteRobotica',
      id: this.#id,
      nombre: this.#nombre,
      stockQuantity: this.#stockQuantity,
      precioUnitario: this.#precioUnitario,
    };
  }

  // ---------------------------------------------------------------
  // Métodos ESTÁTICOS (Clase 16). Se llaman sobre la clase entera
  // (ComponenteRobotica.generarIdUnico()), nunca sobre un objeto ya
  // creado. Todos los métodos de arriba (obtenerInfo, toJSON, etc.)
  // son "dinámicos" o de instancia: necesitan un objeto puntual para
  // funcionar (this.#nombre no existe si no hay un "this"). Estos dos
  // de acá abajo no necesitan ningún objeto todavía creado.
  // ---------------------------------------------------------------

  static generarIdUnico() {
    return `comp-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  static obtenerTotalInstancias() {
    return ComponenteRobotica.#totalInstancias;
  }
}
