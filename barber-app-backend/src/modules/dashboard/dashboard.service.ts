import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { BarberShopEntity } from '../barber-shops/entities/barber-shop.entity';
import { BarberEntity } from '../barbers/entities/barber.entity';
import { ServiceEntity } from '../services/entities/service.entity';
import {
  AppointmentEntity,
  AppointmentStatus,
} from '../appointments/entities/appointments.entity';
import { AdminStatsDto } from './dto/admin-stats.dto';
import { OwnerStatsDto } from './dto/owner-stats.dto';
import { BarberStatsDto } from './dto/barber-stats.dto';
import { ClientStatsDto } from './dto/client-stats.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(BarberShopEntity)
    private readonly barberShopRepo: Repository<BarberShopEntity>,
    @InjectRepository(BarberEntity)
    private readonly barberRepo: Repository<BarberEntity>,
    @InjectRepository(ServiceEntity)
    private readonly serviceRepo: Repository<ServiceEntity>,
    @InjectRepository(AppointmentEntity)
    private readonly appointmentRepo: Repository<AppointmentEntity>,
  ) {}

  async getAdminStats(): Promise<AdminStatsDto> {
    const now = new Date();
    const todayStart = this.getStartOfDay(now);
    const todayEnd = this.getEndOfDay(now);
    const weekStart = this.getStartOfWeek(now);
    const monthStart = this.getStartOfMonth(now);

    // Total barber shops
    const totalBarberShops = await this.barberShopRepo.count();

    // Users by role
    const usersByRole = await this.userRepo
      .createQueryBuilder('u')
      .select('u.role', 'role')
      .addSelect('COUNT(*)::int', 'count')
      .groupBy('u.role')
      .getRawMany();

    // Today's appointments
    const todayAppointmentsCount = await this.appointmentRepo.count({
      where: { date: Between(todayStart, todayEnd) },
    });

    // Week appointments
    const weekAppointmentsCount = await this.appointmentRepo.count({
      where: { date: Between(weekStart, todayEnd) },
    });

    // Month appointments
    const monthAppointmentsCount = await this.appointmentRepo.count({
      where: { date: Between(monthStart, todayEnd) },
    });

    // Total revenue (from confirmed appointments)
    const revenueResult = await this.appointmentRepo
      .createQueryBuilder('apt')
      .innerJoin('apt.service', 'service')
      .select('COALESCE(SUM(service.price::numeric), 0)', 'total')
      .where('apt.status = :status', { status: AppointmentStatus.CONFIRMED })
      .getRawOne();
    const totalRevenue = parseFloat(revenueResult?.total || '0');

    // Appointments by shop
    const appointmentsByShop = await this.appointmentRepo
      .createQueryBuilder('apt')
      .innerJoin('apt.barber', 'barber')
      .innerJoin('barber.barberShop', 'shop')
      .select('shop.id', 'shopId')
      .addSelect('shop.name', 'shopName')
      .addSelect('COUNT(*)::int', 'count')
      .groupBy('shop.id')
      .addGroupBy('shop.name')
      .getRawMany();

    return {
      totalBarberShops,
      usersByRole,
      todayAppointmentsCount,
      weekAppointmentsCount,
      monthAppointmentsCount,
      totalRevenue,
      appointmentsByShop,
    };
  }

  async getOwnerStats(barberShopId: string): Promise<OwnerStatsDto> {
    if (!barberShopId) {
      throw new NotFoundException('Owner has no assigned barber shop');
    }

    const now = new Date();
    const todayStart = this.getStartOfDay(now);
    const todayEnd = this.getEndOfDay(now);
    const weekStart = this.getStartOfWeek(now);
    const monthStart = this.getStartOfMonth(now);

    // Barbers count
    const barbersCount = await this.barberRepo.count({
      where: { barberShopId },
    });

    // Services count
    const servicesCount = await this.serviceRepo.count({
      where: { barberShopId },
    });

    // Get all barber IDs for this shop
    const barbers = await this.barberRepo.find({
      where: { barberShopId },
      select: ['id'],
    });
    const barberIds = barbers.map((b) => b.id);

    if (barberIds.length === 0) {
      return {
        barbersCount: 0,
        servicesCount,
        todayAppointmentsCount: 0,
        weekAppointmentsCount: 0,
        monthAppointmentsCount: 0,
        revenue: 0,
        appointmentsByBarber: [],
      };
    }

    // Today's appointments
    const todayAppointmentsCount = await this.appointmentRepo
      .createQueryBuilder('apt')
      .where('apt.barberId IN (:...barberIds)', { barberIds })
      .andWhere('apt.date BETWEEN :start AND :end', {
        start: todayStart,
        end: todayEnd,
      })
      .getCount();

    // Week appointments
    const weekAppointmentsCount = await this.appointmentRepo
      .createQueryBuilder('apt')
      .where('apt.barberId IN (:...barberIds)', { barberIds })
      .andWhere('apt.date BETWEEN :start AND :end', {
        start: weekStart,
        end: todayEnd,
      })
      .getCount();

    // Month appointments
    const monthAppointmentsCount = await this.appointmentRepo
      .createQueryBuilder('apt')
      .where('apt.barberId IN (:...barberIds)', { barberIds })
      .andWhere('apt.date BETWEEN :start AND :end', {
        start: monthStart,
        end: todayEnd,
      })
      .getCount();

    // Revenue for this shop
    const revenueResult = await this.appointmentRepo
      .createQueryBuilder('apt')
      .innerJoin('apt.service', 'service')
      .where('apt.barberId IN (:...barberIds)', { barberIds })
      .andWhere('apt.status = :status', { status: AppointmentStatus.CONFIRMED })
      .select('COALESCE(SUM(service.price::numeric), 0)', 'total')
      .getRawOne();
    const revenue = parseFloat(revenueResult?.total || '0');

    // Appointments by barber
    const appointmentsByBarber = await this.appointmentRepo
      .createQueryBuilder('apt')
      .innerJoin('apt.barber', 'barber')
      .innerJoin('barber.user', 'user')
      .where('apt.barberId IN (:...barberIds)', { barberIds })
      .select('barber.id', 'barberId')
      .addSelect('user.name', 'barberName')
      .addSelect('COUNT(*)::int', 'count')
      .groupBy('barber.id')
      .addGroupBy('user.name')
      .getRawMany();

    return {
      barbersCount,
      servicesCount,
      todayAppointmentsCount,
      weekAppointmentsCount,
      monthAppointmentsCount,
      revenue,
      appointmentsByBarber,
    };
  }

  async getBarberStats(userId: string): Promise<BarberStatsDto> {
    // Find the barber by userId
    const barber = await this.barberRepo.findOne({
      where: { userId },
    });

    if (!barber) {
      throw new NotFoundException('Barber profile not found for this user');
    }

    const barberId = barber.id;
    const now = new Date();
    const todayStart = this.getStartOfDay(now);
    const todayEnd = this.getEndOfDay(now);
    const weekStart = this.getStartOfWeek(now);
    const monthStart = this.getStartOfMonth(now);

    // Today's appointments count
    const todayAppointmentsCount = await this.appointmentRepo.count({
      where: {
        barberId,
        date: Between(todayStart, todayEnd),
      },
    });

    // Upcoming appointments (next 5)
    const upcomingRaw = await this.appointmentRepo
      .createQueryBuilder('apt')
      .innerJoin('apt.client', 'client')
      .innerJoin('apt.service', 'service')
      .where('apt.barberId = :barberId', { barberId })
      .andWhere('apt.date >= :now', { now })
      .andWhere('apt.status != :cancelled', {
        cancelled: AppointmentStatus.CANCELLED,
      })
      .select([
        'apt.id AS id',
        'apt.date AS date',
        'client.name AS "clientName"',
        'service.name AS "serviceName"',
      ])
      .orderBy('apt.date', 'ASC')
      .limit(5)
      .getRawMany();

    const upcomingAppointments = upcomingRaw.map((r) => ({
      id: r.id,
      date: r.date,
      clientName: r.clientName,
      serviceName: r.serviceName,
    }));

    // Week completed count
    const weekCompletedCount = await this.appointmentRepo.count({
      where: {
        barberId,
        status: AppointmentStatus.CONFIRMED,
        date: Between(weekStart, todayEnd),
      },
    });

    // Month completed count
    const monthCompletedCount = await this.appointmentRepo.count({
      where: {
        barberId,
        status: AppointmentStatus.CONFIRMED,
        date: Between(monthStart, todayEnd),
      },
    });

    // Unique clients served
    const clientsResult = await this.appointmentRepo
      .createQueryBuilder('apt')
      .where('apt.barberId = :barberId', { barberId })
      .andWhere('apt.status = :status', { status: AppointmentStatus.CONFIRMED })
      .select('COUNT(DISTINCT apt.clientId)::int', 'count')
      .getRawOne();
    const clientsServedCount = clientsResult?.count || 0;

    return {
      todayAppointmentsCount,
      upcomingAppointments,
      weekCompletedCount,
      monthCompletedCount,
      clientsServedCount,
    };
  }

  async getClientStats(clientId: string): Promise<ClientStatsDto> {
    const now = new Date();

    // Total visits (confirmed appointments)
    const totalVisits = await this.appointmentRepo.count({
      where: {
        clientId,
        status: AppointmentStatus.CONFIRMED,
      },
    });

    // Upcoming appointment (next one)
    const upcomingRaw = await this.appointmentRepo
      .createQueryBuilder('apt')
      .innerJoin('apt.barber', 'barber')
      .innerJoin('barber.user', 'barberUser')
      .innerJoin('barber.barberShop', 'shop')
      .innerJoin('apt.service', 'service')
      .where('apt.clientId = :clientId', { clientId })
      .andWhere('apt.date >= :now', { now })
      .andWhere('apt.status != :cancelled', {
        cancelled: AppointmentStatus.CANCELLED,
      })
      .select([
        'apt.id AS id',
        'apt.date AS date',
        'barberUser.name AS "barberName"',
        'service.name AS "serviceName"',
        'shop.name AS "shopName"',
      ])
      .orderBy('apt.date', 'ASC')
      .limit(1)
      .getRawOne();

    const upcomingAppointment = upcomingRaw
      ? {
          id: upcomingRaw.id,
          date: upcomingRaw.date,
          barberName: upcomingRaw.barberName,
          serviceName: upcomingRaw.serviceName,
          shopName: upcomingRaw.shopName,
        }
      : null;

    // Recent appointments (last 5)
    const recentRaw = await this.appointmentRepo
      .createQueryBuilder('apt')
      .innerJoin('apt.barber', 'barber')
      .innerJoin('barber.user', 'barberUser')
      .innerJoin('barber.barberShop', 'shop')
      .innerJoin('apt.service', 'service')
      .where('apt.clientId = :clientId', { clientId })
      .select([
        'apt.id AS id',
        'apt.date AS date',
        'apt.status AS status',
        'barberUser.name AS "barberName"',
        'service.name AS "serviceName"',
        'shop.name AS "shopName"',
      ])
      .orderBy('apt.date', 'DESC')
      .limit(5)
      .getRawMany();

    const recentAppointments = recentRaw.map((r) => ({
      id: r.id,
      date: r.date,
      barberName: r.barberName,
      serviceName: r.serviceName,
      shopName: r.shopName,
      status: r.status,
    }));

    // Unique barber shops visited
    const shopsResult = await this.appointmentRepo
      .createQueryBuilder('apt')
      .innerJoin('apt.barber', 'barber')
      .where('apt.clientId = :clientId', { clientId })
      .andWhere('apt.status = :status', { status: AppointmentStatus.CONFIRMED })
      .select('COUNT(DISTINCT barber.barberShopId)::int', 'count')
      .getRawOne();
    const barberShopsVisited = shopsResult?.count || 0;

    return {
      totalVisits,
      upcomingAppointment,
      recentAppointments,
      barberShopsVisited,
    };
  }

  // Helper methods for date ranges
  private getStartOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getEndOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getStartOfMonth(date: Date): Date {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
