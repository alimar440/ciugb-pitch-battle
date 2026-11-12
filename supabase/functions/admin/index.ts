import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const url = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const allowedOrigins = (Deno.env.get('ALLOWED_ORIGIN') ?? '').split(',').map((origin) => origin.trim()).filter(Boolean);
const service = createClient(url, serviceKey, { auth: { persistSession: false } });

function headers(request: Request): HeadersInit {
  return {
    'Access-Control-Allow-Origin': allowedOrigins.includes(request.headers.get('origin') ?? '') ? request.headers.get('origin')! : 'null',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
    Vary: 'Origin',
  };
}
const reply = (request: Request, body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: headers(request) });

Deno.serve(async (request) => {
  // A 204 response must not contain even an empty-string body in the Fetch API.
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: headers(request) });
  if (!allowedOrigins.includes(request.headers.get('origin') ?? '')) return reply(request, { error: 'Origine non autorisée.' }, 403);
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return reply(request, { error: 'Authentification requise.' }, 401);
  const { data: auth } = await service.auth.getUser(token);
  if (!auth.user) return reply(request, { error: 'Session invalide.' }, 401);
  const { data: profile } = await service.from('profiles').select('role').eq('id', auth.user.id).maybeSingle();
  if (profile?.role !== 'admin') return reply(request, { error: 'Accès administrateur requis.' }, 403);

  if (request.method === 'GET') {
    const requestUrl = new URL(request.url);
    if (requestUrl.searchParams.get('resource') === 'dashboard') {
      const [{ data: settings, error: settingsError }, { data: applications, error: applicationsError }] = await Promise.all([
        service.from('contest_settings').select('registration_open,finalists_published').limit(1).maybeSingle(),
        service.from('applications').select('status'),
      ]);
      if (settingsError || applicationsError) return reply(request, { error: 'Lecture du tableau de bord impossible.' }, 400);
      const counts = { total: applications?.length ?? 0, submitted: 0, underReview: 0, shortlisted: 0, selected: 0 };
      for (const application of applications ?? []) {
        if (application.status === 'submitted') counts.submitted++;
        if (application.status === 'under_review') counts.underReview++;
        if (application.status === 'selected') counts.selected++;
      }
      return reply(request, { data: { registrationOpen: settings?.registration_open ?? false, finalistsPublished: settings?.finalists_published ?? false, counts } });
    }
    if (requestUrl.searchParams.get('resource') === 'settings') {
      const { data, error } = await service.from('contest_settings')
        .select('contest_id,registration_open,finalists_published,min_team_size,max_team_size,rules_text,rules_version,privacy_notice_text,privacy_notice_version')
        .limit(1).maybeSingle();
      return error ? reply(request, { error: 'Lecture des réglages impossible.' }, 400) : reply(request, { data });
    }
    const id = requestUrl.searchParams.get('applicationId');
    if (id) {
      const [{ data: application, error: applicationError }, { data: members, error: membersError }, { data: history, error: historyError }] = await Promise.all([
        service.from('applications').select('id,reference,team_name,project_title,summary,problem,solution,category,status,created_at').eq('id', id).maybeSingle(),
        service.from('team_members').select('full_name,is_leader,email,phone').eq('application_id', id).order('is_leader', { ascending: false }),
        service.from('status_history').select('from_status,to_status,created_at').eq('application_id', id).order('created_at', { ascending: false }),
      ]);
      if (applicationError || membersError || historyError || !application) return reply(request, { error: 'Lecture du dossier impossible.' }, 404);
      return reply(request, { data: { ...application, members: members ?? [], history: history ?? [] } });
    }
    const query = service.from('applications').select('id,reference,team_name,project_title,category,status,created_at');
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.error('admin list query failed', error);
      return reply(request, { error: 'Lecture impossible.' }, 400);
    }
    return reply(request, { data });
  }
  if (request.method === 'PATCH') {
    const body = await request.json() as { action?: string; applicationId?: string; status?: string; registrationOpen?: boolean; finalistsPublished?: boolean; minTeamSize?: number; maxTeamSize?: number; rulesText?: string; rulesVersion?: string; privacyText?: string; privacyVersion?: string };
    if (body.action === 'event-state') {
      if (typeof body.registrationOpen !== 'boolean' || typeof body.finalistsPublished !== 'boolean') return reply(request, { error: 'État invalide.' }, 422);
      const { error } = await service.from('contest_settings').update({ registration_open: body.registrationOpen, finalists_published: body.finalistsPublished, updated_at: new Date().toISOString(), updated_by: auth.user.id }).neq('contest_id', '00000000-0000-0000-0000-000000000000');
      return error ? reply(request, { error: 'Mise à jour impossible.' }, 400) : reply(request, { ok: true });
    }
    const allowed = ['submitted', 'under_review', 'selected', 'rejected'];
    if (!body.applicationId || !body.status || !allowed.includes(body.status)) return reply(request, { error: 'Décision invalide.' }, 422);
    const { error } = await service.rpc('set_application_status', { p_application_id: body.applicationId, p_status: body.status, p_admin_id: auth.user.id });
    return error ? reply(request, { error: 'Mise à jour impossible.' }, 400) : reply(request, { ok: true });
  }
  return reply(request, { error: 'Méthode non prise en charge.' }, 405);
});
