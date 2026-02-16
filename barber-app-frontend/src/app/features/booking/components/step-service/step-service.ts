import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ServiceDto } from '../../../../core/services/services-api.service';

@Component({
  selector: 'app-step-service',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './step-service.html',
})
export class StepService {
  @Input() services: ServiceDto[] = [];
  @Input() selectedService: ServiceDto | null = null;
  @Output() serviceSelected = new EventEmitter<ServiceDto>();

  selectService(service: ServiceDto) {
    this.serviceSelected.emit(service);
  }

  isSelected(service: ServiceDto): boolean {
    return this.selectedService?.id === service.id;
  }
}
