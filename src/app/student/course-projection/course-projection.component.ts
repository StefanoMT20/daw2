import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';
import { CareerService } from '../../shared/services/career.service';
import { CourseService } from '../../shared/services/course.service';
import {
  ProjectionService,
  Projection,
  Course,
} from '../../shared/services/projection.service';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

interface ScheduleEvent {
  id: string;
  name: string;
  day: string;
  startTime: string;
  endTime: string;
  classroom: string;
  teacher: string;
  modality: 'Presencial' | 'Virtual';
}

interface TeacherPopupInfo {
  id: number;
  fullName: string;
  email: string;
  specialization: string;
  departamento: string;
  ubicacion_oficina: string;
  horario_atencion: string;
  areas_investigacion: string[];
  grado_academico: string;
}

@Component({
  selector: 'app-course-projection',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="main-container">
      <!-- Información del estudiante -->
      <div class="student-info-bar">
        <div class="student-info-details">
          <div class="info-item">
            <strong>Estudiante:</strong> {{ currentStudent?.nombre || '' }}
            {{ currentStudent?.apellido || '' }}
          </div>
          <div class="info-item">
            <strong>Código de alumno:</strong>
            {{ currentStudent?.codigo_estudiante || '' }}
          </div>
          <div class="info-item">
            <strong>Ciclo a proyectar:</strong>
            {{ formatCiclo(getNextCycle(currentStudent?.ciclo_actual)) }}
          </div>
          <div class="info-item">
            <strong>Carrera:</strong> {{ careerName }}
          </div>
          <div class="info-item">
            <strong>Correo:</strong> {{ currentStudent?.email || '' }}
          </div>
        </div>
      </div>

      <div class="projection-container">
        <!-- Sección de cursos disponibles -->
        <div
          id="courses-section"
          class="available-courses"
          [style.display]="hasExistingProjection ? 'none' : 'block'"
        >
          <div class="section-header">
            <h2>Cursos Disponibles</h2>
            <div class="total-credits">
              Créditos seleccionados: {{ selectedCredits }}/22
            </div>
          </div>

          <div class="modality-tabs">
            <button
              [class.active]="selectedModality === 'Todos'"
              (click)="changeModality('Todos')"
            >
              Todos
            </button>
            <button
              [class.active]="selectedModality === 'Presencial'"
              (click)="changeModality('Presencial')"
            >
              Presencial
            </button>
            <button
              [class.active]="selectedModality === 'Virtual'"
              (click)="changeModality('Virtual')"
            >
              Virtual
            </button>
          </div>

          <div class="table-container">
            <div class="table-responsive">
              @if (isLoading) {
              <div class="loading-message">Cargando cursos disponibles...</div>
              } @else if (!displayedCourses.length) {
              <div class="no-courses-message">
                No hay cursos disponibles para mostrar.
              </div>
              } @else {
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre del Curso</th>
                    <th>Créditos</th>
                    <th>Docente</th>
                    <th>Horario</th>
                    <th>Modalidad</th>
                    <th>Turno</th>
                    <th>Sede</th>
                    <th>Vacantes</th>
                    <th>Aula</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  @for (course of displayedCourses; track course.code) {
                  <tr>
                    <td class="code-column" data-label="Código">
                      {{ course.code }}
                    </td>
                    <td class="name-column" data-label="Nombre del Curso">
                      <div class="course-name" [title]="course.description">
                        {{ course.name }}
                        @if (course.prerequisites && course.prerequisites.length
                        > 0) {
                        <div class="prerequisites">
                          Prerrequisitos: {{ course.prerequisites.join(', ') }}
                        </div>
                        }
                      </div>
                    </td>
                    <td class="credits-column" data-label="Créditos">
                      {{ course.credits }}
                    </td>
                    <td class="teacher-column" data-label="Docente">
                      <button
                        class="teacher-button"
                        [class.unassigned]="
                          !course.teacher.nombre && !course.teacher.apellido
                        "
                        (click)="showTeacherInfo(course.teacher)"
                      >
                        {{
                          course.teacher.nombre && course.teacher.apellido
                            ? course.teacher.nombre +
                              ' ' +
                              course.teacher.apellido
                            : 'Sin asignar'
                        }}
                      </button>
                    </td>
                    <td class="schedule-column" data-label="Horario">
                      {{ formatSchedule(course.schedule) }}
                    </td>
                    <td class="modality-column" data-label="Modalidad">
                      <span
                        class="modality-badge {{
                          course.modality.toLowerCase()
                        }}"
                      >
                        {{ course.modality }}
                      </span>
                    </td>
                    <td class="shift-column" data-label="Turno">
                      {{ course.shift }}
                    </td>
                    <td class="campus-column" data-label="Sede">
                      {{ course.campus }}
                    </td>
                    <td class="slots-column" data-label="Vacantes">
                      {{ course.slots }}
                    </td>
                    <td class="classroom-column" data-label="Aula">
                      {{ course.classroom }}
                    </td>
                    <td class="action-column" data-label="Acción">
                      <button
                        class="add-button"
                        [class.unassigned-teacher]="
                          !course.teacher.nombre && !course.teacher.apellido
                        "
                        [class.different-modality]="hasModalityConflict(course)"
                        (click)="addCourse(course)"
                        [disabled]="
                          isCourseSelected(course) ||
                          (!course.teacher.nombre &&
                            !course.teacher.apellido) ||
                          hasModalityConflict(course)
                        "
                      >
                        <i
                          [class]="
                            !course.teacher.nombre && !course.teacher.apellido
                              ? 'fas fa-ban'
                              : 'fas fa-plus'
                          "
                        ></i>
                        <span>{{
                          !course.teacher.nombre && !course.teacher.apellido
                            ? 'Sin asignar'
                            : 'Agregar'
                        }}</span>
                      </button>
                    </td>
                  </tr>
                  }
                </tbody>
              </table>
              }
            </div>
          </div>
        </div>

        <!-- Mi Proyección -->
        <div class="selected-courses">
          <h3>Mi Proyección</h3>
          <div class="selected-courses-list">
            @for (course of selectedCourses; track course.code) {
            <div
              class="course-card"
              [style.padding-bottom]="hasExistingProjection ? '48px' : ''"
            >
              <div class="course-info">
                <h4>{{ course.name }}</h4>
                <p><strong>Código:</strong> {{ course.code }}</p>
                <p><strong>Créditos:</strong> {{ course.credits }}</p>
                <p>
                  <strong>Docente:</strong>
                  {{
                    course.teacher.nombre && course.teacher.apellido
                      ? course.teacher.nombre + ' ' + course.teacher.apellido
                      : 'Sin asignar'
                  }}
                </p>
                <p>
                  <strong>Horario:</strong>
                  {{ formatSchedule(course.schedule) }}
                </p>
              </div>
              <button
                class="remove-button"
                (click)="removeCourse(course)"
                [style.display]="hasExistingProjection ? 'none' : 'block'"
              >
                Eliminar
              </button>
              <span
                class="modality-badge"
                [class.presencial]="course.modality === 'Presencial'"
                [class.virtual]="course.modality === 'Virtual'"
              >
                <i
                  [class]="
                    course.modality === 'Presencial'
                      ? 'fas fa-building'
                      : 'fas fa-laptop'
                  "
                ></i>
                {{ course.modality }}
              </span>
            </div>
            }
          </div>

          <div
            class="action-buttons"
            [style.display]="hasExistingProjection ? 'none' : 'flex'"
          >
            <button class="save-button" (click)="saveProjection()">
              <i class="fas fa-save"></i>
              Guardar Proyección
            </button>
            <button class="view-schedule-button" (click)="scrollToSchedule()">
              <i class="fas fa-calendar-alt"></i>
              Ver Horario Semanal
            </button>
          </div>

          <div
            class="action-buttons"
            [style.display]="hasExistingProjection ? 'flex' : 'none'"
          >
            <button class="view-schedule-button" (click)="scrollToSchedule()">
              <i class="fas fa-calendar-alt"></i>
              Ver Horario Semanal
            </button>
          </div>
        </div>

        <!-- Horario semanal -->
        <div id="schedule-section" class="schedule-section">
          <div class="section-header">
            <h2>Horario Semanal</h2>
            <div class="schedule-actions">
              <button class="filter-button" (click)="toggleTimeFilter()">
                <i class="fas fa-filter"></i>
                <span>{{
                  showFullSchedule
                    ? 'Mostrar horas relevantes'
                    : 'Mostrar todas las horas'
                }}</span>
              </button>
              <button class="print-button" (click)="printSchedule()">
                <i class="fas fa-print"></i>
                <span>Imprimir</span>
              </button>
              <button class="export-button" (click)="exportSchedule()">
                <i class="fas fa-file-export"></i>
                <span>Exportar</span>
              </button>
            </div>
          </div>

          <div class="schedule-container">
            <div class="time-navigation">
              <button
                class="scroll-button"
                [class.active]="selectedPeriod === 'morning'"
                (click)="scrollSchedule('morning')"
              >
                <i class="fas fa-sun"></i> Mañana (6:00 - 11:59)
              </button>
              <button
                class="scroll-button"
                [class.active]="selectedPeriod === 'afternoon'"
                (click)="scrollSchedule('afternoon')"
              >
                <i class="fas fa-cloud-sun"></i> Tarde (12:00 - 18:59)
              </button>
              <button
                class="scroll-button"
                [class.active]="selectedPeriod === 'evening'"
                (click)="scrollSchedule('evening')"
              >
                <i class="fas fa-moon"></i> Noche (19:00 - 23:59)
              </button>
              <button
                class="scroll-button reset"
                [class.active]="selectedPeriod === 'all'"
                (click)="resetPeriodFilter()"
              >
                <i class="fas fa-clock"></i> Todas las horas
              </button>
            </div>

            <div class="schedule-grid" #scheduleGrid>
              <div class="time-column">
                <div class="header-cell"></div>
                @for (hour of getFilteredHours(); track hour) {
                <div class="time-cell" [id]="'hour-' + hour">
                  {{ formatHour(hour) }}
                </div>
                }
              </div>

              @for (day of days; track day) {
              <div class="day-column">
                <div class="header-cell">{{ day }}</div>
                @for (hour of getFilteredHours(); track hour) {
                <div class="schedule-cell">
                  @for (event of getEventsForDayAndHour(day, hour); track
                  event.id) {
                  <div
                    class="event-card"
                    [style.height.px]="getEventHeight(event)"
                    [style.top.px]="getEventTop(event)"
                    (click)="showEventDetails(event)"
                  >
                    <h4>{{ event.name }}</h4>
                    <p class="event-time">
                      {{ event.startTime }} - {{ event.endTime }}
                    </p>
                    <p class="event-location">
                      <i class="fas fa-map-marker-alt"></i>
                      {{ event.classroom }}
                    </p>
                    @if (event.modality) {
                    <span
                      class="modality-badge {{ event.modality.toLowerCase() }}"
                    >
                      {{ event.modality }}
                    </span>
                    }
                  </div>
                  }
                </div>
                }
              </div>
              }
            </div>
          </div>
        </div>

        <!-- Popup para detalles del curso en el horario -->
        @if (selectedEvent) {
        <div class="event-popup-overlay" (click)="closeEventDetails($event)">
          <div class="event-popup" (click)="$event.stopPropagation()">
            <div class="popup-header">
              <h3>{{ selectedEvent.name }}</h3>
              <button class="close-button" (click)="closeEventDetails($event)">
                ×
              </button>
            </div>
            <div class="popup-content">
              <div class="info-group">
                <i class="fas fa-clock"></i>
                <div>
                  <strong>Horario</strong>
                  <p>
                    {{ selectedEvent.day }}, {{ selectedEvent.startTime }} -
                    {{ selectedEvent.endTime }}
                  </p>
                </div>
              </div>
              <div class="info-group">
                <i class="fas fa-map-marker-alt"></i>
                <div>
                  <strong>Aula</strong>
                  <p>{{ selectedEvent.classroom }}</p>
                </div>
              </div>
              <div class="info-group">
                <i class="fas fa-chalkboard-teacher"></i>
                <div>
                  <strong>Docente</strong>
                  <p>{{ selectedEvent.teacher }}</p>
                </div>
              </div>
              @if (getEventCourse(selectedEvent)) {
              <div class="info-group">
                <i class="fas fa-info-circle"></i>
                <div>
                  <strong>Información del Curso</strong>
                  <p>Código: {{ getEventCourse(selectedEvent)?.code }}</p>
                  <p>Créditos: {{ getEventCourse(selectedEvent)?.credits }}</p>
                  <p>
                    Modalidad: {{ getEventCourse(selectedEvent)?.modality }}
                  </p>
                </div>
              </div>
              }
            </div>
          </div>
        </div>
        }
      </div>
    </div>

    <!-- Popup para información del docente -->
    @if (selectedTeacher) {
    <div class="teacher-popup-overlay" (click)="closeTeacherInfo($event)">
      <div class="teacher-popup" (click)="$event.stopPropagation()">
        <div class="popup-header">
          <div class="teacher-header-info">
            <h3>{{ selectedTeacher.fullName }}</h3>
            <div class="teacher-degree">
              {{ selectedTeacher.grado_academico }}
            </div>
          </div>
          <button class="close-button" (click)="closeTeacherInfo($event)">
            ×
          </button>
        </div>
        <div class="popup-content">
          <div class="info-group">
            <i class="fas fa-envelope"></i>
            <div>
              <strong>Correo electrónico</strong>
              <p>{{ selectedTeacher.email }}</p>
            </div>
          </div>
          <div class="info-group">
            <i class="fas fa-graduation-cap"></i>
            <div>
              <strong>Especialidad</strong>
              <p>{{ selectedTeacher.specialization }}</p>
            </div>
          </div>
          <div class="info-group">
            <i class="fas fa-building"></i>
            <div>
              <strong>Departamento</strong>
              <p>{{ selectedTeacher.departamento }}</p>
            </div>
          </div>
          <div class="info-group">
            <i class="fas fa-map-marker-alt"></i>
            <div>
              <strong>Ubicación de oficina</strong>
              <p>{{ selectedTeacher.ubicacion_oficina }}</p>
            </div>
          </div>
          <div class="info-group">
            <i class="fas fa-clock"></i>
            <div>
              <strong>Horario de atención</strong>
              <p>{{ selectedTeacher.horario_atencion }}</p>
            </div>
          </div>
          <div class="info-group">
            <i class="fas fa-microscope"></i>
            <div>
              <strong>Áreas de investigación</strong>
              <div class="research-areas">
                <ul>
                  @for (area of selectedTeacher.areas_investigacion; track area)
                  {
                  <li>{{ area }}</li>
                  }
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    } @if (printMode) {
    <div class="print-overlay" (click)="closePrintPreview($event)">
      <div class="print-container" (click)="$event.stopPropagation()">
        <div class="print-header">
          <h3>Vista previa de impresión</h3>
          <button class="close-button" (click)="closePrintPreview($event)">
            ×
          </button>
        </div>
        <div class="print-tabs">
          <button
            [class.active]="printTab === 'grid'"
            (click)="printTab = 'grid'"
          >
            Vista de cuadrícula
          </button>
          <button
            [class.active]="printTab === 'list'"
            (click)="printTab = 'list'"
          >
            Vista de lista
          </button>
        </div>
        <div class="print-content">
          @if (printTab === 'grid') {
          <div class="print-grid-view">
            <div class="schedule-grid-print">
              <div class="time-column">
                <div class="header-cell"></div>
                @for (hour of getFilteredHours(); track hour) {
                <div class="time-cell">{{ formatHour(hour) }}</div>
                }
              </div>

              @for (day of days; track day) {
              <div class="day-column">
                <div class="header-cell">{{ day }}</div>
                @for (hour of getFilteredHours(); track hour) {
                <div class="schedule-cell">
                  @for (event of getEventsForDayAndHour(day, hour); track
                  event.id) {
                  <div
                    class="event-card"
                    [style.height.px]="getEventHeight(event)"
                    [style.top.px]="getEventTop(event)"
                  >
                    <h4>{{ event.name }}</h4>
                    <p class="event-time">
                      {{ event.startTime }} - {{ event.endTime }}
                    </p>
                    <p class="event-location">
                      <i class="fas fa-map-marker-alt"></i>
                      {{ event.classroom }}
                    </p>
                    @if (event.modality) {
                    <span
                      class="modality-badge {{ event.modality.toLowerCase() }}"
                    >
                      {{ event.modality }}
                    </span>
                    }
                  </div>
                  }
                </div>
                }
              </div>
              }
            </div>
          </div>
          } @if (printTab === 'list') {
          <div class="print-list-view">
            @for (day of getDaysWithEvents(); track day) {
            <div class="day-schedule">
              <h4>{{ day }}</h4>
              <div class="day-events">
                @for (event of getEventsForDay(day); track event.id) {
                <div class="event-list-item">
                  <div class="event-time-range">
                    {{ event.startTime }} - {{ event.endTime }}
                  </div>
                  <div class="event-details">
                    <div class="event-name">{{ event.name }}</div>
                    <div class="event-info">
                      <span
                        ><i class="fas fa-map-marker-alt"></i>
                        {{ event.classroom }}</span
                      >
                      <span
                        ><i class="fas fa-chalkboard-teacher"></i>
                        {{ event.teacher }}</span
                      >
                      @if (event.modality) {
                      <span
                        class="modality-badge {{
                          event.modality.toLowerCase()
                        }}"
                        ><i class="fas fa-laptop"></i>
                        {{ event.modality }}</span
                      >
                      } @if (getEventCourse(event)) {
                      <span
                        ><i class="fas fa-info-circle"></i>
                        {{ getEventCourse(event)?.code }}</span
                      >
                      }
                    </div>
                  </div>
                </div>
                }
              </div>
            </div>
            } @if (events.length === 0) {
            <div class="no-events">
              <p>No hay eventos programados en el horario</p>
            </div>
            }
          </div>
          }
        </div>
        <div class="print-actions">
          <button class="print-now-button" (click)="executePrint()">
            <i class="fas fa-print"></i> Imprimir ahora
          </button>
          <button class="cancel-button" (click)="closePrintPreview($event)">
            Cancelar
          </button>
        </div>
      </div>
    </div>
    }
  `,
  styles: [
    `
      .main-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
        padding: 1rem;
        margin: 0;
      }

      .modality-tabs {
        display: flex;
        background: white;
        margin-bottom: 1rem;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      .modality-tabs button {
        flex: 1;
        padding: 0.8rem 1rem;
        background: none;
        border: none;
        cursor: pointer;
        font-weight: 500;
        color: #666;
        transition: all 0.3s;
        position: relative;
        text-align: center;
      }

      .modality-tabs button.active {
        color: #0053bb;
        background: #f0f5ff;
      }

      .modality-tabs button.active::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 25%;
        width: 50%;
        height: 3px;
        background: #0053bb;
        border-radius: 3px 3px 0 0;
      }

      .modality-tabs button:hover:not(.active) {
        background: #f8f9fa;
      }

      /* Barra de información del estudiante */
      .student-info-bar {
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        padding: 1rem;
        margin-bottom: 1.5rem;
        border-left: 5px solid #0053bb;
      }

      .student-info-details {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem 2rem;
      }

      .info-item {
        color: #444;
        font-size: 0.9rem;
      }

      .info-item strong {
        color: #0053bb;
        font-weight: 500;
        margin-right: 0.3rem;
      }

      .student-header {
        display: none;
      }

      .projection-container {
        animation: fadeIn 0.5s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .section-header {
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        margin-bottom: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        animation: slideIn 0.5s ease;
        flex-wrap: wrap;
        gap: 1rem;
      }

      @keyframes slideIn {
        from {
          transform: translateX(-20px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .total-credits {
        background: linear-gradient(135deg, #047489 0%, #0053bb 100%);
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 20px;
        font-weight: 500;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
      }

      .total-credits:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
      }

      .table-container {
        margin: 1.5rem 0;
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        overflow: hidden;
      }

      .table-responsive {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        font-size: 0.95rem;
      }

      th,
      td {
        padding: 0.8rem 1rem;
        text-align: left;
        vertical-align: middle;
        border-bottom: 1px solid #f0f0f0;
      }

      th {
        background: linear-gradient(135deg, #f8f9fa 0%, #eef1f5 100%);
        color: #444;
        font-weight: 600;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        white-space: nowrap;
        position: sticky;
        top: 0;
        z-index: 1;
      }

      tr:hover td {
        background-color: #f8f9fa;
      }

      tr:last-child td {
        border-bottom: none;
      }

      .code-column {
        font-family: 'Courier New', monospace;
        color: #0053bb;
        font-weight: 500;
        letter-spacing: -0.5px;
        white-space: nowrap;
      }

      .name-column {
        min-width: 200px;
      }

      .credits-column {
        text-align: center;
        width: 80px;
      }

      .schedule-column,
      .teacher-column,
      .campus-column,
      .classroom-column {
        white-space: nowrap;
      }

      .course-name {
        font-weight: 500;
      }

      .prerequisites {
        font-size: 0.8rem;
        color: #666;
        margin-top: 0.3rem;
      }

      .modality-badge {
        display: inline-block;
        padding: 0.3rem 0.6rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
        text-align: center;
      }

      .modality-badge.presencial {
        background-color: #e3f2fd;
        color: #1565c0;
      }

      .modality-badge.virtual {
        background-color: #fff3e0;
        color: #e65100;
      }

      .modality-badge.híbrido {
        background-color: #fff8e1;
        color: #ff8f00;
      }

      .add-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        background: linear-gradient(135deg, #7ad11a 0%, #68b416 100%);
        color: white;
        border: none;
        padding: 0.6rem 1.2rem;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s;
        font-weight: 500;
        white-space: nowrap;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
      }

      .add-button:hover:not(:disabled) {
        background: linear-gradient(135deg, #68b416 0%, #5aa012 100%);
        transform: translateY(-1px);
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
      }

      .add-button:disabled {
        background: #e0e0e0;
        cursor: not-allowed;
        box-shadow: none;
        color: #999;
      }

      .add-button.unassigned-teacher:disabled {
        background: transparent;
        color: #999999;
        padding: 8px;
        border: none;
        box-shadow: none;
        position: relative;
      }

      .add-button:disabled {
        cursor: not-allowed;
        position: relative;
      }

      .add-button:disabled:not(.unassigned-teacher) {
        background: #e0e0e0;
        box-shadow: none;
        color: #999;
      }

      .add-button.unassigned-teacher:disabled:hover::after {
        content: 'Curso aún no habilitado hasta que se asigne un docente';
        position: absolute;
        right: 100%;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-size: 0.85rem;
        white-space: nowrap;
        z-index: 1000;
        margin-right: 10px;
      }

      .add-button.unassigned-teacher:disabled:hover::before {
        content: '';
        position: absolute;
        right: -5px;
        top: 50%;
        transform: translateY(-50%);
        border-left: 5px solid rgba(0, 0, 0, 0.8);
        border-top: 5px solid transparent;
        border-bottom: 5px solid transparent;
        z-index: 1000;
      }

      .add-button.different-modality:disabled:hover::after {
        content: 'No puedes seleccionar el mismo curso en diferentes modalidades';
        position: absolute;
        right: 100%;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-size: 0.85rem;
        white-space: nowrap;
        z-index: 1000;
        margin-right: 10px;
      }

      .add-button.different-modality:disabled:hover::before {
        content: '';
        position: absolute;
        right: -5px;
        top: 50%;
        transform: translateY(-50%);
        border-left: 5px solid rgba(0, 0, 0, 0.8);
        border-top: 5px solid transparent;
        border-bottom: 5px solid transparent;
        z-index: 1000;
      }

      .teacher-button {
        background: none;
        border: none;
        color: #0053bb;
        padding: 0;
        font-size: inherit;
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 2px;
      }

      .teacher-button.unassigned {
        color: #888;
        cursor: default;
        text-decoration: none;
      }

      .teacher-button:hover:not(.unassigned) {
        color: #004397;
      }

      /* Adaptaciones responsive */
      @media (max-width: 1200px) {
        th,
        td {
          padding: 0.7rem 0.8rem;
        }
      }

      @media (max-width: 992px) {
        .table-responsive {
          padding-bottom: 0.5rem;
        }
      }

      @media (max-width: 768px) {
        th,
        td {
          padding: 0.6rem 0.7rem;
          font-size: 0.9rem;
        }

        .table-container {
          margin: 1rem 0;
        }
      }

      /* Vista de tarjetas para móviles */
      @media (max-width: 576px) {
        .table-responsive table {
          display: block;
        }

        .table-responsive thead {
          display: none;
        }

        .table-responsive tbody {
          display: block;
        }

        .table-responsive tr {
          display: block;
          margin-bottom: 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          background-color: white;
        }

        .table-responsive td {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          border-bottom: 1px solid #f0f0f0;
          text-align: right;
        }

        .table-responsive td:last-child {
          border-bottom: none;
        }

        .table-responsive td::before {
          content: attr(data-label);
          font-weight: 600;
          color: #0053bb;
          flex: 1;
          text-align: left;
          padding-right: 0.5rem;
        }

        .code-column,
        .name-column,
        .teacher-column,
        .schedule-column,
        .campus-column,
        .classroom-column {
          white-space: normal;
        }

        .add-button {
          margin-left: auto;
        }

        .modality-badge {
          margin-left: auto;
        }

        .prerequisites {
          width: 100%;
          text-align: left;
          margin-top: 0.5rem;
        }

        .course-name {
          display: flex;
          flex-direction: column;
          width: 100%;
          text-align: left;
        }

        .table-responsive .action-column {
          width: 100%;
          min-width: auto;
          white-space: normal;
          display: flex;
          justify-content: flex-end;
          padding: 0.75rem 0.5rem;
        }

        .add-button {
          margin-left: auto;
        }
      }

      /* Mejora de la barra de desplazamiento para dispositivos táctiles */
      @media (hover: none) {
        .table-responsive::-webkit-scrollbar {
          height: 8px;
        }

        .table-responsive::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .table-responsive::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
      }

      .selected-courses {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin-top: 2rem;
      }

      .selected-courses h3 {
        margin: 0 0 1rem 0;
        color: #333;
      }

      .selected-courses-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
      }

      .course-card {
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        background: #f8f9fa;
        flex-wrap: wrap;
        gap: 1rem;
        position: relative;
      }

      .course-card .modality-badge {
        position: absolute;
        bottom: 8px;
        right: 8px;
        padding: 0.3rem 0.6rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.3rem;
      }

      .course-card .modality-badge.presencial {
        background-color: #e3f2fd;
        color: #1565c0;
      }

      .course-card .modality-badge.virtual {
        background-color: #fff3e0;
        color: #e65100;
      }

      .course-info {
        flex: 1;
        min-width: 200px;
      }

      .course-info h4 {
        margin: 0 0 0.5rem 0;
        color: #0053bb;
      }

      .course-info p {
        margin: 0 0 0.25rem 0;
        color: #666;
        font-size: 0.9rem;
      }

      .remove-button {
        background: #dc3545;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;
        white-space: nowrap;
      }

      .remove-button:hover {
        background: #c82333;
      }

      .teacher-popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(4px);
        padding: 1rem;
      }

      .teacher-popup {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        width: 400px;
        max-width: 90vw;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        animation: popupFadeIn 0.3s ease;
      }

      @keyframes popupFadeIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      .close-button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #666;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s;
      }

      .close-button:hover {
        background: #f0f0f0;
        color: #333;
      }

      .popup-header {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 12px 12px 0 0;
        display: flex;
        gap: 1rem;
        align-items: center;
        border-bottom: 1px solid #eee;
        position: relative;
        flex-wrap: wrap;
      }

      .teacher-photo {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        object-fit: cover;
      }

      .teacher-header-info {
        flex: 1;
        min-width: 150px;
      }

      .teacher-degree {
        font-size: 0.8rem;
        color: #666;
      }

      .popup-content {
        padding: 1rem;
      }

      .info-group {
        display: flex;
        gap: 1rem;
        padding: 0.75rem 0;
        border-bottom: 1px solid #eee;
      }

      .info-group:last-child {
        border-bottom: none;
      }

      .info-group i {
        color: #0053bb;
        width: 20px;
        text-align: center;
      }

      .info-group > div {
        flex: 1;
      }

      .info-group strong {
        display: block;
        font-size: 0.8rem;
        color: #666;
        margin-bottom: 0.25rem;
      }

      .info-group p {
        margin: 0;
        font-size: 0.9rem;
        color: #333;
        word-break: break-word;
      }

      .research-areas {
        margin-top: 1rem;
      }

      .research-areas strong {
        display: block;
        font-size: 0.8rem;
        color: #666;
        margin-bottom: 0.5rem;
      }

      .research-areas ul {
        margin: 0;
        padding-left: 1.5rem;
        font-size: 0.9rem;
      }

      .research-areas li {
        margin-bottom: 0.25rem;
        color: #333;
      }

      @media (max-width: 768px) {
        .main-container {
          padding: 0.5rem;
        }

        .projection-container {
          padding: 0.5rem;
        }

        .section-header {
          flex-direction: column;
          align-items: flex-start;
          padding: 1rem;
        }

        th,
        td {
          padding: 0.75rem 0.5rem;
          font-size: 0.9rem;
        }

        .add-button,
        .remove-button {
          padding: 0.4rem 0.75rem;
          font-size: 0.8rem;
        }

        .selected-courses {
          padding: 1rem;
        }

        .selected-courses-list {
          grid-template-columns: 1fr;
        }

        .course-card {
          flex-direction: column;
        }

        .remove-button {
          align-self: flex-end;
        }

        .teacher-popup {
          width: 95vw;
          max-height: 80vh;
        }

        .popup-header {
          padding: 0.75rem;
        }

        .info-group {
          flex-wrap: wrap;
        }
      }

      @media (max-width: 480px) {
        .student-info h1 {
          font-size: 1.1rem;
        }

        .student-details span {
          font-size: 0.75rem;
        }

        .section-header h2 {
          font-size: 1.2rem;
        }

        .total-credits {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
        }

        .table-responsive {
          min-height: 300px;
        }

        .add-button i {
          display: none;
        }

        .add-button {
          padding: 0.3rem 0.5rem;
        }

        .teacher-photo {
          width: 50px;
          height: 50px;
        }

        .teacher-popup {
          width: 100%;
          max-height: 85vh;
        }

        .popup-header {
          padding: 0.75rem;
        }

        .popup-header h3 {
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
        }

        .teacher-degree {
          font-size: 0.75rem;
        }

        .popup-content {
          padding: 0.75rem;
        }

        .info-group {
          padding: 0.5rem 0;
        }

        .info-group strong {
          font-size: 0.75rem;
        }

        .info-group p {
          font-size: 0.85rem;
        }

        .research-areas strong {
          font-size: 0.75rem;
        }

        .research-areas ul {
          padding-left: 1.25rem;
        }

        .research-areas li {
          font-size: 0.85rem;
          margin-bottom: 0.15rem;
        }
      }

      /* Vista de tabla compacta para móviles */
      @media (max-width: 768px) {
        .table-responsive table {
          display: block;
        }

        .table-responsive thead {
          display: none;
        }

        .table-responsive tbody {
          display: block;
        }

        .table-responsive tbody tr {
          display: block;
          margin-bottom: 1rem;
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 0.5rem;
          background: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .table-responsive td {
          display: flex;
          padding: 0.5rem;
          border-bottom: 1px solid #f5f5f5;
          text-align: right;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
        }

        .table-responsive td:last-child {
          border-bottom: none;
        }

        .table-responsive td::before {
          content: attr(data-label);
          font-weight: bold;
          margin-right: 1rem;
          text-align: left;
          flex: 1;
          color: #666;
        }

        .table-responsive .name-column {
          flex-direction: column;
          align-items: flex-start;
        }

        .table-responsive .name-column::before {
          margin-bottom: 0.5rem;
        }

        .table-responsive .course-name {
          width: 100%;
        }

        .table-responsive .prerequisites {
          margin-top: 0.5rem;
          font-size: 0.8rem;
          padding-left: 0;
        }

        .table-responsive .code-column,
        .table-responsive .name-column,
        .table-responsive .credits-column,
        .table-responsive .teacher-column,
        .table-responsive .schedule-column,
        .table-responsive .modality-column,
        .table-responsive .shift-column,
        .table-responsive .campus-column,
        .table-responsive .slots-column,
        .table-responsive .classroom-column,
        .table-responsive .action-column {
          width: 100%;
          min-width: auto;
          white-space: normal;
        }

        .table-responsive .action-column {
          display: flex;
          justify-content: center;
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid #eee;
        }

        .table-responsive .add-button {
          width: 100%;
          justify-content: center;
        }

        .teacher-popup {
          width: 95vw;
          max-height: 80vh;
        }
      }

      /* Estilos para botones de acción */
      .action-buttons {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
        flex-wrap: wrap;
      }

      .save-button,
      .view-schedule-button {
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        transition: all 0.3s;
        border: none;
      }

      .save-button {
        background: #7ad11a;
        color: white;
      }

      .save-button:hover {
        background: #68b416;
      }

      .view-schedule-button {
        background: #0053bb;
        color: white;
      }

      .view-schedule-button:hover {
        background: #004397;
      }

      /* Estilos para la sección de horario */
      .schedule-section {
        margin-top: 3rem;
        scroll-margin-top: 150px;
      }

      .schedule-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .print-button,
      .export-button,
      .filter-button {
        background: transparent;
        border: 1px solid #0053bb;
        color: #0053bb;
        padding: 0.5rem 0.75rem;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s;
        font-size: 0.9rem;
      }

      .print-button:hover,
      .export-button:hover,
      .filter-button:hover {
        background: #0053bb;
        color: white;
      }

      .time-navigation {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
        overflow-x: auto;
        padding-bottom: 0.5rem;
        -webkit-overflow-scrolling: touch;
      }

      .scroll-button {
        background: #f0f5ff;
        border: 1px solid #ccd9ff;
        color: #0053bb;
        padding: 0.6rem 1rem;
        border-radius: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s;
        font-size: 0.9rem;
        white-space: nowrap;
        min-width: fit-content;
      }

      .scroll-button.active {
        background: #0053bb;
        color: white;
        border-color: #0053bb;
      }

      .scroll-button:hover:not(.active) {
        background: #d1e1ff;
      }

      .scroll-button.reset {
        background: #f5f5f5;
        border-color: #ddd;
        color: #666;
      }

      .scroll-button.reset.active {
        background: #666;
        color: white;
        border-color: #666;
      }

      .scroll-button.reset:hover:not(.active) {
        background: #e0e0e0;
      }

      @media (max-width: 768px) {
        .time-navigation {
          padding-bottom: 0.8rem;
        }

        .scroll-button {
          padding: 0.5rem 0.8rem;
          font-size: 0.85rem;
        }
      }

      @media (max-width: 480px) {
        .scroll-button {
          padding: 0.4rem 0.6rem;
          font-size: 0.8rem;
        }

        .scroll-button i {
          margin-right: 0.3rem;
        }
      }

      .schedule-container {
        background: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        margin-top: 1.5rem;
        max-width: 100%;
        display: flex;
        flex-direction: column;
      }

      .schedule-grid {
        display: flex;
        min-width: 600px;
        max-width: 100%;
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
      }

      .time-column,
      .day-column {
        flex: 1;
      }

      .time-column {
        min-width: 50px;
        max-width: 50px;
        position: sticky;
        left: 0;
        background: white;
        z-index: 2;
      }

      .day-column {
        min-width: 100px;
      }

      .header-cell {
        height: 40px;
        background: #0053bb;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        border-right: 1px solid #fff;
        position: sticky;
        top: 0;
        z-index: 1;
        font-size: 0.9rem;
      }

      .time-column .header-cell {
        z-index: 3;
      }

      .time-cell {
        height: 50px;
        border-bottom: 1px solid #eee;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        font-size: 0.8rem;
        background: white;
      }

      .schedule-cell {
        height: 50px;
        border-bottom: 1px solid #eee;
        border-right: 1px solid #eee;
        position: relative;
      }

      .event-card {
        position: absolute;
        width: calc(100% - 4px);
        left: 2px;
        background: #e6f0ff;
        border-left: 3px solid #0053bb;
        padding: 0.3rem;
        overflow: hidden;
        z-index: 1;
        cursor: pointer;
        transition: all 0.2s;
      }

      .event-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
        background: #d1e1ff;
      }

      .event-card h4 {
        margin: 0 0 0.15rem 0;
        font-size: 0.8rem;
        color: #0053bb;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .event-card p {
        margin: 0;
        font-size: 0.7rem;
        color: #666;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .event-time {
        margin-bottom: 0.1rem;
      }

      .event-location {
        font-size: 0.65rem !important;
      }

      .event-card .modality-badge {
        position: absolute;
        bottom: 2px;
        right: 2px;
        padding: 0.15rem 0.3rem;
        border-radius: 4px;
        font-size: 0.6rem;
        font-weight: 500;
        text-align: center;
        opacity: 0.9;
      }

      .event-card .modality-badge.presencial {
        background-color: #e3f2fd;
        color: #1565c0;
      }

      .event-card .modality-badge.virtual {
        background-color: #fff3e0;
        color: #e65100;
      }

      /* Popup para detalles del evento */
      .event-popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(4px);
        padding: 1rem;
      }

      .event-popup {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        width: 350px;
        max-width: 90vw;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        animation: popupFadeIn 0.3s ease;
      }

      .event-popup .popup-header {
        background: #0053bb;
        color: white;
        padding: 1rem;
        border-radius: 12px 12px 0 0;
        position: relative;
      }

      .event-popup .popup-header h3 {
        margin: 0;
        font-size: 1.2rem;
        padding-right: 20px;
      }

      .event-popup .close-button {
        position: absolute;
        top: 0.6rem;
        right: 1rem;
        background: none;
        border: none;
        font-size: 1.5rem;
        color: white;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .event-popup .popup-content {
        padding: 1rem;
      }

      /* Media queries adicionales para la sección de horario */
      @media (max-width: 768px) {
        .schedule-section .section-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .schedule-actions {
          margin-top: 0.5rem;
          width: 100%;
          justify-content: flex-start;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          -webkit-overflow-scrolling: touch;
        }

        .print-button,
        .export-button,
        .filter-button {
          padding: 0.4rem 0.6rem;
          font-size: 0.8rem;
          white-space: nowrap;
          min-height: 36px;
        }

        .scroll-button {
          padding: 0.3rem 0.6rem;
          font-size: 0.8rem;
        }

        .day-column {
          min-width: 80px;
        }

        .schedule-container {
          padding: 0.75rem;
        }

        .schedule-grid {
          overflow-x: auto;
          min-width: 100%;
          width: 100%;
          padding-bottom: 0.5rem;
          -webkit-overflow-scrolling: touch;
        }
      }

      @media (max-width: 480px) {
        .schedule-section {
          margin-top: 2rem;
        }

        .schedule-actions {
          justify-content: space-between;
          gap: 0.3rem;
        }

        .print-button span,
        .export-button span,
        .filter-button span {
          display: none;
        }

        .print-button,
        .export-button,
        .filter-button {
          padding: 0.4rem;
          width: 36px;
          height: 36px;
          justify-content: center;
          min-height: unset;
        }

        .scroll-button {
          padding: 0.3rem 0.5rem;
          font-size: 0.75rem;
          min-height: 32px;
        }

        .scroll-button i {
          margin-right: 0.2rem;
        }

        .day-column {
          min-width: 70px;
        }
      }

      /* Estilos para la vista de impresión */
      .print-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1100;
        backdrop-filter: blur(5px);
        padding: 1rem;
      }

      .print-container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
        width: 90%;
        max-width: 900px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: popupFadeIn 0.3s ease;
      }

      .print-header {
        background: #0053bb;
        color: white;
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .print-header h3 {
        margin: 0;
      }

      .print-tabs {
        display: flex;
        border-bottom: 1px solid #eee;
      }

      .print-tabs button {
        flex: 1;
        padding: 1rem;
        border: none;
        background: none;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s;
        color: #666;
      }

      .print-tabs button.active {
        border-bottom: 3px solid #0053bb;
        color: #0053bb;
        font-weight: 500;
      }

      .print-content {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        min-height: 300px;
      }

      .print-actions {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        border-top: 1px solid #eee;
        justify-content: flex-end;
      }

      .print-now-button {
        background: #0053bb;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s;
      }

      .print-now-button:hover {
        background: #004397;
      }

      .cancel-button {
        background: #f0f0f0;
        color: #333;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
      }

      .cancel-button:hover {
        background: #e0e0e0;
      }

      /* Estilos para la vista de cuadrícula imprimible */
      .schedule-grid-print {
        display: flex;
        width: 100%;
        min-height: 500px;
      }

      /* Estilos para la vista de lista */
      .print-list-view {
        padding: 1rem;
      }

      .schedule-info {
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #eee;
      }

      .student-print-info {
        font-weight: 600;
        font-size: 1.1rem;
        margin: 0 0 0.5rem 0;
      }

      .day-schedule {
        margin-bottom: 20px;
      }

      .day-schedule h4 {
        margin: 0 0 10px 0;
        border-bottom: 1px solid #ccc;
        padding-bottom: 5px;
      }

      .day-events {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .event-list-item {
        display: flex;
        margin-bottom: 10px;
        border: 1px solid #eee;
      }

      .event-time-range {
        background: #f0f0f0;
        padding: 10px;
        min-width: 120px;
        text-align: center;
        font-weight: bold;
      }

      .event-details {
        padding: 10px;
      }

      .event-name {
        font-weight: bold;
        margin-bottom: 5px;
      }

      .event-info {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        font-size: 14px;
      }

      .event-info i {
        margin-right: 0.3rem;
        color: #0053bb;
      }

      .no-events {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 200px;
        background: #f8f9fa;
        border-radius: 8px;
        color: #666;
      }

      @media print {
        .print-overlay {
          display: none;
        }

        .main-container {
          margin: 0;
          padding: 0;
        }

        .printable-content {
          display: block !important;
          width: 100%;
        }

        .student-header,
        .projection-container > *:not(.printable-content) {
          display: none !important;
        }
      }

      /* Media queries para la vista de impresión */
      @media (max-width: 768px) {
        .print-container {
          width: 95%;
          max-height: 85vh;
        }

        .print-tabs button {
          padding: 0.75rem 0.5rem;
          font-size: 0.9rem;
        }

        .event-time-range {
          min-width: 90px;
          padding: 0.75rem;
        }
      }

      @media (max-width: 480px) {
        .print-tabs button {
          padding: 0.5rem;
          font-size: 0.8rem;
        }

        .event-list-item {
          flex-direction: column;
        }

        .event-time-range {
          width: 100%;
          padding: 0.5rem;
          border-right: none;
          border-bottom: 1px solid #d1e1ff;
        }
      }

      /* Estilos específicos para impresión */
      @media print {
        /* Configuración general */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color: #000 !important;
          background: none !important;
          box-shadow: none !important;
          text-shadow: none !important;
          filter: grayscale(100%) !important;
        }

        body > *:not(.print-only) {
          visibility: hidden;
        }

        .print-only {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          visibility: visible !important;
        }

        /* Cabecera súper compacta */
        .student-print-info {
          padding: 2px 4px;
          border-bottom: 1px solid #000;
          margin-bottom: 2px;
          line-height: 1;
        }

        .student-print-info h3 {
          margin: 0;
          font-size: 8pt;
          display: inline-block;
          margin-right: 8px;
        }

        .student-print-info p {
          margin: 0;
          font-size: 7pt;
          display: inline-block;
          margin-right: 8px;
        }

        /* Vista de cuadrícula - Horizontal ultra compacta */
        .schedule-grid-print {
          @page {
            size: A4 landscape;
            margin: 0.2cm;
          }

          display: grid;
          grid-template-columns: 30px repeat(7, 1fr);
          width: 100%;
          border: 1px solid #000;
          page-break-inside: avoid;
        }

        .schedule-grid-print .time-column {
          min-width: 30px;
        }

        .schedule-grid-print .header-cell {
          height: 14px;
          font-size: 6pt;
          padding: 1px;
          border: 1px solid #000;
          background: #f0f0f0 !important;
          display: flex;
          align-items: center;
          justify-content: center;
          text-transform: uppercase;
        }

        .schedule-grid-print .time-cell {
          height: 28px;
          font-size: 5pt;
          padding: 0;
          border-bottom: 1px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .schedule-grid-print .schedule-cell {
          height: 28px;
          border: 1px solid #000;
          position: relative;
        }

        .schedule-grid-print .event-card {
          position: absolute;
          left: 0;
          right: 0;
          border: 1px solid #000;
          padding: 1px;
          font-size: 5pt;
          background: #f8f8f8 !important;
          display: flex;
          flex-direction: column;
          justify-content: center;
          line-height: 1;
        }

        .schedule-grid-print .event-card h4 {
          font-size: 5pt;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .schedule-grid-print .event-card p {
          font-size: 4pt;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Vista de lista - Vertical ultra compacta */
        .print-list-view {
          @page {
            size: A4 portrait;
            margin: 0.3cm;
          }

          display: flex;
          flex-direction: column;
          width: 100%;
          page-break-inside: avoid;
        }

        .print-list-view .day-schedule {
          margin: 0;
          border-bottom: 1px solid #000;
        }

        .print-list-view .day-schedule h4 {
          font-size: 7pt;
          padding: 1px 2px;
          margin: 0;
          background: #f0f0f0 !important;
          text-transform: uppercase;
        }

        .print-list-view .day-events {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
        }

        .print-list-view .event-list-item {
          height: 32px;
          display: flex;
          border: 1px solid #000;
          overflow: hidden;
        }

        .print-list-view .event-time-range {
          width: 50px;
          min-width: 50px;
          font-size: 6pt;
          padding: 1px;
          background: #f8f8f8 !important;
          border-right: 1px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        .print-list-view .event-details {
          flex: 1;
          padding: 1px 2px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
          line-height: 1;
        }

        .print-list-view .event-name {
          font-size: 6pt;
          font-weight: bold;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .print-list-view .event-info {
          display: flex;
          gap: 4px;
          font-size: 5pt;
          flex-wrap: wrap;
        }

        .print-list-view .event-info span {
          display: flex;
          align-items: center;
          gap: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .print-list-view .event-info i {
          font-size: 5pt;
          width: 6px;
        }

        /* Badges minimalistas */
        .modality-badge {
          border: 1px solid #000;
          padding: 0 1px;
          font-size: 4pt;
          background: #f0f0f0 !important;
          line-height: 1;
        }

        /* Ocultar elementos innecesarios */
        .print-overlay,
        .print-container,
        .print-header,
        .print-tabs,
        .print-actions {
          display: none !important;
        }

        /* Ajustes de altura para eventos */
        .schedule-grid-print .event-card,
        .print-list-view .event-list-item {
          transform-origin: top left;
          transform: scale(0.95);
        }
      }

      .research-areas ul {
        list-style: none;
        padding: 0;
        margin: 5px 0 0 0;
      }

      .research-areas li {
        margin-bottom: 5px;
        padding: 5px 10px;
        background-color: #f5f5f5;
        border-radius: 4px;
        font-size: 0.9em;
      }

      .teacher-degree {
        color: #666;
        font-size: 0.9em;
        margin-top: 5px;
      }
    `,
  ],
})
export class CourseProjectionComponent implements OnInit {
  selectedCredits = 0;
  currentStudent: any = {};
  careerName: string = '';
  selectedCourses: Course[] = [];
  selectedSemester: string = '';
  projection: Projection | null = null;
  days = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];
  hours = Array.from({ length: 24 }, (_, i) => i);
  events: ScheduleEvent[] = [];
  availableCourses: Course[] = [];
  displayedCourses: Course[] = [];
  selectedModality: 'Todos' | 'Presencial' | 'Virtual' = 'Todos';
  isLoading: boolean = true;
  selectedTeacher: any = null;
  selectedEvent: ScheduleEvent | null = null;
  showFullSchedule: boolean = false;
  printMode: boolean = false;
  printTab: 'grid' | 'list' = 'grid';
  selectedPeriod: 'all' | 'morning' | 'afternoon' | 'evening' = 'all';
  hasExistingProjection: boolean = false;

  constructor(
    private authService: AuthService,
    private careerService: CareerService,
    private courseService: CourseService,
    private projectionService: ProjectionService
  ) {}

  formatCiclo(ciclo: string | undefined): string {
    return ciclo ? ciclo.replace('_', ' ') : '';
  }

  ngOnInit() {
    this.isLoading = true;
    this.authService.getCurrentUser().subscribe((user) => {
      if (user) {
        this.currentStudent = user;
        this.selectedSemester = this.getNextCycle(user.ciclo_actual);

        // Cargar la carrera
        this.careerService.getCareerById(user.carrera_id).subscribe(
          (career) => {
            if (career) {
              this.careerName = career.nombre;
            }
          },
          (error) => {
            console.error('Error al cargar la carrera:', error);
          }
        );

        // Primero intentar cargar la proyección existente
        this.projectionService.getProjection().subscribe(
          (projection) => {
            if (projection) {
              console.log('Proyección encontrada, cargando datos...');
              this.loadProjectionCourses(projection);
            } else {
              console.log(
                'No hay proyección existente, cargando cursos disponibles...'
              );
              this.hasExistingProjection = false;
              this.loadAvailableCourses(user);
            }
          },
          (error) => {
            console.error('Error al verificar proyección:', error);
            this.hasExistingProjection = false;
            this.loadAvailableCourses(user);
          }
        );
      }
    });
  }

  getNextCycle(currentCycle: string): string {
    const cycleNumber = parseInt(currentCycle.replace('Ciclo_', ''));
    const nextNumber = cycleNumber + 1;
    return nextNumber <= 10
      ? `Ciclo_${String(nextNumber).padStart(2, '0')}`
      : currentCycle;
  }

  private loadProjectionCourses(projection: Projection) {
    console.log('Iniciando carga de proyección...', projection);
    this.hasExistingProjection = true;
    this.projection = projection;

    if (
      !projection.proyeccionCursos ||
      projection.proyeccionCursos.length === 0
    ) {
      console.log('La proyección no tiene cursos');
      this.selectedCourses = [];
      this.isLoading = false;
      return;
    }

    try {
      // Los cursos ya vienen formateados correctamente del backend
      this.selectedCourses = projection.proyeccionCursos.map(
        (proyeccionCurso) => {
          const curso = proyeccionCurso.curso;
          console.log('Procesando curso:', curso);

          // Usar directamente los datos ya formateados
          return {
            code: curso.code,
            name: curso.name,
            credits: curso.credits,
            teacher: curso.teacher,
            schedule: curso.schedule,
            slots: curso.slots,
            classroom: curso.classroom,
            modality: curso.modality,
            shift: curso.shift,
            campus: curso.campus,
            prerequisites: curso.prerequisites || [],
            description: curso.description,
          };
        }
      );

      console.log('Cursos cargados:', this.selectedCourses);

      // Actualizar créditos y eventos del horario
      this.updateCredits();
      this.updateScheduleEvents();
    } catch (error) {
      console.error('Error al procesar los cursos de la proyección:', error);
    }

    this.isLoading = false;
  }

  private loadAvailableCourses(user: any) {
    console.log('Cargando cursos disponibles...');
    this.courseService
      .getAvailableCourses(
        user.carrera_id,
        this.getNextCycle(user.ciclo_actual)
      )
      .subscribe(
        (courses) => {
          console.log('Cursos disponibles obtenidos:', courses);
          this.availableCourses = courses;
          this.applyModalityFilter();
          this.isLoading = false;
        },
        (error) => {
          console.error('Error al obtener los cursos:', error);
          this.isLoading = false;
          this.availableCourses = [];
          this.displayedCourses = [];
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los cursos disponibles',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#0053bb',
          });
        }
      );
  }

  saveProjection() {
    if (!this.selectedCourses || this.selectedCourses.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe seleccionar al menos un curso para la proyección',
      });
      return;
    }

    this.projectionService
      .createProjection(this.selectedSemester, this.selectedCourses)
      .subscribe(
        (projection) => {
          if (projection) {
            this.projection = projection;
            this.hasExistingProjection = true;
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: 'La proyección se ha guardado correctamente.',
            });
          }
        },
        (error) => {
          console.error('Error al guardar la proyección:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al guardar la proyección. Por favor, inténtelo de nuevo.',
          });
        }
      );
  }

  // Método para aplicar el filtro de modalidad
  applyModalityFilter() {
    console.log('Aplicando filtro de modalidad:', this.selectedModality);
    console.log('Cursos disponibles:', this.availableCourses);

    if (this.selectedModality === 'Todos') {
      this.displayedCourses = [...this.availableCourses];
    } else {
      this.displayedCourses = this.availableCourses.filter(
        (course) => course.modality === this.selectedModality
      );
    }

    console.log('Cursos filtrados:', this.displayedCourses);
  }

  // Método para cambiar la modalidad seleccionada
  changeModality(modality: 'Todos' | 'Presencial' | 'Virtual') {
    this.selectedModality = modality;
    this.applyModalityFilter();
  }

  showTeacherInfo(teacher: any) {
    if (!teacher || (!teacher.nombre && !teacher.apellido)) {
      return;
    }

    // Convertir las áreas de investigación de string a array
    const areasInvestigacion = teacher.areas_investigacion
      ? teacher.areas_investigacion
          .split(',')
          .map((area: string) => area.trim())
      : [];

    this.selectedTeacher = {
      id: teacher.id,
      fullName: `${teacher.nombre} ${teacher.apellido}`,
      email: teacher.email,
      specialization: teacher.especialidad,
      departamento: teacher.departamento,
      ubicacion_oficina: teacher.ubicacion_oficina,
      horario_atencion: teacher.horario_atencion,
      areas_investigacion: areasInvestigacion,
      grado_academico: teacher.grado_academico,
    };

    console.log('Teacher popup info:', this.selectedTeacher);
  }

  closeTeacherInfo(event: MouseEvent) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.selectedTeacher = null;
  }

  private convertCourseToEvents(course: Course): ScheduleEvent[] {
    console.log('Convirtiendo curso a eventos:', course);
    const events: ScheduleEvent[] = [];

    // Verificar si hay un horario válido
    if (!course.schedule || course.schedule.trim() === '') {
      console.warn(`El curso ${course.code} no tiene un horario definido`);
      return events;
    }

    try {
      // Separar los días del horario (ejemplo: "Lunes,Miércoles")
      const scheduleInfo = course.schedule.split(' ');
      console.log('Información del horario:', scheduleInfo);

      if (scheduleInfo.length < 3) {
        console.warn(
          `Formato de horario inválido para el curso ${course.code}: ${course.schedule}`
        );
        return events;
      }

      const days = scheduleInfo[0].split(',');
      console.log('Días del horario:', days);

      // Extraer las horas (ejemplo: "08:00:00 - 10:00:00")
      const timeRange = scheduleInfo.slice(1).join(' ').split(' - ');
      console.log('Rango de horas:', timeRange);

      if (timeRange.length !== 2) {
        console.warn(
          `Formato de horas inválido para el curso ${course.code}: ${course.schedule}`
        );
        return events;
      }

      // Asegurarse de que las horas tengan el formato correcto
      let startTime = timeRange[0];
      let endTime = timeRange[1];

      // Si las horas incluyen segundos (HH:mm:ss), quitarlos
      if (startTime.length > 5) startTime = startTime.substring(0, 5);
      if (endTime.length > 5) endTime = endTime.substring(0, 5);

      console.log('Horas procesadas:', { startTime, endTime });

      // Crear un evento para cada día
      days.forEach((day: string) => {
        const event: ScheduleEvent = {
          id: `${course.code}-${day}`,
          name: course.name,
          day: day.trim(),
          startTime: startTime,
          endTime: endTime,
          classroom: course.classroom || 'Sin asignar',
          teacher:
            course.teacher.nombre && course.teacher.apellido
              ? `${course.teacher.nombre} ${course.teacher.apellido}`
              : 'Sin asignar',
          modality: course.modality as 'Presencial' | 'Virtual',
        };
        console.log('Evento creado:', event);
        events.push(event);
      });

      return events;
    } catch (error) {
      console.error(
        `Error al procesar el horario del curso ${course.code}:`,
        error
      );
      console.error('Detalles del curso:', course);
      return events;
    }
  }

  private updateScheduleEvents() {
    console.log('Actualizando eventos del horario...');
    console.log('Cursos seleccionados:', this.selectedCourses);

    // Limpiar eventos existentes
    this.events = [];

    // Convertir cada curso seleccionado en eventos
    this.selectedCourses.forEach((course) => {
      try {
        const courseEvents = this.convertCourseToEvents(course);
        console.log(
          `Eventos generados para el curso ${course.code}:`,
          courseEvents
        );
        this.events.push(...courseEvents);
      } catch (error) {
        console.error(
          `Error al convertir el curso ${course.code} a eventos:`,
          error
        );
      }
    });

    console.log('Total de eventos actualizados:', this.events.length);
    console.log('Eventos:', this.events);
  }

  addCourse(course: Course) {
    if (this.isCourseSelected(course)) {
      return;
    }

    if (this.hasScheduleConflict(course)) {
      Swal.fire({
        icon: 'error',
        title: 'Conflicto de Horarios',
        text: 'Este curso se solapa con otro curso ya seleccionado.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#0053bb',
      });
      return;
    }

    this.selectedCourses.push(course);
    this.updateCredits();
    this.updateScheduleEvents();
  }

  removeCourse(course: Course) {
    this.selectedCourses = this.selectedCourses.filter(
      (c) => c.code !== course.code
    );
    this.updateCredits();
    this.updateScheduleEvents();
  }

  isCourseSelected(course: Course): boolean {
    return this.selectedCourses.some((c) => c.code === course.code);
  }

  private updateCredits() {
    this.selectedCredits = this.selectedCourses.reduce(
      (sum, course) => sum + course.credits,
      0
    );
  }

  // Métodos para el manejo del horario
  scrollToSchedule() {
    document
      .getElementById('schedule-section')
      ?.scrollIntoView({ behavior: 'smooth' });
  }

  toggleTimeFilter() {
    this.showFullSchedule = !this.showFullSchedule;
  }

  getFilteredHours(): number[] {
    let hours = this.showFullSchedule
      ? this.hours
      : this.hours.filter((hour) => hour >= 6 && hour <= 23);

    switch (this.selectedPeriod) {
      case 'morning':
        return hours.filter((hour) => hour >= 6 && hour < 12);
      case 'afternoon':
        return hours.filter((hour) => hour >= 12 && hour < 19);
      case 'evening':
        return hours.filter((hour) => hour >= 19 && hour <= 23);
      default:
        return hours;
    }
  }

  formatHour(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  scrollSchedule(period: 'morning' | 'afternoon' | 'evening') {
    this.selectedPeriod = period;

    // Definir la hora de inicio para cada período
    const startHours = {
      morning: 6,
      afternoon: 12,
      evening: 19,
    };

    // Actualizar la vista después del cambio de período
    setTimeout(() => {
      const targetHour = startHours[period];
      const hourElement = document.getElementById(`hour-${targetHour}`);
      if (hourElement) {
        hourElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  resetPeriodFilter() {
    this.selectedPeriod = 'all';
  }

  getEventsForDayAndHour(day: string, hour: number): ScheduleEvent[] {
    return this.events.filter((event) => {
      const eventHour = parseInt(event.startTime.split(':')[0]);
      return event.day === day && eventHour === hour;
    });
  }

  getEventHeight(event: ScheduleEvent): number {
    const startHour = parseInt(event.startTime.split(':')[0]);
    const startMinutes = parseInt(event.startTime.split(':')[1]);
    const endHour = parseInt(event.endTime.split(':')[0]);
    const endMinutes = parseInt(event.endTime.split(':')[1]);

    // Calcular la duración total en minutos
    const duration = (endHour - startHour) * 60 + (endMinutes - startMinutes);

    // Para la vista normal (no impresión)
    if (!this.printMode) {
      return (duration / 60) * 50; // 50px por hora
    }

    // Para la vista de impresión
    return (duration / 60) * 40; // 40px por hora en impresión
  }

  getEventTop(event: ScheduleEvent): number {
    const startMinutes = parseInt(event.startTime.split(':')[1]);

    // Para la vista normal (no impresión)
    if (!this.printMode) {
      return (startMinutes / 60) * 50; // Posición proporcional dentro de la hora
    }

    // Para la vista de impresión
    return (startMinutes / 60) * 40; // 40px por hora en impresión
  }

  showEventDetails(event: ScheduleEvent) {
    this.selectedEvent = event;
  }

  closeEventDetails(event: Event) {
    event?.preventDefault();
    event?.stopPropagation();
    this.selectedEvent = null;
  }

  getEventCourse(event: ScheduleEvent): Course | undefined {
    return this.selectedCourses.find(
      (course) => course.code === event.id.split('-')[0]
    );
  }

  // Métodos para la impresión
  printSchedule() {
    this.printMode = true;
    this.printTab = 'grid';
  }

  closePrintPreview(event: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.printMode = false;
  }

  executePrint() {
    // Crear un elemento temporal para la impresión
    const printContainer = document.createElement('div');
    printContainer.className = 'print-only';

    // Agregar información del estudiante
    const studentInfo = document.createElement('div');
    studentInfo.className = 'student-print-info';
    studentInfo.innerHTML = `
      <h3>${this.getStudentInfo()}</h3>
      <p>${this.getCareerInfo()}</p>
      <p>Total de créditos: ${this.getTotalCredits()}</p>
      <p>Período académico: 2025-II</p>
    `;
    printContainer.appendChild(studentInfo);

    if (this.printTab === 'grid') {
      // Vista de cuadrícula
      const gridContainer = document.createElement('div');
      gridContainer.className = 'schedule-grid-print';

      // Crear columna de tiempo
      const timeColumn = document.createElement('div');
      timeColumn.className = 'time-column';
      timeColumn.innerHTML = `
        <div class="header-cell"></div>
        ${this.hours
          .filter((hour) => hour >= 6 && hour <= 23)
          .map(
            (hour) => `
            <div class="time-cell">${this.formatHour(hour)}</div>
          `
          )
          .join('')}
      `;
      gridContainer.appendChild(timeColumn);

      // Crear columnas de días
      this.days.forEach((day) => {
        const dayColumn = document.createElement('div');
        dayColumn.className = 'day-column';
        dayColumn.innerHTML = `
          <div class="header-cell">${day}</div>
          ${this.hours
            .filter((hour) => hour >= 6 && hour <= 23)
            .map(
              (hour) => `
              <div class="schedule-cell">
                ${this.events
                  .filter(
                    (event) =>
                      event.day === day &&
                      parseInt(event.startTime.split(':')[0]) === hour
                  )
                  .map(
                    (event) => `
                    <div class="event-card"
                         style="height: ${this.getEventHeight(event)}px;
                                top: ${this.getEventTop(event)}px;">
                      <h4>${event.name}</h4>
                      <p class="event-time">${event.startTime} - ${
                      event.endTime
                    }</p>
                      <p class="event-location">
                        <i class="fas fa-map-marker-alt"></i> ${event.classroom}
                      </p>
                      <p class="event-teacher">
                        <i class="fas fa-chalkboard-teacher"></i> ${
                          event.teacher
                        }
                      </p>
                      ${
                        event.modality
                          ? `<span class="modality-badge ${event.modality.toLowerCase()}">
                           ${event.modality}
                         </span>`
                          : ''
                      }
                    </div>
                  `
                  )
                  .join('')}
              </div>
            `
            )
            .join('')}
        `;
        gridContainer.appendChild(dayColumn);
      });

      printContainer.appendChild(gridContainer);
    } else {
      // Vista de lista
      const listContainer = document.createElement('div');
      listContainer.className = 'print-list-view';

      // Agrupar eventos por día
      const eventsByDay = this.days.reduce((acc, day) => {
        acc[day] = this.events
          .filter((event) => event.day === day)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
        return acc;
      }, {} as { [key: string]: ScheduleEvent[] });

      // Crear secciones por día
      Object.entries(eventsByDay).forEach(([day, dayEvents]) => {
        if (dayEvents.length > 0) {
          const daySection = document.createElement('div');
          daySection.className = 'day-schedule';
          daySection.innerHTML = `
            <h4>${day}</h4>
            <div class="day-events">
              ${dayEvents
                .map(
                  (event) => `
                <div class="event-list-item">
                  <div class="event-time-range">
                    ${event.startTime} - ${event.endTime}
                  </div>
                  <div class="event-details">
                    <div class="event-name">${event.name}</div>
                    <div class="event-info">
                      <span>
                        <i class="fas fa-map-marker-alt"></i> ${event.classroom}
                      </span>
                      <span>
                        <i class="fas fa-chalkboard-teacher"></i> ${
                          event.teacher
                        }
                      </span>
                      ${
                        event.modality
                          ? `<span class="modality-badge ${event.modality.toLowerCase()}">
                           <i class="fas fa-laptop"></i> ${event.modality}
                         </span>`
                          : ''
                      }
                    </div>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          `;
          listContainer.appendChild(daySection);
        }
      });

      printContainer.appendChild(listContainer);
    }

    // Agregar estilos específicos para impresión
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page {
          size: A4 landscape;
          margin: 1cm;
        }

        body * {
          visibility: hidden;
        }

        .print-only, .print-only * {
          visibility: visible !important;
        }

        .print-only {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }

        .student-print-info {
          margin-bottom: 1.5cm;
          text-align: center;
        }

        .student-print-info h3 {
          margin: 0;
          font-size: 16pt;
          color: #000;
        }

        .student-print-info p {
          margin: 5px 0;
          font-size: 11pt;
          color: #333;
        }

        /* Vista de cuadrícula */
        .schedule-grid-print {
          display: grid;
          grid-template-columns: 60px repeat(7, 1fr);
          width: 100%;
          border: 1px solid #ccc;
          page-break-inside: avoid;
        }

        .time-column {
          min-width: 60px;
        }

        .day-column {
          border-left: 1px solid #ccc;
        }

        .header-cell {
          background-color: #f0f0f0 !important;
          -webkit-print-color-adjust: exact;
          padding: 8px;
          text-align: center;
          font-weight: bold;
          border-bottom: 1px solid #ccc;
          font-size: 10pt;
        }

        .time-cell {
          height: 60px;
          border-bottom: 1px solid #ccc;
          text-align: center;
          font-size: 9pt;
          padding: 4px;
        }

        .schedule-cell {
          height: 60px;
          border-bottom: 1px solid #ccc;
          position: relative;
        }

        .event-card {
          position: absolute;
          left: 2px;
          right: 2px;
          background-color: #e3f2fd !important;
          -webkit-print-color-adjust: exact;
          border-left: 3px solid #1565c0;
          padding: 4px;
          font-size: 8pt;
          overflow: hidden;
        }

        .event-card h4 {
          margin: 0 0 2px 0;
          font-size: 9pt;
          font-weight: bold;
        }

        .event-card p {
          margin: 1px 0;
          font-size: 8pt;
        }

        /* Vista de lista */
        .print-list-view {
          width: 100%;
        }

        .day-schedule {
          margin-bottom: 1cm;
          page-break-inside: avoid;
        }

        .day-schedule h4 {
          font-size: 14pt;
          margin: 0 0 0.5cm 0;
          border-bottom: 2px solid #0053bb;
          padding-bottom: 0.2cm;
          color: #0053bb;
        }

        .day-events {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5cm;
        }

        .event-list-item {
          display: grid;
          grid-template-columns: 120px 1fr;
          border: 1px solid #ccc;
          page-break-inside: avoid;
        }

        .event-time-range {
          background-color: #f5f5f5 !important;
          -webkit-print-color-adjust: exact;
          padding: 10px;
          text-align: center;
          font-weight: bold;
          font-size: 10pt;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .event-details {
          padding: 10px;
        }

        .event-name {
          font-weight: bold;
          font-size: 11pt;
          margin-bottom: 5px;
          color: #0053bb;
        }

        .event-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 8px;
          font-size: 9pt;
        }

        .event-info span {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .event-info i {
          color: #666;
        }

        /* Badges de modalidad */
        .modality-badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 8pt;
          font-weight: 500;
        }

        .modality-badge.presencial {
          background-color: #e3f2fd !important;
          color: #1565c0;
        }

        .modality-badge.virtual {
          background-color: #fff3e0 !important;
          color: #e65100;
        }

        /* Asegurar que todo el contenido sea visible */
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;

    // Agregar elementos temporales al documento
    document.head.appendChild(style);
    document.body.appendChild(printContainer);

    // Ejecutar la impresión
    window.print();

    // Limpiar elementos temporales
    document.head.removeChild(style);
    document.body.removeChild(printContainer);
  }

  exportSchedule() {
    const filename = `horario_${
      this.currentStudent?.codigo_estudiante || 'export'
    }.txt`;

    // Información del estudiante
    let content = `${this.currentStudent?.nombre || ''} ${
      this.currentStudent?.apellido || ''
    }\n`;
    content += `Código: ${this.currentStudent?.codigo_estudiante || ''}\n`;
    content += `Carrera: ${this.careerName}\n`;
    content += `Ciclo: ${this.formatCiclo(
      this.currentStudent?.ciclo_actual
    )}\n\n`;

    // Horario de clases
    content += `HORARIO DE CLASES\n\n`;

    // Agrupar eventos por día
    const eventsByDay = this.days.reduce((acc, day) => {
      const dayEvents = this.events
        .filter((event) => event.day === day)
        .sort(
          (a, b) =>
            this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime)
        );

      if (dayEvents.length > 0) {
        acc[day] = dayEvents;
      }
      return acc;
    }, {} as { [key: string]: ScheduleEvent[] });

    // Generar horario por día
    Object.entries(eventsByDay).forEach(([day, events]) => {
      content += `${day}\n`;
      events.forEach((event) => {
        content += `${event.startTime} - ${event.endTime}: ${event.name}\n`;
        content += `Aula: ${event.classroom} | Profesor: ${event.teacher}\n`;
        content += `Modalidad: ${event.modality}\n\n`;
      });
      content += '\n';
    });

    // Cursos seleccionados
    content += `CURSOS SELECCIONADOS\n\n`;
    this.selectedCourses.forEach((course) => {
      content += `${course.code} - ${course.name}\n`;
      content += `Créditos: ${course.credits}\n`;
      content += `Horario: ${course.schedule}\n`;
      content += `Modalidad: ${course.modality}\n\n`;
    });

    // Total de créditos
    content += `\nTotal de Créditos: ${this.selectedCredits}`;

    // Crear y descargar el archivo
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Métodos auxiliares para la vista de impresión
  getStudentInfo(): string {
    return `${this.currentStudent?.nombre || ''} ${
      this.currentStudent?.apellido || ''
    } - ${this.currentStudent?.codigo_estudiante || ''}`;
  }

  getCareerInfo(): string {
    return `${this.careerName} - ${this.formatCiclo(
      this.currentStudent?.ciclo_actual
    )}`;
  }

  getTotalCredits(): number {
    return this.selectedCourses.reduce(
      (sum, course) => sum + course.credits,
      0
    );
  }

  getFormattedSchedule(event: ScheduleEvent): string {
    return `${event.startTime} - ${event.endTime}`;
  }

  getDaysWithEvents(): string[] {
    const uniqueDays = new Set(this.events.map((event) => event.day));
    return Array.from(uniqueDays);
  }

  getEventsForDay(day: string): ScheduleEvent[] {
    return this.events
      .filter((event) => event.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  // Método auxiliar para validar solapamiento de horarios
  private hasScheduleConflict(newCourse: Course): boolean {
    const newEvents = this.convertCourseToEvents(newCourse);

    for (const newEvent of newEvents) {
      for (const existingEvent of this.events) {
        if (newEvent.day === existingEvent.day) {
          const newStart = this.timeToMinutes(newEvent.startTime);
          const newEnd = this.timeToMinutes(newEvent.endTime);
          const existingStart = this.timeToMinutes(existingEvent.startTime);
          const existingEnd = this.timeToMinutes(existingEvent.endTime);

          if (
            (newStart >= existingStart && newStart < existingEnd) ||
            (newEnd > existingStart && newEnd <= existingEnd) ||
            (newStart <= existingStart && newEnd >= existingEnd)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  getPeriodLabel(): string {
    switch (this.selectedPeriod) {
      case 'morning':
        return 'Mañana (6:00 - 11:59)';
      case 'afternoon':
        return 'Tarde (12:00 - 18:59)';
      case 'evening':
        return 'Noche (19:00 - 23:59)';
      default:
        return 'Todas las horas';
    }
  }

  hasModalityConflict(course: Course): boolean {
    // Buscar si existe un curso con el mismo nombre en los seleccionados
    const sameNameCourse = this.selectedCourses.find(
      (selectedCourse) => selectedCourse.name === course.name
    );

    // Si no hay curso con el mismo nombre, no hay conflicto
    if (!sameNameCourse) {
      return false;
    }

    // Verificar si la modalidad es diferente para el mismo curso
    return course.modality !== sameNameCourse.modality;
  }

  formatSchedule(schedule: string): string {
    if (!schedule) return '';

    // Separar los días y el horario
    const [days, ...timeParts] = schedule.split(' ');

    // Formatear los días (agregar espacio después de la coma)
    const formattedDays = days.split(',').join(', ');

    // Formatear el horario (remover los segundos)
    const timeRange = timeParts
      .join(' ')
      .replace(/:\d{2} -/, ' -') // Remover segundos de la hora inicial
      .replace(/:\d{2}$/, ''); // Remover segundos de la hora final

    return `${formattedDays} ${timeRange}`;
  }
}
