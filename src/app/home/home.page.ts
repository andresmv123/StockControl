
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  AlertController
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import { cubeOutline } from 'ionicons/icons';

import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon
  ]
})
export class HomePage {

  correo: string = '';
  contrasena: string = '';

  iniciandoSesion = false;

  private alertController = inject(AlertController);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);

  constructor() {
    addIcons({ cubeOutline });
  }

  async mostrarAlerta(
    titulo: string,
    mensaje: string
  ): Promise<void> {

    const alerta = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['Aceptar']
    });

    await alerta.present();
  }

  // INICIAR SESIÓN CON SUPABASE
  async iniciarSesion(): Promise<void> {

    if (this.iniciandoSesion) {
      return;
    }

    if (!this.correo.trim() || !this.contrasena) {

      await this.mostrarAlerta(
        'Campos incompletos',
        'Ingresa tu correo y contraseña.'
      );

      return;
    }

    this.iniciandoSesion = true;

    try {

      const { data, error } =
        await this.supabaseService.iniciarSesion(
          this.correo.trim().toLowerCase(),
          this.contrasena
        );

      if (error) {

        console.error('Error al iniciar sesión:', error);

        let mensaje = 'No fue posible iniciar sesión.';

        if (error.message === 'Invalid login credentials') {
          mensaje = 'El correo o la contraseña son incorrectos.';
        } else if (error.message === 'Email not confirmed') {
          mensaje = 'Debes confirmar tu correo electrónico antes de iniciar sesión.';
        } else {
          mensaje = error.message;
        }

        await this.mostrarAlerta(
          'Error de inicio de sesión',
          mensaje
        );

        return;
      }

      if (!data.user || !data.session) {

        await this.mostrarAlerta(
          'Error de sesión',
          'No fue posible obtener una sesión válida.'
        );

        return;
      }

      // LIMPIAR CONTRASEÑA DEL FORMULARIO
      this.contrasena = '';

      // ENTRAR AL DASHBOARD
      await this.router.navigateByUrl('/dashboard', {
        replaceUrl: true
      });

    } catch (error) {

      console.error('Error inesperado:', error);

      await this.mostrarAlerta(
        'Error de conexión',
        'No se pudo conectar con Supabase. Revisa tu conexión a internet.'
      );

    } finally {
      this.iniciandoSesion = false;
    }
  }

  // IR A LA PANTALLA DE REGISTRO
  registrarse(): void {
    this.router.navigateByUrl('/registro');
  }
}
