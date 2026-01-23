import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CourseService, Course } from '../../../core/course.service';
import { ProgressService, Progress } from '../../../core/progress.service';
import { LessonService } from '../../../core/lesson.service';
import { CertificateService } from '../../../core/certificate.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.scss',
})
export class StudentDashboard {
  private readonly courseService = inject(CourseService);
  private readonly lessonService = inject(LessonService);
  public readonly progressService = inject(ProgressService);
  private readonly certificateService = inject(CertificateService);

  readonly userId = 1; // Hardcoded user ID

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

  readonly isEligibleForCertificate = computed(() => (courseId: number) => {
    const stats = this.getProgressForCourse()(courseId);
    return this.certificateService.isEligibleForCertificate(stats.completed, stats.total);
  });

  constructor() {
    this.courseService.fetchCourses();
    this.lessonService.fetchLessons();
    this.progressService.fetchAllProgressForUser(this.userId);
  }

  downloadCertificate(course: Course) {
    // Dans un vrai cas, on récupérerait le nom de l'étudiant depuis un AuthService
    const studentName = "Alhoussen";

    // Pour cet exemple, on met un score fictif de 100% si le quiz n'est pas lié
    const score = 100;

    this.certificateService.generateCertificate({
      id: Date.now(),
      userId: this.userId,
      courseId: course.id,
      courseName: course.title,
      studentName: studentName,
      completionDate: new Date(),
      score: score
    });
  }
}
