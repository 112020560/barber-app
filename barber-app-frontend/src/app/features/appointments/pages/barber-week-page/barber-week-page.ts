import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../core/services/auth.service';
import { BarbersApiService } from '../../../../core/services/barbers-api.service';
import { AppointmentDto, AppointmentsApiService } from '../../../../core/services/appointments-api.service';

interface WeekDay {
  date: Date;
  label: string;
  key: string;
}

@Component({
  selector: 'app-barber-week-page',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TagModule, ProgressSpinnerModule, ToastModule],
  providers: [MessageService],
  templateUrl: './barber-week-page.html',
  styleUrl: './barber-week-page.scss',
})
export class BarberWeekPage implements OnInit {
  loading = signal(false);
  barberId = signal<string | null>(null);
  appointments = signal<AppointmentDto[]>([]);
  weekStart = signal<Date>(this.getMondayOfWeek(new Date()));

  weekDays = computed<WeekDay[]>(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.weekStart());
      d.setDate(d.getDate() + i);
      return {
        date: d,
        label: d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' }),
        key: this.toDayString(d),
      };
    })
  );

  weekLabel = computed(() => {
    const days = this.weekDays();
    const from = days[0].date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
    const to = days[6].date.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${from} – ${to}`;
  });

  appointmentsByDay = computed<Map<string, AppointmentDto[]>>(() => {
    const map = new Map<string, AppointmentDto[]>();
    for (const apt of this.appointments()) {
      const key = this.toDayString(new Date(apt.date));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(apt);
    }
    return map;
  });

  isCurrentWeek = computed(() => {
    const currentMonday = this.getMondayOfWeek(new Date());
    return this.toDayString(this.weekStart()) === this.toDayString(currentMonday);
  });

  constructor(
    private auth: AuthService,
    private barbersApi: BarbersApiService,
    private appointmentsApi: AppointmentsApiService,
    private msg: MessageService,
  ) {}

  ngOnInit(): void {
    this.loadBarberId();
  }

  loadBarberId(): void {
    const userId = this.auth.userId();
    if (!userId) return;

    this.barbersApi.getByUserId(userId).subscribe({
      next: (barber) => {
        this.barberId.set(barber.id);
        this.loadWeek();
      },
      error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se encontró el perfil de barbero' }),
    });
  }

  loadWeek(): void {
    const id = this.barberId();
    if (!id) return;

    this.loading.set(true);
    this.appointmentsApi.getWeekAgenda(id, this.toDayString(this.weekStart())).subscribe({
      next: (res) => this.appointments.set(res),
      error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la semana' }),
      complete: () => this.loading.set(false),
    });
  }

  prevWeek(): void {
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() - 7);
    this.weekStart.set(d);
    this.loadWeek();
  }

  nextWeek(): void {
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() + 7);
    this.weekStart.set(d);
    this.loadWeek();
  }

  goToCurrentWeek(): void {
    this.weekStart.set(this.getMondayOfWeek(new Date()));
    this.loadWeek();
  }

  getAppointmentsForDay(key: string): AppointmentDto[] {
    return this.appointmentsByDay().get(key) ?? [];
  }

  statusSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING': return 'warn';
      case 'CANCELLED': return 'danger';
      default: return 'secondary';
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'Confirmada';
      case 'PENDING': return 'Pendiente';
      case 'CANCELLED': return 'Cancelada';
      default: return status;
    }
  }

  formatHour(iso: string): string {
    return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  }

  private getMondayOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private toDayString(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
