import { getApiProvider } from '@/lib/api/config';
import { createRestBackend } from '@/lib/api/restBackend';
import { createSupabaseBackend } from '@/lib/api/supabaseBackend';

function createBackend() {
  const provider = getApiProvider();
  if (provider === 'supabase') {
    return createSupabaseBackend();
  }
  return createRestBackend();
}

export const backend = createBackend();
