import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ScheduleEvent {
  id: string;
  name: string;
  day: string;
  startTime: string;
  endTime: string;
  classroom: string;
  teacher: string;
}

@Component({
  selector: 'app-schedule-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="schedule-container">
      <h2>Horario Semanal</h2>

      <div class="schedule-grid">
        <div class="time-column">
          <div class="header-cell"></div>
          @for (hour of hours; track hour) {
          <div class="time-cell">{{ formatHour(hour) }}</div>
          }
        </div>

        @for (day of days; track day) {
        <div class="day-column">
          <div class="header-cell">{{ day }}</div>
          @for (hour of hours; track hour) {
          <div class="schedule-cell">
            @for (event of getEventsForDayAndHour(day, hour); track event.id) {
            <div
              class="event-card"
              [style.height.px]="getEventHeight(event)"
              [style.top.px]="getEventTop(event)"
            >
              <h4>{{ event.name }}</h4>
              <p>{{ event.startTime }} - {{ event.endTime }}</p>
              <p>{{ event.classroom }}</p>
              <p>{{ event.teacher }}</p>
            </div>
            }
          </div>
          }
        </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .schedule-container {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        overflow-x: auto;
      }

      h2 {
        margin: 0 0 2rem 0;
        color: #333;
        position: sticky;
        left: 0;
      }

      .schedule-grid {
        display: flex;
        min-width: 1200px;
      }

      .time-column,
      .day-column {
        flex: 1;
        min-width: 150px;
      }

      .time-column {
        min-width: 80px;
        position: sticky;
        left: 0;
        background: white;
        z-index: 2;
      }

      .header-cell {
        height: 50px;
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
      }

      .time-column .header-cell {
        z-index: 3;
      }

      .time-cell {
        height: 60px;
        border-bottom: 1px solid #eee;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        font-size: 0.9rem;
        background: white;
      }

      .schedule-cell {
        height: 60px;
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
        padding: 0.5rem;
        overflow: hidden;
        z-index: 1;
      }

      .event-card h4 {
        margin: 0 0 0.25rem 0;
        font-size: 0.9rem;
        color: #0053bb;
      }

      .event-card p {
        margin: 0;
        font-size: 0.8rem;
        color: #666;
      }

      .schedule-container::-webkit-scrollbar {
        height: 8px;
      }

      .schedule-container::-webkit-scrollbar-track {
        background: #f1f1f1;
      }

      .schedule-container::-webkit-scrollbar-thumb {
        background: #0053bb;
        border-radius: 4px;
      }

      .schedule-container::-webkit-scrollbar-thumb:hover {
        background: #004397;
      }
    `,
  ],
})
export class ScheduleViewerComponent {
  days = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];
  hours = Array.from({ length: 24 }, (_, i) => i); // 0:00 to 23:00

  events: ScheduleEvent[] = [
    {
      id: '1',
      name: 'Diseño y Patrones de Software',
      day: 'Lunes',
      startTime: '08:00',
      endTime: '10:00',
      classroom: 'C-301',
      teacher: 'Luis Fernández',
    },
    {
      id: '2',
      name: 'Diseño y Patrones de Software',
      day: 'Miércoles',
      startTime: '08:00',
      endTime: '10:00',
      classroom: 'C-301',
      teacher: 'Luis Fernández',
    },
    {
      id: '3',
      name: 'Física I',
      day: 'Lunes',
      startTime: '14:00',
      endTime: '16:00',
      classroom: 'D-301',
      teacher: 'María Torres',
    },
  ];

  formatHour(hour: number): string {
    return `${hour.toString().padStart(2, '0')}:00`;
  }

  getEventsForDayAndHour(day: string, hour: number): ScheduleEvent[] {
    return this.events.filter((event) => {
      const startHour = parseInt(event.startTime.split(':')[0]);
      const endHour = parseInt(event.endTime.split(':')[0]);
      return event.day === day && hour >= startHour && hour < endHour;
    });
  }

  getEventHeight(event: ScheduleEvent): number {
    const startHour = parseInt(event.startTime.split(':')[0]);
    const endHour = parseInt(event.endTime.split(':')[0]);
    return (endHour - startHour) * 60;
  }

  getEventTop(event: ScheduleEvent): number {
    const startHour = parseInt(event.startTime.split(':')[0]);
    const startMinute = parseInt(event.startTime.split(':')[1]);
    return startMinute;
  }
}
