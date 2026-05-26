import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const engineerGuard: CanActivateFn = (_route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isEngineer()) return true;
  if (auth.isLoggedIn()) return router.createUrlTree(['/account']);
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const customerGuard: CanActivateFn = (_route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isCustomer()) return true;
  if (auth.isLoggedIn()) return router.createUrlTree(['/dashboard']);
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
