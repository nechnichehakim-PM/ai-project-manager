/**
 * PM Hub — Supabase Auth + Data Sync
 * Chargé dynamiquement par pmhub-data.js sur toutes les pages.
 */
(function () {
  'use strict';

  var SUPABASE_URL  = 'https://fznbkseaycjgmnxgrhiq.supabase.co';
  var SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6bmJrc2VheWNqZ21ueGdyaGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NDI4NDQsImV4cCI6MjA4OTUxODg0NH0.Tf88eFwXR5gp6xkZDzSASdESRm1i8HYUspezF5jLnkw';

  // Clés localStorage exclues de la sync cloud (données sensibles ou UI-only)
  var EXCLUDED_KEYS = ['pmhub_ai_settings'];

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
      window.location.href = 'pm-hub-login.html';
    });
  }

  // ── DATA SYNC ─────────────────────────────────────────────────

  function isExcluded(key) {
    return EXCLUDED_KEYS.indexOf(key) >= 0 || key.indexOf('pmhub_sidebar_open_') === 0;
  }

  /**
   * Charge toutes les données cloud → localStorage.
   * Si une clé existe en local mais pas en cloud, elle est migrée vers le cloud.
   */
  function fetchAllFromCloud(userId) {
    return getClient()
      .from('pmhub_data')
      .select('key, value, updated_at')
      .eq('user_id', userId)
      .then(function (r) {
        if (r.error) { console.warn('[PMHub] Sync cloud:', r.error.message); return; }

        // Timestamps des modifications locales (last-write-wins)
        var localTs = {};
        try { localTs = JSON.parse(localStorage.getItem('pmhub_sync_ts') || '{}'); } catch(e) {}

        var cloudKeys = {};
        var localNewer = []; // clés où local est plus récent → ré-uploader

        (r.data || []).forEach(function (row) {
          cloudKeys[row.key] = true;
          var cloudTime = row.updated_at || '';
          var localTime = localTs[row.key]  || '';
          if (!localTime || cloudTime >= localTime) {
            // Cloud est plus récent (ou pas de timestamp local) → utiliser cloud
            try { localStorage.setItem(row.key, JSON.stringify(row.value)); } catch (e) {}
          } else {
            // Local est plus récent → garder local, re-synchroniser vers cloud
            localNewer.push(row.key);
          }
        });

        // Migration : forcer l'écriture des données PMHUB si le cloud est vide
        var uploads = [];
        var isNewUser = Object.keys(cloudKeys).length === 0;

        if (isNewUser && typeof PMHUB !== 'undefined') {
          // Nouveau compte : initialiser Supabase avec toutes les données PMHUB
          var allKeys = [
            'projects', 'resources', 'raids', 'templates',
            'wizard', 'profile', 'stakeholders', 'communication',
            'budget', 'deliverables', 'onePager', 'retros'
          ];
          allKeys.forEach(function (k) {
            var lsKey = PMHUB.KEYS[k];
            if (!lsKey) return;
            // Appeler le getter PMHUB pour déclencher le fallback par défaut
            var val = null;
            try {
              if (k === 'projects')   val = PMHUB.getProjects();
              else if (k === 'resources') val = PMHUB.getResources();
              else if (k === 'profile')   val = PMHUB.getProfile();
            } catch(e) {}
            // Ensuite récupérer depuis localStorage (peut contenir des données existantes)
            var raw = localStorage.getItem(lsKey);
            if (raw) {
              try { val = JSON.parse(raw); } catch(e) {}
            }
            if (val !== null) {
              uploads.push({ user_id: userId, key: lsKey, value: val, updated_at: new Date().toISOString() });
            }
          });
        } else {
          // Compte existant : migrer les clés absentes du cloud OU localement plus récentes
          Object.keys(localStorage).forEach(function (key) {
            if (key === 'pmhub_sync_ts') return; // ne pas uploader le meta-timestamp
            if (key.startsWith('pmhub_') && !isExcluded(key) && (!cloudKeys[key] || localNewer.indexOf(key) >= 0)) {
              try {
                var val = JSON.parse(localStorage.getItem(key));
                uploads.push({ user_id: userId, key: key, value: val, updated_at: new Date().toISOString() });
              } catch (e) {}
            }
          });
        }

        if (uploads.length > 0) {
          getClient().from('pmhub_data').upsert(uploads, { onConflict: 'user_id,key' });
        }

        window.dispatchEvent(new CustomEvent('pmhub:synced', { detail: { userId: userId } }));
      });
  }

  /**
   * Enregistre une clé/valeur dans Supabase (async, non-bloquant).
   */
  function saveToCloud(key, value) {
    if (isExcluded(key)) return;
    var user = window.PMHUB_AUTH && window.PMHUB_AUTH._user;
    if (!user) return;
    getClient().from('pmhub_data').upsert(
      { user_id: user.id, key: key, value: value, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    );
  }

  // ── AUTH GUARD ────────────────────────────────────────────────

  var LOGIN_PAGE   = 'pm-hub-login.html';
  var currentPage  = (window.location.pathname || '').split('/').pop() || '';
  var isLoginPage  = currentPage === LOGIN_PAGE;

  // Masquer le body immédiatement pour éviter le flash non-authentifié
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
      window.location.href = 'pm-hub.html';
      return;
    }

    window.PMHUB_AUTH._user = session.user;
    window.dispatchEvent(new CustomEvent('pmhub:update'));

    fetchAllFromCloud(session.user.id).then(function () {
      window.dispatchEvent(new CustomEvent('pmhub:update'));
      showBody();
    });
  }

  waitForLib(function () {

    // onAuthStateChange capte à la fois les sessions existantes et les
    // redirections email (hash access_token dans l'URL)
    getClient().auth.onAuthStateChange(function (event, session) {
      console.log('[PMHub] Auth event:', event, session ? session.user.email : 'null');
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (!window.PMHUB_AUTH._user) handleSession(session);
      }
      if (event === 'SIGNED_OUT' && !isLoginPage) {
        window.location.href = LOGIN_PAGE;
      }
    });

    // Vérification immédiate (session déjà en localStorage)
    getSession().then(function (session) {
      console.log('[PMHub] getSession():', session ? session.user.email : 'null');
      handleSession(session);
    }).catch(function (err) {
      console.error('[PMHub] Auth error:', err);
      showBody();
    });
  });

  // ── API PUBLIQUE ───────────────────────────────────────────────

  window.PMHUB_AUTH = {
    _user:          null,
    getClient:      getClient,
    getSession:     getSession,
    signIn:         signIn,
    signUp:         signUp,
    signOut:        signOut,
    saveToCloud:    saveToCloud,
    fetchAllFromCloud: fetchAllFromCloud,
  };

})();
