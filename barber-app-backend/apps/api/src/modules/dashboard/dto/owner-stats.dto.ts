export interface AppointmentsByBarberDto {
  barberId: string;
  barberName: string;
  count: number;
}

export interface OwnerStatsDto {
  barbersCount: number;
  servicesCount: number;
  todayAppointmentsCount: number;
  weekAppointmentsCount: number;
  monthAppointmentsCount: number;
  revenue: number;
  appointmentsByBarber: AppointmentsByBarberDto[];
}
