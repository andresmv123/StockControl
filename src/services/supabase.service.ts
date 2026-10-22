
import { Injectable } from '@angular/core';
import {
  createClient,
  SupabaseClient
} from '@supabase/supabase-js';

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  public readonly client: SupabaseClient;

  constructor() {
    this.client = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  // REGISTRAR USUARIO
  async registrarUsuario(
    nombre: string,
    correo: string,
    contrasena: string
  ) {
    return await this.client.auth.signUp({
      email: correo,
      password: contrasena,
      options: {
        data: {
          nombre: nombre
        }
      }
    });
  }

  // INICIAR SESIÓN
  async iniciarSesion(
    correo: string,
    contrasena: string
  ) {
    return await this.client.auth.signInWithPassword({
      email: correo,
      password: contrasena
    });
  }

  // CERRAR SESIÓN
  async cerrarSesion() {
    return await this.client.auth.signOut();
  }

  // OBTENER USUARIO ACTUAL
  async obtenerUsuario() {
    return await this.client.auth.getUser();
  }

}
