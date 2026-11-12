import { Component, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { getRuntimeConfig } from '../../../core/runtime-config';

interface RegistrationInfo {
  readonly registrationOpen: boolean;
  readonly minTeamSize: number | null;
  readonly maxTeamSize: number | null;
  readonly rulesText: string;
  readonly rulesVersion: string;
  readonly privacyText: string;
  readonly privacyVersion: string;
}

@Component({
  selector: 'app-application-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './application-page.html',
  styleUrl: './application-page.css',
})
export class ApplicationPage {
  private readonly config = getRuntimeConfig();
  private readonly baseUrl = this.config.supabaseUrl.replace(/\/$/, '');
  protected readonly step = signal(0);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly confirmation = signal('');
  protected readonly challengeError = signal('');
  protected readonly challengeToken = signal('');
  protected readonly registrationInfo = signal<RegistrationInfo | null>(null);
  protected readonly configured = Boolean(this.baseUrl && this.config.supabaseAnonKey);
  protected readonly form = new FormBuilder().group({
    teamName: ['', [Validators.required, Validators.maxLength(120)]],
    projectTitle: ['', [Validators.required, Validators.maxLength(160)]],
    category: ['', Validators.maxLength(100)],
    summary: ['', [Validators.required, Validators.maxLength(1000)]],
    problem: ['', [Validators.required, Validators.maxLength(2000)]],
    solution: ['', [Validators.required, Validators.maxLength(2000)]],
    members: new FormArray([this.createMember(true)]),
    rulesAccepted: [false, Validators.requiredTrue],
    privacyAccepted: [false, Validators.requiredTrue],
    finalistPublicationConsent: [false],
    website: [''],
  });

  constructor() {
    if (this.configured) void this.loadRegistrationInfo();
  }

  protected get members(): FormArray {
    return this.form.controls.members;
  }

  protected addMember(): void {
    const maximum = this.registrationInfo()?.maxTeamSize;
    if (maximum !== null && maximum !== undefined && this.members.length >= maximum) return;
    this.members.push(this.createMember(false));
  }

  protected removeMember(index: number): void {
    if (index > 0) this.members.removeAt(index);
  }

  protected next(): void {
    this.error.set('');
    if (this.step() === 0 && this.form.controls.teamName.invalid) {
      this.form.controls.teamName.markAsTouched();
      return;
    }
    if (this.step() === 1) {
      const fields = [this.form.controls.projectTitle, this.form.controls.summary, this.form.controls.problem, this.form.controls.solution];
      fields.forEach((field) => field.markAsTouched());
      if (fields.some((field) => field.invalid)) return;
      const size = this.members.length;
      const info = this.registrationInfo();
      if ((info?.minTeamSize && size < info.minTeamSize) || (info?.maxTeamSize && size > info.maxTeamSize)) {
        this.error.set(`L’équipe doit compter entre ${info.minTeamSize} et ${info.maxTeamSize} membres selon les modalités configurées.`);
        return;
      }
      if (this.members.controls.some((member) => member.invalid)) {
        this.members.controls.forEach((member) => member.markAllAsTouched());
        return;
      }
      if (!info?.registrationOpen || !info.rulesText || !info.privacyText) {
        this.error.set('Les inscriptions ne sont pas encore ouvertes par le comité. Les modalités officielles seront affichées avant l’envoi.');
        return;
      }
    }
    this.step.update((value) => Math.min(value + 1, 2));
    if (this.step() === 2) window.setTimeout(() => this.renderChallenge());
  }

  protected previous(): void {
    this.error.set('');
    this.step.update((value) => Math.max(value - 1, 0));
  }

  protected async submit(): Promise<void> {
    this.error.set('');
    this.form.controls.rulesAccepted.markAsTouched();
    this.form.controls.privacyAccepted.markAsTouched();
    if (this.form.invalid) return;
    if (!this.configured || !this.registrationInfo()?.registrationOpen) {
      this.error.set('Les inscriptions ne sont pas ouvertes ou la plateforme n’est pas encore configurée.');
      return;
    }
    this.busy.set(true);
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/submit-application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: this.config.supabaseAnonKey,
          Authorization: `Bearer ${this.config.supabaseAnonKey}`,
        },
        body: JSON.stringify({
          ...this.form.getRawValue(),
          challengeToken: this.challengeToken(),
          rulesVersion: this.registrationInfo()?.rulesVersion,
          privacyVersion: this.registrationInfo()?.privacyVersion,
        }),
      });
      const result = (await response.json()) as { reference?: string; error?: string };
      if (!response.ok || !result.reference) throw new Error(result.error ?? 'La candidature n’a pas pu être enregistrée.');
      this.confirmation.set(result.reference);
      this.form.reset();
      this.challengeToken.set('');
    } catch (cause) {
      this.error.set(cause instanceof Error ? cause.message : 'Une erreur est survenue. Réessayez plus tard.');
    } finally {
      this.busy.set(false);
    }
  }

  private challengeWidgetId = '';
  private challengeRenderAttempts = 0;
  private turnstileScriptRequested = false;

  private renderChallenge(): void {
    if (!this.config.turnstileSiteKey || this.challengeWidgetId) return;
    if (!document.querySelector('#turnstile-widget')) {
      if (this.challengeRenderAttempts++ < 10) window.setTimeout(() => this.renderChallenge(), 50);
      return;
    }
    if (!window.turnstile) {
      if (!this.turnstileScriptRequested) this.loadTurnstileScript();
      if (this.challengeRenderAttempts++ < 40) window.setTimeout(() => this.renderChallenge(), 250);
      else this.challengeError.set('La vérification anti-robot ne s’est pas chargée. Vérifiez votre connexion puis rechargez la page.');
      return;
    }
    try {
      this.challengeWidgetId = window.turnstile.render('#turnstile-widget', {
        sitekey: this.config.turnstileSiteKey,
        action: 'application',
        callback: (token) => { this.challengeToken.set(token); },
        'expired-callback': () => { this.challengeToken.set(''); },
      });
    } catch {
      this.challengeError.set('La vérification anti-robot ne peut pas démarrer. Rechargez la page puis réessayez.');
    }
  }

  private loadTurnstileScript(): void {
    this.turnstileScriptRequested = true;
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => this.renderChallenge();
    script.onerror = () => this.challengeError.set('Impossible de charger la vérification anti-robot. Désactivez un éventuel bloqueur de contenu puis rechargez la page.');
    document.head.append(script);
  }

  private async loadRegistrationInfo(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/submit-application`, {
        method: 'GET',
        headers: { apikey: this.config.supabaseAnonKey, Authorization: `Bearer ${this.config.supabaseAnonKey}` },
      });
      if (response.ok) this.registrationInfo.set((await response.json()) as RegistrationInfo);
    } catch {
      this.error.set('Impossible de charger les modalités de candidature pour le moment.');
    }
  }

  private createMember(isLeader: boolean) {
    return new FormBuilder().group({
      fullName: ['', [Validators.required, Validators.maxLength(160)]],
      email: [isLeader ? '' : '', isLeader ? [Validators.required, Validators.email, Validators.maxLength(254)] : [Validators.email, Validators.maxLength(254)]],
      phone: ['', isLeader ? [Validators.required, Validators.maxLength(40)] : Validators.maxLength(40)],
      isLeader: [isLeader],
    });
  }
}
