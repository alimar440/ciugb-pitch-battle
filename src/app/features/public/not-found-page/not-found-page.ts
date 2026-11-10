import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  styleUrl: './not-found-page.css',
  template: `
    <main class="not-found-page">
      <p class="eyebrow">Erreur 404</p>
      <h1>Page introuvable</h1>
      <p>Cette adresse ne correspond à aucune page du site.</p>
      <a routerLink="/">Revenir à l’accueil</a>
    </main>
  `,
})
export class NotFoundPage {}
