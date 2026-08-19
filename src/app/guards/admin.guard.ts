import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { ToastService } from '../services/toast.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  const currentUser = supabaseService.getCurrentUser();
  const isUserAdmin = supabaseService.isAdmin();

  if (currentUser && isUserAdmin) {
    return true;
  }

  toastService.error('Access Denied', 'Admin privileges are required to access the Operations Center.');
  router.navigate(['/']);
  return false;
};
