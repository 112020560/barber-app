import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { BarberShopDto, BarberShopsApiService } from '../../../../core/services/barber-shops-api.service';
import { UserDto, UsersApiService } from '../../../../core/services/users-api.service';
import { BarberDto, BarbersApiService } from '../../../../core/services/barbers-api.service';

@Component({
  selector: 'app-barbers-page',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    TableModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './barbers-page.html',
  styleUrl: './barbers-page.scss',
})
export class BarbersPage {
  loading = signal(false);
  saving = signal(false);

  barberShops = signal<BarberShopDto[]>([]);
  users = signal<UserDto[]>([]);
  barbers = signal<BarberDto[]>([]);

  selectedBarberShopId: string | null = null;

  dialogVisible = false;
  createUserId: string | null = null;
  createBarberShopId: string | null = null;

  constructor(
    private barberShopsApi: BarberShopsApiService,
    private usersApi: UsersApiService,
    private barbersApi: BarbersApiService,
    private msg: MessageService,
    private confirm: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.loadBarberShops();
    this.loadUsers();
  }

  loadBarberShops() {
    this.barberShopsApi.list().subscribe({
      next: (res) => {
        this.barberShops.set(res);

        if (!this.selectedBarberShopId && res.length > 0) {
          this.selectedBarberShopId = res[0].id;
          this.loadBarbers();
        }
      },
      error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar barberías' }),
    });
  }

  loadUsers() {
    this.usersApi.list('BARBER').subscribe({
      next: (res) => this.users.set(res),
      error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar usuarios BARBER' }),
    });
  }

  loadBarbers() {
    if (!this.selectedBarberShopId) return;

    this.loading.set(true);

    this.barbersApi.list(this.selectedBarberShopId).subscribe({
      next: (res) => this.barbers.set(res),
      error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar barberos' }),
      complete: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.createBarberShopId = this.selectedBarberShopId;
    this.createUserId = null;
    this.dialogVisible = true;
  }

  save() {
    if (!this.createUserId || !this.createBarberShopId) return;

    this.saving.set(true);

    this.barbersApi
      .create({
        userId: this.createUserId,
        barberShopId: this.createBarberShopId,
      })
      .subscribe({
        next: () => {
          this.msg.add({ severity: 'success', summary: 'OK', detail: 'Barbero asignado' });
          this.dialogVisible = false;
          this.loadBarbers();
        },
        error: (err) => {
          const detail =
            err?.error?.message ??
            'No se pudo asignar el barbero (puede que ya esté asignado).';

          this.msg.add({ severity: 'error', summary: 'Error', detail });
        },
        complete: () => this.saving.set(false),
      });
  }

  confirmDelete(row: BarberDto) {
    const name = row.user?.name ?? 'este barbero';

    this.confirm.confirm({
      header: 'Eliminar barbero',
      message: `¿Seguro que deseas eliminar a ${name} de esta barbería?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => this.delete(row.id),
    });
  }

  delete(id: string) {
    this.barbersApi.remove(id).subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'OK', detail: 'Barbero eliminado' });
        this.loadBarbers();
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el barbero' });
      },
    });
  }
}
