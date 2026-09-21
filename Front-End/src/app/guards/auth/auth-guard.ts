import { AuthService } from '@/app/services/login/auth.service';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {

  const router = inject(Router);

  const authService = inject(AuthService);
  if (authService.isAuthenticated()) {
    return true;
  }
  return router.parseUrl('/auth');
};
