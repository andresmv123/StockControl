
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonContent,
  IonIcon,
  IonButton,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  AlertController
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  arrowBackOutline,
  addOutline,
  arrowDownOutline,
  arrowUpOutline,
  swapHorizontalOutline,
  cubeOutline,
  closeOutline
} from 'ionicons/icons';

import { SupabaseService } from '../../services/supabase.service';

interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
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
  selector: 'app-movimientos',
  templateUrl: './movimientos.page.html',
  styleUrls: ['./movimientos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    IonButton,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption
  ]
})
export class MovimientosPage {

  private router = inject(Router);
  private alertController = inject(AlertController);
  private supabaseService = inject(SupabaseService);

  productos: Producto[] = [];
  movimientos: Movimiento[] = [];

  mostrarFormulario = false;
  cargando = false;
  guardando = false;

  productoSeleccionado: number | null = null;
  tipoMovimiento: 'Entrada' | 'Salida' = 'Entrada';
  cantidad: number | null = null;

  // Evita que una consulta antigua sobrescriba
  // información más reciente.
  private versionConsulta = 0;

  constructor() {
    addIcons({
      arrowBackOutline,
      addOutline,
      arrowDownOutline,
      arrowUpOutline,
      swapHorizontalOutline,
      cubeOutline,
      closeOutline
    });
  }

  // Se ejecuta cada vez que entramos a Movimientos.
  ionViewWillEnter(): void {
    void this.cargarDatos();
  }

  // CARGAR PRODUCTOS E HISTORIAL DESDE SUPABASE
  async cargarDatos(): Promise<void> {
    const versionActual = ++this.versionConsulta;

    this.cargando = true;

    try {
      const [respuestaProductos, respuestaMovimientos] =
        await Promise.all([
          this.supabaseService.client
            .from('productos')
            .select('id, nombre, categoria, precio, stock')
            .order('nombre', { ascending: true }),

          this.supabaseService.client
            .from('movimientos')
            .select(
              'id, producto_id, producto, tipo, cantidad, fecha'
            )
            .order('fecha', { ascending: false })
            .order('id', { ascending: false })
        ]);

      if (versionActual !== this.versionConsulta) {
        return;
      }

      if (respuestaProductos.error) {
        throw respuestaProductos.error;
      }

      if (respuestaMovimientos.error) {
        throw respuestaMovimientos.error;
      }

      this.productos = (respuestaProductos.data ?? []).map(
        producto => ({
          id: Number(producto.id),
          nombre: producto.nombre,
          categoria: producto.categoria,
          precio: Number(producto.precio),
          stock: Number(producto.stock)
        })
      );

      this.movimientos = (respuestaMovimientos.data ?? []).map(
        movimiento => ({
          id: Number(movimiento.id),
          productoId: Number(movimiento.producto_id),
          producto: movimiento.producto,
          tipo: movimiento.tipo as 'Entrada' | 'Salida',
          cantidad: Number(movimiento.cantidad),
          fecha: movimiento.fecha
        })
      );

    } catch (error) {
      if (versionActual !== this.versionConsulta) {
        return;
      }

      console.error('Error al cargar movimientos:', error);

      await this.mostrarAlerta(
        'Error de conexión',
        'No fue posible consultar el inventario y los movimientos desde Supabase.'
      );

    } finally {
      if (versionActual === this.versionConsulta) {
        this.cargando = false;
      }
    }
  }

  get totalEntradas(): number {
    return this.movimientos.filter(
      movimiento => movimiento.tipo === 'Entrada'
    ).length;
  }

  get totalSalidas(): number {
    return this.movimientos.filter(
      movimiento => movimiento.tipo === 'Salida'
    ).length;
  }

  get productoActual(): Producto | undefined {
    return this.productos.find(
      producto => producto.id === this.productoSeleccionado
    );
  }

  abrirFormulario(): void {
    if (this.guardando) {
      return;
    }

    this.productoSeleccionado = null;
    this.tipoMovimiento = 'Entrada';
    this.cantidad = null;
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    if (this.guardando) {
      return;
    }

    this.mostrarFormulario = false;
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

  // REGISTRAR ENTRADA O SALIDA EN POSTGRESQL
  async registrarMovimiento(): Promise<void> {

    if (this.guardando) {
      return;
    }

    const producto = this.productoActual;
    const cantidad = Number(this.cantidad);

    if (!producto) {
      await this.mostrarAlerta(
        'Producto requerido',
        'Selecciona un producto.'
      );
      return;
    }

    if (
      this.cantidad === null ||
      !Number.isInteger(cantidad) ||
      cantidad <= 0
    ) {
      await this.mostrarAlerta(
        'Cantidad inválida',
        'Ingresa una cantidad entera mayor que cero.'
      );
      return;
    }

    if (
      this.tipoMovimiento === 'Salida' &&
      cantidad > producto.stock
    ) {
      await this.mostrarAlerta(
        'Stock insuficiente',
        `Solo tienes ${producto.stock} unidades disponibles.`
      );
      return;
    }

    this.guardando = true;

    try {
      // La función de PostgreSQL realiza ambas
      // operaciones en una sola transacción:
      //
      // 1. Actualiza el stock.
      // 2. Guarda el movimiento en el historial.

      const { error } =
        await this.supabaseService.client.rpc(
          'registrar_movimiento',
          {
            p_producto_id: producto.id,
            p_tipo: this.tipoMovimiento,
            p_cantidad: cantidad
          }
        );

      if (error) {
        throw error;
      }

      // Invalidamos cualquier consulta anterior.
      this.versionConsulta++;

      // Cerramos el formulario tras guardar.
      this.mostrarFormulario = false;
      this.productoSeleccionado = null;
      this.cantidad = null;
      this.tipoMovimiento = 'Entrada';

      // Consultamos el stock y el historial reales.
      await this.cargarDatos();

      await this.mostrarAlerta(
        'Movimiento registrado',
        'El inventario se actualizó correctamente en Supabase.'
      );

    } catch (error) {
      console.error('Error al registrar movimiento:', error);

      await this.mostrarAlerta(
        'No se pudo registrar',
        'Revisa que el producto exista y que tenga stock suficiente. Si el problema continúa, comprueba la conexión con Supabase.'
      );

      // Si falló por stock desactualizado,
      // volvemos a consultar el inventario.
      await this.cargarDatos();

    } finally {
      this.guardando = false;
    }
  }

  volverDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }
}
