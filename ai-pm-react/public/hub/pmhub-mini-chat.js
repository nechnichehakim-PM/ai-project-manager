/**
 * PM Hub — Mini chatbot flottant (données complètes du site, présent partout sauf Centre IA)
 */
(function() {
  if (typeof window === 'undefined' || /pm-hub-ai\.html|pm-hub-ai-/.test(window.location.pathname || window.location.href || '')) return;

  function buildContext() {
    if (typeof PMHUB === 'undefined') return 'Aucune donnée chargée.';
    var lines = [];
    try {
      var stats = PMHUB.getStats ? PMHUB.getStats() : {};
      lines.push('=== PORTEFEUILLE ===');
      lines.push('Projets actifs: ' + (stats.active || 0) + ', En attente: ' + (stats.hold || 0) + ', À risque: ' + (stats.risk || 0) + ', Clôturés: ' + (stats.closed || 0) + ', Archivés: ' + (stats.archived || 0) + ', Total: ' + (stats.total || 0));
      lines.push('Avancement moyen: ' + (stats.avgProgress || 0) + '%');
      var projects = PMHUB.getProjects ? PMHUB.getProjects().filter(function(p) { return p.status !== 'archived'; }) : [];
      projects.forEach(function(p) {
        lines.push('');
        lines.push('--- Projet: ' + (p.name || 'Sans nom') + ' (id=' + p.id + ', ref=' + (p.ref || '') + ')');
        lines.push('  Statut: ' + (p.status || '') + ', Avancement: ' + (p.progress != null ? p.progress + '%' : '—') + ', Type: ' + (p.type || '') + ', Client: ' + (p.client || '—'));
        lines.push('  Début: ' + (p.start || '—') + ', Fin: ' + (p.end || '—') + ', Budget: ' + (p.budget || '—') + ', Priorité: ' + (p.priority || '—'));
        if (p.desc) lines.push('  Description: ' + String(p.desc).slice(0, 200) + (p.desc.length > 200 ? '...' : ''));
        if (PMHUB.getRaids) {
          var r = PMHUB.getRaids(p.id);
          var risks = (r.risks || []).length;
          var actions = (r.actions || []).length;
          var issues = (r.issues || []).length;
          var decisions = (r.decisions || []).length;
          lines.push('  RAID: ' + risks + ' risques, ' + actions + ' actions, ' + issues + ' issues, ' + decisions + ' décisions');
          (r.risks || []).slice(0, 3).forEach(function(risk) { lines.push('    Risque: ' + (risk.desc || risk.title || '')); });
          (r.issues || []).slice(0, 2).forEach(function(iss) { lines.push('    Issue: ' + (iss.desc || iss.title || '')); });
        }
        if (PMHUB.getProjectHealth) {
          var h = PMHUB.getProjectHealth(p.id);
          lines.push('  Santé: ' + h.score + '/100, RAG: ' + h.rag + ', Risques ouverts: ' + h.openRisks + ', Issues: ' + h.openIssues);
        }
        if (PMHUB.getBudget) {
          var b = PMHUB.getBudget(p.id);
          if (b && (b.planned || b.consumed)) lines.push('  Budget: prévu ' + (b.planned || '—') + ', consommé ' + (b.consumed || '—') + ' ' + (b.currency || '€'));
        }
        if (p.team && p.team.length) lines.push('  Équipe: ' + p.team.join(', '));
      });
      if (PMHUB.getResources) {
        var resources = PMHUB.getResources();
        if (resources.length) {
          lines.push('');
          lines.push('=== RESSOURCES ===');
          resources.forEach(function(r) {
            lines.push('- ' + (r.id || '') + ': ' + (r.name || '') + ', ' + (r.role || '') + ', disponibilité ' + (r.availability != null ? r.availability + '%' : '—'));
          });
        }
      }
      if (PMHUB.getProfile) {
        var profile = PMHUB.getProfile();
        lines.push('');
        lines.push('=== PROFIL PM ===');
        lines.push(profile.name || '', profile.title || '', profile.company || '');
      }
    } catch (e) {
      lines.push('Erreur contexte: ' + (e && e.message));
    }
    return lines.join('\n');
  }

  function injectPanel() {
    if (document.getElementById('miniChatPanel')) return;
    var style = document.createElement('style');
    style.textContent = [
      '.mini-chat-panel{position:fixed;bottom:90px;right:28px;width:380px;max-width:calc(100vw - 56px);height:420px;max-height:70vh;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:0 20px 60px rgba(0,0,0,0.4);display:none;flex-direction:column;z-index:340;overflow:hidden}.mini-chat-panel.open{display:flex}',
      '.mini-chat-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--border);background:var(--surface2);flex-shrink:0}',
      '.mini-chat-title{font-family:var(--font-mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);font-weight:600}',
      '.mini-chat-minimize{width:28px;height:28px;border:1px solid var(--border);background:var(--surface);color:var(--text-muted);border-radius:6px;cursor:pointer;font-size:18px;line-height:1;display:flex;align-items:center;justify-content:center;padding:0}.mini-chat-minimize:hover{color:var(--text);background:rgba(255,255,255,.06)}',
      '.mini-chat-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:12px;min-height:0}',
      '.mini-chat-welcome{font-size:12px;color:var(--text-muted);line-height:1.6}.mini-chat-welcome a{color:var(--accent);text-decoration:none}.mini-chat-welcome a:hover{text-decoration:underline}',
      '.mini-chat-msg{display:flex;gap:10px;align-items:flex-start;max-width:95%}.mini-chat-msg.user{align-self:flex-end;flex-direction:row-reverse}',
      '.mini-chat-msg .mini-chat-msg-bubble{padding:10px 14px;border-radius:12px;font-size:12px;line-height:1.5;white-space:pre-wrap;word-break:break-word}',
      '.mini-chat-msg.user .mini-chat-msg-bubble{background:rgba(99,102,241,.2);border:1px solid rgba(99,102,241,.3);color:var(--text)}',
      '.mini-chat-msg.ai .mini-chat-msg-bubble{background:var(--surface2);border:1px solid var(--border);color:var(--text-soft)}',
      '.mini-chat-msg.error .mini-chat-msg-bubble{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);color:var(--danger)}',
      '.mini-chat-footer{padding:12px;border-top:1px solid var(--border);display:flex;gap:8px;align-items:flex-end;flex-shrink:0}',
      '.mini-chat-input{flex:1;min-height:44px;max-height:100px;padding:10px 14px;border:1px solid var(--border);border-radius:10px;background:var(--surface2);color:var(--text);font-size:13px;font-family:inherit;resize:none;outline:none}.mini-chat-input:focus{border-color:var(--accent)}',
      '.mini-chat-send{width:44px;height:44px;border:none;border-radius:10px;background:var(--accent);color:#fff;font-size:16px;cursor:pointer;flex-shrink:0}.mini-chat-send:hover{opacity:.9}.mini-chat-send:disabled{opacity:.5;cursor:not-allowed}'
    ].join('');
    document.head.appendChild(style);
    var panel = document.createElement('div');
    panel.className = 'mini-chat-panel';
    panel.id = 'miniChatPanel';
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML = [
      '<div class="mini-chat-header"><span class="mini-chat-title">Assistant IA</span><button type="button" class="mini-chat-minimize" title="Réduire">−</button></div>',
      '<div class="mini-chat-messages" id="miniChatMessages">',
        '<div class="mini-chat-welcome" id="miniChatWelcome">',
          '<p>Posez une question sur vos projets, risques, planning, budget, ressources ou rapports. J’ai accès à toutes les données du portefeuille.</p>',
          '<p>Si l’IA n’est pas configurée, <a href="pm-hub-settings.html" target="_blank">configurez-la dans Paramètres</a>.</p>',
        '</div>',
      '</div>',
      '<div class="mini-chat-footer">',
        '<textarea class="mini-chat-input" id="miniChatInput" placeholder="Votre message..." rows="1" maxlength="2000"></textarea>',
        '<button type="button" class="mini-chat-send" id="miniChatSend" title="Envoyer">➤</button>',
      '</div>'
    ].join('');
    document.body.appendChild(panel);
    panel.querySelector('.mini-chat-minimize').addEventListener('click', window.toggleMiniChat || function() {});
  }

  window.toggleMiniChat = function() {
    var panel = document.getElementById('miniChatPanel');
    if (!panel) return;
    var isOpen = panel.classList.toggle('open');
    panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    if (isOpen) {
      var input = document.getElementById('miniChatInput');
      if (input) input.focus();
    }
  };

  window.appendMiniChatMessage = function(role, text, isError) {
    var wrap = document.getElementById('miniChatMessages');
    var welcome = document.getElementById('miniChatWelcome');
    if (welcome) welcome.style.display = 'none';
    var div = document.createElement('div');
    div.className = 'mini-chat-msg ' + role + (isError ? ' error' : '');
    var bubble = document.createElement('div');
    bubble.className = 'mini-chat-msg-bubble';
    bubble.textContent = text;
    div.appendChild(bubble);
    wrap.appendChild(div);
    wrap.scrollTop = wrap.scrollHeight;
  };

  window.sendMiniChatMessage = function() {
    var input = document.getElementById('miniChatInput');
    var sendBtn = document.getElementById('miniChatSend');
    if (!input || !sendBtn) return;
    var text = (input.value || '').trim();
    if (!text) return;
    input.value = '';
    window.appendMiniChatMessage('user', text);
    sendBtn.disabled = true;
    if (typeof PMHUB === 'undefined' || !PMHUB.isAIEnabled()) {
      window.appendMiniChatMessage('ai', 'L’IA n’est pas configurée. Allez dans Paramètres → Intelligence IA pour ajouter une clé API.', true);
      sendBtn.disabled = false;
      return;
    }
    var context = buildContext();
    var sysPrompt = 'Tu es l’assistant PM du portefeuille. Tu dois répondre UNIQUEMENT à partir des données ci-dessous. Si une info n’y figure pas, dis que tu ne l’as pas. Réponds en français, de façon concise et actionable.\n\n--- DONNÉES ACTUELLES DU SITE ---\n' + context + '\n--- FIN DONNÉES ---';
    PMHUB.callAI(sysPrompt, text).then(function(reply) {
      window.appendMiniChatMessage('ai', reply || 'Pas de réponse.');
    }).catch(function(err) {
      window.appendMiniChatMessage('ai', (err && err.message) || 'Erreur lors de l’appel à l’IA.', true);
    }).finally(function() {
      sendBtn.disabled = false;
    });
  };

  function hookFab() {
    var fab = document.getElementById('aiFloatBtn') || document.querySelector('.ai-float-btn');
    if (!fab) {
      fab = document.createElement('a');
      fab.href = '#';
      fab.className = 'ai-float-btn';
      fab.id = 'aiFloatBtn';
      fab.title = 'Assistant IA';
      fab.setAttribute('aria-label', 'Ouvrir l’assistant IA');
      fab.textContent = '🤖';
      document.body.appendChild(fab);
    }
    fab.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.toggleMiniChat();
      return false;
    });
    if (fab.tagName === 'A') fab.removeAttribute('href');
    fab.setAttribute('aria-label', 'Ouvrir l’assistant IA');
  }

  function init() {
    injectPanel();
    hookFab();
    var input = document.getElementById('miniChatInput');
    if (input) {
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); window.sendMiniChatMessage(); }
      });
    }
    var sendBtn = document.getElementById('miniChatSend');
    if (sendBtn) sendBtn.addEventListener('click', window.sendMiniChatMessage);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
