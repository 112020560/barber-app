import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { UserRole } from './entities/user.entity';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.service.update(id, dto);
  }
  // GET /users?role=BARBER
  @Get()
  findAll(@Query('role') role?: UserRole) {
    return this.service.findAll(role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
