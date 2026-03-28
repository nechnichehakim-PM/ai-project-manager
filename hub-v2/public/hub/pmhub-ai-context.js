/**
 * PM Hub — Bloc IA contextuel (toutes pages)
 * Chaque page définit window.PMHUB_AI_CTX = { label, buildPrompt, [system], [cacheKey] }
 * Le composant s'auto-injecte en tête de .main
 */
(function () {
  'use strict';

  var CSS = [
    '.ai-ctx{background:linear-gradient(135deg,rgba(99,210,180,.05),rgba(99,102,241,.03));border:1px solid rgba(99,210,180,.16);border-radius:12px;margin-bottom:24px;overflow:hidden;}',
    '.ai-ctx-head{display:flex;align-items:center;gap:12px;padding:13px 18px;cursor:pointer;user-select:none;}',
    '.ai-ctx-head:hover{background:rgba(99,210,180,.03);}',
    '.ai-ctx-icon{font-size:15px;flex-shrink:0;}',
    '.ai-ctx-lbl{font-family:"DM Mono",monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);flex:1;}',
    '.ai-ctx-meta{font-family:"DM Mono",monospace;font-size:9px;color:var(--text-muted);margin-right:8px;}',
    '.ai-ctx-chevron{font-size:10px;color:var(--text-muted);transition:transform .2s;flex-shrink:0;}',
    '.ai-ctx-chevron.open{transform:rotate(180deg);}',
    '.ai-ctx-btn{font-family:"DM Mono",monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;padding:5px 13px;border-radius:5px;cursor:pointer;border:1px solid rgba(99,210,180,.3);background:rgba(99,210,180,.08);color:var(--accent);transition:all .2s;flex-shrink:0;}',
    '.ai-ctx-btn:hover:not(:disabled){background:rgba(99,210,180,.16);}',
    '.ai-ctx-btn:disabled{opacity:.45;cursor:default;}',
    '.ai-ctx-btn.secondary{border-color:rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:var(--text-muted);}',
    '.ai-ctx-body{border-top:1px solid rgba(99,210,180,.1);padding:16px 18px 18px;}',
    '.ai-ctx-loading{display:flex;align-items:center;gap:10px;font-family:"DM Mono",monospace;font-size:11px;color:var(--text-muted);}',
    '.ai-ctx-dots{display:flex;gap:3px;}',
    '.ai-ctx-dots b{width:5px;height:5px;border-radius:50%;background:var(--accent);display:inline-block;animation:aiD 1.2s ease-in-out infinite;}',
    '.ai-ctx-dots b:nth-child(2){animation-delay:.2s;}.ai-ctx-dots b:nth-child(3){animation-delay:.4s;}',
    '@keyframes aiD{0%,80%,100%{opacity:.2;transform:scale(.8);}40%{opacity:1;transform:scale(1);}}',
    '.ai-ctx-result{font-family:"DM Mono",monospace;font-size:11px;line-height:1.85;color:var(--text-soft);}',
    '.ai-ctx-result strong{color:var(--text);}',
    '.ai-ctx-result .ai-s{margin:10px 0 4px;color:var(--accent);font-weight:600;font-size:10px;letter-spacing:.1em;text-transform:uppercase;}',
    '.ai-ctx-footer{display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,.05);}',
    '.ai-ctx-ts{font-family:"DM Mono",monospace;font-size:9px;color:var(--text-muted);}',
    '.ai-ctx-err{font-family:"DM Mono",monospace;font-size:11px;color:var(--danger);}'
  ].join('');

  function injectCSS() {
    if (document.getElementById('_ai_ctx_css')) return;
    var s = document.createElement('style');
    s.id = '_ai_ctx_css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function fmt(text) {
    return String(text || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/#{1,3}\s?(.*)/g, '<div class="ai-s">$1</div>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }

  function renderResult(text, ts) {
    return '<div class="ai-ctx-result">' + fmt(text) + '</div>' +
      '<div class="ai-ctx-footer">' +
        '<span class="ai-ctx-ts">Généré ' + (ts || '') + '</span>' +
        '<div style="display:flex;gap:8px;">' +
          '<button class="ai-ctx-btn secondary" onclick="window._aiCtxCopy()">Copier</button>' +
          '<button class="ai-ctx-btn" onclick="window._aiCtxRun()">Ré-analyser</button>' +
        '</div>' +
      '</div>';
  }

  function init() {
    var ctx = window.PMHUB_AI_CTX;
    if (!ctx) return;
    var main = document.querySelector('.main') || document.querySelector('.main-col');
    if (!main) return;

    injectCSS();

    var wrap = document.createElement('div');
    wrap.id = '_ai_ctx_wrap';
    main.insertBefore(wrap, main.firstChild);

    var cacheKey = 'pmhub_aic_' + (ctx.cacheKey || (location.pathname + location.search).replace(/[^a-z0-9]/gi, '_'));
    var cached = null;
    try { cached = sessionStorage.getItem(cacheKey); } catch (e) {}

    function render(open) {
      wrap.innerHTML =
        '<div class="ai-ctx" id="_aiCtxCard">' +
          '<div class="ai-ctx-head" onclick="window._aiCtxToggle()" role="button" tabindex="0" aria-expanded="' + (open ? 'true' : 'false') + '">' +
            '<span class="ai-ctx-icon">✨</span>' +
            '<span class="ai-ctx-lbl">Analyse IA — ' + (ctx.label || 'Cette page') + '</span>' +
            '<span class="ai-ctx-meta" id="_aiCtxMeta">' + (cached ? 'Dernière analyse' : 'Non analysé') + '</span>' +
            (open ? '' : '<button class="ai-ctx-btn" onclick="event.stopPropagation();window._aiCtxRun()" id="_aiCtxRunBtn">Analyser</button>') +
            '<span class="ai-ctx-chevron' + (open ? ' open' : '') + '" id="_aiCtxChev">▾</span>' +
          '</div>' +
          '<div id="_aiCtxBody" style="' + (open ? '' : 'display:none;') + '">' +
            (cached ? '<div class="ai-ctx-body">' + renderResult(cached, '') + '</div>' : '') +
          '</div>' +
        '</div>';
    }

    render(!!cached);

    window._aiCtxToggle = function () {
      var body = document.getElementById('_aiCtxBody');
      var chev = document.getElementById('_aiCtxChev');
      if (!body) return;
      var isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : '';
      if (chev) { chev.className = 'ai-ctx-chevron' + (isOpen ? '' : ' open'); }
    };

    window._aiCtxRun = async function () {
      var body = document.getElementById('_aiCtxBody');
      var meta = document.getElementById('_aiCtxMeta');
      var btn  = document.getElementById('_aiCtxRunBtn');
      if (!body) return;
      body.style.display = '';
      var chev = document.getElementById('_aiCtxChev');
      if (chev) chev.className = 'ai-ctx-chevron open';
      body.innerHTML = '<div class="ai-ctx-body"><div class="ai-ctx-loading"><div class="ai-ctx-dots"><b></b><b></b><b></b></div>Analyse en cours…</div></div>';
      if (meta) meta.textContent = 'Génération…';
      if (btn) { btn.disabled = true; btn.textContent = '…'; }
      try {
        if (typeof PMHUB === 'undefined' || !PMHUB.callAI) throw new Error('IA non configurée');
        var prompt = ctx.buildPrompt();
        var system = ctx.system ||
          'Tu es un expert PM senior certifié PMP® et PRINCE2 7th. ' +
          'Analyse les données fournies. Réponds en français, de façon structurée avec des sections titrées (##), ' +
          'des points clés en **gras**, et des recommandations numérotées concrètes et actionnables. ' +
          'Sois précis, direct, max 280 mots.';
        var result = await PMHUB.callAI(system, prompt);
        var ts = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        body.innerHTML = '<div class="ai-ctx-body">' + renderResult(result, ts) + '</div>';
        if (meta) meta.textContent = 'Analysé à ' + ts;
        try { sessionStorage.setItem(cacheKey, result); } catch (e) {}
      } catch (err) {
        body.innerHTML = '<div class="ai-ctx-body"><div class="ai-ctx-err">⚠ ' + (err.message || 'Erreur') +
          ' — <a href="pm-hub-settings.html" style="color:var(--accent);">Configurer l\'IA →</a></div></div>';
        if (meta) meta.textContent = 'Erreur';
      }
      if (btn) { btn.disabled = false; btn.textContent = 'Analyser'; }
    };

    window._aiCtxCopy = function () {
      var el = document.querySelector('#_aiCtxBody .ai-ctx-result');
      if (!el) return;
      navigator.clipboard.writeText(el.innerText).catch(function () {});
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
