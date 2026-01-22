import { Injectable, signal, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type Quiz = {
  id: number;
  chapterId: number;
  questions: {
    id: number;
    question: string;
    choices: string[];
    answer: number;
  }[];
};

@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly apiUrl = 'http://localhost:3000/quizzes';
  private readonly _quizzes = signal<Quiz[]>([]);
  readonly quizzes: Signal<Quiz[]> = this._quizzes.asReadonly();

  constructor(private readonly http: HttpClient) {}

  fetchQuizzes() {
    this.http.get<Quiz[]>(this.apiUrl).subscribe(q => this._quizzes.set(q));
  }

  getQuizByChapter(chapterId: number): Quiz | undefined {
    return this._quizzes().find(q => q.chapterId === chapterId);
  }
}
