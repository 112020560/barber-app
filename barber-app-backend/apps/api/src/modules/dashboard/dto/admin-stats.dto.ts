export interface UsersByRoleDto {
  role: string;
  count: number;
}

export interface AppointmentsByShopDto {
  shopId: string;
  shopName: string;
  count: number;
}

export interface AdminStatsDto {
  totalBarberShops: number;
  usersByRole: UsersByRoleDto[];
  todayAppointmentsCount: number;
  weekAppointmentsCount: number;
  monthAppointmentsCount: number;
  totalRevenue: number;
  appointmentsByShop: AppointmentsByShopDto[];
}
