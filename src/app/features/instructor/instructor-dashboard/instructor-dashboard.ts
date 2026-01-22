import { Component, inject, Signal, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService, Course } from '../../../core/course.service';

// Interfaces for a more structured form
interface LessonForm {
  id?: number;
  title: string;
  videoUrl: string;
}

interface ChapterForm {
  id?: number;
  title: string;
  lessons: LessonForm[];
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
  readonly courses: Signal<Course[]> = this.courseService.courses;

  showForm = signal(false);
  editId = signal<number|null>(null);
  form: WritableSignal<CourseForm> = signal({ title: '', category: '', description: '', instructorId: 2, chapters: [] });

  openAdd() {
    this.showForm.set(true);
    this.editId.set(null);
    this.form.set({ title: '', category: '', description: '', instructorId: 2, chapters: [] });
  }

  openEdit(course: Course) {
    this.showForm.set(true);
    this.editId.set(course.id);
    // Deep copy to avoid direct mutation of the original course object
    this.form.set(JSON.parse(JSON.stringify(course)));
  }

  save() {
    const value = this.form();
    if (this.editId()) {
      this.courseService.updateCourse(this.editId()!, value);
    } else {
      this.courseService.addCourse(value);
    }
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

  constructor() {
    this.courseService.fetchCourses();
  }
}
