import { apiPath } from '@/lib/api/config';
import { tableForEntity } from '@/lib/api/entityTableMap';
import { ApiError } from '@/lib/api/errors';

function getStoredAccessToken() {
  if (typeof window === 'undefined') return null;
  return (
    window.localStorage.getItem('tracesafe_access_token')
    || window.localStorage.getItem('base44_access_token')
    || window.localStorage.getItem('token')
    || null
  );
}

function clearStoredAccessToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('tracesafe_access_token');
  window.localStorage.removeItem('base44_access_token');
  window.localStorage.removeItem('token');
}

async function parseJsonResponse(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function authHeaders(extra = {}) {
  const token = getStoredAccessToken();
  const h = { ...extra };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function request(method, path, { json, formData } = {}) {
  const url = apiPath(path);
  const headers = authHeaders();
  let body;
  if (json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  }
  if (formData) {
    body = formData;
  }
  const res = await fetch(url, { method, headers, body });
  const data = await parseJsonResponse(res);
  if (!res.ok) {
    throw new ApiError(data.message || `HTTP ${res.status}`, { status: res.status, data });
  }
  return data;
}

function parseListSort(sortField) {
  if (!sortField || typeof sortField !== 'string') return { col: 'created_at', desc: true };
  const desc = sortField.startsWith('-');
  const col = desc ? sortField.slice(1) : sortField;
  return { col: col || 'created_at', desc };
}

function createEntityApi(entityName) {
  const table = tableForEntity(entityName);
  const base = `/api/entities/${encodeURIComponent(table)}`;

  return {
    async create(payload) {
      return request('POST', base, { json: payload });
    },
    async update(id, payload) {
      return request('PATCH', `${base}/${encodeURIComponent(id)}`, { json: payload });
    },
    async list(sortField, limit) {
      const { col, desc } = parseListSort(sortField);
      const q = new URLSearchParams();
      q.set('sort', `${desc ? '-' : ''}${col}`);
      if (limit != null) q.set('limit', String(limit));
      const raw = await request('GET', `${base}?${q.toString()}`);
      if (Array.isArray(raw)) return raw;
      return raw.items ?? raw.data ?? raw.rows ?? [];
    },
    async filter(_criteria) {
      throw new ApiError('filter() is not implemented for REST adapter; use an edge function or extend the API.', {
        status: 501,
      });
    },
  };
}

export function createRestBackend() {
  const entities = {
    InspectionReport: createEntityApi('InspectionReport'),
    BatchStatus: createEntityApi('BatchStatus'),
    ConsumerReport: createEntityApi('ConsumerReport'),
    ContactLead: createEntityApi('ContactLead'),
  };

  return {
    auth: {
      async hasCredentials() {
        return Boolean(getStoredAccessToken());
      },
      async me() {
        const data = await request('GET', '/api/auth/me');
        return data.user ?? data;
      },
      logout(redirectTarget) {
        clearStoredAccessToken();
        if (redirectTarget === false || redirectTarget === undefined) return;
        const t = redirectTarget === true ? window.location.href : redirectTarget;
        if (typeof t === 'string') {
          if (t.startsWith('http')) window.location.assign(t);
          else window.location.assign(`${window.location.origin}${t.startsWith('/') ? t : `/${t}`}`);
        }
      },
      redirectToLogin(returnUrl) {
        const login =
          import.meta.env.VITE_AUTH_LOGIN_URL
          || `/login?return=${encodeURIComponent(returnUrl || window.location.href)}`;
        if (login.startsWith('http')) window.location.assign(login);
        else window.location.assign(`${window.location.origin}${login.startsWith('/') ? login : `/${login}`}`);
      },
    },
    entities,
    functions: {
      async invoke(name, body) {
        const data = await request('POST', `/api/functions/${encodeURIComponent(name)}`, { json: body });
        return { data };
      },
    },
    integrations: {
      Core: {
        async UploadFile({ file }) {
          const fd = new FormData();
          fd.append('file', file);
          const url = apiPath('/api/storage/upload');
          const res = await fetch(url, { method: 'POST', headers: authHeaders(), body: fd });
          const data = await parseJsonResponse(res);
          if (!res.ok) {
            throw new ApiError(data.message || `Upload failed: ${res.status}`, { status: res.status, data });
          }
          return { file_url: data.file_url ?? data.url ?? data.publicUrl };
        },
      },
    },
  };
}
