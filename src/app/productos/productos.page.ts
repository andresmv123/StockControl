
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonContent,
  IonIcon,
  IonButton,
  IonInput,
  IonItem,
  AlertController
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  arrowBackOutline,
  addOutline,
  searchOutline,
  cubeOutline,
  createOutline,
  trashOutline,
  closeOutline,
  warningOutline
} from 'ionicons/icons';

import { SupabaseService } from '../../services/supabase.service';
import { TipoCambioService } from '../../services/tipo-cambio.service';

interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
}

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    IonButton,
    IonInput,
    IonItem
  ]
})
export class ProductosPage {

  private router = inject(Router);
  private alertController = inject(AlertController);
  private supabaseService = inject(SupabaseService);
  private tipoCambioService = inject(TipoCambioService);

  productos: Producto[] = [];

  busqueda = '';
  mostrarFormulario = false;
  editando = false;

  cargando = false;
  guardando = false;

  // PERMISOS
  esAdministrador = false;
  cargandoRol = true;

  // API EXTERNA
  tasaDolar: number | null = null;
  cargandoTipoCambio = false;

  productoActual: Producto = this.productoVacio();

  // Evitar respuestas antiguas
  private versionConsulta = 0;
  private versionRol = 0;
  private versionTipoCambio = 0;

  constructor() {
    addIcons({
      arrowBackOutline,
      addOutline,
      searchOutline,
      cubeOutline,
      createOutline,
      trashOutline,
      closeOutline,
      warningOutline
    });
  }

  // CARGAR DATOS AL ENTRAR
  ionViewWillEnter(): void {
    void this.cargarRol();
    void this.cargarProductos();
    void this.cargarTipoCambio();
  }

  // CONSULTAR ROL DEL USUARIO
  async cargarRol(): Promise<void> {

    const versionActual = ++this.versionRol;

    this.esAdministrador = false;
    this.cargandoRol = true;
    this.mostrarFormulario = false;

    try {

      const { data: usuarioData, error: usuarioError } =
        await this.supabaseService.obtenerUsuario();

      if (versionActual !== this.versionRol) {
        return;
      }

      if (usuarioError || !usuarioData.user) {
        return;
      }

      const { data: perfil, error: perfilError } =
        await this.supabaseService.client
          .from('perfiles')
          .select('rol')
          .eq('id', usuarioData.user.id)
          .single();

      if (versionActual !== this.versionRol) {
        return;
      }

      if (perfilError) {
        throw perfilError;
      }

      this.esAdministrador = perfil?.rol === 'admin';

    } catch (error) {

      if (versionActual !== this.versionRol) {
        return;
      }

      console.error('Error al consultar rol:', error);
      this.esAdministrador = false;

    } finally {

      if (versionActual === this.versionRol) {
        this.cargandoRol = false;
      }
    }
  }

  // CONSULTAR API EXTERNA  
  async cargarTipoCambio(): Promise<void> {

    const versionActual = ++this.versionTipoCambio;

    this.cargandoTipoCambio = true;
    this.tasaDolar = null;

    try {

      const tasa =
        await this.tipoCambioService.obtenerTipoCambio();

      if (versionActual !== this.versionTipoCambio) {
        return;
      }

      this.tasaDolar = tasa;

    } catch (error: unknown) {

      if (versionActual !== this.versionTipoCambio) {
        return;
      }

      console.error('Error al consultar tipo de cambio:', error);

      this.tasaDolar = null;

      const mensaje =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error desconocido al consultar la API.';

      await this.mostrarAlerta(
        'Tipo de cambio no disponible',
        mensaje + ' Los precios en pesos mexicanos seguirán disponibles.'
      );

    } finally {

      if (versionActual === this.versionTipoCambio) {
        this.cargandoTipoCambio = false;
      }
    }
  }


  // CONVERTIR PRECIO MXN A USD
  convertirADolares(precio: number): number | null {

    if (this.tasaDolar === null) {
      return null;
    }

    return this.tipoCambioService.convertirPesosADolares(
      precio,
      this.tasaDolar
    );
  }

  productoVacio(): Producto {
    return {
      id: 0,
      nombre: '',
      categoria: '',
      precio: 0,
      stock: 0
    };
  }

  private convertirProducto(datos: {
    id: number;
    nombre: string;
    categoria: string;
    precio: number;
    stock: number;
  }): Producto {

    return {
      id: Number(datos.id),
      nombre: datos.nombre,
      categoria: datos.categoria,
      precio: Number(datos.precio),
      stock: Number(datos.stock)
    };
  }

  // CARGAR PRODUCTOS DESDE SUPABASE
  async cargarProductos(): Promise<void> {

    const versionActual = ++this.versionConsulta;

    this.cargando = true;

    try {

      const { data, error } =
        await this.supabaseService.client
          .from('productos')
          .select('id, nombre, categoria, precio, stock')
          .order('id', { ascending: false });

      if (versionActual !== this.versionConsulta) {
        return;
      }

      if (error) {
        throw error;
      }

      this.productos = (data ?? []).map(
        producto => this.convertirProducto(producto)
      );

    } catch (error) {

      if (versionActual !== this.versionConsulta) {
        return;
      }

      console.error('Error al cargar productos:', error);

      await this.mostrarAlerta(
        'Error de conexión',
        'No fue posible cargar los productos desde Supabase.'
      );

    } finally {

      if (versionActual === this.versionConsulta) {
        this.cargando = false;
      }
    }
  }

