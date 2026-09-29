import { createRegistration, emailExists, getRegistrationStats, getRegistrations, updateRegistrationStatus, bulkUpdateStatus } from './db/queries';
import { RegistrationFormSchema } from './types/registration';
import { exportToCSV } from './utils/export';

interface Env {
  DB: D1Database;
  ADMIN_API_KEY?: string;
}

const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers }
  });

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PATCH, OPTIONS',
  'access-control-allow-headers': 'Content-Type, Authorization, X-Admin-Key'
};

const withCors = (response: Response) => {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, { status: response.status, headers });
};

const isAdmin = (request: Request, env: Env) => {
  if (!env.ADMIN_API_KEY) return false;
  const supplied = request.headers.get('x-admin-key') || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return supplied === env.ADMIN_API_KEY;
};

const adminRequired = (request: Request, env: Env) => {
  if (!isAdmin(request, env)) return json({ error: 'Admin authentication required' }, 401);
  return null;
};

const parseJson = async (request: Request) => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};

const parseFilters = (url: URL) => ({
  search: url.searchParams.get('search') || undefined,
  status: url.searchParams.get('status') || undefined,
  city: url.searchParams.get('city') || undefined,
  ageRange: url.searchParams.get('ageRange') || undefined,
  experience: url.searchParams.get('experience') || undefined,
  course: url.searchParams.get('course') || undefined,
  dateFrom: url.searchParams.get('dateFrom') || undefined,
  dateTo: url.searchParams.get('dateTo') || undefined,
  limit: Math.min(Number(url.searchParams.get('limit') || 50), 5000),
  offset: Math.max(Number(url.searchParams.get('offset') || 0), 0)
});

const toExcelHtml = (registrations: Awaited<ReturnType<typeof getRegistrations>>['registrations']) => {
  const headers = ['Registration ID', 'Full Name', 'Email', 'WhatsApp', 'City', 'Age Range', 'Courses', 'Goals', 'Experience', 'Previous Skills', 'Learning Mode', 'Preferred Time', 'Training Plan', 'Additional Goals', 'Status', 'Created At'];
  const escape = (value: unknown) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const values = (registration: typeof registrations[number]) => [
    registration.registrationId, registration.fullName, registration.email, registration.whatsapp,
    registration.city, registration.ageRange, registration.courses.join('; '), registration.goals.join('; '),
    registration.experience, registration.previousSkills.join('; '), registration.learningMode,
    registration.preferredTime, registration.trainingPlan, registration.additionalGoals,
    registration.status, registration.createdAt
  ];
  return `<!doctype html><html><head><meta charset="utf-8"></head><body><table><thead><tr>${headers.map((header) => `<th>${escape(header)}</th>`).join('')}</tr></thead><tbody>${registrations.map((registration) => `<tr>${values(registration).map((value) => `<td>${escape(value)}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`;
};

const exportResponse = async (request: Request, env: Env) => {
  const denied = adminRequired(request, env);
  if (denied) return denied;

  const url = new URL(request.url);
  const format = url.searchParams.get('format') || 'csv';
  const { registrations } = await getRegistrations(env.DB, { ...parseFilters(url), limit: 5000, offset: 0 });
  const date = new Date().toISOString().slice(0, 10);

  if (format === 'json') {
    return new Response(JSON.stringify(registrations, null, 2), {
      headers: { 'content-type': 'application/json; charset=utf-8', 'content-disposition': `attachment; filename="og-web-registrations-${date}.json"` }
    });
  }

  if (format === 'xlsx' || format === 'xls') {
    return new Response(toExcelHtml(registrations), {
      headers: { 'content-type': 'application/vnd.ms-excel; charset=utf-8', 'content-disposition': `attachment; filename="og-web-registrations-${date}.xls"` }
    });
  }

  return new Response(exportToCSV(registrations), {
    headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="og-web-registrations-${date}.csv"` }
  });
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    try {
      if (path === '/api/registrations/submit' && request.method === 'POST') {
        const payload = await parseJson(request);
        const parsed = RegistrationFormSchema.safeParse(payload);
        if (!parsed.success) return withCors(json({ error: 'Validation failed', details: parsed.error.flatten() }, 422));
        if (await emailExists(env.DB, parsed.data.email)) return withCors(json({ error: 'This email is already registered' }, 409));

        const registration = await createRegistration(env.DB, { ...parsed.data, status: 'registered', source: 'web' }, request.headers.get('CF-Connecting-IP') || undefined, request.headers.get('User-Agent') || undefined);
        return withCors(json({ registration }, 201));
      }

      if (path === '/api/registrations/check-email' && request.method === 'GET') {
        const email = url.searchParams.get('email');
        if (!email) return withCors(json({ error: 'Email is required' }, 400));
        return withCors(json({ exists: await emailExists(env.DB, email) }));
      }

      if (path === '/api/admin/registrations' && request.method === 'GET') {
        const denied = adminRequired(request, env);
        if (denied) return withCors(denied);
        return withCors(json(await getRegistrations(env.DB, parseFilters(url))));
      }

      if (path === '/api/admin/registrations/stats' && request.method === 'GET') {
        const denied = adminRequired(request, env);
        if (denied) return withCors(denied);
        return withCors(json(await getRegistrationStats(env.DB)));
      }

      if (path === '/api/admin/registrations/export' && request.method === 'GET') {
        return withCors(await exportResponse(request, env));
      }

      const singleMatch = path.match(/^\/api\/admin\/registrations\/([^/]+)$/);
      if (singleMatch && request.method === 'PATCH') {
        const denied = adminRequired(request, env);
        if (denied) return withCors(denied);
        const payload = await parseJson(request) as { status?: string; notes?: string } | null;
        const validStatuses = ['registered', 'contacted', 'enrolled', 'dropped'];
        if (!payload?.status || !validStatuses.includes(payload.status)) return withCors(json({ error: 'Valid status is required' }, 422));
        await updateRegistrationStatus(env.DB, singleMatch[1], payload.status, payload.notes);
        return withCors(json({ ok: true }));
      }

      if (path === '/api/admin/registrations/bulk' && request.method === 'PATCH') {
        const denied = adminRequired(request, env);
        if (denied) return withCors(denied);
        const payload = await parseJson(request) as { ids?: string[]; status?: string } | null;
        const validStatuses = ['registered', 'contacted', 'enrolled', 'dropped'];
        if (!payload?.ids?.length || !payload.status || !validStatuses.includes(payload.status)) return withCors(json({ error: 'IDs and a valid status are required' }, 422));
        await bulkUpdateStatus(env.DB, payload.ids, payload.status);
        return withCors(json({ ok: true, updated: payload.ids.length }));
      }

      return new Response('Not found', { status: 404 });
    } catch (error) {
      console.error(error);
      return withCors(json({ error: 'Internal server error' }, 500));
    }
  }
};
