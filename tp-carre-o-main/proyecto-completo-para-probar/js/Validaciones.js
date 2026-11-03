// Validaciones de lo que llega de afuera (la API y el selector).
// No confiamos en que la respuesta venga bien: hay que chequearla.

export const MONEDAS_PERMITIDAS = ['EUR', 'BRL'];

export function validarMoneda(moneda) {
  return MONEDAS_PERMITIDAS.includes(moneda);
}

export function validarCotizaciones(cotizaciones) {
  return MONEDAS_PERMITIDAS.every(
    (moneda) => Number.isFinite(cotizaciones[moneda]) && cotizaciones[moneda] > 0
  );
}

export function validarConversion(resultado) {
  return Number.isFinite(resultado.tasa)
    && resultado.tasa > 0
    && Number.isFinite(resultado.valorConvertido);
}