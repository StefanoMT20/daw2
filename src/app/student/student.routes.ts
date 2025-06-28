import { Routes } from '@angular/router';
import { StudentDashboardComponent } from './dashboard/student-dashboard.component';
import { CourseProjectionComponent } from './course-projection/course-projection.component';
import { ScheduleViewerComponent } from './schedule-viewer/schedule-viewer.component';

export const STUDENT_ROUTES: Routes = [
  {
    path: '',
    component: StudentDashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'projection',
        pathMatch: 'full',
      },
      {
        path: 'projection',
        component: CourseProjectionComponent,
      },
      {
        path: 'schedule',
        component: ScheduleViewerComponent,
      },
    ],
  },
];
