// Capa de servicios: lo único que sabe hablar con la API externa.
// Ninguna otra parte del programa usa fetch directamente, todo pasa
// por acá. Devuelve los datos ya parseados o tira un Error con un
// mensaje que se pueda mostrar tal cual en pantalla.

const URL_COTIZACIONES = 'https://open.er-api.com/v6/latest/ARS';

export class ApiClient {
  // Es estático porque no necesita ningún objeto creado: no guarda
  // estado, solo hace la petición.
  static async obtenerCotizaciones() {
    try {
      const respuesta = await fetch(URL_COTIZACIONES);

      // fetch NO tira error si el servidor responde 404 o 500, solo
      // falla si no hay conexión. Por eso hay que mirar response.ok.
      if (!respuesta.ok) {
        throw new Error(`El servicio de cotizaciones respondió con error (${respuesta.status}).`);
      }

      return await respuesta.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('No se pudo conectar con el servicio de cotizaciones. Revisá tu conexión.');
      }
      if (error instanceof SyntaxError) {
        throw new Error('El servicio devolvió una respuesta que no se pudo leer.');
      }
      throw error;
    }
  }
}