import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
};

const json = (body: Record<string, string>, status: number) => Response.json(body, {
  status,
  headers: corsHeaders,
});

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const authorization = request.headers.get('Authorization');
  if (!authorization) return json({ error: 'unauthorized' }, 401);

  const url = Deno.env.get('SUPABASE_URL')!;
  const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: { user }, error } = await userClient.auth.getUser();
  if (error || !user) return json({ error: 'unauthorized' }, 401);

  const signedInAt = user.last_sign_in_at ? Date.parse(user.last_sign_in_at) : 0;
  if (Date.now() - signedInAt > 15 * 60 * 1000) {
    return json({ error: 'recent_authentication_required' }, 403);
  }

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const folder = `${user.id}/profile`;
  const { data: files } = await admin.storage.from('private-user-files').list(folder);
  if (files?.length) {
    const { error: storageError } = await admin.storage
      .from('private-user-files')
      .remove(files.map((file) => `${folder}/${file.name}`));
    if (storageError) return json({ error: 'file_cleanup_failed' }, 500);
  }

  const { error: deletionError } = await admin.auth.admin.deleteUser(user.id);
  if (deletionError) return json({ error: 'account_deletion_failed' }, 500);

  return new Response(null, { status: 204, headers: corsHeaders });
});
