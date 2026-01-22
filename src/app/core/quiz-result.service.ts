import { Injectable, signal, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type QuizResult = {
  userId: number;
  chapterId: number;
  score: number;
  total: number;
};

@Injectable({ providedIn: 'root' })
export class QuizResultService {
  private readonly apiUrl = 'http://localhost:3000/quizResults';
  private readonly _results = signal<QuizResult[]>([]);
  readonly results: Signal<QuizResult[]> = this._results.asReadonly();

  constructor(private readonly http: HttpClient) {}

  fetchResults() {
    this.http.get<QuizResult[]>(this.apiUrl).subscribe(r => this._results.set(r));
  }

  saveResult(result: QuizResult) {
    const exists = this._results().find(r => r.userId === result.userId && r.chapterId === result.chapterId);
    if (exists) return;
    this.http.post(this.apiUrl, result).subscribe(() => this.fetchResults());
  }

  getResult(userId: number, chapterId: number): QuizResult | undefined {
    return this._results().find(r => r.userId === userId && r.chapterId === chapterId);
  }
}
