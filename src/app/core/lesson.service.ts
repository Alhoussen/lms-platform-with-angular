import { Injectable, signal, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';

export type Lesson = {
  id: number;
  title: string;
  videoUrl: string;
  chapterId: number;
};

@Injectable({ providedIn: 'root' })
export class LessonService {
  private readonly apiUrl = 'http://localhost:3000/lessons';
  private readonly _lessons = signal<Lesson[]>([]);
  readonly lessons: Signal<Lesson[]> = this._lessons.asReadonly();

  constructor(private readonly http: HttpClient) {}

  fetchLessons() {
    this.http.get<Lesson[]>(this.apiUrl).subscribe(lessons => this._lessons.set(lessons));
  }

  addLesson(lesson: Omit<Lesson, 'id'>): Observable<Lesson> {
    return this.http.post<Lesson>(this.apiUrl, lesson);
  }

  deleteLesson(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deleteLessons(ids: number[]): Observable<void[]> {
    if (ids.length === 0) {
      return of([]);
    }
    const deleteObservables = ids.map(id => this.deleteLesson(id));
    return forkJoin(deleteObservables);
  }
}
