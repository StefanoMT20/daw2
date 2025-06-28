import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Course {
  code: string;
  name: string;
  credits: number;
  teacher: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    especialidad: string;
    departamento: string;
    ubicacion_oficina: string;
    horario_atencion: string;
    areas_investigacion: string;
    grado_academico: string;
  };
  schedule: string;
  slots: number;
  classroom: string;
  modality: string;
  shift: string;
  campus: string;
  prerequisites: string[];
  description: string;
}

export interface ProyeccionCurso {
  id: number;
  curso: any;
  fechaAgregado: string;
}

export interface Projection {
  id: number;
  usuarioId: number;
  cicloProyectado: string;
  proyeccionCursos: ProyeccionCurso[];
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CreateProjectionRequest {
  cicloProyectado: string;
  codigosCursos: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ProjectionService {
  private apiUrl = `${environment.apiUrl}/student/projections`;

  constructor(private http: HttpClient) {}

  getProjection(): Observable<Projection | null> {
    return this.http
      .get<Projection>(this.apiUrl, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        observe: 'response',
      })
      .pipe(
        map((response) => {
          if (!response.body) {
            console.log('Respuesta vacía del servidor');
            return null;
          }
          const projection = response.body;
          if (
            projection.proyeccionCursos &&
            projection.proyeccionCursos.length > 0
          ) {
            console.log('Proyección existente encontrada:', projection);
            // Convertir los cursos del backend al formato del frontend
            const convertedProjection = {
              ...projection,
              proyeccionCursos: projection.proyeccionCursos.map((pc) => ({
                ...pc,
                curso: {
                  code: pc.curso.codigoCurso,
                  name: pc.curso.nombre,
                  credits: pc.curso.creditos,
                  teacher: pc.curso.docente
                    ? {
                        id: pc.curso.docente.id.toString(),
                        nombre: pc.curso.docente.nombre || '',
                        apellido: pc.curso.docente.apellido || '',
                        email: pc.curso.docente.email || '',
                        especialidad: pc.curso.docente.especialidad || '',
                        departamento: pc.curso.docente.departamento || '',
                        ubicacion_oficina:
                          pc.curso.docente.ubicacion_oficina || '',
                        horario_atencion:
                          pc.curso.docente.horario_atencion || '',
                        areas_investigacion:
                          pc.curso.docente.areas_investigacion || '',
                        grado_academico: pc.curso.docente.grado_academico || '',
                      }
                    : {
                        id: pc.curso.docenteId?.toString() || '',
                        nombre: '',
                        apellido: '',
                        email: '',
                        especialidad: '',
                        departamento: '',
                        ubicacion_oficina: '',
                        horario_atencion: '',
                        areas_investigacion: '',
                        grado_academico: '',
                      },
                  schedule:
                    pc.curso.horarioDias &&
                    pc.curso.horaInicio &&
                    pc.curso.horaFin
                      ? `${pc.curso.horarioDias} ${pc.curso.horaInicio} - ${pc.curso.horaFin}`
                      : '',
                  slots: pc.curso.vacantesTotales,
                  classroom: pc.curso.aula,
                  modality:
                    pc.curso.modalidad.charAt(0).toUpperCase() +
                    pc.curso.modalidad.slice(1).toLowerCase(),
                  shift:
                    pc.curso.turno.charAt(0).toUpperCase() +
                    pc.curso.turno.slice(1).toLowerCase(),
                  campus: pc.curso.sede,
                  prerequisites: [],
                  description: pc.curso.descripcion,
                },
              })),
            };
            console.log('Proyección convertida:', convertedProjection);
            return convertedProjection;
          }
          console.log('No se encontró proyección existente');
          return null;
        }),
        catchError((error) => {
          console.error('Error al obtener la proyección:', error);
          if (error.status === 401) {
            console.log('Usuario no autenticado');
          } else if (error.status === 404) {
            console.log('No se encontró la proyección');
          } else {
            console.log('Error del servidor:', error.message);
          }
          return of(null);
        })
      );
  }

  createProjection(
    cicloProyectado: string,
    cursos: any[]
  ): Observable<Projection | null> {
    if (!cursos || cursos.length === 0) {
      console.error('No se proporcionaron cursos para la proyección');
      return of(null);
    }

    const payload: CreateProjectionRequest = {
      cicloProyectado: this.formatCiclo(cicloProyectado),
      codigosCursos: cursos.map((curso) => curso.code),
    };

    return this.http
      .post<Projection>(this.apiUrl, payload, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        observe: 'response',
      })
      .pipe(
        map((response) => {
          if (!response.body) {
            throw new Error('No se recibió respuesta del servidor');
          }
          console.log('Proyección creada:', response.body);
          return response.body;
        }),
        catchError((error) => {
          console.error('Error al crear la proyección:', error);
          if (error.status === 401) {
            throw new Error('Usuario no autenticado');
          } else if (error.status === 400) {
            throw new Error(
              'Datos de proyección inválidos: ' + error.error?.message
            );
          } else {
            throw new Error('Error del servidor: ' + error.message);
          }
        })
      );
  }

  private formatCiclo(ciclo: string): string {
    // Si ya tiene el formato correcto, devolverlo
    if (/^Ciclo_\d{2}$/.test(ciclo)) {
      return ciclo;
    }

    // Si es un número, formatearlo
    const num = parseInt(ciclo);
    if (!isNaN(num) && num >= 1 && num <= 10) {
      return `Ciclo_${String(num).padStart(2, '0')}`;
    }

    // Si tiene otro formato, intentar extraer el número
    const match = ciclo.match(/\d+/);
    if (match) {
      const num = parseInt(match[0]);
      if (num >= 1 && num <= 10) {
        return `Ciclo_${String(num).padStart(2, '0')}`;
      }
    }

    throw new Error('Formato de ciclo inválido');
  }
}
