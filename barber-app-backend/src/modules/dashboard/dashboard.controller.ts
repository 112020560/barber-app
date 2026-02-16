import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @Roles('ADMIN')
  getAdminStats() {
    return this.dashboardService.getAdminStats();
  }

  @Get('owner')
  @Roles('OWNER')
  getOwnerStats(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getOwnerStats(user.barberShopId);
  }

  @Get('barber')
  @Roles('BARBER')
  getBarberStats(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getBarberStats(user.userId);
  }

  @Get('client')
  @Roles('CLIENT')
  getClientStats(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getClientStats(user.userId);
  }
}
