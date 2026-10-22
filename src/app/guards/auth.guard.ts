
import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

import { SupabaseService } from '../../services/supabase.service';

export const authGuard: CanActivateFn = async () => {

  const router = inject(Router);
  const supabaseService = inject(SupabaseService);

  try {
    const { data, error } =
      await supabaseService.obtenerUsuario();

    if (!error && data.user) {
      return true;
    }

    return router.createUrlTree(['/home']);

  } catch (error) {
    console.error('Error al verificar la sesión:', error);

    return router.createUrlTree(['/home']);
  }
};
