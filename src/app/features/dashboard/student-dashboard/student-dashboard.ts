import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CourseService, Course } from '../../../core/course.service';
import { ProgressService, Progress } from '../../../core/progress.service';
import { LessonService } from '../../../core/lesson.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.scss',
})
export class StudentDashboard {
  private readonly courseService = inject(CourseService);
  private readonly lessonService = inject(LessonService); // Needed for total lessons
  public readonly progressService = inject(ProgressService); // Make public for template if needed

  readonly userId = 1; // Hardcoded user ID, to be replaced with auth system

  readonly courses = this.courseService.courses;
  readonly allUserProgress = this.progressService.allUserProgress;

  readonly totalCompletedLessons = computed(() => {
    const progresses = this.allUserProgress();
    return progresses.reduce((acc: number, p: Progress) => acc + p.completedLessons.length, 0);
  });

  readonly totalPossibleLessons = computed(() => {
    const allCourses = this.courses();
    return allCourses.reduce((acc: number, c: Course) => acc + c.chapters.flatMap(chap => chap.lessons).length, 0);
  });

  readonly overallProgressPercentage = computed(() => {
    const completed = this.totalCompletedLessons();
    const total = this.totalPossibleLessons();
    return total > 0 ? (completed / total) * 100 : 0;
  });

  readonly getProgressForCourse = computed(() => (courseId: number) => {
    const progress = this.allUserProgress().find(p => p.userId === this.userId && p.courseId === courseId);
    const course = this.courses().find(c => c.id === courseId);
    if (!course || !progress) {
      return { completed: 0, total: course?.chapters.flatMap(c => c.lessons).length ?? 0, percentage: 0 };
    }
    const totalLessonsInCourse = course.chapters.flatMap(c => c.lessons).length;
    const completedLessonsInCourse = progress.completedLessons.length;
    return {
      completed: completedLessonsInCourse,
      total: totalLessonsInCourse,
      percentage: totalLessonsInCourse > 0 ? (completedLessonsInCourse / totalLessonsInCourse) * 100 : 0
    };
  });

  constructor() {
    this.courseService.fetchCourses();
    this.lessonService.fetchLessons(); // Ensure lessons are fetched for totalPossibleLessons calculation
    this.progressService.fetchAllProgressForUser(this.userId);
  }
}
