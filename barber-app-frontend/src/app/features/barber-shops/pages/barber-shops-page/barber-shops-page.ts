import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import {
  BarberShopsApiService,
  BarberShopDto,
  CreateBarberShopDto,
} from '../../../../core/services/barber-shops-api.service';

@Component({
  selector: 'app-barber-shops-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './barber-shops-page.html',
  styleUrl: './barber-shops-page.scss',
})
export class BarberShopsPage implements OnInit {
  barberShops = signal<BarberShopDto[]>([]);
  loading = signal(false);

  // Modal
  showModal = false;
  editingId: string | null = null;
  form: CreateBarberShopDto = { name: '', address: '', phone: '' };
  saving = false;

  constructor(
    private api: BarberShopsApiService,
    private msg: MessageService,
    private confirm: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (data) => {
        this.barberShops.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las barberías' });
        this.loading.set(false);
      },
    });
  }

  openNew() {
    this.editingId = null;
    this.form = { name: '', address: '', phone: '' };
    this.showModal = true;
  }

  openEdit(shop: BarberShopDto) {
    this.editingId = shop.id;
    this.form = { name: shop.name, address: shop.address, phone: shop.phone };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingId = null;
  }

  save() {
    if (!this.form.name || !this.form.address || !this.form.phone) {
      this.msg.add({ severity: 'warn', summary: 'Atención', detail: 'Completa todos los campos' });
      return;
    }

    this.saving = true;

    if (this.editingId) {
      this.api.update(this.editingId, this.form).subscribe({
        next: () => {
          this.msg.add({ severity: 'success', summary: 'OK', detail: 'Barbería actualizada' });
          this.closeModal();
          this.loadData();
        },
        error: () => {
          this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' });
        },
        complete: () => (this.saving = false),
      });
    } else {
      this.api.create(this.form).subscribe({
        next: () => {
          this.msg.add({ severity: 'success', summary: 'OK', detail: 'Barbería creada' });
          this.closeModal();
          this.loadData();
        },
        error: () => {
          this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear' });
        },
        complete: () => (this.saving = false),
      });
    }
  }

  confirmDelete(shop: BarberShopDto) {
    this.confirm.confirm({
      message: `¿Eliminar la barbería "${shop.name}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: () => this.delete(shop.id),
    });
  }

  delete(id: string) {
    this.api.remove(id).subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'OK', detail: 'Barbería eliminada' });
        this.loadData();
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' });
      },
    });
  }
}
