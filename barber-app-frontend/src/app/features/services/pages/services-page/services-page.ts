import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { BarberShopDto, BarberShopsApiService } from '../../../../core/services/barber-shops-api.service';
import { ServiceDto, ServicesApiService } from '../../../../core/services/services-api.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-services-page',
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ToastModule,
    ConfirmDialogModule,],
  providers: [MessageService, ConfirmationService],
  templateUrl: './services-page.html',
  styleUrl: './services-page.scss',
})
export class ServicesPage implements OnInit {

  loading = signal(false);
  saving = signal(false);

  barberShops = signal<BarberShopDto[]>([]);
  services = signal<ServiceDto[]>([]);

  selectedBarberShopId: string | null = null;
  filter = '';

  dialogVisible = false;
  editingId: string | null = null;

  form: any;

  dialogTitle = computed(() => (this.editingId ? 'Editar servicio' : 'Nuevo servicio'));

  filteredServices = computed(() => {
    const f = this.filter.trim().toLowerCase();
    const items = this.services();
    if (!f) return items;
    return items.filter(x => x.name.toLowerCase().includes(f));
  });

  // Para OWNER: ocultar selector de barbería
  isOwner = computed(() => this.auth.userRole() === 'OWNER');

  constructor(
    private fb: FormBuilder,
    private barberShopsApi: BarberShopsApiService,
    private servicesApi: ServicesApiService,
    private msg: MessageService,
    private confirm: ConfirmationService,
    private auth: AuthService,
  ) {
    this.form = this.fb.group({
      barberShopId: [null, Validators.required],
      name: ['', Validators.required],
      price: [0, Validators.required],
      durationMin: [30, Validators.required],
    });
  }

  ngOnInit(): void {
    // Si es OWNER, usar su barberShopId directamente
    if (this.auth.userRole() === 'OWNER') {
      this.selectedBarberShopId = this.auth.barberShopId();
      this.loadServices();
    } else {
      this.loadBarberShops();
    }
  }

  loadBarberShops() {
    this.barberShopsApi.list().subscribe({
      next: (res) => {
        this.barberShops.set(res);

        // auto select first barber shop for convenience
        if (!this.selectedBarberShopId && res.length > 0) {
          this.selectedBarberShopId = res[0].id;
          this.loadServices();
        }
      },
    });
  }

  loadServices() {
    if (!this.selectedBarberShopId) return;

    this.loading.set(true);

    this.servicesApi.list(this.selectedBarberShopId).subscribe({
      next: (res) => this.services.set(res),
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los servicios' });
      },
      complete: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.editingId = null;
    this.form.reset({
      barberShopId: this.selectedBarberShopId ?? '',
      name: '',
      price: 0,
      durationMin: 30,
    });
    this.dialogVisible = true;
  }

  openEdit(row: ServiceDto) {
    this.editingId = row.id;
    this.form.reset({
      barberShopId: row.barberShopId,
      name: row.name,
      price: Number(row.price),
      durationMin: row.durationMin,
    });
    this.dialogVisible = true;
  }

  save() {
    if (this.form.invalid) return;

    const value = this.form.value;
    const dto = {
      barberShopId: value.barberShopId!,
      name: value.name!,
      price: String(value.price ?? 0),
      durationMin: Number(value.durationMin ?? 0),
    };

    this.saving.set(true);

    const req = this.editingId
      ? this.servicesApi.update(this.editingId, dto)
      : this.servicesApi.create(dto);

    req.subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'OK', detail: 'Servicio guardado' });
        this.dialogVisible = false;
        this.loadServices();
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el servicio' });
      },
      complete: () => this.saving.set(false),
    });
  }

  confirmDelete(row: ServiceDto) {
    this.confirm.confirm({
      header: 'Eliminar servicio',
      message: `¿Seguro que deseas eliminar "${row.name}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => this.delete(row.id),
    });
  }

  delete(id: string) {
    this.servicesApi.remove(id).subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'OK', detail: 'Servicio eliminado' });
        this.loadServices();
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el servicio' });
      },
    });
  }

}
