import { Injectable, signal, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';


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

  constructor(private readonly http: HttpClient) { }

  fetchQuizzes() {
    this.http.get<Quiz[]>(this.apiUrl).subscribe(q => this._quizzes.set(q));
  }

  getQuizByChapter(chapterId: number): Quiz | undefined {
    return this._quizzes().find(q => q.chapterId === chapterId);
  }

  addQuiz(quiz: Omit<Quiz, 'id'>) {
    return this.http.post<Quiz>(this.apiUrl, quiz).pipe(
      tap(newQuiz => this._quizzes.update(qs => [...qs, newQuiz]))
    );
  }

  updateQuiz(quiz: Quiz) {
    return this.http.put<Quiz>(`${this.apiUrl}/${quiz.id}`, quiz).pipe(
      tap(updated => this._quizzes.update(qs => qs.map(q => q.id === updated.id ? updated : q)))
    );
  }

  deleteQuiz(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this._quizzes.update(qs => qs.filter(q => q.id !== id)))
    );
  }
}
