import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/courses/course-catalog/course-catalog').then(m => m.CourseCatalog) },
  { path: 'courses/:id', loadComponent: () => import('./features/courses/course-detail/course-detail').then(m => m.CourseDetail) },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/student-dashboard/student-dashboard').then(m => m.StudentDashboard) },
  { path: 'instructor', loadComponent: () => import('./features/instructor/instructor-dashboard/instructor-dashboard').then(m => m.InstructorDashboard) }
];
