import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemarchesAdmin } from './demarches-admin';

describe('DemarchesAdmin', () => {
  let component: DemarchesAdmin;
  let fixture: ComponentFixture<DemarchesAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemarchesAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(DemarchesAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
