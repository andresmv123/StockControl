
import { Injectable } from '@angular/core';

interface RespuestaTipoCambio {
  date: string;
  mxn: {
    usd: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TipoCambioService {

  private readonly apiUrl =
  'https://latest.currency-api.pages.dev/v1/currencies/mxn.json';

  private readonly tiempoMaximo = 10000;

  async obtenerTipoCambio(): Promise<number> {

    const controlador = new AbortController();

    const temporizador = setTimeout(() => {
      controlador.abort();
    }, this.tiempoMaximo);

    try {

      const respuesta = await fetch(this.apiUrl, {
        method: 'GET',
        signal: controlador.signal,
        headers: {
          Accept: 'application/json'
        }
      });

      if (respuesta.status === 404) {
        throw new Error(
          'No se encontró el servicio de tipo de cambio.'
        );
      }

      if (respuesta.status === 401 ||
          respuesta.status === 403) {
        throw new Error(
          'El servicio rechazó el acceso a la información.'
        );
      }

      if (respuesta.status >= 500) {
        throw new Error(
          'El servidor de tipo de cambio no está disponible.'
        );
      }

      if (!respuesta.ok) {
        throw new Error(
          `Error HTTP ${respuesta.status} al consultar la API.`
        );
      }

      let datos: RespuestaTipoCambio;

      try {
        datos = await respuesta.json();
      } catch {
        throw new Error(
          'La API devolvió una respuesta JSON inválida.'
        );
      }

      const tasa = datos?.mxn?.usd;

      if (
        typeof tasa !== 'number' ||
        !Number.isFinite(tasa) ||
        tasa <= 0
      ) {
        throw new Error(
          'La API devolvió un tipo de cambio inválido.'
        );
      }

      return tasa;

    } catch (error: unknown) {

      if (
        error instanceof DOMException &&
        error.name === 'AbortError'
      ) {
        throw new Error(
          'La consulta tardó demasiado tiempo. Intenta nuevamente.'
        );
      }

      if (error instanceof TypeError) {
        throw new Error(
          'No fue posible conectar con la API. Revisa tu conexión a Internet.'
        );
      }

      throw error;

    } finally {
      clearTimeout(temporizador);
    }
  }

  convertirPesosADolares(
    pesos: number,
    tasa: number
  ): number {
    return pesos * tasa;
  }
}
