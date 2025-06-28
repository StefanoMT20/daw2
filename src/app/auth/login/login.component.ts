import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <img src="assets/logo.png" alt="Logo" class="logo" />
        </div>

        <form class="login-form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="email"
              placeholder="Ingresa tu correo electrónico"
              required
              [disabled]="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="password"
              placeholder="Ingresa tu contraseña"
              required
              [disabled]="isLoading"
            />
          </div>

          @if (errorMessage) {
            <div class="error-message">
              {{ errorMessage }}
            </div>
          }

          <button
            type="submit"
            class="login-button"
            [disabled]="isLoading || !email || !password"
          >
            {{ isLoading ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #0053bb 0%, #047489 100%);
      }

      .login-card {
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        width: 100%;
        max-width: 400px;
      }

      .login-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .logo {
        width: 210px;
        height: auto;
        margin-bottom: 1rem;
      }

      h1 {
        color: #333;
        font-size: 1.5rem;
        margin: 0;
      }

      .login-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      label {
        color: #555;
        font-size: 0.9rem;
      }

      input {
        padding: 0.75rem;
        border: 2px solid #e0e0e0;
        border-radius: 0.5rem;
        font-size: 1rem;
        transition: border-color 0.3s;
      }

      input:focus {
        outline: none;
        border-color: #0053bb;
      }

      input:disabled {
        background-color: #f5f5f5;
        cursor: not-allowed;
      }

      .error-message {
        color: #dc3545;
        font-size: 0.9rem;
        text-align: center;
        padding: 0.5rem;
        background: #ffe6e6;
        border-radius: 0.5rem;
      }

      .login-button {
        background: #0053bb;
        color: white;
        padding: 0.75rem;
        border: none;
        border-radius: 0.5rem;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.3s;
      }

      .login-button:hover:not(:disabled) {
        background: #004397;
      }

      .login-button:disabled {
        background: #cccccc;
        cursor: not-allowed;
      }
    `,
  ],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  onSubmit() {
    if (this.isLoading || !this.email || !this.password) return;

    this.errorMessage = '';
    this.isLoading = true;

    this.authService
      .login(this.email, this.password)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (user) => {
          if (user) {
            console.log('Login exitoso:', user);
            this.router.navigate([this.authService.getRedirectUrl()]);
          } else {
            this.errorMessage =
              'No se recibió el token de autenticación. Intente nuevamente.';
          }
        },
        error: (error) => {
          console.error('Error de autenticación:', error);
          if (error.status === 401) {
            this.errorMessage = 'Correo electrónico o contraseña incorrectos';
          } else if (error.status === 0) {
            this.errorMessage =
              'No se pudo conectar con el servidor. Por favor, verifica tu conexión.';
          } else {
            this.errorMessage =
              'Error al conectar con el servidor. Intente nuevamente.';
          }
        },
      });
  }

}