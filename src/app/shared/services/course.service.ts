import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map, catchError, switchMap } from 'rxjs/operators';
import { TeacherService, Teacher } from './teacher.service';
import { AuthService } from '../../shared/services/auth.service';

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
  modality: 'Presencial' | 'Virtual';
  shift: 'Mañana' | 'Tarde' | 'Noche';
  campus: string;
  prerequisites: string[];
  description: string;
}

export interface BackendCourse {
  id: number;
  codigoCurso: string;
  nombre: string;
  descripcion: string;
  creditos: number;
  ciclo: string;
  carreraId: number;
  areaConocimiento: string;
  modalidad: string;
  sede: string;
  turno: string;
  vacantesTotales: number;
  vacantesDisponibles: number;
  docenteId: number | null;
  horarioDias: string;
  horaInicio: string;
  horaFin: string;
  aula: string;
  enlaceVirtual: string | null;
  activo: boolean;
  fechaCreacion: string;
}

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private apiUrl = `${environment.apiUrl}/courses`;

  constructor(
    private http: HttpClient,
    private teacherService: TeacherService,
    private authService: AuthService
  ) {}

  getAllCourses(): Observable<Course[]> {
    console.log('Solicitando todos los cursos al backend');
    return this.http
      .get<BackendCourse[]>(this.apiUrl, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        switchMap((courses) => {
          console.log('Cursos recibidos del backend:', courses);
          if (!courses || !Array.isArray(courses) || courses.length === 0) {
            console.log('No se encontraron cursos, usando datos de muestra');
            return of(this.getSampleCourses());
          }
          const teacherRequests = courses.map((course) =>
            this.getTeacherForCourse(course.docenteId)
          );
          return forkJoin(teacherRequests).pipe(
            map((teachers) =>
              courses.map((course, index) =>
                this.initializeCourse(course, teachers[index])
              )
            )
          );
        }),
        catchError((error) => {
          console.error('Error al obtener los cursos:', error);
          return of(this.getSampleCourses());
        })
      );
  }

  getAvailableCourses(careerId: number, cycle: string): Observable<Course[]> {
    console.log('Solicitando cursos disponibles:', { careerId, cycle });
    const params = new HttpParams()
      .set('careerId', careerId.toString())
      .set('cycle', cycle);

    return this.http
      .get<BackendCourse[]>(this.apiUrl, {
        params,
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        switchMap((courses) => {
          if (!Array.isArray(courses)) {
            console.error('La respuesta del backend no es un array:', courses);
            return of([]);
          }
          const teacherRequests = courses.map((course) =>
            this.getTeacherForCourse(course.docenteId)
          );
          return forkJoin(teacherRequests).pipe(
            map((teachers) =>
              courses.map((course, index) =>
                this.initializeCourse(course, teachers[index])
              )
            )
          );
        }),
        catchError((error) => {
          console.error('Error al obtener los cursos:', error);
          return of([]);
        })
      );
  }

  getCourseById(id: number): Observable<Course> {
    return this.http
      .get<BackendCourse>(`${this.apiUrl}/${id}`, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        switchMap((course) =>
          this.getTeacherForCourse(course.docenteId).pipe(
            map((teacher) => this.initializeCourse(course, teacher))
          )
        )
      );
  }

  createCourse(course: Partial<BackendCourse>): Observable<any> {
    const courseToSend = {
      ...course,
      horarioDias: course.horarioDias || 'LUN',
      horaInicio: course.horaInicio || '08:00',
      horaFin: course.horaFin || '10:00',
      aula: course.aula || 'A-101',
      modalidad: course.modalidad || 'presencial',
      vacantesTotales: course.vacantesTotales || 30,
      vacantesDisponibles: course.vacantesTotales || 30,
      activo: true,
    };

    return this.http
      .post(`${this.apiUrl}`, courseToSend, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error al crear curso:', error);
          return throwError(() => error);
        })
      );
  }

  updateCourse(id: number, course: Partial<BackendCourse>): Observable<any> {
    const courseToSend = {
      ...course,
      horarioDias: course.horarioDias || 'LUN',
      horaInicio: course.horaInicio || '08:00',
      horaFin: course.horaFin || '10:00',
      aula: course.aula || 'A-101',
      modalidad: course.modalidad || 'presencial',
      vacantesTotales: course.vacantesTotales || 30,
      vacantesDisponibles: course.vacantesTotales || 30,
      activo: true,
    };

    return this.http
      .put(`${this.apiUrl}/${id}`, courseToSend, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error al actualizar curso:', error);
          return throwError(() => error);
        })
      );
  }

  deleteCourse(id: number): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/${id}`, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error al eliminar curso:', error);
          return throwError(() => error);
        })
      );
  }

  private getTeacherForCourse(docenteId: number | null): Observable<Teacher | undefined> {
    if (!docenteId) {
      return of(undefined);
    }
    return this.teacherService.getTeacher(docenteId).pipe(
      catchError((error) => {
        console.error('Error al obtener docente:', error);
        return of(undefined);
      })
    );
  }

  private initializeCourse(backendCourse: BackendCourse, teacher?: Teacher): Course {
    const modalidad = backendCourse.modalidad.charAt(0).toUpperCase() + backendCourse.modalidad.slice(1).toLowerCase();
    const turno = backendCourse.turno.charAt(0).toUpperCase() + backendCourse.turno.slice(1).toLowerCase();

    const teacherInfo = {
      id: backendCourse.docenteId?.toString() || '',
      nombre: teacher?.nombre || '',
      apellido: teacher?.apellido || '',
      email: teacher?.email || '',
      especialidad: teacher?.especialidad || '',
      departamento: teacher?.departamento || '',
      ubicacion_oficina: teacher?.ubicacion_oficina || '',
      horario_atencion: teacher?.horario_atencion || '',
      areas_investigacion: teacher?.areas_investigacion || '',
      grado_academico: teacher?.grado_academico || '',
    };

    let schedule = '';
    if (backendCourse.horarioDias && backendCourse.horaInicio && backendCourse.horaFin) {
      schedule = `${backendCourse.horarioDias} ${backendCourse.horaInicio} - ${backendCourse.horaFin}`;
    }

    return {
      code: backendCourse.codigoCurso || '',
      name: backendCourse.nombre || '',
      credits: backendCourse.creditos || 0,
      teacher: teacherInfo,
      schedule,
      slots: backendCourse.vacantesTotales || 0,
      classroom: backendCourse.aula || '',
      modality: modalidad as 'Presencial' | 'Virtual',
      shift: turno as 'Mañana' | 'Tarde' | 'Noche',
      campus: backendCourse.sede || '',
      prerequisites: [],
      description: backendCourse.descripcion || '',
    };
  }

  private getSampleCourses(): Course[] {
    return [
      {
        code: 'ISW-C03-01',
        name: 'Algoritmos y Estructuras de Datos',
        credits: 4,
        teacher: {
          id: '1',
          nombre: 'Juan',
          apellido: 'Pérez',
          email: 'juan.perez@universidad.edu',
          especialidad: 'Ciencias de la Computación',
          departamento: 'Ingeniería de Software',
          ubicacion_oficina: 'Edificio A, Oficina 101',
          horario_atencion: 'Lunes y Miércoles 14:00-16:00',
          areas_investigacion: 'Algoritmos',
          grado_academico: 'Doctor',
        },
        schedule: 'LUN-MIE 08:00 - 10:00',
        slots: 30,
        classroom: 'A-101',
        modality: 'Presencial',
        shift: 'Mañana',
        campus: 'Campus Principal',
        prerequisites: [],
        description: 'Curso de algoritmos y estructuras de datos',
      }
    ];
  }
}
