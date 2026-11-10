import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

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
        <p class="edition-line">72H DU CIUGB <span>UNIVERSITÉ GASTON BERGER</span></p>
        <div class="title-layout">
          <h1 id="finalists-title">Les<br /><span>finalistes.</span></h1>
          <p class="selection-label">SÉLECTION<br />OFFICIELLE</p>
        </div>
        <p class="heading-caption">Les projets étudiants prennent la parole.</p>
      </section>

      <section class="publication" aria-labelledby="publication-title">
        <p class="publication-label">La publication</p>
        <div>
          <h2 id="publication-title">La sélection sera publiée ici.</h2>
          <p class="description">Les équipes retenues apparaîtront sur cette page après leur sélection et la publication officielle par les organisateurs.</p>
          <div class="page-actions">
            <a class="apply-link" routerLink="/postuler">Présenter votre projet <span aria-hidden="true">↗</span></a>
            <a class="home-link" routerLink="/">Découvrir le concours</a>
          </div>
        </div>
      </section>
    </main>
  `,
})
export class FinalistsPage {}
