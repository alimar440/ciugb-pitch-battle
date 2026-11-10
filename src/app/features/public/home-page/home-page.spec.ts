import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomePage } from './home-page';

describe('HomePage', () => {
  it('shows a visible application button that opens the application route', async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    const applyButton = fixture.nativeElement.querySelector('a.button-primary') as HTMLAnchorElement;

    expect(applyButton).toBeTruthy();
    expect(applyButton.textContent?.trim()).toBe('Postuler');
    expect(applyButton.getAttribute('href')).toBe('/postuler');
  });

  it('switches to the dark navigation appearance after scrolling', async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 40 });
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('.site-header') as HTMLElement;
    const logo = fixture.nativeElement.querySelector('.site-header .brand-logo') as HTMLImageElement;
    expect(header.classList.contains('is-scrolled')).toBe(true);
    expect(logo.getAttribute('src')).toBe('ciugb-mark-inverse.png');
  });
});
