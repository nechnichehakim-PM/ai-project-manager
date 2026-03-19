/**
 * PM Hub — Suggestions IA contextuelles (omni-présence)
 * Affiche des propositions en direct selon la page et le projet en cours.
 */
(function() {
  'use strict';

  const path = typeof document !== 'undefined' ? (document.location.pathname || '').split('/').pop() : '';
  const projectId = (function() {
    const m = (document.location.search || '').match(/[?&]project=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : (typeof PMHUB !== 'undefined' && PMHUB.getParam ? PMHUB.getParam('project') : null) || '';
  })();

  function pageContext() {
    if (/pm-hub-project\.html/i.test(path)) return 'project';
    if (/index\.html$/i.test(path) || /pm-hub\.html$/i.test(path)) return 'dashboard';
    if (/pm-hub-gantt/i.test(path)) return 'gantt';
    if (/pm-hub-kanban/i.test(path)) return 'kanban';
    if (/pm-hub-raid/i.test(path)) return 'raid';
    if (/pm-hub-resources/i.test(path)) return 'resources';
    if (/pm-hub-report/i.test(path)) return 'report';
    if (/pm-hub-transverse/i.test(path)) return 'transverse';
    if (/pm-hub-templates/i.test(path)) return 'templates';
    if (/pm-hub-settings/i.test(path)) return 'settings';
    if (/pm-hub-ai/i.test(path)) return 'ai';
    if (/pm-hub-wizard/i.test(path)) return 'wizard';
    return 'dashboard';
  }

  const ctx = pageContext();

  const SUGGESTIONS = {
    dashboard: [
      { icon: '🧭', label: 'Lancer le wizard', href: '#', onclick: 'if(typeof openModal===\'function\')openModal(); return false;' },
      { icon: '⚠️', label: 'Voir le RAID', href: 'pm-hub-raid.html' },
      { icon: '📊', label: 'Reporting', href: 'pm-hub-report.html' },
      { icon: '🤖', label: 'Assistant IA', href: 'pm-hub-ai.html?from=Dashboard' },
    ],
    gantt: [
      { icon: '➕', label: 'Ajouter une tâche', href: '#', onclick: 'typeof openAddTask==="function"&&openAddTask(); return false;' },
      { icon: '🔴', label: 'Chemin critique', href: '#', onclick: 'typeof toggleCriticalPath==="function"&&toggleCriticalPath(); return false;' },
      { icon: '📅', label: "Aujourd'hui", href: '#', onclick: 'typeof scrollToToday==="function"&&scrollToToday(); return false;' },
      { icon: '🤖', label: 'Analyser le planning', href: 'pm-hub-ai.html?from=Gantt' + (projectId ? '&project=' + encodeURIComponent(projectId) : '') },
    ],
    kanban: [
      { icon: '📅', label: 'Voir le Gantt', href: 'pm-hub-gantt.html' + (projectId ? '?project=' + encodeURIComponent(projectId) : '') },
      { icon: '📋', label: 'Tâches du projet', href: 'pm-hub-gantt.html' + (projectId ? '?project=' + encodeURIComponent(projectId) : '') },
      { icon: '🤖', label: 'Prioriser avec l\'IA', href: 'pm-hub-ai.html?from=Kanban' + (projectId ? '&project=' + encodeURIComponent(projectId) : '') },
    ],
    raid: [
      { icon: '🤖', label: 'Analyser le RAID', href: 'pm-hub-ai.html?from=RAID' + (projectId ? '&project=' + encodeURIComponent(projectId) : '') },
      { icon: '➕', label: 'Ajouter un risque', href: '#', onclick: 'typeof openAddRAID==="function"?openAddRAID():document.querySelector(\'.add-btn\')&&document.querySelector(\'.add-btn\').click(); return false;' },
      { icon: '📊', label: 'Reporting', href: 'pm-hub-report.html' },
      { icon: '📅', label: 'Planning', href: 'pm-hub-gantt.html' + (projectId ? '?project=' + encodeURIComponent(projectId) : '') },
    ],
    resources: [
      { icon: '➕', label: 'Ajouter un membre', href: '#', onclick: 'typeof openAddRes==="function"&&openAddRes(); return false;' },
      { icon: '📊', label: 'Voir l\'allocation', href: '#alloc' },
      { icon: '🤖', label: 'Équilibre charge (IA)', href: 'pm-hub-ai.html?from=Ressources' },
    ],
    report: [
      { icon: '🖨️', label: 'Exporter / Imprimer', href: '#', onclick: 'window.print(); return false;' },
      { icon: '🤖', label: 'Briefing hebdo IA', href: 'pm-hub-ai.html?from=Reporting' },
      { icon: '⚠️', label: 'RAID', href: 'pm-hub-raid.html' },
    ],
    transverse: [
      { icon: '📄', label: 'One-pager', href: '#', onclick: "var t=document.querySelector('[data-tab=onepager]');if(t)t.click(); return false;" },
      { icon: '🤖', label: 'Assistant IA', href: 'pm-hub-ai.html?from=Pilotage' + (projectId ? '&project=' + encodeURIComponent(projectId) : '') },
    ],
    templates: [
      { icon: '📦', label: 'Tous les templates', href: '#', onclick: "typeof filterPhase==='function'&&filterPhase('all'); return false;" },
      { icon: '🤖', label: 'Générer un livrable (IA)', href: 'pm-hub-ai.html?from=Templates' + (projectId ? '&project=' + encodeURIComponent(projectId) : '') },
      { icon: '🏠', label: 'Dashboard', href: 'pm-hub.html' },
    ],
    settings: [
      { icon: '🤖', label: 'Configurer l\'IA', href: 'pm-hub-settings.html#section-ai' },
      { icon: '💾', label: 'Exporter les données', href: 'pm-hub-settings.html#section-data' },
      { icon: '🏠', label: 'Dashboard', href: 'pm-hub.html' },
    ],
    project: [
      { icon: '⚠️', label: 'RAID du projet', href: 'pm-hub-raid.html?project=' + encodeURIComponent(projectId || '') },
      { icon: '📋', label: 'Kanban', href: 'pm-hub-kanban.html?project=' + encodeURIComponent(projectId || '') },
      { icon: '📄', label: 'Templates', href: 'pm-hub-templates.html' + (projectId ? '?project=' + encodeURIComponent(projectId) : '') },
      { icon: '🤖', label: 'Analyser avec l\'IA', href: 'pm-hub-ai.html?from=Dashboard%20projet' + (projectId ? '&project=' + encodeURIComponent(projectId) : '') },
    ],
    ai: [],
    wizard: [],
  };

  function getSuggestions() {
    const list = SUGGESTIONS[ctx] || SUGGESTIONS.dashboard;
    return list.filter(Boolean);
  }

  function buildBar() {
    const suggestions = getSuggestions();
    if (suggestions.length === 0) return '';

    const pills = suggestions.map(function(s) {
      const attrs = [];
      if (s.href && s.href !== '#') attrs.push('href="' + s.href.replace(/"/g, '&quot;') + '"');
      else attrs.push('href="#"');
      if (s.onclick) attrs.push('onclick="' + s.onclick.replace(/"/g, '&quot;') + '"');
      return '<a class="ai-suggestion-pill" ' + attrs.join(' ') + '><span class="ai-suggestion-icon">' + (s.icon || '→') + '</span>' + (s.label || '') + '</a>';
    }).join('');

    return '<div class="ai-suggestions-bar" id="aiSuggestionsBar" role="complementary" aria-label="Suggestions de l’assistant IA">' +
      '<span class="ai-suggestions-label">L\'IA vous suggère</span>' +
      '<div class="ai-suggestions-pills">' + pills + '</div>' +
      '<div class="ai-suggestions-dynamic" id="aiSuggestionsDynamic"></div>' +
      '</div>';
  }

  function buildContextForAI() {
    var parts = ['Page: ' + ctx];
    if (projectId && typeof PMHUB !== 'undefined') {
      var p = PMHUB.getProjectById && PMHUB.getProjectById(projectId);
      if (p) parts.push('Projet: ' + (p.name || p.ref || projectId));
    }
    if (ctx === 'raid' && typeof PMHUB !== 'undefined' && projectId) {
      var r = PMHUB.getRaids && PMHUB.getRaids(projectId);
      if (r) {
        var n = (r.risks && r.risks.length) || 0; var a = (r.actions && r.actions.length) || 0;
        parts.push('Risques: ' + n + ', Actions: ' + a);
      }
    }
    if (ctx === 'dashboard' && typeof PMHUB !== 'undefined') {
      var list = PMHUB.getProjects && PMHUB.getProjects();
      if (list) parts.push('Nombre de projets: ' + list.length);
    }
    return parts.join('. ');
  }

  function fetchDynamicSuggestions() {
    var wrap = document.getElementById('aiSuggestionsDynamic');
    if (!wrap || typeof PMHUB === 'undefined' || !PMHUB.isAIEnabled || !PMHUB.isAIEnabled()) return;

    var ctxStr = buildContextForAI();
    var sys = 'Tu es un assistant PM. Réponds UNIQUEMENT par 1 ou 2 courtes suggestions d\'action (une par ligne, max 6 mots chacune). Pas de numérotation, pas de tiret. Exemple:\nVérifier le RAID\nRelancer le sponsor';
    var user = 'Contexte: ' + ctxStr + '. Quelles 1 ou 2 actions prioritaires suggères-tu maintenant ?';

    wrap.innerHTML = '<span class="ai-suggestions-dynamic-loading">Suggestions IA…</span>';
    PMHUB.callAI(sys, user).then(function(text) {
      var lines = (text || '').split(/\n/).map(function(s) { return s.replace(/^[\s\-•*]+/, '').trim(); }).filter(function(s) { return s.length > 0 && s.length < 80; }).slice(0, 2);
      if (lines.length === 0) { wrap.innerHTML = ''; return; }
      var aiPills = lines.map(function(label) {
        var href = 'pm-hub-ai.html?from=' + encodeURIComponent(ctx) + (projectId ? '&project=' + encodeURIComponent(projectId) : '') + '&q=' + encodeURIComponent(label);
        return '<a class="ai-suggestion-pill ai-suggestion-pill-dynamic" href="' + href + '"><span class="ai-suggestion-icon">🤖</span>' + (label.replace(/</g, '&lt;')) + '</a>';
      }).join('');
      wrap.innerHTML = aiPills;
    }).catch(function() { wrap.innerHTML = ''; });
  }

  function init() {
    var container = document.getElementById('ai-suggestions-bar');
    if (!container || ctx === 'ai' || ctx === 'wizard') return;
    var html = buildBar();
    if (!html) return;
    container.innerHTML = html;
    container.classList.add('ai-suggestions-bar-visible');
    setTimeout(fetchDynamicSuggestions, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
