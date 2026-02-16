export interface UpcomingAppointmentDto {
  id: string;
  date: Date;
  clientName: string;
  serviceName: string;
}

export interface BarberStatsDto {
  todayAppointmentsCount: number;
  upcomingAppointments: UpcomingAppointmentDto[];
  weekCompletedCount: number;
  monthCompletedCount: number;
  clientsServedCount: number;
}
