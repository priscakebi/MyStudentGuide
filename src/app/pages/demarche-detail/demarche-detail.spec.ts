import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

// Le composant exporté s'appelle DemarcheDetailComponent
// (l'ancien import « DemarcheDetail » empêchait toute la suite de tests de compiler).
import { DemarcheDetailComponent } from './demarche-detail';

describe('DemarcheDetailComponent', () => {
  let component: DemarcheDetailComponent;
  let fixture: ComponentFixture<DemarcheDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemarcheDetailComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(DemarcheDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
