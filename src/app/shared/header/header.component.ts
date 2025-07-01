import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CareerService } from '../services/career.service';
import { switchMap, of, catchError } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="main-header">
      <div class="header-content">
        <div class="logo-section">
          <ng-container *ngIf="isAdmin; else studentLogo">
            <img src="assets/logo-header.png" alt="Logo Admin" />
          </ng-container>
          <ng-template #studentLogo>
            <img src="assets/logo-header.png" alt="Logo Student" />
          </ng-template>
          <h1 class="app-title">
            {{ isAdmin ? 'Same Banner - Panel Administrativo' : 'Same Banner' }}
          </h1>
        </div>

        <div class="user-info">
          <ng-container *ngIf="isAdmin; else studentInfo">
            <div class="admin-badges">
              <span class="admin-badge">Administrador</span>
              <span class="admin-badge highlight">{{ currentPeriod }}</span>
            </div>
          </ng-container>
          <ng-template #studentInfo>
            <div class="student-info">
              <span class="student-name">{{ studentName }}</span>
              <span class="career-info">{{ careerInfo }}</span>
            </div>
          </ng-template>

          <button class="logout-button" (click)="logout()">
            <i class="fas fa-sign-out-alt"></i>
            <span class="logout-text">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      .main-header {
        background: linear-gradient(135deg, #047489 0%, #0053bb 100%);
        color: white;
        padding: 1rem 2rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
        z-index: 10;
        width: 100%;
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1400px;
        margin: 0 auto;
        flex-wrap: nowrap;
      }

      .logo-section {
        display: flex;
        align-items: center;
        gap: 1rem;
        min-width: 0;
      }

      .app-title {
        font-size: 1.2rem;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .logo {
        height: 40px;
        width: 40px;
        min-width: 40px; /* Evita que el logo se encoja */
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 1.5rem;
      }

      /* Estilos para administrador */
      .admin-badges {
        display: flex;
        gap: 0.8rem;
      }

      .admin-badge {
        font-size: 0.85rem;
        font-weight: 500;
        background: rgba(255, 255, 255, 0.15);
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        white-space: nowrap;
      }

      .admin-badge.highlight {
        background: rgba(255, 255, 255, 0.25);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }

      /* Estilos para estudiante */
      .student-info {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }

      .student-name {
        font-size: 1.1rem;
        font-weight: 500;
      }

      .career-info {
        font-size: 0.9rem;
        opacity: 0.9;
      }

      /* Estilos comunes */
      .logout-button {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        white-space: nowrap;
        min-width: 44px;
        min-height: 44px;
        justify-content: center;
      }

      .logout-button:hover {
        background: white;
        color: #0053bb;
        transform: translateY(-1px);
      }

      /* Media queries mejorados */
      @media (max-width: 992px) {
        .admin-badges {
          display: none;
        }

        .main-header {
          padding: 0.8rem 1.5rem;
        }
      }

      @media (max-width: 768px) {
        .main-header {
          padding: 0.8rem 1rem;
        }

        .header-content {
          gap: 0.5rem;
        }

        .logo-section {
          gap: 0.5rem;
        }

        .app-title {
          font-size: 1rem;
          max-width: 180px;
        }

        .user-info {
          gap: 0.8rem;
        }

        .logout-text {
          display: none;
        }

        .logout-button {
          padding: 0.5rem;
          min-width: 40px;
        }
      }

      @media (max-width: 480px) {
        .main-header {
          padding: 0.7rem;
        }

        .header-content {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          gap: 0.25rem;
        }

        .logo-section {
          gap: 0.4rem;
        }

        .logo {
          width: 36px;
          height: 36px;
          min-width: 36px;
        }

        .app-title {
          font-size: 0.9rem;
          max-width: 140px;
        }

        .admin-name,
        .student-name {
          font-size: 0.85rem;
        }

        .career-info {
          font-size: 0.75rem;
        }

        .student-info {
          align-items: flex-end;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .student-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .career-info {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        .logout-button {
          min-width: 36px;
          min-height: 36px;
          padding: 0.4rem;
          border-radius: 4px;
        }
      }
    `,
  ],
})
export class HeaderComponent implements OnInit {
  isAdmin: boolean = false;
  studentName: string = '';
  careerInfo: string = '';
  currentPeriod: string = '2025-II';

  constructor(
    private authService: AuthService,
    private careerService: CareerService,
    private router: Router
  ) {}

  private formatCiclo(ciclo?: string): string {
    return ciclo ? ciclo.replace('_', ' ') : 'Sin ciclo';
  }

  ngOnInit() {
    this.authService.currentUser$
      .pipe(
        switchMap((user) => {
          if (!user) {
            return of(null);
          }

          this.isAdmin = this.authService.isAdmin();

          if (!this.isAdmin && user) {
            this.studentName = `${user.nombre} ${user.apellido}`;
            return this.careerService.getCarrera(user.carreraId).pipe(
              switchMap((carrera) => {
                const cicloFormateado = this.formatCiclo(user?.cicloActual);
                this.careerInfo = `${carrera.nombre} - ${cicloFormateado}`;
                return of(null);
              }),
              catchError((error) => {
                console.error('Error al cargar la carrera:', error);
                const cicloFormateado = this.formatCiclo(user?.cicloActual);
                this.careerInfo = `${cicloFormateado}`;
                return of(null);
              })
            );
          }

          return of(null);
        })
      )
      .subscribe();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
