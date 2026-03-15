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
      '</div>';
  }

  function init() {
    var container = document.getElementById('ai-suggestions-bar');
    if (!container || ctx === 'ai' || ctx === 'wizard') return;
    var html = buildBar();
    if (!html) return;
    container.innerHTML = html;
    container.classList.add('ai-suggestions-bar-visible');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
