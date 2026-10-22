
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  IonContent,
  IonIcon,
  IonButton,
  AlertController
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  arrowBackOutline,
  personOutline,
  mailOutline,
  shieldCheckmarkOutline,
  logOutOutline,
  settingsOutline,
  cameraOutline
} from 'ionicons/icons';

import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    IonButton
  ]
})
export class PerfilPage {

  private router = inject(Router);
  private alertController = inject(AlertController);
  private supabaseService = inject(SupabaseService);

  nombre = 'Cargando...';
  correo = '';
  rol = 'Cargando...';

  fotoPerfil: string | null = null;
  subiendoFoto = false;

  // Evita que una consulta anterior sobrescriba
  // la información más reciente.
  private versionConsulta = 0;

  constructor() {
    addIcons({
      arrowBackOutline,
      personOutline,
      mailOutline,
      shieldCheckmarkOutline,
      logOutOutline,
      settingsOutline,
      cameraOutline
    });
  }

  // Se ejecuta cada vez que entramos al perfil.
  ionViewWillEnter(): void {
    void this.cargarPerfil();
  }

  // CARGAR DATOS DEL USUARIO
  async cargarPerfil(): Promise<void> {

    const versionActual = ++this.versionConsulta;

    this.nombre = 'Cargando...';
    this.correo = '';
    this.rol = 'Cargando...';
    this.fotoPerfil = null;

    try {

      const { data, error } =
        await this.supabaseService.obtenerUsuario();

      if (versionActual !== this.versionConsulta) {
        return;
      }

      if (error || !data.user) {
        this.nombre = 'Usuario no identificado';
        this.correo = '';
        this.rol = 'Sin asignar';
        return;
      }

      const usuario = data.user;

      this.nombre =
        usuario.user_metadata?.['nombre'] || 'Usuario';

      this.correo = usuario.email || '';

      // Consultamos rol y fotografía.
      await Promise.all([
        this.cargarRol(usuario.id, versionActual),
        this.cargarFoto(usuario.id, versionActual)
      ]);

    } catch (error) {

      if (versionActual !== this.versionConsulta) {
        return;
      }

      console.error('Error al cargar perfil:', error);

      this.nombre = 'Error al cargar perfil';
      this.correo = '';
      this.rol = 'No disponible';
      this.fotoPerfil = null;
    }
  }

  // CONSULTAR ROL REAL EN SUPABASE
  private async cargarRol(
    usuarioId: string,
    versionActual: number
  ): Promise<void> {

    try {

      const { data, error } =
        await this.supabaseService.client
          .from('perfiles')
          .select('rol')
          .eq('id', usuarioId)
          .single();

      if (versionActual !== this.versionConsulta) {
        return;
      }

      if (error) {
        throw error;
      }

      if (data.rol === 'admin') {
        this.rol = 'Administrador';
      } else if (data.rol === 'empleado') {
        this.rol = 'Empleado';
      } else {
        this.rol = 'Sin asignar';
      }

    } catch (error) {

      if (versionActual !== this.versionConsulta) {
        return;
      }

      console.error('Error al consultar rol:', error);

      this.rol = 'No disponible';
    }
  }

  // CARGAR FOTO DE PERFIL
  async cargarFoto(
    usuarioId: string,
    versionActual = this.versionConsulta
  ): Promise<void> {

    try {

      const ruta = `${usuarioId}/avatar`;

      const { data, error } =
        await this.supabaseService.client.storage
          .from('avatars')
          .createSignedUrl(ruta, 3600);

      if (versionActual !== this.versionConsulta) {
        return;
      }

      if (error) {
        // Es normal si todavía no hay fotografía.
        this.fotoPerfil = null;
        return;
      }

      this.fotoPerfil = data.signedUrl;

    } catch (error) {

      if (versionActual !== this.versionConsulta) {
        return;
      }

      console.error('Error al cargar fotografía:', error);
    }
  }

  // SELECCIONAR Y SUBIR FOTO
  async seleccionarFoto(evento: Event): Promise<void> {

    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo || this.subiendoFoto) {
      return;
    }

    const tiposPermitidos = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!tiposPermitidos.includes(archivo.type)) {

      await this.mostrarAlerta(
        'Formato no permitido',
        'Selecciona una imagen JPG, PNG o WebP.'
      );

      input.value = '';
      return;
    }

    if (archivo.size > 2 * 1024 * 1024) {

      await this.mostrarAlerta(
        'Imagen demasiado grande',
        'La fotografía no debe superar los 2 MB.'
      );

      input.value = '';
      return;
    }

    this.subiendoFoto = true;

    try {

      const { data, error } =
        await this.supabaseService.obtenerUsuario();

      if (error || !data.user) {

        await this.mostrarAlerta(
          'Sesión no válida',
          'Debes iniciar sesión para cambiar tu fotografía.'
        );

        return;
      }

      const usuarioId = data.user.id;
      const ruta = `${usuarioId}/avatar`;

      const { error: errorSubida } =
        await this.supabaseService.client.storage
          .from('avatars')
          .upload(ruta, archivo, {
            upsert: true,
            contentType: archivo.type,
            cacheControl: '60'
          });

      if (errorSubida) {

        console.error('Error al subir foto:', errorSubida);

        await this.mostrarAlerta(
          'Error al subir fotografía',
          errorSubida.message
        );

        return;
      }

      // Renovamos la URL para mostrar la nueva foto.
      await this.cargarFoto(usuarioId);

      await this.mostrarAlerta(
        'Fotografía actualizada',
        'Tu nueva foto de perfil se guardó correctamente.'
      );

    } catch (error) {

      console.error('Error inesperado:', error);

      await this.mostrarAlerta(
        'Error',
        'Ocurrió un problema al actualizar la fotografía.'
      );

    } finally {
      this.subiendoFoto = false;
      input.value = '';
    }
  }

  volverDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }

  // CONFIRMACIÓN DE CIERRE DE SESIÓN
  async cerrarSesion(): Promise<void> {

    const alerta = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que deseas salir de StockControl?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar sesión',
          handler: () => {
            void this.confirmarCerrarSesion();
          }
        }
      ]
    });

    await alerta.present();
  }

  // CERRAR SESIÓN EN SUPABASE
  private async confirmarCerrarSesion(): Promise<void> {

    try {

      const { error } =
        await this.supabaseService.cerrarSesion();

      if (error) {

        await this.mostrarAlerta(
          'Error',
          'No fue posible cerrar sesión.'
        );

        return;
      }

      // Invalidamos las consultas anteriores.
      this.versionConsulta++;

      this.nombre = 'Cargando...';
      this.correo = '';
      this.rol = 'Sin asignar';
      this.fotoPerfil = null;

      await this.router.navigateByUrl('/home', {
        replaceUrl: true
      });

    } catch (error) {

      console.error('Error al cerrar sesión:', error);

      await this.mostrarAlerta(
        'Error',
        'Ocurrió un problema al cerrar sesión.'
      );
    }
  }

  private async mostrarAlerta(
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
}
