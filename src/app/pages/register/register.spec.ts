import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { Register } from './register';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  /** Formulaire correctement rempli. */
  const remplir = () => {
    component.firstName = 'Prisca';
    component.lastName = 'Kouenin';
    component.email = 'prisca@email.com';
    component.password = 'MotDePasse12!';
    component.confirmPassword = 'MotDePasse12!';
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('refuse l’inscription tant que les conditions ne sont pas acceptées (RGPD)', () => {
    remplir();

    component.onRegister();

    expect(component.formValid).toBe(false);
    expect(component.errorMessage).toContain('conditions d\'utilisation');
    http.expectNone((req) => req.url.endsWith('/register'));
  });

  it('envoie le consentement à l’API une fois la case cochée', () => {
    remplir();
    component.accepteConditions = true;

    component.onRegister();

    const req = http.expectOne((r) => r.url.endsWith('/register'));
    expect(req.request.body.accepteConditions).toBe(true);
  });
});
