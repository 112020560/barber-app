import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarberShopsPage } from './barber-shops-page';

describe('BarberShopsPage', () => {
  let component: BarberShopsPage;
  let fixture: ComponentFixture<BarberShopsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarberShopsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarberShopsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
