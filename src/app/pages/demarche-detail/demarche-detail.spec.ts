import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemarcheDetail } from './demarche-detail';

describe('DemarcheDetail', () => {
  let component: DemarcheDetail;
  let fixture: ComponentFixture<DemarcheDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemarcheDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(DemarcheDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
