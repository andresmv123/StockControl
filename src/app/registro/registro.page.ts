
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
import {
  personAddOutline,
  arrowBackOutline
} from 'ionicons/icons';

import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
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
export class RegistroPage {

  nombre = '';
  correo = '';
  contrasena = '';
  confirmarContrasena = '';

  registrando = false;

  private router = inject(Router);
  private alertController = inject(AlertController);
  private supabaseService = inject(SupabaseService);

  constructor() {
    addIcons({
      personAddOutline,
      arrowBackOutline
    });
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

  async crearCuenta(): Promise<void> {

    if (this.registrando) {
      return;
    }

    if (
      !this.nombre.trim() ||
      !this.correo.trim() ||
      !this.contrasena ||
      !this.confirmarContrasena
    ) {
      await this.mostrarAlerta(
        'Campos incompletos',
        'Por favor, completa todos los campos.'
      );
      return;
    }

    const correoValido =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.correo.trim());

    if (!correoValido) {
      await this.mostrarAlerta(
        'Correo inválido',
        'Ingresa un correo electrónico válido.'
      );
      return;
    }

    if (this.contrasena.length < 6) {
      await this.mostrarAlerta(
        'Contraseña corta',
        'La contraseña debe tener al menos 6 caracteres.'
      );
      return;
    }

    if (this.contrasena !== this.confirmarContrasena) {
      await this.mostrarAlerta(
        'Las contraseñas no coinciden',
        'Verifica que ambas contraseñas sean iguales.'
      );
      return;
    }

    this.registrando = true;

    try {
      const { data, error } =
        await this.supabaseService.registrarUsuario(
          this.nombre.trim(),
          this.correo.trim().toLowerCase(),
          this.contrasena
        );

      if (error) {
        console.error('Error de registro:', error);

        await this.mostrarAlerta(
          'No se pudo crear la cuenta',
          error.message
        );
        return;
      }

      if (!data.user) {
        await this.mostrarAlerta(
          'Registro no completado',
          'No se pudo confirmar el registro. Inténtalo nuevamente.'
        );
        return;
      }

      if (data.session) {
        await this.mostrarAlerta(
          'Registro completado',
          'Tu cuenta fue creada correctamente. Ya puedes continuar.'
        );
      } else {
        await this.mostrarAlerta(
          'Revisa tu correo',
          'Si tu registro se procesó correctamente, recibirás un correo de confirmación. Verifica tu cuenta antes de iniciar sesión.'
        );
      }

      this.nombre = '';
      this.correo = '';
      this.contrasena = '';
      this.confirmarContrasena = '';

      await this.router.navigateByUrl('/home');

    } catch (error) {
      console.error('Error inesperado:', error);

      await this.mostrarAlerta(
        'Error de conexión',
        'No fue posible conectar con Supabase. Revisa tu conexión a internet e inténtalo nuevamente.'
      );

    } finally {
      this.registrando = false;
    }
  }

  volverLogin(): void {
    this.router.navigateByUrl('/home');
  }
}
