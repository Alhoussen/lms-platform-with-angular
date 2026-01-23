import { Component, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CourseService, Course } from '../../../core/course.service';

@Component({
  selector: 'app-course-catalog',
  imports: [CommonModule, RouterModule],
  templateUrl: './course-catalog.html',
  styleUrl: './course-catalog.scss',
})
export class CourseCatalog {
  private readonly courseService = inject(CourseService);
  readonly courses: Signal<Course[]> = this.courseService.courses;

  constructor() {
    this.courseService.fetchCourses();
  }
}
