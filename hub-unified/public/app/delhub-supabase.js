/**
 * DelHub — Supabase Auth + Data Sync
 * Chargé dynamiquement par delhub-data.js sur toutes les pages.
 */
(function () {
  'use strict';

  var SUPABASE_URL  = 'https://fznbkseaycjgmnxgrhiq.supabase.co';
  var SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6bmJrc2VheWNqZ21ueGdyaGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NDI4NDQsImV4cCI6MjA4OTUxODg0NH0.Tf88eFwXR5gp6xkZDzSASdESRm1i8HYUspezF5jLnkw';

  var EXCLUDED_KEYS = ['delhub_ai_settings'];

  var _client = null;

  function getClient() {
    if (!_client) {
      _client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
        auth: { persistSession: true, autoRefreshToken: true }
      });
    }
    return _client;
  }

  // ── AUTH ──────────────────────────────────────────────────────

  function getSession() {
    return getClient().auth.getSession().then(function (r) {
      return r.data.session;
    });
  }

  function signIn(email, password) {
    return getClient().auth.signInWithPassword({ email: email, password: password })
      .then(function (r) {
        if (r.error) throw r.error;
        return r.data;
      });
  }

  function signUp(email, password) {
    return getClient().auth.signUp({ email: email, password: password })
      .then(function (r) {
        if (r.error) throw r.error;
        return r.data;
      });
  }

  function signOut() {
    return getClient().auth.signOut().then(function () {
      localStorage.clear();
      window.location.href = 'delhub-login.html';
    });
  }

  // ── DATA SYNC ─────────────────────────────────────────────────

  function isExcluded(key) {
    return EXCLUDED_KEYS.indexOf(key) >= 0 || key.indexOf('delhub_sidebar_open_') === 0;
  }

  function fetchAllFromCloud(userId) {
    return getClient()
      .from('pmhub_data')
      .select('key, value, updated_at')
      .eq('user_id', userId)
      .then(function (r) {
        if (r.error) { console.warn('[DelHub] Sync cloud:', r.error.message); return; }

        var localTs = {};
        try { localTs = JSON.parse(localStorage.getItem('delhub_sync_ts') || '{}'); } catch(e) {}

        var cloudKeys = {};
        var localNewer = [];

        (r.data || []).forEach(function (row) {
          // Only process delhub_ keys
          if (row.key.indexOf('delhub_') !== 0) return;
          cloudKeys[row.key] = true;
          var cloudTime = row.updated_at || '';
          var localTime = localTs[row.key]  || '';
          if (!localTime || cloudTime >= localTime) {
            try { localStorage.setItem(row.key, JSON.stringify(row.value)); } catch (e) {}
          } else {
            localNewer.push(row.key);
          }
        });

        // Upload local keys that are newer or missing from cloud
        var uploads = [];
        Object.keys(localStorage).forEach(function (key) {
          if (key === 'delhub_sync_ts') return;
          if (key.startsWith('delhub_') && !isExcluded(key) && (!cloudKeys[key] || localNewer.indexOf(key) >= 0)) {
            try {
              var val = JSON.parse(localStorage.getItem(key));
              uploads.push({ user_id: userId, key: key, value: val, updated_at: new Date().toISOString() });
            } catch (e) {}
          }
        });

        if (uploads.length > 0) {
          getClient().from('pmhub_data').upsert(uploads, { onConflict: 'user_id,key' });
        }

        window.dispatchEvent(new CustomEvent('delhub:synced', { detail: { userId: userId } }));
      });
  }

  function saveToCloud(key, value) {
    if (isExcluded(key)) return;
    var user = window.DELHUB_AUTH && window.DELHUB_AUTH._user;
    if (!user) return;
    getClient().from('pmhub_data').upsert(
      { user_id: user.id, key: key, value: value, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    );
  }

  // ── AUTH GUARD ────────────────────────────────────────────────

  var LOGIN_PAGE   = 'delhub-login.html';
  var currentPage  = (window.location.pathname || '').split('/').pop() || '';
  var isLoginPage  = currentPage === LOGIN_PAGE;

  if (!isLoginPage) {
    document.body.style.opacity = '0';
  }

  function showBody() {
    document.body.style.transition = 'opacity 0.15s';
    document.body.style.opacity    = '1';
  }

  function waitForLib(cb) {
    if (window.supabase && window.supabase.createClient) { cb(); return; }
    setTimeout(function () { waitForLib(cb); }, 30);
  }

  function handleSession(session) {
    if (!session) {
      if (!isLoginPage) {
        window.location.href = LOGIN_PAGE;
      } else {
        showBody();
      }
      return;
    }

    if (isLoginPage) {
      // Role-based redirect
      var profile = {};
      try { profile = JSON.parse(localStorage.getItem('delhub_profile') || '{}'); } catch(e) {}
      var role = profile.role || '';

      if (role === 'pm') {
        window.location.href = '../hub/pm-hub.html';
      } else {
        window.location.href = 'delhub-dashboard.html';
      }
      return;
    }

    window.DELHUB_AUTH._user = session.user;
    window.dispatchEvent(new CustomEvent('delhub:update'));

    fetchAllFromCloud(session.user.id).then(function () {
      window.dispatchEvent(new CustomEvent('delhub:update'));
      showBody();
    });
  }

  waitForLib(function () {
    getClient().auth.onAuthStateChange(function (event, session) {
      console.log('[DelHub] Auth event:', event, session ? session.user.email : 'null');
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (!window.DELHUB_AUTH._user) handleSession(session);
      }
      if (event === 'SIGNED_OUT' && !isLoginPage) {
        window.location.href = LOGIN_PAGE;
      }
    });

    getSession().then(function (session) {
      console.log('[DelHub] getSession():', session ? session.user.email : 'null');
      handleSession(session);
    }).catch(function (err) {
      console.error('[DelHub] Auth error:', err);
      showBody();
    });
  });

  // ── API PUBLIQUE ───────────────────────────────────────────────

  window.DELHUB_AUTH = {
    _user:             null,
    getClient:         getClient,
    getSession:        getSession,
    signIn:            signIn,
    signUp:            signUp,
    signOut:           signOut,
    saveToCloud:       saveToCloud,
    fetchAllFromCloud: fetchAllFromCloud,
  };

})();
