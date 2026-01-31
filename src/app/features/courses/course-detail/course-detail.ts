import { Component, computed, effect, inject, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoPlayer } from '../video-player/video-player';
import { ChapterQuiz, QuizQuestion } from '../chapter-quiz/chapter-quiz';
import { QuizService } from '../../../core/quiz.service';
import { ActivatedRoute } from '@angular/router';
import { CourseService, Course } from '../../../core/course.service';
import { LessonService, Lesson } from '../../../core/lesson.service';
import { ProgressService } from '../../../core/progress.service';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, VideoPlayer, ChapterQuiz],
  templateUrl: './course-detail.html',
  styleUrl: './course-detail.scss',
})
export class CourseDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly courseService = inject(CourseService);
  private readonly lessonService = inject(LessonService);
  private readonly quizService = inject(QuizService);
  public readonly progressService = inject(ProgressService);

  readonly userId = 1; // Hardcoded user ID, to be replaced with auth system

  readonly course = computed(() => {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    return this.courseService.courses().find(c => c.id === id);
  });

  readonly lessons: Signal<Lesson[]> = this.lessonService.lessons;

  readonly lessonsByChapter = computed(() => {
    const c = this.course();
    if (!c) return {};
    const allLessons = this.lessons();
    console.log('DEBUG CourseDetail chapters:', c.chapters);

    return Object.fromEntries(
      c.chapters.map(chap => {
        // Détecter si les leçons sont stockées comme IDs (number) ou Objets
        if (chap.lessons.length > 0 && typeof chap.lessons[0] === 'number') {
          // Cas 1 : IDs (Relationnel) -> On filtre depuis allLessons
          const lessonIds = chap.lessons as any as number[];
          return [chap.id, allLessons.filter(lesson => lessonIds.includes(lesson.id))];
        } else {
          // Cas 2 : Objets (Nested) -> On utilise direct, mais on s'assure qu'ils ont un ID (simulé si besoin)
          // Attention : les leçons nested n'ont peut-être pas d'ID unique global, ce qui peut poser problème pour la sélection
          // On va essayer de mapper pour avoir une structure compatible Lesson
          const nestedLessons = (chap.lessons as any[]).map((l, index) => ({
            ...l,
            id: l.id || (chap.id * 1000 + index) // Génération d'ID temporaire pour la sélection si manquant
          })) as Lesson[];
          return [chap.id, nestedLessons];
        }
      })
    );
  });

  readonly totalLessonsCount = computed(() => this.course()?.chapters.flatMap(c => c.lessons).length ?? 0);
  readonly completedLessonsCount = computed(() => this.progressService.currentCourseProgress()?.completedLessons.length ?? 0);

  selectedLessonId = signal<number | null>(null);
  selectedChapterId = signal<number | null>(null);

  get quizQuestions(): QuizQuestion[] {
    const chapterId = this.selectedChapterId();
    if (!chapterId) return [];
    const quiz = this.quizService.getQuizByChapter(chapterId);
    return quiz?.questions ?? [];
  }

  constructor() {
    this.courseService.fetchCourses();
    this.lessonService.fetchLessons();
    this.quizService.fetchQuizzes();

    // Effect to fetch progress when the course changes
    effect(() => {
      const currentCourse = this.course();
      if (currentCourse) {
        this.progressService.getProgressForCourse(this.userId, currentCourse.id);
      }
    });
  }

  selectLesson(id: number) {
    this.selectedLessonId.set(id);
  }

  onSelectChapter(id: number) {
    this.selectedChapterId.set(id);
  }

  getLessonVideoUrl(lid: number): string {
    const allConsolidatedLessons = Object.values(this.lessonsByChapter()).flat();
    return allConsolidatedLessons.find(l => l.id === lid)?.videoUrl ?? '';
  }

  toggleLesson(courseId: number, lessonId: number, event: Event) {
    event.stopPropagation(); // Empêche le clic de se propager (si nécessaire)
    this.progressService.toggleLessonStatus(this.userId, courseId, lessonId);
  }
}
