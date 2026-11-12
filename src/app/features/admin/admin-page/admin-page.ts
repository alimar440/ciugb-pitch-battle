import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { createClient, type Session } from '@supabase/supabase-js';
import { getRuntimeConfig } from '../../../core/runtime-config';

type Status = 'submitted' | 'under_review' | 'selected' | 'rejected';
interface Application { id: string; reference: string; team_name: string; project_title: string; category: string | null; status: Status; created_at: string; }
interface ApplicationDetail extends Application { summary: string; problem: string; solution: string; members: { full_name: string; is_leader: boolean; email: string | null; phone: string | null }[]; history: { from_status: Status | null; to_status: Status; created_at: string }[]; }
interface Settings { registrationOpen: boolean; finalistsPublished: boolean; minTeamSize: number; maxTeamSize: number; rulesText: string; rulesVersion: string; privacyText: string; privacyVersion: string; }
interface Dashboard { registrationOpen: boolean; finalistsPublished: boolean; counts: { total: number; submitted: number; underReview: number; shortlisted: number; selected: number }; }

@Component({
  selector: 'app-admin-page',
  imports: [FormsModule, RouterLink],
  styleUrl: './admin-page.css',
  templateUrl: './admin-page.html',
})
export class AdminPage {
  private readonly config = getRuntimeConfig();
  private readonly client = this.config.supabaseUrl && this.config.supabaseAnonKey
    ? createClient(this.config.supabaseUrl, this.config.supabaseAnonKey) : null;
  protected readonly configured = Boolean(this.client);
  protected readonly session = signal<Session | null>(null);
  protected readonly applications = signal<Application[]>([]);
  protected readonly busy = signal(false);
  protected readonly message = signal('');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly passwordVisible = signal(false);
  protected readonly dashboard = signal<Dashboard>({ registrationOpen: false, finalistsPublished: false, counts: { total: 0, submitted: 0, underReview: 0, shortlisted: 0, selected: 0 } });
  protected readonly selectedApplication = signal<ApplicationDetail | null>(null);
  protected readonly settings = signal<Settings>({
    registrationOpen: false, finalistsPublished: false, minTeamSize: 1, maxTeamSize: 5, rulesVersion: 'v1', privacyVersion: 'v1',
    rulesText: 'La candidature est portée par une équipe de 1 à 5 membres. Chaque équipe soumet un projet original, décrit de bonne foi et respecte les lois, les droits d’autrui et les règles de l’Université. Le comité peut demander des précisions, présélectionner les dossiers et modifier le calendrier en cas de nécessité. La décision finale du jury est communiquée par les canaux officiels du CIUGB. Toute information manifestement fausse, plagiée ou contraire au respect des personnes peut entraîner le retrait de la candidature.',
    privacyText: 'Le Club Informatique de l’Université Gaston Berger utilise les informations de candidature uniquement pour organiser le Pitch Battle : recevoir le dossier, contacter le responsable, évaluer les projets et communiquer les résultats. Les coordonnées des membres ne sont pas publiées. Elles sont accessibles seulement au comité habilité et ne sont pas cédées à des tiers. Vous pouvez demander une correction ou la suppression de vos données avant la clôture de l’édition en contactant le comité organisateur. La publication d’une équipe finaliste nécessite une case d’accord distincte dans le formulaire.',
  });
  protected readonly isSignedIn = computed(() => Boolean(this.session()));
  protected readonly decisionNotice = signal('');

  constructor() {
    if (this.client) void this.restoreSession();
  }

  protected async signIn(): Promise<void> {
    if (!this.client) return;
    this.busy.set(true); this.message.set('');
    const { data, error } = await this.client.auth.signInWithPassword({ email: this.email(), password: this.password() });
    this.busy.set(false);
    if (error || !data.session) {
      const reason = error?.message === 'Email not confirmed'
        ? 'Confirmez d’abord l’adresse e-mail de ce compte dans votre boîte de réception.'
        : error?.message === 'Invalid login credentials'
          ? 'E-mail ou mot de passe incorrect.'
          : error?.message ?? 'Connexion impossible. Réessayez.';
      this.message.set(reason);
      return;
    }
    this.session.set(data.session); this.password.set(''); await this.loadApplications(); await this.loadDashboard();
  }

  protected async signOut(): Promise<void> {
    await this.client?.auth.signOut(); this.session.set(null); this.applications.set([]); this.message.set('');
  }

