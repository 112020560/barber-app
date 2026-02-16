// Admin Stats
export interface UsersByRole {
  role: string;
  count: number;
}

export interface AppointmentsByShop {
  shopId: string;
  shopName: string;
  count: number;
}

export interface AdminStats {
  totalBarberShops: number;
  usersByRole: UsersByRole[];
  todayAppointmentsCount: number;
  weekAppointmentsCount: number;
  monthAppointmentsCount: number;
  totalRevenue: number;
  appointmentsByShop: AppointmentsByShop[];
}

// Owner Stats
export interface AppointmentsByBarber {
  barberId: string;
  barberName: string;
  count: number;
}

export interface OwnerStats {
  barbersCount: number;
  servicesCount: number;
  todayAppointmentsCount: number;
  weekAppointmentsCount: number;
  monthAppointmentsCount: number;
  revenue: number;
  appointmentsByBarber: AppointmentsByBarber[];
}

// Barber Stats
export interface UpcomingAppointment {
  id: string;
  date: string;
  clientName: string;
  serviceName: string;
}

export interface BarberStats {
  todayAppointmentsCount: number;
  upcomingAppointments: UpcomingAppointment[];
  weekCompletedCount: number;
  monthCompletedCount: number;
  clientsServedCount: number;
}

// Client Stats
export interface ClientUpcomingAppointment {
  id: string;
  date: string;
  barberName: string;
  serviceName: string;
  shopName: string;
}

export interface ClientRecentAppointment {
  id: string;
  date: string;
  barberName: string;
  serviceName: string;
  shopName: string;
  status: string;
}

export interface ClientStats {
  totalVisits: number;
  upcomingAppointment: ClientUpcomingAppointment | null;
  recentAppointments: ClientRecentAppointment[];
  barberShopsVisited: number;
}
