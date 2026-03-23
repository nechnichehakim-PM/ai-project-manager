/**
 * PM Hub — Navigation contextuelle
 * Sidebar = uniquement les groupes (rubriques).
 * Barre du haut = liens du groupe actif (fonctionnalités).
 */
(function() {
  'use strict';

  var path = (document.location.pathname || '').split('/').pop() || '';

  var GROUPS = [
    { id: 'dashboard',  label: 'Dashboard', first: 'pm-hub.html', pages: [{ name: 'Vue d\'ensemble', href: 'pm-hub.html', icon: '🏠' }] },
    { id: 'planning',   label: 'Planning', first: 'pm-hub-gantt.html', pages: [
      { name: 'Gantt',    href: 'pm-hub-gantt.html',  icon: '📅', methodologies: ['waterfall','hybride'] },
      { name: 'Kanban',   href: 'pm-hub-kanban.html', icon: '📋', methodologies: ['agile','hybride'] },
      { name: 'Sprints',  href: 'pm-hub-agile.html',  icon: '🔄', methodologies: ['agile','hybride'] }
    ]},
    { id: 'raid',       label: 'RAID', first: 'pm-hub-raid.html', pages: [{ name: 'RAID & Risques', href: 'pm-hub-raid.html', icon: '⚠️' }] },
    { id: 'resources',  label: 'Ressources', first: 'pm-hub-resources.html', pages: [{ name: 'Équipe & Charge', href: 'pm-hub-resources.html', icon: '👥' }] },
    { id: 'budget',     label: 'Budget', first: 'pm-hub-budget.html', pages: [{ name: 'Budget / EVM', href: 'pm-hub-budget.html', icon: '💰' }] },
    { id: 'portfolio',  label: 'Portefeuille', first: 'pm-hub-portfolio.html', pages: [{ name: 'Dashboard portefeuille', href: 'pm-hub-portfolio.html', icon: '📊' }] },
    { id: 'executive',  label: 'COMEX', first: 'pm-hub-executive.html', pages: [{ name: 'Vue direction', href: 'pm-hub-executive.html', icon: '🎯' }] },
    { id: 'ai',         label: 'Centre IA', first: 'pm-hub-ai.html', pages: [
      { name: 'Accueil', panel: 'dashboard', icon: '🏠' },
      { name: 'Assistant', panel: 'chat', icon: '💬' },
      { name: 'Analyse RAID', panel: 'raid', icon: '⚠️' },
      { name: 'Rédacteur PM', panel: 'redac', icon: '✍️' },
      { name: 'Briefing', panel: 'briefing', icon: '📊' },
      { name: 'Livrables', panel: 'livrable', icon: '⚡' }
    ]},
    { id: 'documents',  label: 'Documents', first: 'pm-hub-report.html', pages: [{ name: 'Rapport de statut', href: 'pm-hub-report.html', icon: '📄' }] },
    { id: 'governance', label: 'Gouvernance', first: 'pm-hub-governance.html', pages: [{ name: 'Gouvernance', href: 'pm-hub-governance.html', icon: '🏛️' }, { name: 'Pilotage', href: 'pm-hub-transverse.html', icon: '🎯' }] },
    { id: 'knowledge',  label: 'Base de connaissance', first: 'pm-hub-knowledge.html', pages: [{ name: 'Lessons learned', href: 'pm-hub-knowledge.html', icon: '📚' }] },
    { id: 'config',     label: 'Paramètres', first: 'pm-hub-settings.html', pages: [{ name: 'Paramètres', href: 'pm-hub-settings.html', icon: '⚙️' }] }
  ];

  var PAGE_TO_GROUP = {};
  GROUPS.forEach(function(g) {
    g.pages.forEach(function(p) {
      var key = (p.href || '').split('?')[0];
      PAGE_TO_GROUP[key] = g.id;
    });
  });
  PAGE_TO_GROUP['index.html'] = 'dashboard';
  PAGE_TO_GROUP['pm-hub-project.html'] = 'dashboard';
  PAGE_TO_GROUP['pm-hub-ai.html'] = 'ai';
  PAGE_TO_GROUP['pm-hub-budget.html'] = 'budget';
  PAGE_TO_GROUP['pm-hub-portfolio.html'] = 'portfolio';
  PAGE_TO_GROUP['pm-hub-executive.html'] = 'executive';
  PAGE_TO_GROUP['pm-hub-governance.html'] = 'governance';
  PAGE_TO_GROUP['pm-hub-knowledge.html'] = 'knowledge';
  PAGE_TO_GROUP['pm-hub-raid.html'] = 'raid';
  PAGE_TO_GROUP['pm-hub-agile.html'] = 'planning';
  PAGE_TO_GROUP['pm-hub-report.html'] = 'documents';
  PAGE_TO_GROUP['pm-hub-templates.html'] = 'documents';
  PAGE_TO_GROUP['pm-hub-transverse.html'] = 'governance';

  function getCurrentGroup() {
    var key = path === 'index.html' ? 'pm-hub.html' : path;
    return PAGE_TO_GROUP[key] || PAGE_TO_GROUP[path] || 'dashboard';
  }

  function getGroupById(id) {
    return GROUPS.filter(function(g) { return g.id === id; })[0] || GROUPS[0];
  }

  function renderNavContext() {
    var container = document.getElementById('nav-context');
    if (!container) return;
    var g = getGroupById(getCurrentGroup());
    var isAI = g.id === 'ai';
    var activePanel = '';
    if (isAI) {
      var activeEl = document.querySelector('.panel.active');
      activePanel = activeEl ? (activeEl.id || '').replace('panel-', '') : 'chat';
    }
    // Détection méthodologie projet courant (URL > localStorage)
    var currentMethodologyNav = '';
    try {
      var urlProjId = new URLSearchParams(window.location.search).get('project') || localStorage.getItem('pmhub_current_project');
      if (urlProjId && typeof PMHUB !== 'undefined' && PMHUB.getProjectById) {
        var cp = PMHUB.getProjectById(urlProjId);
        if (cp) currentMethodologyNav = cp.methodology || '';
      }
    } catch(e) {}
    var pages = g.pages.filter(function(p) {
      if (!p.methodologies || !isAgileProject && !currentMethodologyNav) return true;
      return !p.methodologies || p.methodologies.indexOf(currentMethodologyNav) !== -1;
    });
    var html = pages.map(function(p, i) {
      var isActive;
      var attrs;
      if (p.panel) {
        isActive = (p.panel === activePanel);
        attrs = ' class="nav-tab' + (isActive ? ' active' : '') + '" data-panel="' + p.panel + '" href="#" onclick="if(typeof showPanel===\'function\')showPanel(\'' + p.panel + '\'); return false;"';
      } else {
        isActive = (p.href === path || (path === 'index.html' && p.href === 'pm-hub.html'));
        attrs = ' class="nav-tab' + (isActive ? ' active' : '') + '" href="' + (p.href || '#') + '"';
      }
      return '<a' + attrs + '>' + (p.icon ? '<span class="nav-tab-icon">' + p.icon + '</span>' : '') + p.name + '</a>';
    }).join('');
    container.innerHTML = html;
  }

  function highlightSidebarGroup() {
    var current = getCurrentGroup();
    document.querySelectorAll('.sb-group').forEach(function(el) {
      if (el.getAttribute('data-group') === current) el.classList.add('active');
      else el.classList.remove('active');
    });
  }

  function init() {
    renderNavContext();
    highlightSidebarGroup();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
