import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { getRuntimeConfig } from '../../../core/runtime-config';

interface Finalist { team_name: string; project_title: string; summary: string; category: string | null; }

@Component({
  selector: 'app-finalists-page',
  imports: [RouterLink],
  styleUrl: './finalists-page.css',
  template: `
    <main class="finalists-page">
      <header class="page-masthead">
        <a class="event-brand" routerLink="/" aria-label="CIUGB Pitch Battle, accueil">
          <img src="ciugb-mark-inverse.png" alt="" width="40" height="36" />
          <span>CIUGB<br /><strong>PITCH BATTLE</strong></span>
        </a>
        <a class="back-link" routerLink="/"><span aria-hidden="true">←</span> Le concours</a>
      </header>

      <section class="selection-heading" aria-labelledby="finalists-title">
        <p class="edition-line">72H DU CIUGB <span>SANAR · SAINT-LOUIS</span></p>
        <div class="title-layout">
          <h1 id="finalists-title">Les<br /><span>finalistes.</span></h1>
          <p class="selection-label">SÉLECTION<br />OFFICIELLE</p>
        </div>
        <p class="heading-caption">Le Pitch Battle du Club Informatique de l’Université Gaston Berger.</p>
      </section>

      <section class="publication" aria-labelledby="publication-title">
        <p class="publication-label">La publication</p>
        <div>
          @if (!loaded()) {
            <h2 id="publication-title">Chargement de la sélection.</h2>
          } @else if (finalists().length) {
            <h2 id="publication-title">Les équipes retenues.</h2>
            <div class="finalist-list">@for (finalist of finalists(); track finalist.team_name) { <article><p class="publication-label">{{ finalist.category || 'Pitch Battle' }}</p><h3>{{ finalist.team_name }}</h3><strong>{{ finalist.project_title }}</strong><p>{{ finalist.summary }}</p></article> }</div>
          } @else {
            <h2 id="publication-title">La sélection sera publiée ici.</h2>
            <p class="description">Les équipes retenues apparaîtront sur cette page après leur sélection et la publication officielle par les organisateurs.</p>
          }
          <div class="page-actions">
            <a class="apply-link" routerLink="/postuler">Présenter votre projet <span aria-hidden="true">↗</span></a>
            <a class="home-link" routerLink="/">Découvrir le concours</a>
          </div>
        </div>
      </section>
    </main>
  `,
})
export class FinalistsPage {
  private readonly config = getRuntimeConfig();
  protected readonly finalists = signal<Finalist[]>([]);
  protected readonly loaded = signal(false);

  constructor() { if (this.config.supabaseUrl && this.config.supabaseAnonKey) void this.loadFinalists(); }

  private async loadFinalists(): Promise<void> {
    try {
      const response = await fetch(`${this.config.supabaseUrl.replace(/\/$/, '')}/rest/v1/rpc/list_published_finalists`, {
        method: 'POST', headers: { apikey: this.config.supabaseAnonKey, Authorization: `Bearer ${this.config.supabaseAnonKey}`, 'Content-Type': 'application/json' }, body: '{}',
      });
      if (response.ok) this.finalists.set((await response.json()) as Finalist[]);
    } finally { this.loaded.set(true); }
  }
}
