/**
 * PM Hub — Logique partagée Centre IA (chat, raid, redac, briefing, livrable)
 */
(function() {
  'use strict';
  var chatHistory = [];
  var generating = false;
  var profile = (typeof PMHUB !== 'undefined' && PMHUB.getProfile) ? PMHUB.getProfile() : { initials: 'AN', name: 'Abdelhakim' };

  function toast(msg, t) {
    t = t || 'ok';
    var el = document.getElementById('toast');
    if (!el) return;
    el.style.borderColor = t === 'err' ? 'rgba(224,112,112,0.3)' : 'rgba(99,210,180,0.3)';
    el.textContent = msg;
    el.style.transform = 'translateY(0)';
    el.style.opacity = '1';
    setTimeout(function() { el.style.transform = 'translateY(65px)'; el.style.opacity = '0'; }, 3200);
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function copyEl(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var t = el.textContent;
    navigator.clipboard.writeText(t).then(function() { toast('📋 Copié !'); }).catch(function() { toast('❌ Échec', 'err'); });
  }
  function iaBanner() {
    return '<div class="ia-off"><div style="font-size:22px">⚡</div><div><div class="ia-off-ttl">IA non configurée</div><div class="ia-off-sub">Configurez votre fournisseur IA pour utiliser cette fonctionnalité.</div></div><a href="pm-hub-settings.html?section=ai">⚙ Configurer</a></div>';
  }
  function getToolBody() {
    return document.querySelector('.tool-body');
  }

  function selOpt(el, gid) {
    var c = document.getElementById(gid);
    if (!c) return;
    var opts = c.querySelectorAll('.opt');
    for (var i = 0; i < opts.length; i++) opts[i].classList.remove('selected');
    if (el) el.classList.add('selected');
  }
  window.selOpt = selOpt;

  function initContextBanner() {
    if (typeof PMHUB === 'undefined') return;
    var from = PMHUB.getParam && PMHUB.getParam('from');
    var projectId = PMHUB.getParam && PMHUB.getParam('project');
    var ban = document.getElementById('ctxBanner');
    if (!ban) return;
    if (!from && !projectId) { ban.style.display = 'none'; return; }
    var parts = [];
    if (from) parts.push('Page : ' + decodeURIComponent(from));
    if (projectId) {
      var p = PMHUB.getProjectById && PMHUB.getProjectById(projectId);
      parts.push('Projet : ' + (p ? p.name : projectId));
    }
    ban.innerHTML = '<span>📍 Contexte</span> ' + parts.join(' · ');
    ban.style.display = 'flex';
  }
  function initStatus() {
    if (typeof PMHUB === 'undefined') return;
    var s = PMHUB.getAISettings && PMHUB.getAISettings();
    var badge = document.getElementById('aiBadge');
    var dot = document.getElementById('aiDot');
    var lbl = document.getElementById('aiLbl');
    var mdl = document.getElementById('aiModel');
    if (!badge) return;
    if (s && s.enabled && s.apiKey && s.provider) {
      var pl = (PMHUB.AI_PROVIDERS && PMHUB.AI_PROVIDERS[s.provider]) ? PMHUB.AI_PROVIDERS[s.provider].label : s.provider;
      badge.className = 'sb-badge-ai on';
      if (dot) dot.className = 'ai-dot on';
      if (lbl) lbl.textContent = 'IA active — ' + pl;
      if (mdl) mdl.textContent = s.model || 'Modèle par défaut';
    } else {
      badge.className = 'sb-badge-ai off';
      if (dot) dot.className = 'ai-dot';
      if (lbl) lbl.textContent = 'IA non configurée';
      if (mdl) mdl.textContent = 'Allez dans Paramètres';
    }
  }
  function initChips() {
    if (typeof PMHUB === 'undefined') return;
    var projs = PMHUB.getProjects ? PMHUB.getProjects().filter(function(p) { return p.status === 'active'; }) : [];
    var c = document.getElementById('projChips');
    if (c) {
      c.innerHTML = projs.length ? projs.map(function(p, i) {
        return '<div class="proj-chip' + (i === 0 ? ' active' : '') + '" onclick="document.querySelectorAll(\'.proj-chip\').forEach(function(x){x.classList.remove(\'active\')});this.classList.add(\'active\')"><div class="proj-dot" style="background:' + (p.color || 'var(--accent)') + '"></div><div class="proj-name">' + (p.name || '') + '</div></div>';
      }).join('') : '<div style="font-family:DM Mono,monospace;font-size:9px;color:var(--text-muted);">Aucun projet actif</div>';
    }
    ['rProj', 'lProj'].forEach(function(sid) {
      var sel = document.getElementById(sid);
      if (!sel) return;
      sel.innerHTML = projs.map(function(p) { return '<option value="' + p.id + '">' + (p.name || '') + '</option>'; }).join('');
      if (sid === 'lProj') {
        sel.onchange = function() { prefillLiv(parseInt(sel.value, 10)); };
        if (projs.length) prefillLiv(projs[0].id);
      }
    });
  }
  function prefillLiv(id) {
    if (typeof PMHUB === 'undefined') return;
    var p = PMHUB.getProjects && PMHUB.getProjects().find(function(x) { return x.id === id; });
    if (!p) return;
    var lDesc = document.getElementById('lDesc');
    var lBudget = document.getElementById('lBudget');
    var lDuree = document.getElementById('lDuree');
    if (lDesc) lDesc.value = p.desc || '';
    if (lBudget) lBudget.value = p.budget ? p.budget + ' €' : '';
    if (lDuree && p.start && p.end) {
      var m = Math.round((new Date(p.end) - new Date(p.start)) / (1000 * 60 * 60 * 24 * 30));
      lDuree.value = m + ' mois';
    }
  }

  function getCtx() {
    if (typeof PMHUB === 'undefined') return '';
    var from = PMHUB.getParam && PMHUB.getParam('from');
    var projectId = PMHUB.getParam && PMHUB.getParam('project');
    var ctxNote = '';
    if (from) ctxNote += 'L\'utilisateur consulte la page "' + decodeURIComponent(from) + '". ';
    if (projectId) {
      var p = PMHUB.getProjectById && PMHUB.getProjectById(projectId);
      if (p) ctxNote += 'Projet focal : ' + p.name + ' (ref ' + (p.ref || '') + '). ';
    }
    var projs = PMHUB.getProjects ? PMHUB.getProjects() : [];
    var res = PMHUB.getResources ? PMHUB.getResources() : [];
    var active = projs.filter(function(p) { return p.status === 'active'; });
    var focalId = projectId || (active[0] && active[0].id) || 1;
    var raid = PMHUB.getRaids ? PMHUB.getRaids(focalId) : { risks: [], actions: [], issues: [], decisions: [] };
    return 'Tu es expert PM senior (PMP, PRINCE2, Agile). Tu travailles avec ' + profile.name + ', ' + (profile.title || '') + ', ' + (profile.company || '') + ', ' + (profile.location || '') + '. Certifications : ' + (profile.badges || []).join(', ') + '.\n' +
      ctxNote + '\nPROJETS ACTIFS :\n' +
      active.map(function(p) {
        return '- ' + p.name + ' (' + (p.ref || '') + ') : ' + p.progress + '% | Phase: ' + (p.phase || '—') + ' | Budget: ' + (p.budget || '—') + '€ | Fin: ' + (p.end || '—') + ' | Equipe: ' + (p.team || []).join(', ') + ' | Priorite: ' + (p.priority || '—');
      }).join('\n') + '\n\nPROJETS CLOTURES : ' + projs.filter(function(p) { return p.status === 'closed'; }).map(function(p) { return p.name; }).join(', ') + '\n\nEQUIPE :\n' +
      res.map(function(r) {
        return '- ' + r.id + ' ' + r.name + ' (' + r.role + ', ' + (r.level || '') + ') Dispo:' + (r.availability || 0) + '% Skills:' + (r.skills || []).join(',');
      }).join('\n') + '\n\nRAID (projet principal) :\nRisques ouverts: ' + (raid.risks || []).filter(function(r) { return r.status !== 'closed'; }).length + ' | Critiques: ' + (raid.risks || []).filter(function(r) { return r.severity === 'critical'; }).length + ' | Actions ouvertes: ' + (raid.actions || []).filter(function(a) { return a.status !== 'closed'; }).length + ' | Issues: ' + (raid.issues || []).filter(function(i) { return i.status !== 'closed'; }).length + '\n\nReponds en francais, de facon concise et professionnelle.';
  }

  // —— CHAT ——
  function addMsg(role, text, cls) {
    cls = cls || '';
    var body = document.getElementById('chatBody');
    if (!body) return null;
    var div = document.createElement('div');
    div.className = 'msg ' + role;
    div.innerHTML = '<div class="msg-av ' + (role === 'user' ? 'u' : 'a') + '">' + (role === 'user' ? (profile.initials || 'AN') : '🤖') + '</div><div class="msg-bbl ' + (role === 'user' ? 'u' : 'a') + ' ' + cls + '">' + esc(text) + '</div>';
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }
  async function sendChat() {
    if (generating) return;
    var input = document.getElementById('chatInput');
    if (!input) return;
    var msg = input.value.trim();
    if (!msg) return;
    if (typeof PMHUB !== 'undefined' && !PMHUB.isAIEnabled()) {
      addMsg('ai', '⚡ IA non configurée. Allez dans Paramètres → ⚙ pour configurer.');
      return;
    }
    var welcome = document.getElementById('chatWelcome');
    if (welcome) welcome.style.display = 'none';
    addMsg('user', msg);
    chatHistory.push({ role: 'user', content: msg });
    input.value = '';
    input.style.height = 'auto';
    generating = true;
    var sendBtn = document.getElementById('sendBtn');
    if (sendBtn) sendBtn.disabled = true;
    var thk = addMsg('ai', '⏳ En train de réfléchir…', 'thinking');
    try {
      var s = PMHUB.getAISettings();
      var p = (PMHUB.AI_PROVIDERS || {})[s.provider];
      var ep = s.provider === 'custom' ? s.endpoint : p.endpoint;
      var mdl = s.model || p.models[0];
      var hdrs = { 'Content-Type': 'application/json' };
      hdrs[p.headerKey] = p.headerPrefix + s.apiKey;
      if (s.provider === 'anthropic') hdrs['anthropic-version'] = '2023-06-01';
      var hist = chatHistory.slice(-12);
      var body;
      if (s.provider === 'anthropic') {
        body = { model: mdl, max_tokens: 3000, system: getCtx(), messages: [{ role: 'user', content: hist.map(function(m) { return '[' + m.role.toUpperCase() + ']: ' + m.content; }).join('\n') }] };
      } else {
        body = { model: mdl, messages: [{ role: 'system', content: getCtx() }].concat(hist.map(function(m) { return { role: m.role === 'user' ? 'user' : 'assistant', content: m.content }; })), temperature: 0.7, max_completion_tokens: 3000 };
      }
      var res = await fetch(ep, { method: 'POST', headers: hdrs, body: JSON.stringify(body) });
      if (!res.ok) {
        var e = await res.json().catch(function() { return {}; });
        throw new Error((e && e.error && e.error.message) || 'Erreur API ' + res.status);
      }
      var d = await res.json();
      var txt = s.provider === 'anthropic' ? (d.content && d.content[0] && d.content[0].text) || '' : (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '';
      thk.remove();
      addMsg('ai', txt);
      chatHistory.push({ role: 'assistant', content: txt });
    } catch (err) {
      thk.remove();
      addMsg('ai', '❌ ' + err.message);
      toast(err.message, 'err');
    } finally {
      generating = false;
      if (sendBtn) sendBtn.disabled = false;
    }
  }
  window.sendChat = sendChat;

  var SUG_Q = {
    'Santé du projet AI Data Center': 'Analyse la santé globale de mon projet AI-Driven Smart Data Center : avancement, risques, équipe, budget. Donne-moi un diagnostic clair avec des points d attention.',
    'Risques critiques à traiter': 'Quels sont mes risques critiques en ce moment et que dois-je faire en priorité cette semaine ?',
    'Mes 5 priorités cette semaine': 'Donne-moi mes 5 actions prioritaires pour cette semaine sur mon portefeuille de projets.',
    'Équilibre charge de l\'équipe': 'Mon équipe est-elle bien équilibrée sur le projet AI Data Center ? Surcharges ? Lacunes de compétences ?',
    'Conformité bonnes pratiques PMP': 'Mon projet AI Data Center respecte-t-il les bonnes pratiques PMP/PRINCE2 ? Qu\'est-ce qui manque ?',
    'Préparer le prochain COPIL': 'Qu\'est-ce que je dois préparer pour mon prochain COPIL sur le projet AI Data Center ? Agenda recommandé ?'
  };
  function sendSug(el) {
    var txt = el && el.querySelector && el.querySelector('.sug-text') ? el.querySelector('.sug-text').textContent.trim() : '';
    var input = document.getElementById('chatInput');
    if (input) input.value = SUG_Q[txt] || txt;
    sendChat();
  }
  window.sendSug = sendSug;

  // —— RAID ——
  function initRaidKpis() {
    if (typeof PMHUB === 'undefined') return;
    var projs = PMHUB.getProjects ? PMHUB.getProjects().filter(function(p) { return p.status === 'active'; }) : [];
    if (!projs.length) return;
    var raid = PMHUB.getRaids && PMHUB.getRaids(projs[0].id);
    if (!raid) return;
    var or = (raid.risks || []).filter(function(r) { return r.status !== 'closed'; }).length;
    var cr = (raid.risks || []).filter(function(r) { return r.severity === 'critical'; }).length;
    var oa = (raid.actions || []).filter(function(a) { return a.status !== 'closed'; }).length;
    var oi = (raid.issues || []).filter(function(i) { return i.status !== 'closed'; }).length;
    var kpis = document.getElementById('raidKpis');
    if (!kpis) return;
    var colors = [
      [or, 'Risques ouverts', or > 2 ? 'var(--danger)' : 'var(--warning)'],
      [cr, 'Critiques', cr > 0 ? 'var(--danger)' : 'var(--success)'],
      [oa, 'Actions ouvertes', 'var(--accent3)'],
      [oi, 'Issues actives', oi > 0 ? 'var(--warning)' : 'var(--success)']
    ];
    kpis.innerHTML = colors.map(function(x) {
      return '<div class="akpi"><div class="akpi-val" style="color:' + x[2] + '">' + x[0] + '</div><div class="akpi-lbl">' + x[1] + '</div></div>';
    }).join('');
  }
  async function analyseRaid() {
    if (typeof PMHUB === 'undefined') return;
    if (!PMHUB.isAIEnabled()) {
      var tb = getToolBody();
      var rb = document.getElementById('raidBody');
      if (tb) tb.insertAdjacentHTML('afterbegin', iaBanner());
      else if (rb) rb.insertAdjacentHTML('afterbegin', iaBanner());
      return;
    }
    var projs = PMHUB.getProjects ? PMHUB.getProjects().filter(function(p) { return p.status === 'active'; }) : [];
    if (!projs.length) { toast('Aucun projet actif', 'err'); return; }
    var proj = projs[0];
    var raid = PMHUB.getRaids && PMHUB.getRaids(proj.id);
    var res = document.getElementById('raidRes');
    var body = document.getElementById('raidBody2');
    var empty = document.getElementById('raidEmpty');
    var btn = document.getElementById('btnRaid');
    if (empty) empty.style.display = 'none';
    if (res) res.classList.add('show');
    if (body) { body.className = 'rcard-body loading'; body.textContent = '⏳ Analyse en cours…'; }
    if (btn) btn.disabled = true;
    var raidTxt = 'Projet: ' + proj.name + ' | Avancement: ' + proj.progress + '%\nRISQUES(' + (raid.risks || []).length + '): ' + (raid.risks || []).map(function(r) { return '[' + r.severity + '/' + r.status + '] ' + r.desc + ' Owner:' + r.owner + ' Mitigation:' + (r.mitigation || 'non definie'); }).join(' | ') + '\nACTIONS(' + (raid.actions || []).length + '): ' + (raid.actions || []).map(function(a) { return '[' + a.status + '] ' + a.desc + ' Owner:' + a.owner + ' Due:' + (a.due || '?'); }).join(' | ') + '\nISSUES(' + (raid.issues || []).length + '): ' + (raid.issues || []).map(function(i) { return i.desc; }).join(' | ') + '\nDECISIONS(' + (raid.decisions || []).length + '): ' + (raid.decisions || []).map(function(d) { return '[' + d.status + '] ' + d.desc; }).join(' | ');
    try {
      var r = await PMHUB.callAI('Tu es expert en gestion des risques projet (PMP, PRINCE2). Analyse de facon structuree et actionnable.', 'Analyse ce RAID Log et donne-moi:\n1. DIAGNOSTIC: sante du RAID (score /10) et points critiques\n2. TOP 3 RISQUES a traiter EN URGENCE avec actions concretes\n3. ACTIONS en retard ou a risque de derapage\n4. RISQUES OUBLIES: 2-3 risques probables non listes (type de projet IA/Datacenter)\n5. CE QUI VA BIEN dans la gestion des risques\n6. RECOMMANDATIONS: 3 actions concretes pour ameliorer\n\n' + raidTxt);
      if (body) { body.className = 'rcard-body'; body.textContent = r; }
      toast('Analyse terminee !');
    } catch (err) {
      if (body) { body.className = 'rcard-body'; body.textContent = 'Erreur: ' + err.message; }
      toast(err.message, 'err');
    } finally {
      if (btn) btn.disabled = false;
    }
  }
  window.analyseRaid = analyseRaid;
  window.initRaidKpis = initRaidKpis;

  // —— REDAC ——
  var REDAC = {
    'email-copil': { label: 'Email COPIL', prompt: function(p, dest, pts, ton) { return 'Redige un email de compte-rendu COPIL pour le projet ' + p.name + ', destine a ' + (dest || 'la direction') + '. Ton: ' + ton + '. Inclure: resume statut, avancement (' + p.progress + '%), points decides, risques majeurs, prochaines etapes. ' + (pts ? 'Points: ' + pts : ''); } },
    'statut': { label: 'Rapport de statut', prompt: function(p, dest, pts, ton) { return 'Redige un rapport de statut pour ' + p.name + ' (' + p.progress + '%, phase: ' + (p.phase || '?') + '), destine a ' + (dest || 'equipe') + '. Ton: ' + ton + '. Format RAG. ' + (pts ? 'Points: ' + pts : ''); } },
    'escalade': { label: 'Note d\'escalade', prompt: function(p, dest, pts, ton) { return 'Redige une note d\'escalade formelle pour ' + p.name + ', a ' + (dest || 'la direction') + '. Ton: ' + ton + '. ' + (pts ? 'Probleme: ' + pts : 'Identifier le probleme critique du RAID.'); } },
    'cr-reunion': { label: 'Compte-rendu reunion', prompt: function(p, dest, pts, ton) { return 'Redige un CR de reunion de projet pour ' + p.name + ', destine a ' + (dest || 'equipe') + '. Ton: ' + ton + '. Format: participants, ordre du jour, decisions, actions. ' + (pts ? 'Points abordes: ' + pts : ''); } },
    'kick-off': { label: 'Email kick-off', prompt: function(p, dest, pts, ton) { return 'Redige l\'email de lancement officiel du projet ' + p.name + ' destine a ' + (dest || 'parties prenantes') + '. Ton: ' + ton + '. Equipe: ' + (p.team || []).join(', ') + ', budget ' + (p.budget || '?') + '€. ' + (pts ? 'Points: ' + pts : ''); } },
    'cloture': { label: 'Note de cloture', prompt: function(p, dest, pts, ton) { return 'Redige la note de cloture du projet ' + p.name + '. Destine a ' + (dest || 'direction et sponsor') + '. Ton: ' + ton + '. Bilan, REX, lecons apprises, recommandations. ' + (pts ? 'Points: ' + pts : ''); } }
  };
  async function genRedac() {
    if (typeof PMHUB === 'undefined') return;
    if (!PMHUB.isAIEnabled()) {
      var tb = getToolBody();
      if (tb) tb.insertAdjacentHTML('afterbegin', iaBanner());
      return;
    }
    var sel = document.querySelector('#redacOpts .selected');
    var selType = (sel && sel.dataset && sel.dataset.t) ? sel.dataset.t : 'email-copil';
    var rProj = document.getElementById('rProj');
    var pid = rProj ? parseInt(rProj.value, 10) : 0;
    var projs = PMHUB.getProjects ? PMHUB.getProjects() : [];
    var proj = projs.find(function(p) { return p.id === pid; }) || projs[0];
    if (!proj) { toast('Aucun projet', 'err'); return; }
    var dest = document.getElementById('rDest');
    var pts = document.getElementById('rPts');
    var ton = document.getElementById('rTon');
    dest = dest ? dest.value : '';
    pts = pts ? pts.value : '';
    ton = ton ? ton.value : 'professionnel';
    var tpl = REDAC[selType];
    var res = document.getElementById('redacRes');
    var body = document.getElementById('redacBody');
    var lbl = document.getElementById('redacLbl');
    var btn = document.getElementById('btnRedac');
    if (lbl) lbl.textContent = tpl.label;
    if (res) res.classList.add('show');
    if (body) { body.className = 'rcard-body loading'; body.textContent = 'Redaction en cours…'; }
    if (btn) btn.disabled = true;
    var raid = PMHUB.getRaids && PMHUB.getRaids(proj.id);
    var raidCtx = 'Risques critiques/high: ' + ((raid && raid.risks) ? raid.risks.filter(function(r) { return r.severity === 'critical' || r.severity === 'high'; }).map(function(r) { return r.desc; }).join(', ') : 'aucun') + '. Actions ouvertes: ' + ((raid && raid.actions) ? raid.actions.filter(function(a) { return a.status !== 'closed'; }).length : 0) + '.';
    try {
      var r = await PMHUB.callAI('Tu es expert en communication de projet (PMP, PRINCE2). Tu rediges des documents professionnels pour ' + profile.name + ', ' + (profile.title || '') + '. Contexte RAID: ' + raidCtx, tpl.prompt(proj, dest, pts, ton));
      if (body) { body.className = 'rcard-body'; body.textContent = r; }
      toast('Document genere !');
    } catch (err) {
      if (body) { body.className = 'rcard-body'; body.textContent = 'Erreur: ' + err.message; }
      toast(err.message, 'err');
    } finally {
      if (btn) btn.disabled = false;
    }
  }
  window.genRedac = genRedac;

  function exportRedacPDF() {
    var bodyEl = document.getElementById('redacBody');
    var lblEl = document.getElementById('redacLbl');
    if (!bodyEl || !bodyEl.textContent || bodyEl.classList.contains('loading')) {
      toast('Aucun contenu à exporter. Générez un document d\'abord.', 'err');
      return;
    }
    var title = (lblEl && lblEl.textContent) ? lblEl.textContent.trim() : 'Document';
    var bodyText = bodyEl.textContent;
    var bodyHtml = '<div class="print-body" style="white-space:pre-wrap;font-family:\'Segoe UI\',system-ui,sans-serif;font-size:13px;line-height:1.6;">' + esc(bodyText) + '</div>';
    var printStyles = '*,::before,::after{margin:0;padding:0;box-sizing:border-box;} body{font-family:\'Segoe UI\',system-ui,sans-serif;background:#fff;color:#111;padding:32px;line-height:1.5;} .print-header{margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #ddd;} .print-title{font-size:22px;font-weight:600;} .print-meta{font-size:11px;color:#666;margin-top:8px;} .print-body{font-size:13px;}';
    var doc = '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>' + esc(title) + '</title><style>' + printStyles + '</style></head><body><div class="print-header"><h1 class="print-title">' + esc(title) + '</h1><div class="print-meta">PM Hub — ' + (new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })) + '</div></div>' + bodyHtml + '<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script></body></html>';
    try {
      var win = window.open('', '_blank', 'width=900,height=700');
      if (!win) {
        toast('Autorisez les fenêtres pop-up pour exporter en PDF.', 'err');
        return;
      }
      win.document.write(doc);
      win.document.close();
      toast('Fenêtre d\'impression ouverte → Choisissez « Enregistrer en PDF »');
    } catch (e) {
      toast('Erreur lors de l\'export PDF.', 'err');
    }
  }
  window.exportRedacPDF = exportRedacPDF;

  // —— BRIEFING ——
  async function genBriefing() {
    if (typeof PMHUB === 'undefined') return;
    if (!PMHUB.isAIEnabled()) {
      var tb = getToolBody();
      if (tb) tb.insertAdjacentHTML('afterbegin', iaBanner());
      return;
    }
    var btn = document.getElementById('btnBriefing');
    var empty = document.getElementById('bEmpty');
    var secs = document.getElementById('bSections');
    if (btn) btn.disabled = true;
    if (empty) empty.style.display = 'none';
    if (secs) secs.style.display = 'flex';
    ['bR', 'bA', 'bP', 'bAc'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) { el.className = 'bblock-body loading'; el.textContent = 'Generation…'; }
    });
    var projs = PMHUB.getProjects ? PMHUB.getProjects() : [];
    var res = PMHUB.getResources ? PMHUB.getResources() : [];
    var today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    var r1 = PMHUB.getRaids && PMHUB.getRaids(1);
    var raidStr = r1 ? 'Risques ouverts:' + (r1.risks || []).filter(function(x) { return x.status !== 'closed'; }).length + ' | Critiques:' + (r1.risks || []).filter(function(x) { return x.severity === 'critical'; }).length + ' | Actions:' + (r1.actions || []).filter(function(x) { return x.status !== 'closed'; }).length : '';
    var ctx = 'PM: ' + profile.name + ' | ' + (profile.title || '') + ' | ' + (profile.company || '') + ' | ' + today + '\nPORTEFEUILLE:\n' + projs.map(function(p) { return '- [' + p.status + '] ' + p.name + ': ' + p.progress + '% | Phase: ' + (p.phase || '?') + ' | Fin: ' + (p.end || '?') + ' | Budget: ' + (p.budget || '?') + '€'; }).join('\n') + '\nEQUIPE:\n' + res.map(function(r) { return '- ' + r.name + ' (' + r.role + ') Dispo:' + r.availability + '%'; }).join('\n') + '\nRAID principal: ' + raidStr;
    var prompts = [
      { id: 'bR', q: 'Redige un resume executif CONCIS (5-7 lignes) de l etat du portefeuille au ' + today + '. Points essentiels uniquement.' },
      { id: 'bA', q: 'Pour chaque projet, donne l etat avec indicateur RAG, le % et 1 point cle. Format liste.' },
      { id: 'bP', q: 'Identifie les 3-5 points d attention critiques du portefeuille : risques, retards, problemes equipe. Liste priorisee.' },
      { id: 'bAc', q: 'Liste les 5-7 actions prioritaires du PM CETTE semaine pour maintenir le portefeuille sur les rails. Liste numerotee avec responsable.' }
    ];
    try {
      for (var i = 0; i < prompts.length; i++) {
        try {
          var r = await PMHUB.callAI('Tu es assistant PM expert. Contexte: ' + ctx, prompts[i].q);
          var el = document.getElementById(prompts[i].id);
          if (el) { el.className = 'bblock-body'; el.textContent = r; }
        } catch (err) {
          var el = document.getElementById(prompts[i].id);
          if (el) { el.className = 'bblock-body'; el.textContent = 'Erreur: ' + err.message; }
        }
      }
      toast('Briefing genere !');
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      if (btn) btn.disabled = false;
    }
  }
  window.genBriefing = genBriefing;
  function copyBriefing() {
    var h = { bR: 'RESUME EXECUTIF', bA: 'AVANCEMENT PAR PROJET', bP: "POINTS D'ATTENTION", bAc: 'ACTIONS PRIORITAIRES' };
    var t = Object.keys(h).map(function(id) { var el = document.getElementById(id); return '## ' + h[id] + '\n\n' + (el ? el.textContent : ''); }).join('\n');
    navigator.clipboard.writeText(t).then(function() { toast('Copie !'); }).catch(function() { toast('Echec', 'err'); });
  }
  window.copyEl = copyEl;
  window.copyBriefing = copyBriefing;
  window._toast = toast;

  // —— CHAT : mode selector + clear ——
  window.setMode = function(el) {
    document.querySelectorAll('.cmode').forEach(function(b) { b.classList.remove('active'); });
    el.classList.add('active');
    var placeholders = {
      quick: 'Posez votre question PM…',
      deep: 'Décrivez la situation à analyser en détail…',
      copil: 'Quel projet ou sujet préparer pour le COPIL ?'
    };
    var ta = document.getElementById('chatInput');
    if (ta) ta.placeholder = placeholders[el.dataset.mode] || placeholders.quick;
  };
  window.clearChat = function() {
    var body = document.getElementById('chatBody');
    var welcome = document.getElementById('chatWelcome');
    if (body) {
      var msgs = body.querySelectorAll('.msg');
      msgs.forEach(function(m) { m.remove(); });
    }
    chatHistory = [];
    if (welcome) welcome.style.display = '';
    toast('Conversation effacée');
  };

  // —— BRIEFING : export PDF ——
  window.exportBriefingPDF = function() {
    var sections = {
      bR: 'Résumé exécutif',
      bA: 'Avancement par projet',
      bP: "Points d'attention & risques",
      bAc: 'Actions prioritaires'
    };
    var hasContent = Object.keys(sections).some(function(id) {
      var el = document.getElementById(id);
      return el && el.textContent && !el.classList.contains('loading');
    });
    if (!hasContent) { toast('Générez le briefing d\'abord.', 'err'); return; }
    var today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    var styles = '*{margin:0;padding:0;box-sizing:border-box;}body{font-family:"Segoe UI",system-ui,sans-serif;background:#fff;color:#111;padding:32px;line-height:1.6;}.hdr{margin-bottom:28px;padding-bottom:16px;border-bottom:2px solid #eee;}.hdr-title{font-size:22px;font-weight:700;}.hdr-meta{font-size:11px;color:#666;margin-top:6px;}.section{margin-bottom:24px;page-break-inside:avoid;}.sec-title{font-size:13px;font-weight:600;color:#333;text-transform:uppercase;letter-spacing:.05em;border-left:3px solid #63D2B4;padding-left:10px;margin-bottom:10px;}.sec-body{font-size:13px;white-space:pre-wrap;color:#222;}';
    var content = Object.keys(sections).map(function(id) {
      var el = document.getElementById(id);
      var text = el ? el.textContent : '';
      return '<div class="section"><div class="sec-title">' + sections[id] + '</div><div class="sec-body">' + text.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</div></div>';
    }).join('');
    var doc = '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Briefing hebdomadaire</title><style>' + styles + '</style></head><body><div class="hdr"><h1 class="hdr-title">Briefing hebdomadaire</h1><div class="hdr-meta">PM Hub · ' + today + '</div></div>' + content + '<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script></body></html>';
    var win = window.open('', '_blank', 'width=900,height=700');
    if (win) { win.document.write(doc); win.document.close(); }
    else toast('Autorisez les popups pour exporter en PDF.', 'err');
  };

  // —— LIVRABLES ——
  var LIV_P = {
    charte: function(ctx) { return 'Genere une Charte de Projet (Project Charter) complete et professionnelle. Inclure: titre, objectifs SMART, perimetre IN/OUT, parties prenantes, sponsor, budget, delais, criteres succes, contraintes, hypotheses, gouvernance. Format structure par sections.\n\n' + ctx; },
    wbs: function(ctx) { return 'Genere un Work Breakdown Structure (WBS) complet. Structure 5 phases (Init/Plan/Exec/Controle/Cloture) avec livrables et taches principales. Format hierarchique numerote.\n\n' + ctx; },
    'raid-init': function(ctx) { return 'Genere un RAID Log initial: 5 risques (proba/impact/severite/mitigation/owner), 5 actions cles demarrage, 2-3 decisions a prendre. Format tableau structure.\n\n' + ctx; },
    raci: function(ctx) { return 'Genere une matrice RACI pour ce projet en te basant sur l equipe fournie. 8-10 livrables/activites principaux avec roles R/A/C/I. Format matrice claire.\n\n' + ctx; },
    jalons: function(ctx) { return 'Genere un planning de jalons critiques: 8-10 jalons, description, dates estimees, criteres validation. Tenir compte budget et duree fournis. Format chronologique.\n\n' + ctx; },
    complet: function(ctx) { return 'Genere un pack complet de demarrage: (1) Resume charte, (2) WBS simplifie 3 niveaux, (3) Top 5 risques, (4) RACI synthetique, (5) 6 jalons cles. Format structure professionnel.\n\n' + ctx; }
  };
  var LIV_LBL = { charte: 'Charte Projet', wbs: 'WBS', raci: 'Matrice RACI', 'raid-init': 'RAID Initial', jalons: 'Jalons', complet: 'Pack Complet' };
  async function genLivrable() {
    if (typeof PMHUB === 'undefined') return;
    if (!PMHUB.isAIEnabled()) {
      var tb = getToolBody();
      if (tb) tb.insertAdjacentHTML('afterbegin', iaBanner());
      return;
    }
    var sel = document.querySelector('#livOpts .selected');
    var selType = (sel && sel.dataset && sel.dataset.t) ? sel.dataset.t : 'charte';
    var lProj = document.getElementById('lProj');
    var pid = lProj ? parseInt(lProj.value, 10) : 0;
    var projs = PMHUB.getProjects ? PMHUB.getProjects() : [];
    var proj = projs.find(function(p) { return p.id === pid; }) || projs[0];
    var lDesc = document.getElementById('lDesc');
    var lBudget = document.getElementById('lBudget');
    var lDuree = document.getElementById('lDuree');
    var lType = document.getElementById('lType');
    var desc = lDesc ? lDesc.value : '';
    var budget = lBudget ? lBudget.value : '';
    var duree = lDuree ? lDuree.value : '';
    var type = lType ? lType.value : '';
    var res = document.getElementById('livRes');
    var body = document.getElementById('livBody');
    var lbl = document.getElementById('livLbl');
    var btn = document.getElementById('btnLiv');
    if (lbl) lbl.textContent = LIV_LBL[selType] || 'Livrable';
    if (res) res.classList.add('show');
    if (body) { body.className = 'rcard-body loading'; body.textContent = 'Generation en cours…'; }
    if (btn) btn.disabled = true;
    var r2 = PMHUB.getResources ? PMHUB.getResources() : [];
    var ctx = 'Projet: ' + (proj ? proj.name : '?') + ' | Ref: ' + (proj ? proj.ref : '?') + ' | Type: ' + type + '\nDescription: ' + (desc || (proj && proj.desc) || '?') + '\nBudget: ' + (budget || (proj && proj.budget) || '?') + ' | Duree: ' + (duree || '?') + '\nDebut: ' + ((proj && proj.start) || '?') + ' | Fin prevue: ' + ((proj && proj.end) || '?') + '\nPM: ' + profile.name + ' (' + (profile.title || '') + ')\nEquipe: ' + r2.map(function(r) { return r.id + ' ' + r.name + ' (' + r.role + ')'; }).join(', ') + '\nSponsor: ' + ((proj && proj.sponsor) || '?') + ' | Client: ' + ((proj && proj.client) || '?');
    try {
      var r = await PMHUB.callAI('Tu es PM senior certifie PMP et PRINCE2. Tu generes des livrables projet professionnels, detailles et directement utilisables. Reponds en francais.', LIV_P[selType](ctx));
      if (body) { body.className = 'rcard-body'; body.textContent = r; }
      toast('Livrable genere !');
    } catch (err) {
      if (body) { body.className = 'rcard-body'; body.textContent = 'Erreur: ' + err.message; }
      toast(err.message, 'err');
    } finally {
      if (btn) btn.disabled = false;
    }
  }
  window.genLivrable = genLivrable;

  // Init commun (pour pages qui ont ces éléments)
  function init() {
    initContextBanner();
    var raidKpis = document.getElementById('raidKpis');
    if (raidKpis) initRaidKpis();
    var projChips = document.getElementById('projChips');
    if (projChips) initChips();
    else {
      var rProj = document.getElementById('rProj');
      var lProj = document.getElementById('lProj');
      if (rProj || lProj) {
        var projs = (typeof PMHUB !== 'undefined' && PMHUB.getProjects) ? PMHUB.getProjects().filter(function(p) { return p.status === 'active'; }) : [];
        if (rProj) rProj.innerHTML = projs.map(function(p) { return '<option value="' + p.id + '">' + (p.name || '') + '</option>'; }).join('');
        if (lProj) {
          lProj.innerHTML = projs.map(function(p) { return '<option value="' + p.id + '">' + (p.name || '') + '</option>'; }).join('');
          lProj.onchange = function() { prefillLiv(parseInt(lProj.value, 10)); };
          if (projs.length) prefillLiv(projs[0].id);
        }
      }
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
