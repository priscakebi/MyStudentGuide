import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Demarches } from './demarches';

describe('Demarches', () => {
  let component: Demarches;
  let fixture: ComponentFixture<Demarches>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Demarches],
    }).compileComponents();

    fixture = TestBed.createComponent(Demarches);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
