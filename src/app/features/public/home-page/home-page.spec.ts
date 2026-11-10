import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomePage } from './home-page';

describe('HomePage', () => {
  it('closes the mobile navigation with Escape and returns focus to its trigger', async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('.menu-toggle') as HTMLButtonElement;
    const navigation = fixture.nativeElement.querySelector('nav') as HTMLElement;
    trigger.click();
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    (navigation.querySelector('a') as HTMLAnchorElement).focus();
    navigation.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });

  it('shows a visible application button that opens the application route', async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    const applyButton = fixture.nativeElement.querySelector('a.button-primary') as HTMLAnchorElement;

    expect(applyButton).toBeTruthy();
    expect(applyButton.textContent).toContain('Postuler');
    expect(applyButton.getAttribute('href')).toBe('/postuler');
  });

  it('tracks scrolling while keeping the inverse brand readable on the dark header', async () => {
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
