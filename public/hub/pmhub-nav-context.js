/**
 * PM Hub — Navigation contextuelle
 * Sidebar = uniquement les groupes (rubriques).
 * Barre du haut = liens du groupe actif (fonctionnalités).
 */
(function() {
  'use strict';

  var path = (document.location.pathname || '').split('/').pop() || '';

  var GROUPS = [
    { id: 'dashboard',  label: "Vue d'ensemble",  first: 'pm-hub.html',  pages: [{ name: 'Dashboard', href: 'pm-hub.html', icon: '🏠' }] },
    { id: 'planning',   label: 'Planning & exécution', first: 'pm-hub-gantt.html', pages: [{ name: 'Planning Gantt', href: 'pm-hub-gantt.html', icon: '📅' }, { name: 'Kanban', href: 'pm-hub-kanban.html', icon: '📋' }] },
    { id: 'governance', label: 'Suivi & gouvernance', first: 'pm-hub-raid.html', pages: [{ name: 'RAID Log', href: 'pm-hub-raid.html', icon: '⚠️' }, { name: 'Reporting', href: 'pm-hub-report.html', icon: '📊' }, { name: 'Pilotage', href: 'pm-hub-transverse.html', icon: '🎯' }] },
    { id: 'resources',  label: 'Ressources & bibliothèque', first: 'pm-hub-resources.html', pages: [{ name: 'Ressources', href: 'pm-hub-resources.html', icon: '👥' }, { name: 'Templates', href: 'pm-hub-templates.html', icon: '📄' }] },
    { id: 'config',     label: 'Configuration', first: 'pm-hub-settings.html', pages: [{ name: 'Paramètres', href: 'pm-hub-settings.html', icon: '⚙️' }] }
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
    var html = g.pages.map(function(p) {
      var isActive = (p.href === path || (path === 'index.html' && p.href === 'pm-hub.html'));
      return '<a class="nav-tab' + (isActive ? ' active' : '') + '" href="' + (p.href || '#') + '">' + (p.icon ? '<span class="nav-tab-icon">' + p.icon + '</span>' : '') + p.name + '</a>';
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
