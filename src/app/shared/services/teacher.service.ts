import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../shared/services/auth.service';

export interface Teacher {
  id: number;
  codigo_docente: string;
  nombre: string;
  apellido: string;
  email: string;
  especialidad: string;
  departamento: string;
  ubicacion_oficina: string;
  horario_atencion: string;
  areas_investigacion: string;
  grado_academico: string;
}

@Injectable({
  providedIn: 'root',
})
export class TeacherService {
  private apiUrl = `${environment.apiUrl}/teachers`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getTeacher(id: number): Observable<Teacher | undefined> {
    console.log('TeacherService: Solicitando docente con ID:', id);
    return this.http
      .get<Teacher>(`${this.apiUrl}/${id}`, {
        headers: this.authService.getAuthHeaders(),
        withCredentials: true,
      })
      .pipe(
        map((teacher) => {
          console.log('TeacherService: Datos del docente recibidos:', teacher);
          return {
            ...teacher,
            departamento: teacher.departamento || '',
            ubicacion_oficina: teacher.ubicacion_oficina || '',
            horario_atencion: teacher.horario_atencion || '',
            areas_investigacion: teacher.areas_investigacion || '',
            grado_academico: teacher.grado_academico || '',
          };
        }),
        catchError((error) => {
          console.error('TeacherService: Error al obtener docente:', error);
          return of(undefined);
        })
      );
  }

  getAllTeachers(): Observable<Teacher[]> {
    return this.http
      .get<Teacher[]>(this.apiUrl, {
        headers: this.authService.getAuthHeaders(),
        withCredentials: true,
      })
      .pipe(
        map((teachers) => {
          console.log('TeacherService: Lista de docentes recibida:', teachers);
          return teachers.map((teacher) => ({
            ...teacher,
            departamento: teacher.departamento || '',
            ubicacion_oficina: teacher.ubicacion_oficina || '',
            horario_atencion: teacher.horario_atencion || '',
            areas_investigacion: teacher.areas_investigacion || '',
            grado_academico: teacher.grado_academico || '',
          }));
        }),
        catchError((error) => {
          console.error(
            'TeacherService: Error al obtener todos los docentes:',
            error
          );
          return of([]);
        })
      );
  }
}
