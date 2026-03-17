import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { secretSlugGuard } from '@core/guards/secret-slug.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'admin/dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@features/admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'blog/:slug',
    loadComponent: () =>
      import('@features/blog/blog-view.component').then((m) => m.BlogViewComponent),
  },
  // Secret admin entry — e.g. /secure-portal-ar2026
  // slug is verified against backend; wrong slug → redirect home
  {
    path: ':slug',
    canActivate: [secretSlugGuard],
    loadComponent: () =>
      import('@features/admin/login/login.component').then((m) => m.LoginComponent),
  },
  { path: '**', redirectTo: '' },
];
