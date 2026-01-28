import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  create(data: Partial<UserEntity>) {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async findAll(role?: UserRole) {
    const query = this.repo
      .createQueryBuilder('u')
      .select(['u.id', 'u.name', 'u.email', 'u.role', 'u.createdAt'])
      .orderBy('u.createdAt', 'DESC');

    if (role) query.where('u.role = :role', { role });

    return query.getMany();
  }

  async findOne(id: string) {
    const user = await this.repo.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'role', 'createdAt'],
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.email && dto.email !== user.email) {
      const exists = await this.repo.findOne({ where: { email: dto.email } });
      if (exists) throw new BadRequestException('Email already exists');
    }

    Object.assign(user, dto);
    await this.repo.save(user);

    // devolver sin passwordHash
    return this.findOne(id);
  }
}
