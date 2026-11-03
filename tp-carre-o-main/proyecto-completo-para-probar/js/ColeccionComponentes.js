import { ComponenteRobotica } from './ComponenteRobotica.js';
import { Microcontrolador } from './Microcontrolador.js';
import { ApiClient } from './ApiClient.js';

const CLAVE_STORAGE = 'inventario-robotica-grupo4';

// Esta clase es la que administra la lista completa de componentes.
// Ninguna otra parte del programa toca el array directamente: todo
// pasa por acá (agregar, buscar, filtrar, borrar, guardar).
//
// La parte de guardarEnLocalStorage()/cargarDesdeLocalStorage() es la
// Clase 13 (localStorage). El resto son formas de recorrer objetos
// dentro de un array (Clase 17), aplicadas a esta lista en particular.
export class ColeccionComponentes {
  #items;

  constructor() {
    this.#items = [];
  }

  agregar(componente) {
    const yaExiste = this.#items.find((item) => item.id === componente.id);
    if (yaExiste) {
      throw new Error(`Ya existe un componente con el ID "${componente.id}".`);
    }
    this.#items.push(componente);
    this.guardarEnLocalStorage();
  }

  eliminar(id) {
    this.#items = this.#items.filter((item) => item.id !== id);
    this.guardarEnLocalStorage();
  }

  // find: localizar un único componente por id.
  buscarPorId(id) {
    return this.#items.find((item) => item.id === id);
  }

  // filter: usado por el buscador en tiempo real de la interfaz.
  filtrarPorNombre(texto) {
    const busqueda = texto.trim().toLowerCase();
    if (!busqueda) return this.obtenerTodos();
    return this.#items.filter((item) => item.nombre.toLowerCase().includes(busqueda));
  }

  actualizarStock(id, diferencia) {
    const componente = this.buscarPorId(id);
    if (!componente) return;
    const nuevoStock = componente.stockQuantity + diferencia;
    componente.stockQuantity = nuevoStock < 0 ? 0 : nuevoStock;
    this.guardarEnLocalStorage();
  }

  obtenerTodos() {
    // Devolvemos una copia (spread) para que nadie desde afuera pueda
    // hacer push/splice directo sobre el array privado.
    return [...this.#items];
  }

  // map: se usa, por ejemplo, para armar listas auxiliares (nombres)
  // sin tocar los objetos originales.
  obtenerNombres() {
    return this.#items.map((item) => item.nombre);
  }

  // reduce: cálculo pedido por la consigna del Grupo 4 — valor
  // monetario total del inventario de componentes.
  calcularValorTotalInventario() {
    return this.#items.reduce((total, item) => total + item.calcularValorEnStock(), 0);
  }

    // Trae las cotizaciones al iniciar la app. Es async porque depende
  // de una petición externa: devuelve una Promesa, no el dato directo.
  async cargarCotizaciones() {
    const datos = await ApiClient.obtenerCotizaciones();
    if (!datos.rates) {
      throw new Error('La API no devolvió cotizaciones.');
    }
    return { EUR: datos.rates.EUR, BRL: datos.rates.BRL };
  }

  // Convierte el valor total del inventario (que está en pesos) a la
  // moneda elegida, usando la cotización del momento.
  async convertirMonedaInventario(moneda) {
    const datos = await ApiClient.obtenerCotizaciones();
    const tasa = datos.rates?.[moneda];
    if (tasa === undefined) {
      throw new Error(`La API no devolvió cotización para ${moneda}.`);
    }
    const valorOriginal = this.calcularValorTotalInventario();
    return { moneda, tasa, valorOriginal, valorConvertido: valorOriginal * tasa };
  }

  guardarEnLocalStorage() {
    const datos = this.#items.map((item) => item.toJSON());
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(datos));
  }

  // Reconstruye los objetos guardados como instancias reales de las
  // clases (no como objetos "planos"), fijándose en el campo "tipo"
  // que cada toJSON() guardó.
  cargarDesdeLocalStorage() {
    const datosGuardados = localStorage.getItem(CLAVE_STORAGE);
    if (!datosGuardados) return;

    let datos;
    try {
      datos = JSON.parse(datosGuardados);
    } catch {
      console.warn('No se pudo leer el inventario guardado, se ignora.');
      return;
    }

    this.#items = datos.map((registro) => {
      if (registro.tipo === 'Microcontrolador') {
        return new Microcontrolador(
          registro.id,
          registro.nombre,
          registro.stockQuantity,
          registro.precioUnitario,
          registro.pinesGPIO,
          registro.soportaWifi
        );
      }
      return new ComponenteRobotica(
        registro.id,
        registro.nombre,
        registro.stockQuantity,
        registro.precioUnitario
      );
    });
  }
}
