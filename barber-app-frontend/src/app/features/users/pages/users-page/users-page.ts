import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { UserDto, UsersApiService } from '../../../../core/services/users-api.service';
import { UserRole } from '../../../../core/models/user-role';

@Component({
  selector: 'app-users-page',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    SelectModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './users-page.html',
  styleUrl: './users-page.scss',
})
export class UsersPage implements OnInit {
  loading = signal(false);
  saving = signal(false);

  users = signal<UserDto[]>([]);
  filter = '';

  dialogVisible = false;
  editingId: string | null = null;

  roleOptions = [
    { label: 'ADMIN', value: 'ADMIN' },
    { label: 'BARBER', value: 'BARBER' },
    { label: 'CLIENT', value: 'CLIENT' },
  ];

  form: any

  dialogTitle = computed(() => (this.editingId ? 'Editar usuario' : 'Nuevo usuario'));

  filteredUsers = computed(() => {
    const f = this.filter.trim().toLowerCase();
    const items = this.users();
    if (!f) return items;

    return items.filter(x =>
      x.name.toLowerCase().includes(f) ||
      x.email.toLowerCase().includes(f) ||
      x.role.toLowerCase().includes(f)
    );
  });

  constructor(
    private fb: FormBuilder,
    private api: UsersApiService,
    private msg: MessageService,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['CLIENT', Validators.required],
      password: [''],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);

    this.api.list().subscribe({
      next: (res) => this.users.set(res),
      error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar usuarios' }),
      complete: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.editingId = null;
    this.form.reset({
      name: '',
      email: '',
      role: 'CLIENT',
      password: '',
    });

    // en create, password requerido
    this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.get('password')?.updateValueAndValidity();

    this.dialogVisible = true;
  }

  openEdit(user: UserDto) {
    this.editingId = user.id;
    this.form.reset({
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      password: '',
    });

    // en edit, password NO requerido
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();

    this.dialogVisible = true;
  }

  save() {
    if (this.form.invalid) return;

    const v = this.form.value;

    this.saving.set(true);

    const req = this.editingId
      ? this.api.update(this.editingId, {
          name: v.name!,
          email: v.email!,
          role: v.role!,
        })
      : this.api.create({
          name: v.name!,
          email: v.email!,
          role: v.role!,
          password: v.password!,
        });

    req.subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'OK', detail: 'Usuario guardado' });
        this.dialogVisible = false;
        this.loadUsers();
      },
      error: (err) => {
        const detail = err?.error?.message ?? 'No se pudo guardar el usuario';
        this.msg.add({ severity: 'error', summary: 'Error', detail });
      },
      complete: () => this.saving.set(false),
    });
  }

}
