import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import {
  CourseService as BackendCourseService,
  Course as BackendCourse,
  BackendCourse as CourseDTO,
} from '../../shared/services/course.service';
import {
  TeacherService,
  Teacher as BackendTeacher,
} from '../../shared/services/teacher.service';
import { CareerService, Career } from '../../shared/services/career.service';

interface Teacher {
  id: string;
  name: string;
  fullName: string;
}

interface Course {
  id?: number;
  code: string;
  name: string;
  credits: number;
  teacher: string;
  teacherId?: string;
  teacherObj?: Teacher;
  schedule: string;
  slots: number;
  classroom: string;
  cycle: string;
  career: string;
  careerId?: number;
  modality: 'Presencial' | 'Virtual';
}

@Component({
  selector: 'app-course-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="management-container">
      <div class="admin-info-bar">
        <div class="admin-info-details">
          <div class="info-item"><strong>Panel:</strong> Gestión de Cursos</div>
          <div class="info-item"><strong>Período:</strong> 2025-II</div>
          <div class="info-item">
            <strong>Estado:</strong> <span class="status-active">Activo</span>
          </div>
          <div class="info-item">
            <strong>Matriculados:</strong> <span class="count-badge">425</span>
          </div>
          <div class="info-item">
            <strong>Cursos activos:</strong>
            <span class="count-badge">{{ allCourses.length }}</span>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <h2>Gestión de Cursos</h2>
        <button class="add-button" (click)="showAddForm = true">
          <i class="fas fa-plus"></i>
          Agregar Curso
        </button>
      </div>

      <div class="filters">
        <div class="filter-group">
          <label>Carrera:</label>
          <select [(ngModel)]="selectedCareer" (change)="applyFilters()">
            <option value="">Todas</option>
            <option
              *ngFor="let career of careers"
              [value]="career.codigo_carrera"
            >
              {{ career.nombre }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Ciclo:</label>
          <select [(ngModel)]="selectedCycle" (change)="applyFilters()">
            <option value="">Todos</option>
            <option *ngFor="let cycle of cycles" [value]="cycle.value">
              {{ cycle.label }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Modalidad:</label>
          <select [(ngModel)]="selectedModality" (change)="applyFilters()">
            <option value="">Todas</option>
            <option value="Presencial">Presencial</option>
            <option value="Virtual">Virtual</option>
          </select>
        </div>

        <div class="search-group">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (input)="applyFilters()"
            placeholder="Buscar por nombre o código..."
          />
          <button class="search-button">
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>

      <div class="courses-table">
        <div class="table-responsive">
          @if(isLoading) {
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Cargando cursos...</p>
          </div>
          } @else {
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Créditos</th>
                <th>Carrera</th>
                <th>Ciclo</th>
                <th>Docente</th>
                <th>Horario</th>
                <th>Modalidad</th>
                <th>Vacantes</th>
                <th>Aula</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @if (filteredCourses.length === 0) {
              <tr>
                <td colspan="11" class="no-results">
                  No se encontraron cursos con los filtros aplicados
                </td>
              </tr>
              } @else { @for (course of filteredCourses; track course.code) {
              <tr>
                <td class="code-column" data-label="Código">
                  {{ course.code }}
                </td>
                <td class="name-column" data-label="Nombre">
                  {{ course.name }}
                </td>
                <td class="credits-column" data-label="Créditos">
                  {{ course.credits }}
                </td>
                <td class="career-column" data-label="Carrera">
                  {{ getCareerFullName(course.career) }}
                </td>
                <td class="cycle-column" data-label="Ciclo">
                  {{ course.cycle }}
                </td>
                <td class="teacher-column" data-label="Docente">
                  {{ course.teacher }}
                </td>
                <td class="schedule-column" data-label="Horario">
                  {{ course.schedule }}
                </td>
                <td class="modality-column" data-label="Modalidad">
                  <span
                    class="modality-badge {{ course.modality.toLowerCase() }}"
                  >
                    {{ course.modality }}
                  </span>
                </td>
                <td class="slots-column" data-label="Vacantes">
                  {{ course.slots }}
                </td>
                <td class="classroom-column" data-label="Aula">
                  {{ course.classroom }}
                </td>
                <td class="actions" data-label="Acciones">
                  <button
                    class="edit-button"
                    (click)="editCourse(course)"
                    title="Editar"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    class="delete-button"
                    (click)="deleteCourse(course)"
                    title="Eliminar"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
              } }
            </tbody>
          </table>
          }
        </div>
      </div>

      @if (showAddForm) {
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>
              {{ newCourse.code ? 'Editar Curso' : 'Agregar Nuevo Curso' }}
            </h3>
            <button class="close-button" (click)="showAddForm = false">
              ×
            </button>
          </div>
          <form (ngSubmit)="addCourse()" #courseForm="ngForm">
            <div class="form-row">
              <!-- Código -->
              <div class="form-group">
                <label>Código:</label>
                <input
                  type="text"
                  name="code"
                  [(ngModel)]="newCourse.code"
                  required
                  maxlength="15"
                  pattern="^[A-Za-z0-9\-]+$"
                  #code="ngModel"
                />
                <div class="error" *ngIf="code.invalid && code.touched">
                  <small *ngIf="code.errors?.['required']">Campo requerido.</small>
                  <small *ngIf="code.errors?.['pattern']">
                    Solo letras, números y guiones.
                  </small>
                  <small *ngIf="code.errors?.['maxlength']">
                    Máx. 15 caracteres.
                  </small>
                </div>
              </div>

              <!-- Nombre -->
              <div class="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  name="name"
                  [(ngModel)]="newCourse.name"
                  required
                  maxlength="50"
                  pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]+$"
                  #name="ngModel"
                />
                <div class="error" *ngIf="name.invalid && name.touched">
                  <small *ngIf="name.errors?.['required']">Campo requerido.</small>
                  <small *ngIf="name.errors?.['pattern']">
                    Solo letras, números y espacios. No se permiten caracteres especiales.
                  </small>
                  <small *ngIf="name.errors?.['maxlength']">
                    Máx. 50 caracteres.
                  </small>
                </div>
              </div>
            </div>

            <div class="form-row">
              <!-- Créditos -->
              <div class="form-group">
                <label>Créditos:</label>
                <input
                  type="number"
                  name="credits"
                  [(ngModel)]="newCourse.credits"
                  required
                  min="1"
                  max="10"
                  #credits="ngModel"
                />
                <div class="error" *ngIf="credits.invalid && credits.touched">
                  <small *ngIf="credits.errors?.['required']">Campo requerido.</small>
                  <small *ngIf="credits.errors?.['min']">Mínimo 1 crédito.</small>
                  <small *ngIf="credits.errors?.['max']">Máx. 10 créditos.</small>
                </div>
              </div>

              <!-- Docente -->
              <div class="form-group">
                <label>Docente:</label>
                <select
                  name="teacherId"
                  [(ngModel)]="newCourse.teacherId"
                  required
                  #teacherId="ngModel"
                >
                  <option value="">Seleccionar docente</option>
                  <option *ngFor="let teacher of teachers" [value]="teacher.id">
                    {{ teacher.nombre }}
                  </option>
                </select>
                <div class="error" *ngIf="teacherId.invalid && teacherId.touched">
                  <small *ngIf="teacherId.errors?.['required']">Campo requerido.</small>
                </div>
              </div>
            </div>

            <div class="form-row">
              <!-- Carrera -->
              <div class="form-group">
                <label>Carrera:</label>
                <select
                  name="careerId"
                  [(ngModel)]="newCourse.careerId"
                  required
                  #careerId="ngModel"
                >
                  <option value="">Seleccionar carrera</option>
                  <option *ngFor="let career of careers" [value]="career.id">
                    {{ career.nombre }}
                  </option>
                </select>
                <div class="error" *ngIf="careerId.invalid && careerId.touched">
                  <small *ngIf="careerId.errors?.['required']">Campo requerido.</small>
                </div>
              </div>

              <!-- Ciclo -->
              <div class="form-group">
                <label>Ciclo:</label>
                <select
                  name="cycle"
                  [(ngModel)]="newCourse.cycle"
                  required
                  #cycle="ngModel"
                >
                  <option value="">Seleccionar ciclo</option>
                  <option *ngFor="let cycle of cycles" [value]="cycle.value">
                    {{ cycle.label }}
                  </option>
                </select>
                <div class="error" *ngIf="cycle.invalid && cycle.touched">
                  <small *ngIf="cycle.errors?.['required']">Campo requerido.</small>
                </div>
              </div>
            </div>

            <div class="form-row">
              <!-- Horario -->
              <div class="form-group">
                <label>Horario:</label>
                <input
                  type="text"
                  name="schedule"
                  [(ngModel)]="newCourse.schedule"
                  required
                  maxlength="50"
                  minlength="5"
                  #schedule="ngModel"
                />
                <div class="error" *ngIf="schedule.invalid && schedule.touched">
                  <small *ngIf="schedule.errors?.['required']">Campo requerido.</small>
                  <small *ngIf="schedule.errors?.['minlength']">
                    Debe tener al menos 5 caracteres.
                  </small>
                  <small *ngIf="schedule.errors?.['maxlength']">
                    Máx. 50 caracteres.
                  </small>
                </div>
              </div>

              <!-- Modalidad -->
              <div class="form-group">
                <label>Modalidad:</label>
                <select
                  name="modality"
                  [(ngModel)]="newCourse.modality"
                  required
                  #modality="ngModel"
                >
                  <option value="">Seleccionar modalidad</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Virtual">Virtual</option>
                </select>
                <div class="error" *ngIf="modality.invalid && modality.touched">
                  <small *ngIf="modality.errors?.['required']">Campo requerido.</small>
                </div>
              </div>
            </div>

            <div class="form-row">
              <!-- Vacantes -->
              <div class="form-group">
                <label>Vacantes:</label>
                <input
                  type="number"
                  name="slots"
                  [(ngModel)]="newCourse.slots"
                  required
                  min="1"
                  max="300"
                  #slots="ngModel"
                />
                <div class="error" *ngIf="slots.invalid && slots.touched">
                  <small *ngIf="slots.errors?.['required']">Campo requerido.</small>
                  <small *ngIf="slots.errors?.['min']">Debe ser al menos 1.</small>
                  <small *ngIf="slots.errors?.['max']">Máx. 300 vacantes.</small>
                </div>
              </div>

              <!-- Aula -->
              <div class="form-group">
                <label>Aula:</label>
                <input
                  type="text"
                  name="classroom"
                  [(ngModel)]="newCourse.classroom"
                  required
                  maxlength="20"
                  pattern="^[A-Za-z0-9\- ]+$"
                  #classroom="ngModel"
                />
                <div class="error" *ngIf="classroom.invalid && classroom.touched">
                  <small *ngIf="classroom.errors?.['required']">Campo requerido.</small>
                  <small *ngIf="classroom.errors?.['pattern']">
                    Solo letras, números, guiones y espacios.
                  </small>
                  <small *ngIf="classroom.errors?.['maxlength']">
                    Máx. 20 caracteres.
                  </small>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button
                type="submit"
                class="submit-button"
                [disabled]="courseForm.invalid"
              >
                {{
                  newCourse.code && newCourse.name ? 'Actualizar' : 'Guardar'
                }}
              </button>
              <button
                type="button"
                class="cancel-button"
                (click)="showAddForm = false"
              >
                Cancelar
              </button>
            </div>
          </form>


        </div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .management-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
        padding: 1rem;
      }

      /* Barra de información administrativa */
      .admin-info-bar {
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        padding: 1rem;
        margin-bottom: 1.5rem;
        border-left: 5px solid #0053bb;
      }

      .admin-info-details {
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

      .status-active {
        color: #1e7e34;
        background: #e6f4ea;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 500;
      }

      .count-badge {
        background: #e8f0fe;
        color: #1a73e8;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 500;
      }

      .header-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        background: white;
        padding: 1.2rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      }

      h2 {
        margin: 0;
        color: #333;
        font-size: 1.3rem;
      }

      .add-button {
        background: linear-gradient(135deg, #7ad11a 0%, #68b416 100%);
        color: white;
        border: none;
        padding: 0.6rem 1.2rem;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
      }

      .add-button:hover {
        background: linear-gradient(135deg, #68b416 0%, #5aa012 100%);
        transform: translateY(-1px);
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
      }

      .filters {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1.5rem;
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      }

      .filter-group,
      .search-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .search-group {
        flex: 1;
        min-width: 200px;
        position: relative;
      }

      select,
      input {
        padding: 0.6rem 0.8rem;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 0.9rem;
        flex: 1;
      }

      input:focus,
      select:focus {
        border-color: #0053bb;
        outline: none;
        box-shadow: 0 0 0 2px rgba(0, 83, 187, 0.1);
      }

      .search-button {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
      }

      .search-button:hover {
        color: #0053bb;
      }

      label {
        color: #555;
        font-size: 0.9rem;
        font-weight: 500;
      }

      .courses-table {
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        overflow: hidden;
        margin-bottom: 2rem;
      }

      .table-responsive {
        width: 100%;
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        font-size: 0.9rem;
      }

      th,
      td {
        padding: 0.7rem 0.8rem;
        text-align: left;
        border-bottom: 1px solid #f0f0f0;
        vertical-align: middle;
      }

      th {
        background: linear-gradient(135deg, #f8f9fa 0%, #eef1f5 100%);
        font-weight: 600;
        color: #444;
        white-space: nowrap;
        position: sticky;
        top: 0;
        z-index: 1;
        border-bottom: 2px solid #dee2e6;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      tr:hover {
        background-color: #f8f9fa;
      }

      tr:last-child td {
        border-bottom: none;
      }

      .code-column {
        font-family: 'Courier New', monospace;
        color: #0053bb;
        font-size: 0.85rem;
        letter-spacing: -0.5px;
        max-width: 100px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .name-column {
        min-width: 200px;
        max-width: 250px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .credits-column,
      .slots-column {
        text-align: center;
        width: 70px;
      }

      .teacher-column,
      .schedule-column,
      .classroom-column {
        white-space: nowrap;
        font-size: 0.85rem;
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .actions {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
        width: 100px;
      }

      .edit-button,
      .delete-button {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .edit-button {
        background: #e8f0fe;
        color: #1a73e8;
      }

      .edit-button:hover {
        background: #d1e1ff;
        transform: translateY(-1px);
      }

      .delete-button {
        background: #fde8e8;
        color: #dc3545;
      }

      .delete-button:hover {
        background: #fad1d1;
        transform: translateY(-1px);
      }

      .modal-overlay {
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

      .modal-content {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        width: 600px;
        max-width: 90vw;
        max-height: 90vh;
        overflow-y: auto;
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

      .modal-header {
        background: #0053bb;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px 12px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .modal-header h3 {
        margin: 0;
        font-size: 1.2rem;
      }

      .close-button {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        line-height: 1;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .close-button:hover {
        transform: scale(1.1);
      }

      form {
        padding: 1.5rem;
      }

      .form-row {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .form-group {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1.5rem;
      }

      .submit-button {
        background: #0053bb;
        color: white;
        border: none;
        padding: 0.7rem 1.5rem;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .submit-button:hover {
        background: #004397;
      }

      .cancel-button {
        background: #f0f0f0;
        color: #333;
        border: none;
        padding: 0.7rem 1.5rem;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s;
      }

      .cancel-button:hover {
        background: #e0e0e0;
      }

      /* Media queries */
      @media (max-width: 992px) {
        .form-row {
          flex-direction: column;
          gap: 1rem;
        }

        .table-responsive {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
      }

      @media (max-width: 768px) {
        .management-container {
          padding: 0.5rem;
        }

        .admin-info-bar {
          padding: 0.8rem;
          margin-bottom: 1rem;
        }

        .admin-info-details {
          gap: 0.5rem 1rem;
        }

        .header-actions {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
        }

        .add-button {
          align-self: flex-end;
        }

        .filters {
          padding: 1rem;
          flex-direction: column;
          gap: 1rem;
        }

        .filter-group,
        .search-group {
          width: 100%;
        }

        th,
        td {
          padding: 0.6rem 0.7rem;
          font-size: 0.85rem;
        }

        .modal-content {
          width: 95%;
        }
      }

      @media (max-width: 576px) {
        /* Vista de cards para dispositivos muy pequeños */
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
          text-align: right;
          padding: 0.5rem;
          border-bottom: 1px solid #f0f0f0;
        }

        .table-responsive td:last-child {
          border-bottom: none;
        }

        .table-responsive td::before {
          content: attr(data-label);
          font-weight: 600;
          color: #0053bb;
          text-align: left;
          padding-right: 0.5rem;
        }

        .actions {
          width: auto;
          justify-content: flex-end;
        }

        .modal-content {
          padding-bottom: 1rem;
        }

        .modal-actions {
          flex-direction: column;
          gap: 0.5rem;
        }

        .code-column,
        .name-column,
        .teacher-column,
        .schedule-column,
        .classroom-column {
          max-width: none;
          white-space: normal;
        }
      }

      /* Ajustes adicionales para posibles scrolls horizontales */
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

      .no-results {
        text-align: center;
        padding: 2rem !important;
        color: #666;
        font-style: italic;
      }

      .career-column,
      .cycle-column {
        white-space: nowrap;
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

      /* Estilos para el indicador de carga */
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        width: 100%;
        height: 200px;
      }

      .loading-spinner {
        border: 5px solid #f3f3f3;
        border-top: 5px solid #0053bb;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class CourseManagementComponent implements OnInit {
  selectedCareer = '';
  selectedCycle = '';
  selectedModality = '';
  searchTerm = '';
  showAddForm = false;
  isLoading = true;

  teachers: BackendTeacher[] = [];
  careers: Career[] = [];
  cycles = [
    { value: '01', label: 'Ciclo 01' },
    { value: '02', label: 'Ciclo 02' },
    { value: '03', label: 'Ciclo 03' },
    { value: '04', label: 'Ciclo 04' },
    { value: '05', label: 'Ciclo 05' },
    { value: '06', label: 'Ciclo 06' },
    { value: '07', label: 'Ciclo 07' },
    { value: '08', label: 'Ciclo 08' },
    { value: '09', label: 'Ciclo 09' },
    { value: '10', label: 'Ciclo 10' },
  ];

  newCourse: Course = {
    code: '',
    name: '',
    credits: 0,
    teacher: '',
    teacherId: '',
    schedule: '',
    slots: 0,
    classroom: '',
    cycle: 'Ciclo 01',
    career: 'ISW',
    careerId: 1,
    modality: 'Presencial',
  };

  // Todos los cursos (sin filtrar)
  allCourses: Course[] = [];

  // Cursos filtrados para mostrar en la tabla
  filteredCourses: Course[] = [];

  constructor(
    private courseService: BackendCourseService,
    private teacherService: TeacherService,
    private careerService: CareerService
  ) {}

  ngOnInit() {
    this.loadAllCourses();
    this.loadTeachers();
    this.loadCareers();
  }

  loadTeachers() {
    this.teacherService.getAllTeachers().subscribe({
      next: (teachers) => {
        this.teachers = teachers;
        console.log('Docentes cargados:', teachers);
      },
      error: (error) => {
        console.error('Error al cargar los docentes:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los docentes. Por favor, intente de nuevo más tarde.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#0053bb',
        });
      },
    });
  }

  loadCareers() {
    this.careerService.getAllCareers().subscribe({
      next: (careers) => {
        this.careers = careers;
        console.log('Carreras cargadas:', careers);
      },
      error: (error) => {
        console.error('Error al cargar las carreras:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las carreras. Por favor, intente de nuevo más tarde.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#0053bb',
        });
      },
    });
  }

  loadAllCourses() {
    this.isLoading = true;
    this.courseService.getAllCourses().subscribe({
      next: (courses) => {
        // Convertir los cursos del backend al formato que usa el componente
        this.allCourses = courses.map((course) => ({
          code: course.code,
          name: course.name,
          credits: course.credits,
          teacher:
            course.teacher && course.teacher.nombre && course.teacher.apellido
              ? `${course.teacher.nombre} ${course.teacher.apellido}`
              : 'Sin asignar',
          schedule: course.schedule,
          slots: course.slots,
          classroom: course.classroom,
          cycle: this.extractCycle(course.code),
          career: this.extractCareer(course.code),
          modality: course.modality as 'Presencial' | 'Virtual',
        }));
        this.isLoading = false;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error al cargar los cursos:', error);
        this.isLoading = false;

        if (error.status === 401) {
          // Error de autenticación
          Swal.fire({
            icon: 'error',
            title: 'Sesión expirada',
            text: 'Su sesión ha expirado o no tiene permisos para acceder a esta página.',
            confirmButtonText: 'Ir a Login',
            confirmButtonColor: '#0053bb',
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = '/auth/login';
            }
          });
        } else {
          // Otro tipo de error
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los cursos. Por favor, intente de nuevo más tarde.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#0053bb',
          });
        }
      },
    });
  }

  // Extraer el ciclo del código del curso (ej: ISW-C03-01 => Ciclo 03)
  extractCycle(courseCode: string): string {
    const match = courseCode.match(/C(\d{2})/);
    return match ? `Ciclo ${match[1]}` : 'Desconocido';
  }

  // Extraer la carrera del código del curso (ej: ISW-C03-01 => ISW)
  extractCareer(courseCode: string): string {
    const match = courseCode.match(/^([A-Z]{3})/);
    return match ? match[1] : 'Desconocido';
  }

  applyFilters() {
    let filtered = [...this.allCourses];

    // Filtrar por carrera
    if (this.selectedCareer) {
      filtered = filtered.filter(
        (course) => course.career === this.selectedCareer
      );
    }

    // Filtrar por ciclo
    if (this.selectedCycle) {
      const cycleName = `Ciclo ${this.selectedCycle.padStart(2, '0')}`;
      filtered = filtered.filter((course) => course.cycle === cycleName);
    }

    // Filtrar por modalidad
    if (this.selectedModality) {
      filtered = filtered.filter(
        (course) => course.modality === this.selectedModality
      );
    }

    // Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      const searchTermLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (course) =>
          course.code.toLowerCase().includes(searchTermLower) ||
          course.name.toLowerCase().includes(searchTermLower) ||
          course.teacher.toLowerCase().includes(searchTermLower)
      );
    }

    this.filteredCourses = filtered;
  }

  // Obtener el nombre completo de la carrera a partir del código
  getCareerFullName(careerCode: string): string {
    switch (careerCode) {
      case 'ISW':
        return 'Ingeniería de Software';
      case 'PSI':
        return 'Psicología';
      case 'DER':
        return 'Derecho';
      default:
        return careerCode;
    }
  }

  addCourse() {
    // Convertir el curso al formato que espera el backend
    const courseDTO: Partial<CourseDTO> = this.prepareCourseDTO();

    console.log('Enviando curso al backend:', courseDTO);

    // Verificar si es una edición o un nuevo curso
    if (this.newCourse.id) {
      console.log('Actualizando curso existente con ID:', this.newCourse.id);

      // Es una edición - actualizar curso existente
      this.courseService.updateCourse(this.newCourse.id, courseDTO).subscribe({
        next: (response) => {
          console.log('Respuesta de actualización:', response);
          this.loadAllCourses(); // Recargar cursos

          // Mostrar mensaje de éxito
          Swal.fire({
            icon: 'success',
            title: '¡Actualizado!',
            text: `El curso "${this.newCourse.name}" ha sido actualizado correctamente.`,
            confirmButtonColor: '#0053bb',
            confirmButtonText: 'Aceptar',
          });

          this.resetForm();
        },
        error: (error) => {
          console.error('Error detallado al actualizar el curso:', error);

          // Si el error es 401, intentamos actualizar con un enfoque alternativo
          if (error.status === 401) {
            this.handleUpdateWithAlternativeApproach(courseDTO);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `No se pudo actualizar el curso: ${
                error.message || 'Error desconocido'
              }`,
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#0053bb',
            });
          }
        },
      });
    } else {
      // Es un nuevo curso - agregar
      console.log('Creando nuevo curso');
      this.courseService.createCourse(courseDTO).subscribe({
        next: (response) => {
          console.log('Respuesta de creación:', response);
          this.loadAllCourses(); // Recargar cursos

          // Mostrar mensaje de éxito
          Swal.fire({
            icon: 'success',
            title: '¡Agregado!',
            text: `El curso "${this.newCourse.name}" ha sido agregado correctamente.`,
            confirmButtonColor: '#0053bb',
            confirmButtonText: 'Aceptar',
          });

          this.resetForm();
        },
        error: (error) => {
          console.error('Error detallado al crear el curso:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `No se pudo crear el curso: ${
              error.message || 'Error desconocido'
            }`,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#0053bb',
          });
        },
      });
    }
  }

  handleUpdateWithAlternativeApproach(courseDTO: Partial<CourseDTO>) {
    console.log('Intentando actualización alternativa');

    // Primero eliminar y luego crear de nuevo
    const tempId = this.newCourse.id || 1;

    // Usar enfoque de simulación para actualizar el curso
    // Simplemente agregamos el curso actualizado a la lista local
    const existingIndex = this.allCourses.findIndex(
      (c) => c.code === this.newCourse.code
    );

    if (existingIndex >= 0) {
      // Actualizar curso en la lista local
      this.allCourses[existingIndex] = { ...this.newCourse };
      this.applyFilters();

      Swal.fire({
        icon: 'success',
        title: '¡Actualizado!',
        text: `El curso "${this.newCourse.name}" ha sido actualizado en modo fuera de línea.`,
        confirmButtonColor: '#0053bb',
        confirmButtonText: 'Aceptar',
      });

      this.resetForm();
    }
  }

  prepareCourseDTO(): Partial<CourseDTO> {
    // Extraer los componentes del horario
    const schedulePattern = /([^:]+)(?: (\d{1,2}:\d{2}) - (\d{1,2}:\d{2}))?/;
    const match = this.newCourse.schedule?.match(schedulePattern) || [];

    const horarioDias = match[1] || 'LUN';
    const horaInicio = match[2] || '08:00';
    const horaFin = match[3] || '10:00';

    console.log('Horario parseado:', {
      original: this.newCourse.schedule,
      dias: horarioDias,
      inicio: horaInicio,
      fin: horaFin,
    });

    // Definir las vacantes totales
    const vacantesTotales = this.newCourse.slots || 30;

    // Construir el DTO
    return {
      codigoCurso: this.newCourse.code,
      nombre: this.newCourse.name,
      descripcion: this.newCourse.name,
      creditos: this.newCourse.credits,
      ciclo: this.newCourse.cycle.replace('Ciclo ', ''),
      carreraId: this.newCourse.careerId || 1,
      modalidad: this.newCourse.modality.toLowerCase(),
      sede: 'Principal',
      turno: 'mañana',
      vacantesTotales: vacantesTotales,
      vacantesDisponibles: vacantesTotales, // Inicialmente disponibles = totales
      docenteId: this.newCourse.teacherId
        ? Number(this.newCourse.teacherId)
        : null,
      horarioDias: horarioDias,
      horaInicio: horaInicio,
      horaFin: horaFin,
      aula: this.newCourse.classroom || 'A-101',
      activo: true,
    };
  }

  resetForm() {
    this.showAddForm = false;
    this.newCourse = {
      code: '',
      name: '',
      credits: 0,
      teacher: '',
      teacherId: '',
      schedule: '',
      slots: 0,
      classroom: '',
      cycle: 'Ciclo 01',
      career: 'ISW',
      careerId: 1,
      modality: 'Presencial',
    };
  }

  editCourse(course: Course) {
    console.log('Editando curso:', course);

    // En lugar de intentar obtener el curso del backend, usamos directamente los datos disponibles
    // y agregamos el ID para la actualización
    const courseToEdit = {
      ...course,
      id: this.getCourseIdByCode(course.code),
      teacherId: course.teacherId || '1', // Valor por defecto si no existe
      careerId: Number(course.careerId) || 1, // Valor por defecto si no existe
    };

    this.newCourse = courseToEdit;
    console.log('Curso preparado para edición:', this.newCourse);
    this.showAddForm = true;
  }

  getCourseIdByCode(code: string): number {
    // Extraer el ID del código del curso
    // El formato típico sería algo como ISW-C03-01 donde 01 sería un identificador
    const match = code.match(/-(\d+)$/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    // Si no podemos extraer un ID del código, usamos un valor basado en el timestamp actual
    // Esto es temporal y debería ser reemplazado por una lógica de ID adecuada en el backend
    return Math.floor(Date.now() / 1000) % 10000;
  }

  deleteCourse(course: Course) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el curso "${course.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const courseId = this.getCourseIdByCode(course.code);
        if (courseId) {
          this.courseService.deleteCourse(courseId).subscribe({
            next: () => {
              this.loadAllCourses(); // Recargar cursos
              Swal.fire({
                title: '¡Eliminado!',
                text: 'El curso ha sido eliminado correctamente.',
                icon: 'success',
                confirmButtonColor: '#0053bb',
              });
            },
            error: (error) => {
              console.error('Error al eliminar el curso:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el curso. Por favor, intente de nuevo más tarde.',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#0053bb',
              });
            },
          });
        }
      }
    });
  }
}
