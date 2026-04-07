import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FairplayStore } from './services/fairplay-store.service';

export const authGuard: CanActivateFn = () => {
  const store = inject(FairplayStore);
  const router = inject(Router);

  if (store.currentUser()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const ownerGuard: CanActivateFn = () => {
  const store = inject(FairplayStore);
  const router = inject(Router);
  const user = store.currentUser();

  if (user?.role === 'OWNER') {
    return true;
  }

  return router.createUrlTree([user ? '/' : '/login']);
};
