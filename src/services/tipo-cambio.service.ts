
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

  async obtenerTipoCambio(): Promise<number> {

    const respuesta = await fetch(this.apiUrl);

    if (!respuesta.ok) {
      throw new Error(
        'No fue posible consultar el tipo de cambio.'
      );
    }

    const datos: RespuestaTipoCambio =
      await respuesta.json();

    const tasa = datos.mxn?.usd;

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
  }

  convertirPesosADolares(
    pesos: number,
    tasa: number
  ): number {
    return pesos * tasa;
  }
}
