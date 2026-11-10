import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
};

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: corsHeaders });
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const client = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

async function getActiveSettings() {
  const { data, error } = await client.from('contest_settings')
    .select('registration_open,min_team_size,max_team_size,rules_text,rules_version,privacy_notice_text,privacy_notice_version,registration_deadline,contests!inner(created_at)')
    .order('created_at', { referencedTable: 'contests', ascending: false }).limit(50);
  if (error || !data) return null;
  const today = new Date().toISOString().slice(0, 10);
  return data.find((settings) => settings.registration_open
    && (!settings.registration_deadline || settings.registration_deadline >= today)
    && settings.min_team_size !== null && settings.max_team_size !== null
    && Boolean(settings.rules_text?.trim() && settings.rules_version?.trim())
    && Boolean(settings.privacy_notice_text?.trim() && settings.privacy_notice_version?.trim())) ?? null;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method === 'GET') {
    const data = await getActiveSettings();
    if (!data) return response({ registrationOpen: false, minTeamSize: null, maxTeamSize: null, rulesText: '', rulesVersion: '', privacyText: '', privacyVersion: '' });
    return response({
      registrationOpen: true,
      minTeamSize: data.min_team_size, maxTeamSize: data.max_team_size,
      rulesText: data.rules_text ?? '', rulesVersion: data.rules_version ?? '',
      privacyText: data.privacy_notice_text ?? '', privacyVersion: data.privacy_notice_version ?? '',
    });
  }
  if (request.method !== 'POST') return response({ error: 'Méthode non prise en charge.' }, 405);

  try {
    const raw = await request.text();
    if (raw.length > 32_000) return response({ error: 'Le formulaire dépasse la taille autorisée.' }, 413);
    const body = JSON.parse(raw) as Record<string, unknown>;
    const policy = await getActiveSettings();
    if (!policy) return response({ error: 'Les inscriptions ne sont pas ouvertes ou les modalités doivent être configurées.' }, 403);
    if (body['rulesVersion'] !== policy.rules_version || body['privacyVersion'] !== policy.privacy_notice_version) return response({ error: 'Les modalités ont changé. Rechargez la page et vérifiez-les à nouveau.' }, 409);

    const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
    const hmacSecret = Deno.env.get('RATE_LIMIT_HMAC_SECRET');
    if (!hmacSecret) return response({ error: 'La plateforme doit terminer sa configuration.' }, 503);
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(hmacSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(ip));
    const fingerprint = Array.from(new Uint8Array(signed), (byte) => byte.toString(16).padStart(2, '0')).join('');
    const rate = await client.rpc('consume_submission_attempt', { p_fingerprint: fingerprint });
    if (rate.error || !rate.data) return response({ error: 'Trop de tentatives. Réessayez plus tard.' }, 429);

    const challengeSecret = Deno.env.get('TURNSTILE_SECRET_KEY');
    if (!challengeSecret || typeof body['challengeToken'] !== 'string') return response({ error: 'La vérification anti-robot est requise.' }, 400);
    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: challengeSecret, response: body['challengeToken'] }),
    });
    const challenge = await verify.json() as { success?: boolean; hostname?: string; action?: string };
    const expectedHostname = Deno.env.get('TURNSTILE_ALLOWED_HOSTNAME');
    if (!expectedHostname || !challenge.success || challenge.hostname !== expectedHostname || challenge.action !== 'application') return response({ error: 'La vérification anti-robot a échoué. Réessayez.' }, 400);
    if (typeof body['website'] === 'string' && body['website'].trim()) return response({ error: 'La candidature ne peut pas être validée.' }, 400);
    if (body['rulesAccepted'] !== true || body['privacyAccepted'] !== true) return response({ error: 'Veuillez accepter le règlement et la notice de confidentialité.' }, 400);

    const textFields = ['teamName', 'projectTitle', 'summary', 'problem', 'solution'] as const;
    const limits = { teamName: 120, projectTitle: 160, summary: 1000, problem: 2000, solution: 2000 };
    for (const field of textFields) {
      const value = body[field];
      if (typeof value !== 'string' || !value.trim() || value.length > limits[field]) return response({ error: 'Vérifiez les champs obligatoires et leurs limites.' }, 422);
    }
    const category = body['category'];
    if (category !== null && category !== undefined && (typeof category !== 'string' || category.length > 100)) return response({ error: 'La catégorie dépasse la longueur autorisée.' }, 422);
    const members = body['members'];
    if (!Array.isArray(members) || members.length < policy.min_team_size || members.length > policy.max_team_size) return response({ error: 'Le nombre de membres ne respecte pas les modalités configurées.' }, 422);
    const leaders = members.filter((member) => member && member['isLeader'] === true);
    if (leaders.length !== 1) return response({ error: 'Désignez un seul responsable de candidature.' }, 422);
    for (const member of members) {
      if (!member || typeof member['fullName'] !== 'string' || !member['fullName'].trim() || member['fullName'].length > 160) return response({ error: 'Vérifiez les noms des membres.' }, 422);
    }
    const leader = leaders[0];
    if (typeof leader['email'] !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leader['email']) || typeof leader['phone'] !== 'string' || !leader['phone'].trim()) return response({ error: 'Les coordonnées du responsable sont obligatoires.' }, 422);
    const { data, error } = await client.rpc('submit_application', {
      p_payload: body, p_rules_version: String(body['rulesVersion']), p_privacy_version: String(body['privacyVersion']),
    });
    if (error) {
      if (error.message.includes('applications_team_name_per_contest')) return response({ error: 'Une candidature existe déjà pour ce nom d’équipe.' }, 409);
      if (error.message.includes('TERMS_UPDATED')) return response({ error: 'Les modalités ont changé. Rechargez la page et vérifiez-les à nouveau.' }, 409);
      if (error.message.includes('REGISTRATION_CLOSED')) return response({ error: 'Les inscriptions ne sont pas ouvertes.' }, 403);
      if (error.message.includes('INVALID_TEAM_SIZE')) return response({ error: 'Le nombre de membres ne respecte plus les modalités.' }, 422);
      return response({ error: 'La candidature n’a pas pu être enregistrée. Vérifiez les informations puis réessayez.' }, 400);
    }
    return response({ reference: data }, 201);
  } catch {
    return response({ error: 'Une erreur inattendue est survenue. Réessayez plus tard.' }, 400);
  }
});
