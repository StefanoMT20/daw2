import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  template: `
    <div class="student-dashboard">
      <app-header></app-header>
      <div class="main-content">
        <main class="content-area">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .student-dashboard {
        height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .main-content {
        display: flex;
        flex: 1;
        background: #f5f5f5;
      }

      .content-area {
        flex: 1;
        padding: 2rem;
        overflow-y: auto;
      }

      @media (max-width: 768px) {
        .content-area {
          padding: 1rem;
        }
      }

      @media (max-width: 480px) {
        .content-area {
          padding: 0.75rem;
        }
      }
    `,
  ],
})
export class StudentDashboardComponent {
  logout() {
    // Implementar lógica de logout
  }
}
