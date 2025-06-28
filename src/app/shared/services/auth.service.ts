import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Observable,
  tap,
  BehaviorSubject,
  catchError,
  of,
  switchMap,
} from 'rxjs';
import { environment } from '../../../environments/environment';

interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  codigo_estudiante: string;
  carrera_id: number;
  ciclo_actual: string;
  rol: string;
}

interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private token: string | null = null;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<User | null> {
    const body = {
      email: email,
      password: password,
    };

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, body, {
        observe: 'response',
      })
      .pipe(
        tap((response) => {
          console.log('Respuesta login:', response);
          const token = response.body?.token;
          if (token) {
            this.setToken(token);
          } else {
            console.error('No se recibió token en el login.');
          }
        }),
        switchMap(() => this.loadCurrentUser())
      );
  }

  private loadCurrentUser(): Observable<User | null> {
    return this.http
      .get<User>(`${this.apiUrl}/me`, this.getAuthOptions())
      .pipe(
        tap((user) => {
          console.log('Usuario cargado:', user);
          this.currentUserSubject.next(user);
        }),
        catchError((error) => {
          console.error('Error al cargar usuario:', error);
          this.currentUserSubject.next(null);
          return of(null);
        })
      );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`, this.getAuthOptions());
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    const rol = this.currentUserSubject.value?.rol?.toUpperCase();
    return rol === 'ADMINISTRADOR';
  }

  isStudent(): boolean {
    const rol = this.currentUserSubject.value?.rol?.toUpperCase();
    return rol === 'ESTUDIANTE';
  }

  logout(): void {
    this.token = null;
    this.currentUserSubject.next(null);
    localStorage.removeItem('token');
  }

  getRedirectUrl(): string {
    const user = this.currentUserSubject.value;
    console.log('Usuario actual para redirección:', user);

    if (!user) {
      console.log('No hay usuario, redirigiendo a login');
      return '/login';
    }

    const rol = user.rol?.toUpperCase();
    console.log('Rol del usuario:', rol);

    if (rol === 'ADMINISTRADOR') {
      console.log('Usuario es admin, redirigiendo a /admin/courses');
      return '/admin/courses';
    }

    console.log('Usuario es estudiante, redirigiendo a /student/projection');
    return '/student/projection';
  }

  private setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getAuthOptions() {
    const token = this.token || localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }),
      withCredentials: true,
    };
  }

  public getAuthHeaders(): HttpHeaders {
    const token = this.token || localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
  }
}
