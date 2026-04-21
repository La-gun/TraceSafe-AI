import { apiPath } from '@/lib/api/config';
import { tableForEntity } from '@/lib/api/entityTableMap';
import { ApiError } from '@/lib/api/errors';
import { fetchJson, isHttpLoggingEnabled } from '@/lib/api/http';
import { clearAccessTokens, getAccessToken } from '@/lib/auth/accessToken';

function bearerHeaders(extra = {}) {
  const token = getAccessToken();
  const h = { ...extra };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function request(method, path, { json, formData } = {}) {
  const url = apiPath(path);
  const headers = bearerHeaders({ Accept: 'application/json' });
  let body;
  if (json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  }
  if (formData) {
    body = formData;
  }
  return fetchJson(url, { method, headers, body });
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
        return Boolean(getAccessToken());
      },
      async me() {
        const data = await request('GET', '/api/auth/me');
        return data.user ?? data;
      },
      logout(redirectTarget) {
        clearAccessTokens();
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
          const url = apiPath('/api/storage/upload');
          const headers = bearerHeaders();
          const start = performance.now();
          const fd = new FormData();
          fd.append('file', file);
          if (isHttpLoggingEnabled()) {
            // eslint-disable-next-line no-console
            console.log('[http]', { method: 'POST', url, body: '[FormData:file]' });
          }
          const res = await fetch(url, { method: 'POST', headers, body: fd });
          const text = await res.text();
          let data = {};
          try {
            data = text ? JSON.parse(text) : {};
          } catch {
            data = { raw: text };
          }
          if (!res.ok) {
            if (isHttpLoggingEnabled()) {
              // eslint-disable-next-line no-console
              console.warn('[http:error]', {
                method: 'POST',
                url,
                status: res.status,
                elapsedMs: Math.round(performance.now() - start),
                response: data,
              });
            }
            throw new ApiError(data.message || `Upload failed: ${res.status}`, { status: res.status, data });
          }
          if (isHttpLoggingEnabled()) {
            // eslint-disable-next-line no-console
            console.log('[http:ok]', {
              method: 'POST',
              url,
              status: res.status,
              elapsedMs: Math.round(performance.now() - start),
              response: data,
            });
          }
          return { file_url: data.file_url ?? data.url ?? data.publicUrl };
        },
      },
    },
  };
}
