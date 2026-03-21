import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { RegisterClientDto } from './dtos/register-client.dto';
import { LoginDto } from './dtos/login.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  // Auto-registro para clientes (público)
  @Post('register/client')
  registerClient(@Body() dto: RegisterClientDto) {
    return this.service.registerClient(dto);
  }

  // Registro con rol específico (solo ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.service.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.service.login(dto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.service.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.service.resetPassword(dto);
  }
}
