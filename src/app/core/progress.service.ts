import { Injectable, signal, WritableSignal, computed, Signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

export type Progress = {
  id: number;
  userId: number;
  courseId: number;
  completedLessons: number[];
};

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly apiUrl = 'http://localhost:3000/progress';
  private readonly http = inject(HttpClient);

  // Signal to hold the progress for the currently active course (for course detail view)
  private readonly _currentProgress = signal<Progress | null>(null);
  readonly currentCourseProgress: Signal<Progress | null> = this._currentProgress.asReadonly();

  // Signal to hold all progress records for a specific user (for dashboard view)
  private readonly _allUserProgress = signal<Progress[]>([]);
  readonly allUserProgress: Signal<Progress[]> = this._allUserProgress.asReadonly();
  
  // Derived signal to easily check if a lesson is complete for the current course
  isLessonCompleted(lessonId: number): Signal<boolean> {
    return computed(() => this._currentProgress()?.completedLessons.includes(lessonId) ?? false);
  }

  /**
   * Fetches the progress for a specific user and course.
   * If no progress exists, _currentProgress is set to null.
   */
  getProgressForCourse(userId: number, courseId: number) {
    this.http.get<Progress[]>(`${this.apiUrl}?userId=${userId}&courseId=${courseId}`).pipe(
      tap(progressRecords => {
        this._currentProgress.set(progressRecords[0] || null);
      })
    ).subscribe();
  }

  /**
   * Fetches all progress records for a specific user.
   */
  fetchAllProgressForUser(userId: number) {
    this.http.get<Progress[]>(`${this.apiUrl}?userId=${userId}`).pipe(
      tap(progressRecords => {
        this._allUserProgress.set(progressRecords);
      })
    ).subscribe();
  }

  /**
   * Toggles the completion status of a lesson for a specific user and course.
   * Creates a progress record if one doesn't exist for the course.
   */
  toggleLessonStatus(userId: number, courseId: number, lessonId: number) {
    const current = this._currentProgress(); // Get the signal for the current course's progress
    
    // Determine if we are completing or un-completing the lesson
    const isCompleting = !current?.completedLessons.includes(lessonId);

    if (current) {
      // Progress record exists, so update it
      const updatedLessons = isCompleting
        ? [...current.completedLessons, lessonId]
        : current.completedLessons.filter(id => id !== lessonId);
      
      const updatedRecord = { ...current, completedLessons: updatedLessons };
      
      this.http.put<Progress>(`${this.apiUrl}/${current.id}`, updatedRecord).pipe(
        tap(res => {
          this._currentProgress.set(res); // Update current course progress
          // Also update the overall user progress if it's being watched
          this._allUserProgress.update(all => all.map(p => p.id === res.id ? res : p));
        })
      ).subscribe();

    } else {
      // No progress record, create a new one (only if completing a lesson)
      if (isCompleting) {
        const newRecord = { userId, courseId, completedLessons: [lessonId] };
        this.http.post<Progress>(this.apiUrl, newRecord).pipe(
          tap(res => {
            this._currentProgress.set(res); // Update current course progress
            // Also add to the overall user progress
            this._allUserProgress.update(all => [...all, res]);
          })
        ).subscribe();
      }
    }
  }
}
