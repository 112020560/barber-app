import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { BookingState } from '../../models/booking-state.model';
import { BarberShopDto } from '../../../../core/services/barber-shops-api.service';

@Component({
  selector: 'app-step-confirm',
  standalone: true,
  imports: [CommonModule, CardModule, DividerModule],
  templateUrl: './step-confirm.html',
})
export class StepConfirm {
  @Input() booking: BookingState | null = null;
  @Input() barberShop: BarberShopDto | null = null;

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
