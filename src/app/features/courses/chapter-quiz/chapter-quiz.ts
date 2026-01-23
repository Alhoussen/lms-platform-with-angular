import { Component, Input, signal, inject, OnInit } from '@angular/core';
import { QuizResultService } from '../../../core/quiz-result.service';
import { CommonModule } from '@angular/common';

export type QuizQuestion = {
  id: number;
  question: string;
  choices: string[];
  answer: number;
};

@Component({
  selector: 'app-chapter-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chapter-quiz.html',
  styleUrl: './chapter-quiz.scss',
})
export class ChapterQuiz implements OnInit {
  @Input() questions: QuizQuestion[] = [];
  @Input() chapterId!: number;
  @Input() userId: number = 1;

  // Expose String to template
  readonly String = String;

  current = signal(0);
  selected = signal<number | null>(null);
  feedback = signal<string | null>(null);
  finished = signal(false);
  score = signal(0);
  alreadyPassed = signal(false);

  private readonly quizResultService = inject(QuizResultService);

  ngOnInit() {
    this.quizResultService.fetchResults();
    const res = this.quizResultService.getResult(this.userId, this.chapterId);
    if (res) {
      this.alreadyPassed.set(true);
      this.score.set(res.score);
      this.finished.set(true);
    }
  }

  selectChoice(idx: number) {
    this.selected.set(idx);
  }

  submit() {
    const q = this.questions[this.current()];
    if (this.selected() === q.answer) {
      this.feedback.set('Bonne réponse !');
      this.score.set(this.score() + 1);
    } else {
      this.feedback.set('Mauvaise réponse.');
    }
  }

  next() {
    if (this.current() < this.questions.length - 1) {
      this.current.set(this.current() + 1);
      this.selected.set(null);
      this.feedback.set(null);
    } else {
      this.finished.set(true);
      // Sauvegarder le score si non déjà passé
      if (!this.alreadyPassed()) {
        this.quizResultService.saveResult({
          userId: this.userId,
          chapterId: this.chapterId,
          score: this.score(),
          total: this.questions.length
        });
        this.alreadyPassed.set(true);
      }
    }
  }
}

