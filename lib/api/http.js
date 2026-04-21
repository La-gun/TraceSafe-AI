import { ApiError } from '@/lib/api/errors';

export function isHttpLoggingEnabled() {
  return (
    import.meta.env.DEV === true
    && String(import.meta.env.VITE_HTTP_LOGGING || '').toLowerCase() === 'true'
  );
}

export function createRequestId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

export async function parseJsonResponse(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

/**
 * JSON fetch with consistent headers, logging, and ApiError on failure.
 * @param {string} url
 * @param {{ method?: string, headers?: Record<string,string>, body?: BodyInit|null, signal?: AbortSignal }} [opts]
 */
export async function fetchJson(url, opts = {}) {
  const { method = 'GET', headers: extraHeaders = {}, body, signal } = opts;
  const requestId = createRequestId();
  const headers = {
    Accept: 'application/json',
    'X-Request-Id': requestId,
    ...extraHeaders,
  };
  const start = typeof performance !== 'undefined' ? performance.now() : 0;
  if (isHttpLoggingEnabled()) {
    // eslint-disable-next-line no-console
    console.log('[http]', { requestId, method, url, body: body instanceof FormData ? '[FormData]' : body });
  }
  const res = await fetch(url, { method, headers, body, signal });
  const data = await parseJsonResponse(res);
  if (!res.ok) {
    if (isHttpLoggingEnabled()) {
      // eslint-disable-next-line no-console
      console.warn('[http:error]', {
        requestId,
        method,
        url,
        status: res.status,
        elapsedMs: typeof performance !== 'undefined' ? Math.round(performance.now() - start) : undefined,
        response: data,
      });
    }
    throw new ApiError(data.message || `HTTP ${res.status}`, {
      status: res.status,
      data,
      requestId,
    });
  }
  if (isHttpLoggingEnabled()) {
    // eslint-disable-next-line no-console
    console.log('[http:ok]', {
      requestId,
      method,
      url,
      status: res.status,
      elapsedMs: typeof performance !== 'undefined' ? Math.round(performance.now() - start) : undefined,
      response: data,
    });
  }
  return data;
}
