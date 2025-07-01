import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../shared/services/auth.service';

export interface Carrera {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: number;
}

export interface Career {
  id: number;
  codigo_carrera: string;
  nombre: string;
  descripcion: string;
  duracion_ciclos: number;
  activa: boolean;
  fecha_creacion: string;
}

@Injectable({
  providedIn: 'root',
})
export class CareerService {
  private apiUrl = `${environment.apiUrl}/carreras`;

  private carrerasMap = new Map<number, string>([
    [1, 'Ingeniería de Software'],
    [2, 'Psicología'],
    [3, 'Derecho'],
  ]);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getCarrera(id: number): Observable<Carrera> {
    const nombreCarrera = this.carrerasMap.get(id) || 'Sin carrera';

    const carrera: Carrera = {
      id: id,
      nombre: nombreCarrera,
      descripcion: '',
      duracion: 0,
    };

    return of(carrera);
  }

  getCareerById(id: number): Observable<Career> {
    return this.http.get<Career>(
      `${this.apiUrl}/${id}`,
      {
        headers: this.authService.getAuthHeaders(),
        withCredentials: true,
      }
    );
  }

  getAllCareers(): Observable<Career[]> {
    return this.http
      .get<Career[]>(this.apiUrl, {
        headers: this.authService.getAuthHeaders(),
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          console.error('Error al obtener carreras:', error);
          const fallbackCareers: Career[] = [
            {
              id: 1,
              codigo_carrera: 'ISW',
              nombre: 'Ingeniería de Software',
              descripcion: 'Carrera de ingeniería de software',
              duracion_ciclos: 10,
              activa: true,
              fecha_creacion: new Date().toISOString(),
            },
            {
              id: 2,
              codigo_carrera: 'PSI',
              nombre: 'Psicología',
              descripcion: 'Carrera de psicología',
              duracion_ciclos: 10,
              activa: true,
              fecha_creacion: new Date().toISOString(),
            },
            {
              id: 3,
              codigo_carrera: 'DER',
              nombre: 'Derecho',
              descripcion: 'Carrera de derecho',
              duracion_ciclos: 12,
              activa: true,
              fecha_creacion: new Date().toISOString(),
            },
          ];
          return of(fallbackCareers);
        })
      );
  }
}
