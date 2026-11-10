import { Component, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { publicContent } from '../public-content';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
})
export class HomePage {
  protected readonly content = publicContent;
  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);

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
