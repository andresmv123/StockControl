
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.page').then(
        (m) => m.HomePage
      )
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./registro/registro.page').then(
        (m) => m.RegistroPage
      )
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/dashboard.page').then(
        (m) => m.DashboardPage
      )
  },
  {
    path: 'productos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./productos/productos.page').then(
        (m) => m.ProductosPage
      )
  },
  {
    path: 'movimientos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./movimientos/movimientos.page').then(
        (m) => m.MovimientosPage
      )
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./perfil/perfil.page').then(
        (m) => m.PerfilPage
      )
  }
];
