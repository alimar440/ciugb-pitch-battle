import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { publicContent } from '../public-content';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
})
export class HomePage implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;
  protected readonly content = publicContent;
  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);

  ngAfterViewInit(): void {
    const prefersReducedMotion = typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) return;
    const elements = this.host.nativeElement.querySelectorAll('[data-aos]') as NodeListOf<HTMLElement>;
    if (!elements.length) return;
    this.host.nativeElement.classList.add('aos-ready');
    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).dataset['aosVisible'] = 'true';
          this.observer?.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });
    elements.forEach((element) => this.observer?.observe(element));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  @HostListener('window:scroll')
  protected updateScrolledState(): void {
    this.scrolled.set(window.scrollY > 12);
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
