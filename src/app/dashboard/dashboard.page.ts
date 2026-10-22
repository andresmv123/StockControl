
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  IonContent,
  IonFooter,
  IonIcon,
  AlertController
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  personOutline,
  cubeOutline,
  warningOutline,
  arrowDownOutline,
  arrowUpOutline,
  homeOutline,
  swapHorizontalOutline
} from 'ionicons/icons';

import { SupabaseService } from '../../services/supabase.service';

interface Producto {
  id: number;
  stock: number;
}

interface Movimiento {
  id: number;
  productoId: number;
  producto: string;
  tipo: 'Entrada' | 'Salida';
  cantidad: number;
  fecha: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonFooter,
    IonIcon
  ]
})
export class DashboardPage {

  private router = inject(Router);
  private alertController = inject(AlertController);
  private supabaseService = inject(SupabaseService);

  totalProductos = 0;
  stockBajo = 0;
  entradas = 0;
  salidas = 0;

  movimientos: Movimiento[] = [];
  fotoPerfil: string | null = null;

  cargandoEstadisticas = false;

  // Evita que una consulta antigua reemplace
  // los resultados de una consulta más reciente.
  private versionConsulta = 0;

  constructor() {
    addIcons({
      personOutline,
      cubeOutline,
      warningOutline,
      arrowDownOutline,
      arrowUpOutline,
      homeOutline,
      swapHorizontalOutline
    });
  }

  // Actualizar cada vez que entramos al dashboard.
  ionViewWillEnter(): void {
    void this.actualizarEstadisticas();
    void this.cargarFotoPerfil();
  }

  // CARGAR TODAS LAS ESTADÍSTICAS DESDE SUPABASE
  async actualizarEstadisticas(): Promise<void> {

    const versionActual = ++this.versionConsulta;

    this.cargandoEstadisticas = true;

    try {

      // Consultamos productos y movimientos.
      const [
        respuestaProductos,
        respuestaMovimientos
      ] = await Promise.all([

        this.supabaseService.client
          .from('productos')
          .select('id, stock'),

        this.supabaseService.client
          .from('movimientos')
          .select(
            'id, producto_id, producto, tipo, cantidad, fecha'
          )
          .order('fecha', { ascending: false })
          .order('id', { ascending: false })

      ]);

      // Ignorar respuestas de consultas anteriores.
      if (versionActual !== this.versionConsulta) {
        return;
      }

      if (respuestaProductos.error) {
        throw respuestaProductos.error;
      }

      if (respuestaMovimientos.error) {
        throw respuestaMovimientos.error;
      }

      // PRODUCTOS
      const productos: Producto[] =
        (respuestaProductos.data ?? []).map(
          producto => ({
            id: Number(producto.id),
            stock: Number(producto.stock)
          })
        );

      this.totalProductos = productos.length;

      this.stockBajo = productos.filter(
        producto => producto.stock <= 5
      ).length;

      // MOVIMIENTOS
      const movimientosConsultados: Movimiento[] =
        (respuestaMovimientos.data ?? []).map(
          movimiento => ({
            id: Number(movimiento.id),
            productoId: Number(movimiento.producto_id),
            producto: movimiento.producto,
            tipo: movimiento.tipo as 'Entrada' | 'Salida',
            cantidad: Number(movimiento.cantidad),
            fecha: movimiento.fecha
          })
        );

      // Contar movimientos de cada tipo.
      this.entradas = movimientosConsultados.filter(
        movimiento => movimiento.tipo === 'Entrada'
      ).length;

      this.salidas = movimientosConsultados.filter(
        movimiento => movimiento.tipo === 'Salida'
      ).length;

      // Mostrar solamente los cinco más recientes.
      this.movimientos = movimientosConsultados.slice(0, 5);

    } catch (error) {

      if (versionActual !== this.versionConsulta) {
        return;
      }

      console.error(
        'Error al actualizar dashboard:',
        error
      );

      await this.mostrarAlerta(
        'Error de conexión',
        'No fue posible actualizar el dashboard desde Supabase.'
      );

    } finally {

      if (versionActual === this.versionConsulta) {
        this.cargandoEstadisticas = false;
      }
    }
  }

  // FOTO DE PERFIL DESDE SUPABASE
  async cargarFotoPerfil(): Promise<void> {

    try {

      const { data, error } =
        await this.supabaseService.obtenerUsuario();

      if (error || !data.user) {
        this.fotoPerfil = null;
        return;
      }

      const ruta = `${data.user.id}/avatar`;

      const { data: foto, error: errorFoto } =
        await this.supabaseService.client.storage
          .from('avatars')
          .createSignedUrl(ruta, 3600);

      if (errorFoto) {
        this.fotoPerfil = null;
        return;
      }

      this.fotoPerfil = foto.signedUrl;

    } catch (error) {

      console.error(
        'Error al cargar foto de perfil:',
        error
      );

      this.fotoPerfil = null;
    }
  }

  irProductos(): void {
    this.router.navigateByUrl('/productos');
  }

  irMovimientos(): void {
    this.router.navigateByUrl('/movimientos');
  }

  irPerfil(): void {
    this.router.navigateByUrl('/perfil');
  }

  async mostrarProximamente(
    pantalla: string
  ): Promise<void> {
    await this.mostrarAlerta(
      pantalla,
      'Próximamente crearemos esta pantalla.'
    );
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
