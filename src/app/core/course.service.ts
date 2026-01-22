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
  chapters: Array<{ id: number; title: string; lessons: number[] }>;
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
    const courseToCreate = {
      ...courseForm,
      id: undefined,
      chapters: courseForm.chapters.map(c => ({ title: c.title, lessons: [] })),
    };

    this.http.post<Course>(this.apiUrl, courseToCreate).pipe(
      switchMap(createdCourse => {
        const lessonCreationObservables: Observable<Lesson>[] = [];
        createdCourse.chapters.forEach((chapter, chapterIndex) => {
          courseForm.chapters[chapterIndex].lessons.forEach(lessonForm => {
            lessonCreationObservables.push(this.lessonService.addLesson({
              title: lessonForm.title,
              videoUrl: lessonForm.videoUrl,
              chapterId: chapter.id,
            }));
          });
        });

        if (lessonCreationObservables.length === 0) return of(createdCourse);
        
        return forkJoin(lessonCreationObservables).pipe(
          map(createdLessons => {
            createdLessons.forEach(lesson => {
              createdCourse.chapters.find(c => c.id === lesson.chapterId)?.lessons.push(lesson.id);
            });
            return createdCourse;
          })
        );
      }),
      switchMap(courseWithNewLessonIds => 
        this.http.patch<Course>(`${this.apiUrl}/${courseWithNewLessonIds.id}`, { chapters: courseWithNewLessonIds.chapters })
      ),
      tap(() => this.fetchCourses())
    ).subscribe();
  }

  updateCourse(id: number, courseForm: CourseForm): void {
    // 1. Get the original course to find which lessons to delete
    this.http.get<Course>(`${this.apiUrl}/${id}`).pipe(
      switchMap(originalCourse => {
        // 2. Collect all old lesson IDs and delete them
        const lessonIdsToDelete = originalCourse.chapters.flatMap(c => c.lessons);
        return this.lessonService.deleteLessons(lessonIdsToDelete).pipe(
          map(() => originalCourse) // Pass originalCourse along
        );
      }),
      switchMap(originalCourse => {
        // 3. Create all new lessons from the form
        const lessonCreationObservables: Observable<Lesson>[] = [];
        // We need to use the chapter IDs from the original course object
        originalCourse.chapters.forEach((chapter, chapterIndex) => {
          if (courseForm.chapters[chapterIndex]) {
            courseForm.chapters[chapterIndex].lessons.forEach(lessonForm => {
              lessonCreationObservables.push(this.lessonService.addLesson({
                title: lessonForm.title,
                videoUrl: lessonForm.videoUrl,
                chapterId: chapter.id,
              }));
            });
          }
        });

        if (lessonCreationObservables.length === 0) {
          return of({ createdLessons: [] }); 
        }
        return forkJoin(lessonCreationObservables).pipe(map(createdLessons => ({ createdLessons })));
      }),
      switchMap(({ createdLessons }) => {
        // 4. Build the final course object for the PUT request
        const finalCourseObject = {
          ...courseForm,
          id, // use the id from the argument
          chapters: courseForm.chapters.map(chapterForm => {
            // This is tricky. We need to find the original chapter to preserve its ID.
            // This assumes chapters are not added/deleted/reordered in the UI, which is a simplification.
            const originalChapter = this._courses().find(c => c.id === id)?.chapters.find(c => c.title === chapterForm.title);
            return {
              id: originalChapter?.id ?? Date.now(), // Fallback for new chapters
              title: chapterForm.title,
              lessons: createdLessons
                .filter(lesson => lesson.chapterId === originalChapter?.id)
                .map(l => l.id),
            };
          }),
        };
        // 5. Update the course with a PUT request
        return this.http.put<Course>(`${this.apiUrl}/${id}`, finalCourseObject);
      }),
      tap(() => this.fetchCourses())
    ).subscribe();
  }

  deleteCourse(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => this.fetchCourses());
  }
}

