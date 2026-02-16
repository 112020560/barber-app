import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BarberShopsApiService, BarberShopDto } from '../../core/services/barber-shops-api.service';

@Component({
  selector: 'app-client-home',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, ProgressSpinnerModule],
  template: `
    <div class="p-4">
      <h1>Reservar Cita</h1>
      <p class="text-500 mb-4">Selecciona una barberia para agendar tu cita</p>

      @if (loading) {
        <div class="flex justify-content-center p-5">
          <p-progressSpinner strokeWidth="4"></p-progressSpinner>
        </div>
      } @else if (barberShops.length === 0) {
        <div class="text-center p-5">
          <i class="pi pi-inbox text-4xl text-400 mb-3"></i>
          <p class="text-500">No hay barberias disponibles</p>
        </div>
      } @else {
        <div class="grid">
          @for (shop of barberShops; track shop.id) {
            <div class="col-12 md:col-6 lg:col-4">
              <p-card>
                <ng-template pTemplate="header">
                  <div class="p-3 text-center bg-primary" style="border-radius: 6px 6px 0 0;">
                    <i class="pi pi-building text-4xl text-white"></i>
                  </div>
                </ng-template>
                <ng-template pTemplate="title">
                  {{ shop.name }}
                </ng-template>
                <ng-template pTemplate="subtitle">
                  <i class="pi pi-map-marker mr-2"></i>{{ shop.address }}
                </ng-template>
                <ng-template pTemplate="content">
                  <p><i class="pi pi-phone mr-2"></i>{{ shop.phone }}</p>
                </ng-template>
                <ng-template pTemplate="footer">
                  <p-button
                    label="Reservar"
                    icon="pi pi-calendar-plus"
                    styleClass="w-full"
                    (onClick)="goToBooking(shop.id)">
                  </p-button>
                </ng-template>
              </p-card>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ClientHome implements OnInit {
  barberShops: BarberShopDto[] = [];
  loading = true;

  constructor(
    private barberShopsApi: BarberShopsApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBarberShops();
  }

  loadBarberShops() {
    this.loading = true;
    this.barberShopsApi.list().subscribe({
      next: (shops) => {
        this.barberShops = shops;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  goToBooking(barberShopId: string) {
    this.router.navigate(['/reservar', barberShopId]);
  }
}
