import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesAdmin } from './categories-admin';

describe('CategoriesAdmin', () => {
  let component: CategoriesAdmin;
  let fixture: ComponentFixture<CategoriesAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
