import { Routes } from '@angular/router';
import { authGuard, ownerGuard } from './auth.guards';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/dashboard-page.component').then((m) => m.DashboardPageComponent) },
  { path: 'login', loadComponent: () => import('./pages/login-page.component').then((m) => m.LoginPageComponent) },
  { path: 'register', loadComponent: () => import('./pages/register-page.component').then((m) => m.RegisterPageComponent) },
  {
    path: 'venues',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/venues-page.component').then((m) => m.VenuesPageComponent)
  },
  {
    path: 'activities',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/activities-page.component').then((m) => m.ActivitiesPageComponent)
  },
  {
    path: 'owner',
    canActivate: [ownerGuard],
    loadComponent: () => import('./pages/owner-page.component').then((m) => m.OwnerPageComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile-page.component').then((m) => m.ProfilePageComponent)
  },
  {
    path: 'logout',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/logout-page.component').then((m) => m.LogoutPageComponent)
  },
  { path: '**', redirectTo: '' }
];