  protected async updateStatus(application: Application, status: string): Promise<void> {
    if (!this.session() || !this.client || !(['submitted', 'under_review', 'selected', 'rejected'] as Status[]).includes(status as Status)) return;
    this.busy.set(true); this.message.set('');
    const response = await fetch(`${this.config.supabaseUrl.replace(/\/$/, '')}/functions/v1/admin`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', apikey: this.config.supabaseAnonKey, Authorization: `Bearer ${this.session()!.access_token}` },
      body: JSON.stringify({ applicationId: application.id, status }),
    });
    this.busy.set(false);
    if (!response.ok) { this.message.set('La décision n’a pas été enregistrée.'); return; }
    this.applications.update((items) => items.map((item) => item.id === application.id ? { ...item, status: status as Status } : item));
    this.selectedApplication.update((detail) => detail?.id === application.id ? { ...detail, status: status as Status } : detail);
    const labels: Record<Status, string> = { submitted: 'Dossier reçu', under_review: 'Dossier à examiner', selected: 'Équipe sélectionnée', rejected: 'Candidature refusée' };
    this.decisionNotice.set(`${labels[status as Status]} · la décision est enregistrée.`);
    await this.loadDashboard();
  }

  protected async openApplication(application: Application): Promise<void> {
    if (!this.session()) return;
    this.busy.set(true); this.message.set('');
    try {
      const response = await fetch(`${this.config.supabaseUrl.replace(/\/$/, '')}/functions/v1/admin?applicationId=${encodeURIComponent(application.id)}`, { headers: { apikey: this.config.supabaseAnonKey, Authorization: `Bearer ${this.session()!.access_token}` } });
      const result = await response.json() as { data?: ApplicationDetail; error?: string };
      if (!response.ok || !result.data) throw new Error(result.error ?? 'Dossier introuvable.');
      this.selectedApplication.set(result.data);
    } catch (cause) { this.message.set(cause instanceof Error ? cause.message : 'Lecture du dossier impossible.'); }
    finally { this.busy.set(false); }
  }

  protected closeApplication(): void { this.selectedApplication.set(null); }

  protected statusLabel(status: Status): string {
    return { submitted: 'Reçu', under_review: 'À examiner', selected: 'Sélectionné', rejected: 'Refusé' }[status];
  }

  protected async updateEventState(key: 'registrationOpen' | 'finalistsPublished', value: boolean): Promise<void> {
    if (!this.session()) return;
    const next = { ...this.dashboard(), [key]: value };
    this.busy.set(true); this.message.set('');
    try {
      const response = await fetch(`${this.config.supabaseUrl.replace(/\/$/, '')}/functions/v1/admin`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', apikey: this.config.supabaseAnonKey, Authorization: `Bearer ${this.session()!.access_token}` }, body: JSON.stringify({ action: 'event-state', registrationOpen: next.registrationOpen, finalistsPublished: next.finalistsPublished }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error);
      this.dashboard.set(next);
    } catch (cause) { this.message.set(cause instanceof Error ? cause.message : 'Mise à jour impossible.'); }
    finally { this.busy.set(false); }
  }

  protected async saveSettings(): Promise<void> {
    if (!this.session()) return;
    this.busy.set(true); this.message.set('');
    try {
      const response = await fetch(`${this.config.supabaseUrl.replace(/\/$/, '')}/functions/v1/admin`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', apikey: this.config.supabaseAnonKey, Authorization: `Bearer ${this.session()!.access_token}` },
        body: JSON.stringify({ action: 'settings', ...this.settings() }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error);
      this.message.set(this.settings().registrationOpen ? 'Inscriptions ouvertes.' : 'Réglages enregistrés : inscriptions fermées.');
    } catch (cause) { this.message.set(cause instanceof Error ? cause.message : 'Enregistrement impossible.'); }
    finally { this.busy.set(false); }
  }

  protected updateSetting<K extends keyof Settings>(key: K, value: Settings[K]): void { this.settings.update((settings) => ({ ...settings, [key]: value })); }

  private async restoreSession(): Promise<void> {
    const { data } = await this.client!.auth.getSession();
    this.session.set(data.session);
    if (data.session) { await this.loadApplications(); await this.loadDashboard(); }
  }

  private async loadApplications(): Promise<void> {
    if (!this.session()) return;
    this.busy.set(true); this.message.set('');
    try {
      const response = await fetch(`${this.config.supabaseUrl.replace(/\/$/, '')}/functions/v1/admin`, { headers: { apikey: this.config.supabaseAnonKey, Authorization: `Bearer ${this.session()!.access_token}` } });
      const result = await response.json() as { data?: Application[]; error?: string };
      if (!response.ok) throw new Error(result.error);
      this.applications.set(result.data ?? []);
    } catch (cause) {
      this.message.set(cause instanceof Error && cause.message
        ? `Tableau indisponible : ${cause.message}`
        : 'Tableau indisponible : la fonction admin est inaccessible.');
    }
    finally { this.busy.set(false); }
  }

  private async loadSettings(): Promise<void> {
    if (!this.session()) return;
    try {
      const response = await fetch(`${this.config.supabaseUrl.replace(/\/$/, '')}/functions/v1/admin?resource=settings`, { headers: { apikey: this.config.supabaseAnonKey, Authorization: `Bearer ${this.session()!.access_token}` } });
      const result = await response.json() as { data?: { registration_open: boolean; finalists_published: boolean; min_team_size: number; max_team_size: number; rules_text: string; rules_version: string; privacy_notice_text: string; privacy_notice_version: string } };
      if (result.data) this.settings.set({ registrationOpen: result.data.registration_open, finalistsPublished: result.data.finalists_published, minTeamSize: result.data.min_team_size, maxTeamSize: result.data.max_team_size, rulesText: result.data.rules_text, rulesVersion: result.data.rules_version, privacyText: result.data.privacy_notice_text, privacyVersion: result.data.privacy_notice_version });
    } catch { /* The candidature table remains usable even if settings are absent. */ }
  }

  private async loadDashboard(): Promise<void> {
    if (!this.session()) return;
    try {
      const response = await fetch(`${this.config.supabaseUrl.replace(/\/$/, '')}/functions/v1/admin?resource=dashboard`, { headers: { apikey: this.config.supabaseAnonKey, Authorization: `Bearer ${this.session()!.access_token}` } });
      const result = await response.json() as { data?: Dashboard };
      if (response.ok && result.data) this.dashboard.set(result.data);
    } catch { this.message.set('Tableau de bord indisponible.'); }
  }
}
