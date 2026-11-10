export interface RuntimeConfig {
  readonly supabaseUrl: string;
  readonly supabaseAnonKey: string;
  readonly turnstileSiteKey: string;
}

declare global {
  interface Window {
    readonly ciugbConfig?: RuntimeConfig;
    turnstile?: {
      render(target: string, options: { sitekey: string; action: string; callback: (token: string) => void; 'expired-callback': () => void }): string;
      reset(widgetId?: string): void;
    };
  }
}

export function getRuntimeConfig(): RuntimeConfig {
  return window.ciugbConfig ?? {
    supabaseUrl: '',
    supabaseAnonKey: '',
    turnstileSiteKey: '',
  };
}
