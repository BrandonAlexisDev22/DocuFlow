import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './application/auth/auth.guards';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        title: 'Iniciar sesión · DocuFlow',
        loadComponent: () =>
          import('./presentation/auth/login/login').then((m) => m.Login),
      },
      {
        path: 'register',
        title: 'Crear cuenta · DocuFlow',
        loadComponent: () =>
          import('./presentation/auth/register/register').then(
            (m) => m.Register,
          ),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./presentation/layout/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: 'dashboard',
        title: 'Panel · DocuFlow',
        loadComponent: () =>
          import('./presentation/dashboard/dashboard').then(
            (m) => m.Dashboard,
          ),
      },
      {
        path: 'documents',
        title: 'Documentos · DocuFlow',
        loadComponent: () =>
          import(
            './presentation/documents/document-list/document-list'
          ).then((m) => m.DocumentList),
      },
      {
        path: 'documents/new',
        title: 'Nuevo documento · DocuFlow',
        loadComponent: () =>
          import(
            './presentation/documents/document-form/document-form'
          ).then((m) => m.DocumentForm),
      },
      {
        path: 'documents/:id',
        title: 'Detalle del documento · DocuFlow',
        loadComponent: () =>
          import(
            './presentation/documents/document-detail/document-detail'
          ).then((m) => m.DocumentDetail),
      },
      {
        path: 'documents/:id/edit',
        title: 'Editar documento · DocuFlow',
        loadComponent: () =>
          import(
            './presentation/documents/document-form/document-form'
          ).then((m) => m.DocumentForm),
      },
      {
        path: 'profile',
        title: 'Mi perfil · DocuFlow',
        loadComponent: () =>
          import('./presentation/profile/profile').then((m) => m.Profile),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
