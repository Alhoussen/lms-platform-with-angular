import { Component, inject, Signal, signal, WritableSignal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService, Course } from '../../../core/course.service';
import { QuizService, Quiz } from '../../../core/quiz.service';

// Interfaces for a more structured form
interface LessonForm {
  id?: number;
  title: string;
  videoUrl: string;
}

interface QuestionForm {
  id?: number;
  question: string;
  choices: string[];
  answer: number;
}

interface QuizForm {
  id?: number;
  questions: QuestionForm[];
}

interface ChapterForm {
  id?: number; // Cet ID sera généré par nous si manquant
  title: string;
  lessons: LessonForm[];
  quiz?: QuizForm; // Optional quiz for the chapter
}

export interface CourseForm {
  id?: number;
  title: string;
  category: string;
  description: string;
  instructorId: number;
  chapters: ChapterForm[];
}

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './instructor-dashboard.html',
  styleUrl: './instructor-dashboard.scss',
})
export class InstructorDashboard {
  private readonly courseService = inject(CourseService);
  private readonly quizService = inject(QuizService);

  readonly courses: Signal<Course[]> = this.courseService.courses;
  // On a besoin de charger les quizzes aussi

  showForm = signal(false);
  editId = signal<number | null>(null);
  form: WritableSignal<CourseForm> = signal({ title: '', category: '', description: '', instructorId: 2, chapters: [] });

  constructor() {
    this.courseService.fetchCourses();
    this.quizService.fetchQuizzes();
  }

  openAdd() {
    this.showForm.set(true);
    this.editId.set(null);
    this.form.set({ title: '', category: '', description: '', instructorId: 2, chapters: [] });
  }

  openEdit(course: Course) {
    this.showForm.set(true);
    this.editId.set(course.id);

    // Deep copy of the course
    const formData: CourseForm = JSON.parse(JSON.stringify(course));

    // Attach quizzes to chapters
    formData.chapters.forEach(chapter => {
      if (chapter.id) {
        const quiz = this.quizService.getQuizByChapter(chapter.id);
        if (quiz) {
          chapter.quiz = {
            id: quiz.id,
            questions: JSON.parse(JSON.stringify(quiz.questions))
          };
        }
      }
    });

    this.form.set(formData);
  }

  save() {
    const value = this.form();

    // Générer des IDs pour les nouveaux chapitres pour pouvoir lier les quiz
    value.chapters.forEach(chapter => {
      if (!chapter.id) {
        chapter.id = Date.now() + Math.floor(Math.random() * 1000);
      }
    });

    // 1. Sauvegarder le cours
    if (this.editId()) {
      this.courseService.updateCourse(this.editId()!, value);
    } else {
      this.courseService.addCourse(value);
    }

    // 2. Sauvegarder les quiz
    value.chapters.forEach(chapter => {
      if (chapter.quiz && chapter.quiz.questions.length > 0) {
        // Préparer l'objet Quiz pour le service
        const quizData: any = {
          chapterId: chapter.id!,
          questions: chapter.quiz.questions
        };

        if (chapter.quiz.id) {
          // Update
          quizData.id = chapter.quiz.id;
          this.quizService.updateQuiz(quizData).subscribe();
        } else {
          // Create
          this.quizService.addQuiz(quizData).subscribe();
        }
      }
    });

    this.showForm.set(false);
  }

  remove(id: number) {
    this.courseService.deleteCourse(id);
  }

  cancel() {
    this.showForm.set(false);
  }

  // --- Chapter and Lesson Management ---

  addChapter() {
    this.form.update(f => {
      f.chapters.push({ title: '', lessons: [] });
      return { ...f };
    });
  }

  removeChapter(chapterIndex: number) {
    this.form.update(f => {
      f.chapters.splice(chapterIndex, 1);
      return { ...f };
    });
  }

  addLesson(chapterIndex: number) {
    this.form.update(f => {
      f.chapters[chapterIndex].lessons.push({ title: '', videoUrl: '' });
      return { ...f };
    });
  }

  removeLesson(chapterIndex: number, lessonIndex: number) {
    this.form.update(f => {
      f.chapters[chapterIndex].lessons.splice(lessonIndex, 1);
      return { ...f };
    });
  }

  // --- Quiz Management ---

  addQuizToChapter(chapterIndex: number) {
    this.form.update(f => {
      if (!f.chapters[chapterIndex].quiz) {
        f.chapters[chapterIndex].quiz = { questions: [] };
      }
      return { ...f };
    });
  }

  addQuestion(chapterIndex: number) {
    this.form.update(f => {
      if (!f.chapters[chapterIndex].quiz) {
        f.chapters[chapterIndex].quiz = { questions: [] };
      }
      f.chapters[chapterIndex].quiz!.questions.push({
        question: '',
        choices: ['', '', ''],
        answer: 0
      });
      return { ...f };
    });
  }

  removeQuestion(chapterIndex: number, questionIndex: number) {
    this.form.update(f => {
      if (f.chapters[chapterIndex].quiz) {
        f.chapters[chapterIndex].quiz!.questions.splice(questionIndex, 1);
      }
      return { ...f };
    });
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }
}
