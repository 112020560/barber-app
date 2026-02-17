export interface ClientUpcomingAppointmentDto {
  id: string;
  date: Date;
  barberName: string;
  serviceName: string;
  shopName: string;
}

export interface ClientRecentAppointmentDto {
  id: string;
  date: Date;
  barberName: string;
  serviceName: string;
  shopName: string;
  status: string;
}

export interface ClientStatsDto {
  totalVisits: number;
  upcomingAppointment: ClientUpcomingAppointmentDto | null;
  recentAppointments: ClientRecentAppointmentDto[];
  barberShopsVisited: number;
}
