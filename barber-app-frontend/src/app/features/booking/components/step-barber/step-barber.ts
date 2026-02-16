import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { BarberDto } from '../../../../core/services/barbers-api.service';

@Component({
  selector: 'app-step-barber',
  standalone: true,
  imports: [CommonModule, CardModule, AvatarModule],
  templateUrl: './step-barber.html',
})
export class StepBarber {
  @Input() barbers: BarberDto[] = [];
  @Input() selectedBarber: BarberDto | null = null;
  @Output() barberSelected = new EventEmitter<BarberDto>();

  selectBarber(barber: BarberDto) {
    this.barberSelected.emit(barber);
  }

  isSelected(barber: BarberDto): boolean {
    return this.selectedBarber?.id === barber.id;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
