import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dtos/register.dto';
import { RegisterClientDto } from './dtos/register-client.dto';
import { LoginDto } from './dtos/login.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { UserEntity, UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private resend: Resend;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {
    this.resend = new Resend(this.config.get('RESEND_API_KEY'));
  }

  async register(dto: RegisterDto) {
    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) {
      throw new BadRequestException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role,
      barberShopId: dto.barberShopId || null,
    });

    return this.signToken(user);
  }

  async registerClient(dto: RegisterClientDto) {
    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) {
      throw new BadRequestException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: UserRole.CLIENT, // Siempre CLIENT
      barberShopId: null,
    });

    return this.signToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.signToken(user);
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(dto.email);

    if (user) {
      const token = crypto.randomUUID();
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      user.resetToken = token;
      user.resetTokenExpiry = expiry;
      await this.userRepo.save(user);

      const frontendUrl = this.config.get('FRONTEND_URL');
      const resetLink = `${frontendUrl}/reset-password?token=${token}`;

      try {
        await this.resend.emails.send({
          from: this.config.get('EMAIL_FROM'),
          to: user.email,
          subject: 'Restablecer contraseña — BarberApp',
          html: `
            <h2>Restablecer contraseña</h2>
            <p>Hola ${user.name}, recibimos una solicitud para restablecer tu contraseña.</p>
            <p>Haz clic en el siguiente enlace para crear una nueva contraseña. El enlace expira en 1 hora.</p>
            <p><a href="${resetLink}" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Restablecer contraseña</a></p>
            <p>Si no solicitaste esto, puedes ignorar este email.</p>
          `,
        });
      } catch (error) {
        console.error('Error sending reset email:', error);
      }
    }

    // Siempre responder igual para no revelar si el email existe
    return { message: 'Si el email está registrado, recibirás un enlace en breve.' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({
      where: { resetToken: dto.token },
    });

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new BadRequestException('El enlace es inválido o ha expirado.');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await this.userRepo.save(user);

    return { message: 'Contraseña actualizada correctamente.' };
  }

  private signToken(user: UserEntity) {
    const payload = {
      sub: user.id,
      role: user.role,
      barberShopId: user.barberShopId,
    };

    return {
      accessToken: this.jwt.sign(payload),
    };
  }
}
