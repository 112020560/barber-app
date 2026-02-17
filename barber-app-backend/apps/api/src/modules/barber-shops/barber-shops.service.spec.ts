import { Test, TestingModule } from '@nestjs/testing';
import { BarberShopsService } from './barber-shops.service';

describe('BarberShopsService', () => {
  let service: BarberShopsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BarberShopsService],
    }).compile();

    service = module.get<BarberShopsService>(BarberShopsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
