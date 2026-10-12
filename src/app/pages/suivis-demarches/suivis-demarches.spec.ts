import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { SuivisDemarches } from './suivis-demarches';

describe('SuivisDemarches', () => {
  let component: SuivisDemarches;
  let fixture: ComponentFixture<SuivisDemarches>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuivisDemarches],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SuivisDemarches);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
