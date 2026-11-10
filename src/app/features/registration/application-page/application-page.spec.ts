import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApplicationPage } from './application-page';

describe('ApplicationPage', () => {
  it('explains that submission is unavailable until platform settings are configured', async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationPage],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(ApplicationPage);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Le formulaire sera disponible après la configuration');
  });
});
