import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';
import { BarberShopDto, BarberShopsApiService } from '../../../../core/services/barber-shops-api.service';
import { BarberDto, BarbersApiService } from '../../../../core/services/barbers-api.service';
import { AppointmentDto, AppointmentsApiService, AppointmentStatus } from '../../../../core/services/appointments-api.service';

@Component({
  selector: 'app-appointments-page',
  imports: [
    CommonModule,
    FormsModule,

    TableModule,
    ButtonModule,
    SelectModule,
    DatePickerModule,
    TagModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './appointments-page.html',
  styleUrl: './appointments-page.scss',
})
export class AppointmentsPage  implements OnInit {
  loading = signal(false);

  barberShops = signal<BarberShopDto[]>([]);
  barbers = signal<BarberDto[]>([]);
  appointments = signal<AppointmentDto[]>([]);

  selectedBarberShopId: string | null = null;
  selectedBarberId: string | null = null;

  selectedDate: Date = new Date();

  constructor(
    private barberShopsApi: BarberShopsApiService,
    private barbersApi: BarbersApiService,
    private appointmentsApi: AppointmentsApiService,
    private msg: MessageService,
  ) {}

  ngOnInit(): void {
    this.loadBarberShops();
  }

  loadBarberShops() {
    this.barberShopsApi.list().subscribe({
      next: (res) => {
        this.barberShops.set(res);

        if (!this.selectedBarberShopId && res.length > 0) {
          this.selectedBarberShopId = res[0].id;
          this.onBarberShopChanged();
        }
      },
      error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar barberías' }),
    });
  }

  onBarberShopChanged() {
    this.selectedBarberId = null;
    this.appointments.set([]);

    if (!this.selectedBarberShopId) return;

    this.barbersApi.list(this.selectedBarberShopId).subscribe({
      next: (res) => {
        this.barbers.set(res);

        if (res.length > 0) {
          this.selectedBarberId = res[0].id;
          this.loadAgenda();
        }
      },
      error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar barberos' }),
    });
  }

  loadAgenda() {
    if (!this.selectedBarberId) return;

    const day = this.toDayString(this.selectedDate);

    this.loading.set(true);
    this.appointmentsApi.getAgenda(this.selectedBarberId, day).subscribe({
      next: (res) => {
        // orden por hora asc
        const sorted = [...res].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        this.appointments.set(sorted);
      },
      error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la agenda' }),
      complete: () => this.loading.set(false),
    });
  }

  setStatus(id: string, status: AppointmentStatus) {
    this.appointmentsApi.updateStatus(id, status).subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'OK', detail: `Cita actualizada a ${status}` });
        this.loadAgenda();
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la cita' });
      },
    });
  }

  // statusSeverity(status: AppointmentStatus) {
  //   switch (status) {
  //     case 'CONFIRMED': return 'success';
  //     case 'CANCELLED': return 'danger';
  //     default: return 'warning';
  //   }
  // }
  statusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | null {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warn'; // Use 'warn' instead of 'warning'
      case 'CANCELLED':
        return 'danger';
      default:
        return 'secondary'; // Default severity
    }
  }

  toDayString(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  formatHour(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

}
