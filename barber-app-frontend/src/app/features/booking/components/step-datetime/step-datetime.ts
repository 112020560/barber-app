import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AvailabilityApiService } from '../../../../core/services/availability-api.service';

@Component({
  selector: 'app-step-datetime',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerModule, ButtonModule, ProgressSpinnerModule],
  templateUrl: './step-datetime.html',
})
export class StepDatetime implements OnInit, OnChanges {
  @Input() barberId: string | null = null;
  @Input() serviceId: string | null = null;
  @Input() selectedDate: string | null = null;
  @Input() selectedTime: string | null = null;
  @Output() dateTimeSelected = new EventEmitter<{ date: string; time: string }>();

  dateValue: Date | null = null;
  minDate = new Date();
  slots: string[] = [];
  loading = false;

  constructor(private availabilityApi: AvailabilityApiService) {}

  ngOnInit() {
    if (this.selectedDate) {
      this.dateValue = new Date(this.selectedDate + 'T00:00:00');
      this.loadSlots();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['barberId'] || changes['serviceId']) {
      this.slots = [];
      if (this.dateValue) {
        this.loadSlots();
      }
    }
  }

  onDateSelect(date: Date) {
    this.dateValue = date;
    this.loadSlots();
  }

  loadSlots() {
    if (!this.barberId || !this.serviceId || !this.dateValue) return;

    const day = this.formatDate(this.dateValue);
    this.loading = true;

    this.availabilityApi.getSlots(this.barberId, this.serviceId, day).subscribe({
      next: (res) => {
        this.slots = res.slots;
        this.loading = false;
      },
      error: () => {
        this.slots = [];
        this.loading = false;
      },
    });
  }

  selectTime(time: string) {
    if (!this.dateValue) return;
    this.dateTimeSelected.emit({
      date: this.formatDate(this.dateValue),
      time: this.convertTo24h(time),
    });
  }

  private convertTo24h(time12h: string): string {
    // If already in 24h format, return as is
    if (!time12h.includes('AM') && !time12h.includes('PM')) {
      return time12h;
    }

    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') {
      hours = modifier === 'AM' ? '00' : '12';
    } else if (modifier === 'PM') {
      hours = String(parseInt(hours, 10) + 12);
    }

    return `${hours.padStart(2, '0')}:${minutes}`;
  }

  isTimeSelected(time: string): boolean {
    return this.selectedTime === time && this.formatDate(this.dateValue!) === this.selectedDate;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
