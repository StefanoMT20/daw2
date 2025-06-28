import { Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard';
import { AdminGuard } from './auth/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'student',
    loadComponent: () =>
      import('./student/dashboard/student-dashboard.component').then(
        (m) => m.StudentDashboardComponent
      ),
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'projection', pathMatch: 'full' },
      {
        path: 'projection',
        loadComponent: () =>
          import(
            './student/course-projection/course-projection.component'
          ).then((m) => m.CourseProjectionComponent),
      },
      // Eliminamos la ruta schedule ya que ahora está integrada en projection
    ],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'courses', pathMatch: 'full' },
      {
        path: 'courses',
        loadComponent: () =>
          import('./admin/course-management/course-management.component').then(
            (m) => m.CourseManagementComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: '/login' },
];
