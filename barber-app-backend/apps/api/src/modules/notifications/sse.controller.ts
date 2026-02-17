import {
  Controller,
  Sse,
  Query,
  UnauthorizedException,
  MessageEvent,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { SseService } from './sse.service';

@Controller('notifications')
export class SseController {
  constructor(
    private readonly sseService: SseService,
    private readonly jwtService: JwtService,
  ) {}

  @Sse('stream')
  stream(@Query('token') token: string): Observable<MessageEvent> {
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    try {
      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload.userId;

      if (!userId) {
        throw new UnauthorizedException('Invalid token payload');
      }

      console.log(`SSE client connected: ${userId}`);
      return this.sseService.addClient(userId);
    } catch (error) {
      console.error('SSE auth error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
