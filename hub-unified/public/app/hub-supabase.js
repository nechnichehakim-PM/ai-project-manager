/**
 * Hub Unifié — Supabase Auth + Data Sync
 * Fusionne pmhub-supabase.js + delhub-supabase.js
 * Chargé dynamiquement par hub-data.js sur toutes les pages.
 */
(function () {
  'use strict';

  var SUPABASE_URL  = 'https://zflbgbxljwdartcfhpdr.supabase.co';
  var SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmbGJnYnhsandkYXJ0Y2ZocGRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MjMwMTYsImV4cCI6MjA5MDA5OTAxNn0.1P1kpRs6cB_DmldC1c1_B2CQtIHFwovgXFdfPSr29jY';

  // Clés exclues de la sync cloud (API keys, UI state)
  var EXCLUDED_KEYS = ['pmhub_ai_settings', 'delhub_ai_settings'];

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
    unsubscribeRealtime();
    return getClient().auth.signOut().then(function () {
      localStorage.clear();
      window.location.href = 'hub-login.html';
    });
  }

  // ── DATA SYNC ─────────────────────────────────────────────────

  function isExcluded(key) {
    return EXCLUDED_KEYS.indexOf(key) >= 0 ||
           key.indexOf('pmhub_sidebar_open_') === 0 ||
           key.indexOf('delhub_sidebar_open_') === 0 ||
           key.indexOf('hub_sidebar_open_') === 0;
  }

  /**
   * Charge toutes les données cloud → localStorage (pmhub_* + delhub_*).
   */
  function fetchAllFromCloud(userId) {
    return getClient()
      .from('pmhub_data')
      .select('key, value, updated_at')
      .eq('user_id', userId)
      .then(function (r) {
        if (r.error) { console.warn('[Hub] Sync cloud:', r.error.message); return; }

        var localTs = {};
        try { localTs = JSON.parse(localStorage.getItem('pmhub_sync_ts') || '{}'); } catch(e) {}
        var localTsDel = {};
        try { localTsDel = JSON.parse(localStorage.getItem('delhub_sync_ts') || '{}'); } catch(e) {}

        var cloudKeys = {};
        var localNewer = [];

        (r.data || []).forEach(function (row) {
          cloudKeys[row.key] = true;
          var cloudTime = row.updated_at || '';
          var localTime = localTs[row.key] || localTsDel[row.key] || '';
          if (!localTime || cloudTime >= localTime) {
            try { localStorage.setItem(row.key, JSON.stringify(row.value)); } catch (e) {}
          } else {
            localNewer.push(row.key);
          }
        });

        // Upload local keys missing from cloud or locally newer
        var uploads = [];

        // Check both pmhub_* and delhub_* local keys
        Object.keys(localStorage).forEach(function (key) {
          if (key === 'pmhub_sync_ts' || key === 'delhub_sync_ts') return;
          var isPmKey = key.startsWith('pmhub_');
          var isDelKey = key.startsWith('delhub_');
          var isHubKey = key.startsWith('hub_');
          if ((isPmKey || isDelKey || isHubKey) && !isExcluded(key) && (!cloudKeys[key] || localNewer.indexOf(key) >= 0)) {
            try {
              var val = JSON.parse(localStorage.getItem(key));
              uploads.push({ user_id: userId, key: key, value: val, updated_at: new Date().toISOString() });
            } catch (e) {}
          }
        });

        if (uploads.length > 0) {
          getClient().from('pmhub_data').upsert(uploads, { onConflict: 'user_id,key' });
        }

        // Fire both events for backward compat
        window.dispatchEvent(new CustomEvent('pmhub:synced', { detail: { userId: userId } }));
        window.dispatchEvent(new CustomEvent('delhub:synced', { detail: { userId: userId } }));
      });
  }

  /**
   * Enregistre une clé/valeur dans Supabase (source de vérité).
   * Retourne une Promise pour permettre le suivi.
   */
  function saveToCloud(key, value) {
    if (isExcluded(key)) return Promise.resolve();
    var user = window.HUB_AUTH && window.HUB_AUTH._user;
    if (!user) return Promise.resolve();
    return getClient().from('pmhub_data').upsert(
      { user_id: user.id, key: key, value: value, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    ).then(function(r) {
      if (r.error) console.error('[Hub] saveToCloud erreur:', key, r.error.message);
      else console.log('[Hub] saveToCloud OK:', key);
      return r;
    });
  }

  // ── REALTIME ──────────────────────────────────────────────────

  var _realtimeChannel = null;

  /**
   * Abonnement Realtime sur pmhub_data.
   * Quand une row change (INSERT/UPDATE/DELETE) → met à jour localStorage → dispatch events.
   * Ignore les changements émis par cet onglet (même user_id + même clé venant de saveToCloud).
   */
  function subscribeRealtime(userId) {
    if (_realtimeChannel) return; // déjà abonné

    _realtimeChannel = getClient()
      .channel('hub-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'pmhub_data', filter: 'user_id=eq.' + userId },
        function(payload) {
          var row = payload.new || {};
          var key = row.key;
          var value = row.value;
          var eventType = payload.eventType; // INSERT, UPDATE, DELETE

          if (!key) return;
          console.log('[Hub] Realtime', eventType, key);

          if (eventType === 'DELETE') {
            localStorage.removeItem(key);
          } else {
            // Mettre à jour localStorage (cache)
            try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) {}
          }

          // Dispatch events pour rafraîchir l'UI
          if (key.startsWith('pmhub_')) {
            window.dispatchEvent(new CustomEvent('pmhub:update', { detail: { key: key, source: 'realtime' } }));
          }
          if (key.startsWith('delhub_')) {
            window.dispatchEvent(new CustomEvent('delhub:update', { detail: { key: key, source: 'realtime' } }));
          }
          if (key.startsWith('hub_')) {
            window.dispatchEvent(new CustomEvent('pmhub:update', { detail: { key: key, source: 'realtime' } }));
            window.dispatchEvent(new CustomEvent('delhub:update', { detail: { key: key, source: 'realtime' } }));
          }
        }
      )
      .subscribe(function(status) {
        console.log('[Hub] Realtime status:', status);
      });
  }

  /** Désabonnement propre (appelé au signOut) */
  function unsubscribeRealtime() {
    if (_realtimeChannel) {
      getClient().removeChannel(_realtimeChannel);
      _realtimeChannel = null;
      console.log('[Hub] Realtime unsubscribed');
    }
  }

  // ── AUTH GUARD ────────────────────────────────────────────────

  var LOGIN_PAGES = ['hub-login.html', 'pm-hub-login.html', 'delhub-login.html'];
  var currentPage = (window.location.pathname || '').split('/').pop() || '';
  var isLoginPage = LOGIN_PAGES.indexOf(currentPage) >= 0;

  // Hide body until auth verified (prevent flash)
  if (!isLoginPage && document.body) {
    document.body.style.opacity = '0';
  }

  function showBody() {
    document.body.style.transition = 'opacity 0.15s';
    document.body.style.opacity    = '1';
  }

  function getDefaultPage(role) {
    return (window.HUB_DEFAULT_PAGE && window.HUB_DEFAULT_PAGE[role]) || 'pm-hub.html';
  }

  /** Toast d'accès refusé */
  function showAccessDeniedToast(role, targetPage) {
    var roleLabel = (window.HUB_ROLES && window.HUB_ROLES[role]) ? window.HUB_ROLES[role].label : role;
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:99999;' +
      'background:#1E1E2E;border:1px solid #F43F5E;color:#F43F5E;padding:14px 28px;border-radius:12px;' +
      'font-size:14px;font-weight:600;box-shadow:0 8px 32px rgba(244,63,94,0.3);display:flex;align-items:center;gap:10px;' +
      'animation:hubToastIn 0.3s ease';
    toast.innerHTML = '<span style="font-size:18px">\u26D4</span> Acc\u00e8s refus\u00e9 \u2014 r\u00f4le <span style="color:#fff">' +
      roleLabel + '</span> n\'a pas acc\u00e8s \u00e0 cette page';
    var style = document.createElement('style');
    style.textContent = '@keyframes hubToastIn{from{opacity:0;transform:translateX(-50%) translateY(-20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
    document.head.appendChild(style);
    document.body.appendChild(toast);
    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(function() {
        window.location.href = targetPage;
      }, 300);
    }, 1500);
  }

  function checkPageAccess() {
    if (typeof hubCanAccess !== 'function') return true;
    var pageKey = currentPage.replace('.html', '');
    var access = hubCanAccess(pageKey);
    if (!access) {
      var role = getHubEffectiveRole();
      var target = getDefaultPage(role);
      showBody();
      showAccessDeniedToast(role, target);
      return false;
    }
    return true;
  }

  /** Mode démo : pas de Supabase, vérification rôle via localStorage uniquement */
  function handleDemoMode() {
    if (isLoginPage) { showBody(); return; }
    console.log('[Hub] Mode demo — auth basée sur localStorage');
    // Vérifier si un profil existe
    var profile = {};
    try { profile = JSON.parse(localStorage.getItem('hub_profile') || localStorage.getItem('delhub_profile') || localStorage.getItem('pmhub_profile') || '{}'); } catch(e) {}
    if (!profile.role && !profile.email) {
      // Aucun profil → redirect vers login
      window.location.href = 'hub-login.html';
      return;
    }
    // Profil trouvé → vérifier accès page
    var role = profile.role || 'pm';
    var simulated = sessionStorage.getItem('hub_simulated_role') || sessionStorage.getItem('delhub_simulated_role');
    if (simulated && role === 'god') role = simulated;
    document.documentElement.setAttribute('data-role', role);

    if (checkPageAccess()) {
      showBody();
    }
  }

  function waitForLib(cb) {
    var elapsed = 0;
    var interval = 30;
    var maxWait = 3000; // 3 secondes max

    function check() {
      if (window.supabase && window.supabase.createClient) { cb(); return; }
      elapsed += interval;
      if (elapsed >= maxWait) {
        console.warn('[Hub] Supabase CDN non chargé après ' + maxWait + 'ms — mode demo');
        handleDemoMode();
        return;
      }
      setTimeout(check, interval);
    }
    check();
  }

  function handleSession(session) {
    if (!session) {
      // Pas de session Supabase → tenter mode démo
      handleDemoMode();
      return;
    }

    if (isLoginPage) {
      // Load profile to determine redirect
      var profile = {};
      try { profile = JSON.parse(localStorage.getItem('hub_profile') || localStorage.getItem('delhub_profile') || '{}'); } catch(e) {}
      var role = profile.role || 'pm';
      window.location.href = getDefaultPage(role);
      return;
    }

    window.HUB_AUTH._user = session.user;
    window.dispatchEvent(new CustomEvent('pmhub:update'));
    window.dispatchEvent(new CustomEvent('delhub:update'));

    fetchAllFromCloud(session.user.id).then(function () {
      // Activer Realtime après le sync initial
      subscribeRealtime(session.user.id);

      // After sync, refresh role attribute and check access
      try {
        var profile = JSON.parse(localStorage.getItem('hub_profile') || localStorage.getItem('delhub_profile') || '{}');
        var role = profile.role || 'pm';
        var simulated = sessionStorage.getItem('hub_simulated_role') || sessionStorage.getItem('delhub_simulated_role');
        if (simulated && role === 'god') role = simulated;
        document.documentElement.setAttribute('data-role', role);
      } catch(e) {}

      if (checkPageAccess()) {
        window.dispatchEvent(new CustomEvent('pmhub:update'));
        window.dispatchEvent(new CustomEvent('delhub:update'));
        showBody();
      }
    });
  }

  waitForLib(function () {
    getClient().auth.onAuthStateChange(function (event, session) {
      console.log('[Hub] Auth event:', event, session ? session.user.email : 'null');
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (!window.HUB_AUTH._user) handleSession(session);
      }
      if (event === 'SIGNED_OUT' && !isLoginPage) {
        window.location.href = 'hub-login.html';
      }
    });

    getSession().then(function (session) {
      console.log('[Hub] getSession():', session ? session.user.email : 'null');
      handleSession(session);
    }).catch(function (err) {
      console.error('[Hub] Auth error:', err);
      handleDemoMode();
    });
  });

  // ── PUBLIC API ────────────────────────────────────────────────

  window.HUB_AUTH = {
    _user:              null,
    getClient:          getClient,
    getSession:         getSession,
    signIn:             signIn,
    signUp:             signUp,
    signOut:            signOut,
    saveToCloud:        saveToCloud,
    fetchAllFromCloud:  fetchAllFromCloud,
  };

  // Backward compat
  window.PMHUB_AUTH  = window.HUB_AUTH;
  window.DELHUB_AUTH = window.HUB_AUTH;

})();
