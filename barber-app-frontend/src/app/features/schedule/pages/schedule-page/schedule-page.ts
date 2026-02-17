import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { AuthService } from '../../../../core/services/auth.service';
import {
  AvailabilityApiService,
  TimeBlockDto,
  WorkingHourDto,
} from '../../../../core/services/availability-api.service';
import { BarbersApiService } from '../../../../core/services/barbers-api.service';

interface DayOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-schedule-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    CardModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    ToastModule,
    ConfirmDialogModule,
    DatePickerModule,
    InputTextModule,
    ToggleSwitchModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './schedule-page.html',
  styleUrl: './schedule-page.scss',
})
export class SchedulePage {
  loading = signal(false);
  saving = signal(false);

  workingHours = signal<WorkingHourDto[]>([]);
  timeBlocks = signal<TimeBlockDto[]>([]);

  barberId = signal<string | null>(null);

  // Dialogs
  editHourDialogVisible = false;
  blockDialogVisible = false;

  // Edit working hour form
  editDay: WorkingHourDto | null = null;
  editStartTime: string = '';
  editEndTime: string = '';
  editLunchStart: string = '';
  editLunchEnd: string = '';
  editIsClosed: boolean = false;

  // Create block form
  blockStartDate: Date | null = null;
  blockEndDate: Date | null = null;
  blockAllDay: boolean = false;
  blockReason: string = '';

  days: DayOption[] = [
    { label: 'Domingo', value: 0 },
    { label: 'Lunes', value: 1 },
    { label: 'Martes', value: 2 },
    { label: 'Miércoles', value: 3 },
    { label: 'Jueves', value: 4 },
    { label: 'Viernes', value: 5 },
    { label: 'Sábado', value: 6 },
  ];

  isBarber = computed(() => this.auth.userRole() === 'BARBER');

  today = new Date();

  constructor(
    private availabilityApi: AvailabilityApiService,
    private barbersApi: BarbersApiService,
    private auth: AuthService,
    private msg: MessageService,
    private confirm: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadBarberId();
  }

  loadBarberId(): void {
    const userId = this.auth.userId();
    if (!userId) return;

    // Get barber by userId
    this.barbersApi.getByUserId(userId).subscribe({
      next: (barber) => {
        this.barberId.set(barber.id);
        this.loadData();
      },
      error: () => {
        this.msg.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se encontró el perfil de barbero',
        });
      },
    });
  }

  loadData(): void {
    const id = this.barberId();
    if (!id) return;

    this.loading.set(true);

    this.availabilityApi.getWorkingHours(id).subscribe({
      next: (res) => this.workingHours.set(res),
      error: () =>
        this.msg.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los horarios',
        }),
    });

    this.availabilityApi.getTimeBlocks(id).subscribe({
      next: (res) => this.timeBlocks.set(res),
      error: () =>
        this.msg.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los bloqueos',
        }),
      complete: () => this.loading.set(false),
    });
  }

  getDayName(dayOfWeek: number): string {
    return this.days.find((d) => d.value === dayOfWeek)?.label ?? '';
  }

  formatTime(time: string | undefined): string {
    if (!time) return '-';
    return time.substring(0, 5); // HH:MM
  }

  // Working Hours Edit
  openEditHour(wh: WorkingHourDto): void {
    this.editDay = wh;
    this.editStartTime = wh.startTime.substring(0, 5);
    this.editEndTime = wh.endTime.substring(0, 5);
    this.editLunchStart = wh.lunchStart?.substring(0, 5) ?? '';
    this.editLunchEnd = wh.lunchEnd?.substring(0, 5) ?? '';
    this.editIsClosed = wh.isClosed;
    this.editHourDialogVisible = true;
  }

  saveWorkingHour(): void {
    if (!this.editDay || !this.barberId()) return;

    this.saving.set(true);

    this.availabilityApi
      .updateWorkingHour({
        barberId: this.barberId()!,
        dayOfWeek: this.editDay.dayOfWeek,
        startTime: this.editStartTime || undefined,
        endTime: this.editEndTime || undefined,
        isClosed: this.editIsClosed,
        lunchStart: this.editLunchStart || undefined,
        lunchEnd: this.editLunchEnd || undefined,
      })
      .subscribe({
        next: () => {
          this.msg.add({
            severity: 'success',
            summary: 'OK',
            detail: 'Horario actualizado',
          });
          this.editHourDialogVisible = false;
          this.loadData();
        },
        error: () =>
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el horario',
          }),
        complete: () => this.saving.set(false),
      });
  }

  // Time Blocks
  openCreateBlock(): void {
    this.blockStartDate = null;
    this.blockEndDate = null;
    this.blockAllDay = false;
    this.blockReason = '';
    this.blockDialogVisible = true;
  }

  saveTimeBlock(): void {
    if (!this.blockStartDate || !this.barberId()) return;

    let startAt: Date;
    let endAt: Date;

    if (this.blockAllDay) {
      // Full day block
      startAt = new Date(this.blockStartDate);
      startAt.setHours(0, 0, 0, 0);

      endAt = this.blockEndDate
        ? new Date(this.blockEndDate)
        : new Date(this.blockStartDate);
      endAt.setHours(23, 59, 59, 999);
    } else {
      startAt = new Date(this.blockStartDate);
      endAt = this.blockEndDate
        ? new Date(this.blockEndDate)
        : new Date(startAt.getTime() + 60 * 60 * 1000); // 1 hour default
    }

    this.saving.set(true);

    this.availabilityApi
      .createTimeBlock({
        barberId: this.barberId()!,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        reason: this.blockReason || undefined,
      })
      .subscribe({
        next: (res) => {
          let detail = 'Bloqueo creado';
          if (res.cancelledAppointments > 0) {
            detail += `. Se cancelaron ${res.cancelledAppointments} cita(s) afectada(s).`;
          }
          this.msg.add({ severity: 'success', summary: 'OK', detail });
          this.blockDialogVisible = false;
          this.loadData();
        },
        error: () =>
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el bloqueo',
          }),
        complete: () => this.saving.set(false),
      });
  }

  confirmDeleteBlock(block: TimeBlockDto): void {
    const reason = block.reason || 'Sin motivo';

    this.confirm.confirm({
      header: 'Eliminar bloqueo',
      message: `¿Seguro que deseas eliminar este bloqueo? (${reason})`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => this.deleteBlock(block.id),
    });
  }

  deleteBlock(id: string): void {
    this.availabilityApi.deleteTimeBlock(id).subscribe({
      next: () => {
        this.msg.add({
          severity: 'success',
          summary: 'OK',
          detail: 'Bloqueo eliminado',
        });
        this.loadData();
      },
      error: () =>
        this.msg.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar el bloqueo',
        }),
    });
  }

  formatDateTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString('es', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }
}
