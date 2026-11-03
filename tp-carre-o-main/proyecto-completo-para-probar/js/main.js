import { ComponenteRobotica } from './ComponenteRobotica.js';
import { Microcontrolador } from './Microcontrolador.js';
import { ColeccionComponentes } from './ColeccionComponentes.js';
import {
  renderizarLista,
  renderizarResumen,
  mostrarErrorFormulario,
  limpiarErrorFormulario,
  mostrarLoader,
  ocultarLoader,
  mostrarBannerError,
  renderizarCotizaciones,
  renderizarConversion,
} from './ui.js';
import { validarMoneda, validarCotizaciones, validarConversion } from './Validaciones.js';

const coleccion = new ColeccionComponentes();

const formulario = document.getElementById('form-componente');
const contenedorLista = document.getElementById('lista-componentes');
const resumen = document.getElementById('resumen-inventario');
const buscador = document.getElementById('buscador');
const checkboxMicro = document.getElementById('es-microcontrolador');
const camposMicro = document.getElementById('campos-microcontrolador');

const inputNombre = document.getElementById('nombre');
const inputStock = document.getElementById('stock');
const inputPrecio = document.getElementById('precio');
const inputPines = document.getElementById('pines-gpio');
const inputWifi = document.getElementById('soporta-wifi');
const banner = document.getElementById('banner-error');
const loader = document.getElementById('loader');
const textoCotizaciones = document.getElementById('cotizaciones');
const selectorMoneda = document.getElementById('selector-moneda');
const resultadoConversion = document.getElementById('resultado-conversion');

function actualizarVista(listaAMostrar = coleccion.obtenerTodos()) {
  renderizarLista(contenedorLista, listaAMostrar);
  renderizarResumen(resumen, coleccion);
}

// Muestra u oculta los campos propios de microcontrolador según el
// checkbox, sin tocar nada del resto del formulario.
checkboxMicro.addEventListener('change', () => {
  camposMicro.classList.toggle('oculto', !checkboxMicro.checked);
});

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault(); // no queremos que la página se recargue

  [inputNombre, inputStock, inputPrecio].forEach(limpiarErrorFormulario);
  let hayErrores = false;

  if (inputNombre.value.trim().length === 0) {
    mostrarErrorFormulario(inputNombre, 'Ingresá un nombre.');
    hayErrores = true;
  }
  if (inputStock.value === '' || Number(inputStock.value) < 0) {
    mostrarErrorFormulario(inputStock, 'El stock tiene que ser 0 o mayor.');
    hayErrores = true;
  }
  if (inputPrecio.value === '' || Number(inputPrecio.value) < 0) {
    mostrarErrorFormulario(inputPrecio, 'El precio tiene que ser 0 o mayor.');
    hayErrores = true;
  }

  if (hayErrores) return;

  try {
    // generarIdUnico() es un método estático: se llama sobre la clase
    // (ComponenteRobotica.generarIdUnico()), no sobre un objeto que
    // todavía ni existe. Microcontrolador lo hereda, así que funciona
    // igual llamándolo desde cualquiera de las dos clases.
    const nuevoComponente = checkboxMicro.checked
      ? new Microcontrolador(
          ComponenteRobotica.generarIdUnico(),
          inputNombre.value,
          inputStock.value,
          inputPrecio.value,
          inputPines.value || 0,
          inputWifi.checked
        )
      : new ComponenteRobotica(
          ComponenteRobotica.generarIdUnico(),
          inputNombre.value,
          inputStock.value,
          inputPrecio.value
        );

    coleccion.agregar(nuevoComponente);
    formulario.reset();
    camposMicro.classList.add('oculto');
    buscador.value = '';
    actualizarVista();
  } catch (error) {
    // Si algo falla en los setters de la clase (validación interna),
    // lo mostramos igual como error de formulario.
    mostrarErrorFormulario(inputNombre, error.message);
  }
});

// Filtro en tiempo real: se dispara en cada tecla, no hace falta
// apretar ningún botón.
buscador.addEventListener('input', () => {
  actualizarVista(coleccion.filtrarPorNombre(buscador.value));
});

// Un solo listener para toda la lista (delegación de eventos) en vez
// de uno por cada botón, porque las tarjetas se recrean todo el tiempo.
contenedorLista.addEventListener('click', (evento) => {
  const boton = evento.target.closest('button[data-accion]');
  if (!boton) return;

  const { accion, id } = boton.dataset;
  if (accion === 'sumar') coleccion.actualizarStock(id, 1);
  if (accion === 'restar') coleccion.actualizarStock(id, -1);
  if (accion === 'eliminar') coleccion.eliminar(id);

  actualizarVista(coleccion.filtrarPorNombre(buscador.value));
});

// Carga inicial de cotizaciones. El selector queda deshabilitado
// hasta que termine, y el finally garantiza que el loader se oculte
// tanto si salió bien como si falló.
async function cargarCotizacionesIniciales() {
  selectorMoneda.disabled = true;
  mostrarLoader(loader);
  try {
    const cotizaciones = await coleccion.cargarCotizaciones();
    if (!validarCotizaciones(cotizaciones)) {
      throw new Error('La API devolvió cotizaciones incompletas.');
    }
    renderizarCotizaciones(textoCotizaciones, cotizaciones);
  } catch (error) {
    mostrarBannerError(banner, error.message);
  } finally {
    ocultarLoader(loader);
    selectorMoneda.disabled = false;
  }
}

selectorMoneda.addEventListener('change', async () => {
  const moneda = selectorMoneda.value;
  resultadoConversion.textContent = '';
  if (!validarMoneda(moneda)) return;

  // Se deshabilita el selector mientras la promesa está pendiente
  // para que no se disparen varias peticiones a la vez.
  selectorMoneda.disabled = true;
  mostrarLoader(loader);
  try {
    const resultado = await coleccion.convertirMonedaInventario(moneda);
    if (!validarConversion(resultado)) {
      throw new Error('La API devolvió datos inválidos para la conversión.');
    }
    renderizarConversion(resultadoConversion, resultado);
  } catch (error) {
    mostrarBannerError(banner, error.message);
  } finally {
    ocultarLoader(loader);
    selectorMoneda.disabled = false;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  coleccion.cargarDesdeLocalStorage();
  actualizarVista();
  cargarCotizacionesIniciales(); 
});
