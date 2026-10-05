import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsAdmin } from './documents-admin';

describe('DocumentsAdmin', () => {
  let component: DocumentsAdmin;
  let fixture: ComponentFixture<DocumentsAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentsAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentsAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
