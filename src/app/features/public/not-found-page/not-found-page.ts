import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  styleUrl: './not-found-page.css',
  template: `
    <main class="not-found-page">
      <header class="page-masthead"><a routerLink="/">CIUGB / PITCH BATTLE</a><span>SANAR · SAINT-LOUIS</span></header>
      <div class="error-content">
        <p class="error-number" aria-hidden="true">404</p>
        <div class="error-copy">
          <p class="eyebrow">Erreur 404</p>
          <h1>Cette page<br />n’existe pas.</h1>
          <p class="description">Cette adresse ne correspond à aucune page du site. Retrouvez le Pitch Battle des 72H du CIUGB à l’accueil.</p>
          <a class="home-link" routerLink="/">Revenir au concours <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <footer>CLUB INFORMATIQUE DE L’UNIVERSITÉ GASTON BERGER</footer>
    </main>
  `,
})
export class NotFoundPage {}
