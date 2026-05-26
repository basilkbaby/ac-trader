import { Routes } from '@angular/router';
import { authGuard, engineerGuard, customerGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'quote',
    loadComponent: () => import('./features/quote/quote.component').then(m => m.QuoteComponent)
  },
  {
    path: 'engineers',
    loadComponent: () => import('./features/engineers/engineers.component').then(m => m.EngineersComponent)
  },
  {
    path: 'engineers/:id',
    loadComponent: () => import('./features/engineers/engineer-detail.component').then(m => m.EngineerDetailComponent)
  },
  {
    path: 'booking/:quoteId',
    loadComponent: () => import('./features/booking/booking.component').then(m => m.BookingComponent)
  },
  {
    path: 'join',
    loadComponent: () => import('./features/engineers/engineer-register.component').then(m => m.EngineerRegisterComponent)
  },
  {
    path: 'service-plans',
    loadComponent: () => import('./features/plans/service-plans.component').then(m => m.ServicePlansComponent)
  },
  {
    path: 'health-check',
    loadComponent: () => import('./features/health-check/health-check.component').then(m => m.HealthCheckComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'account',
    canActivate: [customerGuard],
    loadComponent: () => import('./features/account/account.component').then(m => m.AccountComponent)
  },
  {
    path: 'dashboard',
    canActivate: [engineerGuard],
    loadComponent: () => import('./features/dashboard/dashboard-shell.component').then(m => m.DashboardShellComponent),
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      {
        path: 'overview',
        loadComponent: () => import('./features/dashboard/dashboard-overview.component').then(m => m.DashboardOverviewComponent)
      },
      {
        path: 'jobs',
        loadComponent: () => import('./features/dashboard/dashboard-jobs.component').then(m => m.DashboardJobsComponent)
      },
      {
        path: 'invoices',
        loadComponent: () => import('./features/dashboard/dashboard-invoices.component').then(m => m.DashboardInvoicesComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/dashboard/dashboard-profile.component').then(m => m.DashboardProfileComponent)
      },
    ]
  },
  { path: '**', redirectTo: '' }
];
