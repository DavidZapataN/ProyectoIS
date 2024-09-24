import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    title: 'Proyecto IS',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/home/home.component').then((c) => HomeComponent),
  },
  {
    path: 'inactive-patients',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/inactive-patients/inactive-patients.component').then(
        (c) => c.InactivePatientsComponent
      ),
  },

  {
    path: 'login',
    title: 'Proyecto IS',
    loadComponent: () =>
      import('./pages/login/login.component').then((c) => LoginComponent),
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];
