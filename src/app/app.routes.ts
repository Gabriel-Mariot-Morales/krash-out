import { Routes } from '@angular/router';

export const routes: Routes = [
  // redirección inicial a la vista de tareas
  { path: '', redirectTo: 'tareas', pathMatch: 'full' },
  
  // carga perezosa de las 5 vistas principales
  { path: 'tareas', loadComponent: () => import('./features/tareas/tareas').then(m => m.Tareas) },
  { path: 'rutinas', loadComponent: () => import('./features/rutinas/rutinas').then(m => m.Rutinas) },
  { path: 'tienda', loadComponent: () => import('./features/tienda/tienda').then(m => m.Tienda) },
  { path: 'avatar', loadComponent: () => import('./features/avatar/avatar').then(m => m.Avatar) },
  { path: 'perfil', loadComponent: () => import('./features/perfil/perfil').then(m => m.Perfil) }
];