  get productosFiltrados(): Producto[] {

    const texto = this.busqueda.toLowerCase().trim();

    return this.productos.filter(producto =>
      producto.nombre.toLowerCase().includes(texto) ||
      producto.categoria.toLowerCase().includes(texto)
    );
  }

  get totalProductos(): number {
    return this.productos.length;
  }

  get productosStockBajo(): number {
    return this.productos.filter(
      producto => producto.stock <= 5
    ).length;
  }

  // NUEVO PRODUCTO: SOLO ADMIN
  abrirFormulario(): void {

    if (
      !this.esAdministrador ||
      this.cargandoRol ||
      this.guardando
    ) {
      return;
    }

    this.editando = false;
    this.productoActual = this.productoVacio();
    this.mostrarFormulario = true;
  }

  // EDITAR PRODUCTO: SOLO ADMIN
  editarProducto(producto: Producto): void {

    if (
      !this.esAdministrador ||
      this.cargandoRol ||
      this.guardando
    ) {
      return;
    }

    this.editando = true;
    this.productoActual = { ...producto };
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {

    if (this.guardando) {
      return;
    }

    this.mostrarFormulario = false;
    this.editando = false;
    this.productoActual = this.productoVacio();
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

  // GUARDAR PRODUCTO
  async guardarProducto(): Promise<void> {

    if (this.guardando) {
      return;
    }

    if (!this.esAdministrador || this.cargandoRol) {

      await this.mostrarAlerta(
        'Acceso restringido',
        'Solo los administradores pueden modificar productos.'
      );

      return;
    }

    const p = this.productoActual;

    if (!p.nombre.trim() || !p.categoria.trim()) {

      await this.mostrarAlerta(
        'Campos incompletos',
        'Ingresa el nombre y la categoría del producto.'
      );

      return;
    }

    const precio = Number(p.precio);
    const stock = Number(p.stock);

    if (
      !Number.isFinite(precio) ||
      precio < 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {

      await this.mostrarAlerta(
        'Datos inválidos',
        'El precio debe ser válido y el stock debe ser un número entero no negativo.'
      );

      return;
    }

    this.guardando = true;

    const datosProducto = {
      nombre: p.nombre.trim(),
      categoria: p.categoria.trim(),
      precio,
      stock
    };

    try {

      if (this.editando) {

        const { data, error } =
          await this.supabaseService.client
            .from('productos')
            .update(datosProducto)
            .eq('id', p.id)
            .select('id, nombre, categoria, precio, stock')
            .single();

        if (error) {
          throw error;
        }

        const productoActualizado =
          this.convertirProducto(data);

        this.versionConsulta++;

        this.productos = this.productos.map(producto =>
          producto.id === productoActualizado.id
            ? productoActualizado
            : producto
        );

      } else {

        const { data, error } =
          await this.supabaseService.client
            .from('productos')
            .insert(datosProducto)
            .select('id, nombre, categoria, precio, stock')
            .single();

        if (error) {
          throw error;
        }

        const nuevoProducto =
          this.convertirProducto(data);

        this.versionConsulta++;

        this.productos = [
          nuevoProducto,
          ...this.productos.filter(
            producto => producto.id !== nuevoProducto.id
          )
        ];
      }

      this.cargando = false;
      this.mostrarFormulario = false;
      this.editando = false;
      this.productoActual = this.productoVacio();

    } catch (error) {

      console.error('Error al guardar producto:', error);

      await this.mostrarAlerta(
        'No se pudo guardar',
        'Ocurrió un error al guardar el producto en Supabase.'
      );

    } finally {
      this.guardando = false;
    }
  }

  // CONFIRMAR ELIMINACIÓN
  async eliminarProducto(producto: Producto): Promise<void> {

    if (
      !this.esAdministrador ||
      this.cargandoRol ||
      this.guardando
    ) {
      return;
    }

    const alerta = await this.alertController.create({
      header: 'Eliminar producto',
      message: `¿Deseas eliminar "${producto.nombre}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            void this.confirmarEliminarProducto(producto);
          }
        }
      ]
    });

    await alerta.present();
  }

  // ELIMINAR PRODUCTO
  private async confirmarEliminarProducto(
    producto: Producto
  ): Promise<void> {

    if (
      !this.esAdministrador ||
      this.cargandoRol ||
      this.guardando
    ) {
      return;
    }

    this.guardando = true;

    try {

      const { data, error } =
        await this.supabaseService.client
          .from('productos')
          .delete()
          .eq('id', producto.id)
          .select('id');

      if (error) {
        throw error;
      }

      if (!data?.length) {
        throw new Error(
          'No se encontró el producto o no tienes permiso para eliminarlo.'
        );
      }

      this.versionConsulta++;

      this.productos = this.productos.filter(
        p => p.id !== producto.id
      );

      this.cargando = false;

    } catch (error) {

      console.error('Error al eliminar producto:', error);

      await this.mostrarAlerta(
        'No se pudo eliminar',
        'No fue posible eliminar el producto. Si tiene movimientos registrados, debes conservarlo para mantener el historial.'
      );

    } finally {
      this.guardando = false;
    }
  }

  volverDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }
}
