// Todo lo que "dibuja" cosas en la pantalla vive acá. main.js decide
// CUÁNDO renderizar; este archivo decide CÓMO se ve cada cosa.

const UMBRAL_STOCK_BAJO = 3;

function crearTarjetaHTML(componente) {
  // constructor.name nos dice si el objeto es un ComponenteRobotica
  // "común" o un Microcontrolador, sin tener que importar la clase acá.
  const esMicro = componente.constructor.name === 'Microcontrolador';
  const stockBajo = componente.stockQuantity <= UMBRAL_STOCK_BAJO;

  return `
    <div class="componente" data-id="${componente.id}">
      <h3>${componente.nombre}${esMicro ? ' (Microcontrolador)' : ''}</h3>
      <p>${componente.obtenerInfo()}</p>
      ${stockBajo ? '<p class="alerta">Stock bajo, hay que reponer</p>' : ''}
      <button data-accion="restar" data-id="${componente.id}">-1</button>
      <button data-accion="sumar" data-id="${componente.id}">+1</button>
      <button data-accion="eliminar" data-id="${componente.id}">Eliminar</button>
    </div>
  `;
}

export function renderizarLista(contenedor, componentes) {
  if (componentes.length === 0) {
    contenedor.innerHTML = '<p class="lista-vacia">No hay componentes cargados todavía.</p>';
    return;
  }
  // map arma un string de HTML por cada componente; join los pega todos.
  contenedor.innerHTML = componentes.map(crearTarjetaHTML).join('');
}

export function renderizarResumen(elementoResumen, coleccion) {
  const cantidadTotal = coleccion.obtenerTodos().length;
  const valorTotal = coleccion.calcularValorTotalInventario();
  elementoResumen.textContent =
    `${cantidadTotal} componente(s) registrado(s) · Valor total del inventario: $${valorTotal.toFixed(2)}`;
}

export function mostrarErrorFormulario(input, mensaje) {
  input.classList.add('input-error');
  const mensajeError = input.closest('.campo')?.querySelector('.mensaje-error');
  if (mensajeError) mensajeError.textContent = mensaje;
}

export function limpiarErrorFormulario(input) {
  input.classList.remove('input-error');
  const mensajeError = input.closest('.campo')?.querySelector('.mensaje-error');
  if (mensajeError) mensajeError.textContent = '';
}
