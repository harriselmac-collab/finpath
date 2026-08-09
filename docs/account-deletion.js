(() => {
  const SUPABASE_URL = 'https://hvtmjkdldpijqwvbatpy.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_qRBsQsY-Qqw7sHw-etpIYA_Mb55XuSq';
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

  const signedOut = document.querySelector('#signed-out');
  const signedIn = document.querySelector('#signed-in');
  const complete = document.querySelector('#deletion-complete');
  const accountEmail = document.querySelector('#account-email');
  const status = document.querySelector('#status');
  const confirmation = document.querySelector('#confirmation');
  const deleteButton = document.querySelector('#delete-account');

  const setStatus = (message = '', kind = '') => {
    status.textContent = message;
    status.className = `status ${kind}`.trim();
  };

  const setBusy = (busy) => {
    document.querySelectorAll('button').forEach((button) => { button.disabled = busy; });
    if (!busy) deleteButton.disabled = confirmation.value !== 'DELETE';
  };

  const renderSession = (session) => {
    signedOut.classList.toggle('hidden', Boolean(session));
    signedIn.classList.toggle('hidden', !session);
    if (session) accountEmail.textContent = session.user.email || 'Authenticated account';
  };

  const currentPage = () => `${window.location.origin}${window.location.pathname}`;

  document.querySelector('#email-sign-in').addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus();
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const { data, error } = await client.auth.signInWithPassword({
      email: String(form.get('email') || '').trim().toLowerCase(),
      password: String(form.get('password') || ''),
    });
    setBusy(false);
    if (error || !data.session) {
      setStatus('Sign-in failed. Check your details and try again.', 'error');
      return;
    }
    renderSession(data.session);
  });

  document.querySelector('#google-sign-in').addEventListener('click', async () => {
    setStatus();
    setBusy(true);
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: currentPage() },
    });
    if (error) {
      setBusy(false);
      setStatus('Google sign-in could not be started. Try again.', 'error');
    }
  });

  document.querySelector('#sign-out').addEventListener('click', async () => {
    await client.auth.signOut({ scope: 'local' });
    confirmation.value = '';
    setStatus();
    renderSession(null);
  });

  confirmation.addEventListener('input', () => {
    deleteButton.disabled = confirmation.value !== 'DELETE';
  });

  deleteButton.addEventListener('click', async () => {
    if (confirmation.value !== 'DELETE') return;
    setStatus();
    setBusy(true);
    const { error } = await client.functions.invoke('delete-account', { body: {} });
    if (error) {
      setBusy(false);
      setStatus('The account could not be deleted. Sign out, sign in again, and retry. If the problem continues, use the developer contact shown on Google Play.', 'error');
      return;
    }
    await client.auth.signOut({ scope: 'local' }).catch(() => undefined);
    signedOut.classList.add('hidden');
    signedIn.classList.add('hidden');
    complete.classList.remove('hidden');
    setStatus('Your Pocket Ahead account and active app data were permanently deleted.', 'success');
  });

  client.auth.onAuthStateChange((_event, session) => renderSession(session));
  client.auth.getSession().then(({ data }) => {
    renderSession(data.session);
    if (window.location.hash || window.location.search) window.history.replaceState({}, document.title, currentPage());
  }).catch(() => setStatus('The secure sign-in service is temporarily unavailable. Try again shortly.', 'error'));
})();
