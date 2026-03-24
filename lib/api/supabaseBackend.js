import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '@/lib/api/config';
import { tableForEntity } from '@/lib/api/entityTableMap';
import { ApiError } from '@/lib/api/errors';

function parseListSort(sortField) {
  if (!sortField || typeof sortField !== 'string') return { col: 'created_at', ascending: false };
  const desc = sortField.startsWith('-');
  const col = desc ? sortField.slice(1) : sortField;
  return { col: col || 'created_at', ascending: !desc };
}

export function createSupabaseBackend() {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) {
    throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required when VITE_API_PROVIDER=supabase');
  }

  const supabase = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  function createEntityApi(entityName) {
    const table = tableForEntity(entityName);
    return {
      async create(payload) {
        const { data, error } = await supabase.from(table).insert(payload).select().single();
        if (error) throw new ApiError(error.message, { status: 400, data: error });
        return data;
      },
      async update(id, payload) {
        const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single();
        if (error) throw new ApiError(error.message, { status: 400, data: error });
        return data;
      },
      async list(sortField, limit) {
        const { col, ascending } = parseListSort(sortField);
        let q = supabase.from(table).select('*').order(col, { ascending, nullsFirst: false });
        if (limit != null) q = q.limit(limit);
        const { data, error } = await q;
        if (error) throw new ApiError(error.message, { status: 400, data: error });
        return data ?? [];
      },
      async filter(_criteria) {
        throw new ApiError('filter() not used in TraceSafe UI; add a query helper if needed.', { status: 501 });
      },
    };
  }

  const entities = {
    InspectionReport: createEntityApi('InspectionReport'),
    BatchStatus: createEntityApi('BatchStatus'),
    ConsumerReport: createEntityApi('ConsumerReport'),
    ContactLead: createEntityApi('ContactLead'),
  };

  const bucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'uploads';

  return {
    auth: {
      async hasCredentials() {
        const { data: { session } } = await supabase.auth.getSession();
        return Boolean(session?.access_token);
      },
      async me() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw new ApiError(error.message, { status: 401, data: error });
        if (!user) throw new ApiError('Not authenticated', { status: 401 });
        return {
          id: user.id,
          email: user.email,
          role: user.app_metadata?.role ?? user.user_metadata?.role,
          ...user.user_metadata,
        };
      },
      async logout(redirectTarget) {
        await supabase.auth.signOut();
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
        const { data, error } = await supabase.functions.invoke(name, { body });
        if (error) {
          throw new ApiError(error.message || 'Function invoke failed', { status: 502, data: error });
        }
        return { data };
      },
    },
    integrations: {
      Core: {
        async UploadFile({ file }) {
          const path = `public/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, '_')}`;
          const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
            upsert: false,
            contentType: file.type || undefined,
          });
          if (error) throw new ApiError(error.message, { status: 400, data: error });
          const ttl = Number(import.meta.env.VITE_SUPABASE_SIGNED_UPLOAD_TTL_SEC || 604800);
          const { data: signed, error: signErr } = await supabase.storage
            .from(bucket)
            .createSignedUrl(data.path, ttl);
          if (!signErr && signed?.signedUrl) return { file_url: signed.signedUrl };
          const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
          return { file_url: pub.publicUrl };
        },
      },
    },
  };
}
