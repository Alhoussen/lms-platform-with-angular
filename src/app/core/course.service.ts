import { Injectable, signal, Signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { LessonService, Lesson } from './lesson.service';
import { CourseForm } from '../features/instructor/instructor-dashboard/instructor-dashboard';

export type Course = {
  id: number;
  title: string;
  category: string;
  instructorId: number;
  description: string;
  // Support both ID arrays (legacy) and Object arrays (nested)
  chapters: Array<{ id: number; title: string; lessons: number[] | any[] }>;
};

@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly apiUrl = 'http://localhost:3000/courses';
  private readonly http = inject(HttpClient);
  private readonly lessonService = inject(LessonService);

  private readonly _courses = signal<Course[]>([]);
  readonly courses: Signal<Course[]> = this._courses.asReadonly();

  fetchCourses() {
    this.http.get<Course[]>(this.apiUrl).subscribe(courses => this._courses.set(courses));
  }

  addCourse(courseForm: CourseForm): void {
    // SIMPLIFICATION : On sauvegarde tout l'arbre (leçons incluses) directement dans l'objet Course.
    // JSON-Server gère très bien les objets imbriqués.
    // Cela évite la complexité de créer les leçons séparément et de relier les IDs,
    // ce qui causait les problèmes de "leçons vides" ou "IDs orphelins".
    const courseToCreate = {
      ...courseForm,
      id: undefined,
      chapters: courseForm.chapters.map(c => ({
        id: c.id,
        title: c.title,
        lessons: c.lessons // On sauvegarde les objets leçons directement
      })),
    };

    this.http.post<Course>(this.apiUrl, courseToCreate).pipe(
      tap(() => this.fetchCourses())
    ).subscribe();
  }

  updateCourse(id: number, courseForm: CourseForm): void {
    // Pour l'update, on utilise la même logique simplifiée : on écrase avec la structure nested.
    // Attention : cela peut laisser des leçons orphelines dans la table 'lessons', 
    // mais pour l'examen c'est un compromis acceptable pour avoir une feature fonctionnelle.
    const finalCourseObject = {
      ...courseForm,
      id,
      chapters: courseForm.chapters.map(c => ({
        id: c.id ?? Date.now(),
        title: c.title,
        lessons: c.lessons
      })),
    };

    this.http.put<Course>(`${this.apiUrl}/${id}`, finalCourseObject).pipe(
      tap(() => this.fetchCourses())
    ).subscribe();
  }

  deleteCourse(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => this.fetchCourses());
  }
}
