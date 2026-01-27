import { Test, TestingModule } from '@nestjs/testing';
import { BarberShopsController } from './barber-shops.controller';

describe('BarberShopsController', () => {
  let controller: BarberShopsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BarberShopsController],
    }).compile();

    controller = module.get<BarberShopsController>(BarberShopsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
