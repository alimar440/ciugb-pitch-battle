import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-finalists-page',
  imports: [RouterLink],
  styleUrl: './finalists-page.css',
  template: `
    <main class="finalists-page">
      <a class="back-link" routerLink="/">Retour à l’accueil</a>
      <p class="eyebrow">Pitch Battle · 72H du CIUGB</p>
      <h1>Finalistes</h1>
      <p class="description">
        Les équipes retenues seront affichées ici après leur sélection et la publication officielle par les organisateurs.
      </p>
      <a class="home-link" routerLink="/">Retour au Pitch Battle</a>
    </main>
  `,
})
export class FinalistsPage {}
