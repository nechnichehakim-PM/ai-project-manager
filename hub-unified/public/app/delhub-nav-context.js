/**
 * DelHub — Navigation contextuelle
 * Onglets du groupe actif dans la barre du haut.
 */
(function() {
  'use strict';

  var path = (document.location.pathname || '').split('/').pop() || '';

  var GROUPS = [
    { id: 'dashboard', label: 'Dashboard', first: 'delhub-dashboard.html', pages: [
      { name: 'Vue d\'ensemble', href: 'delhub-dashboard.html', icon: '🏠' }
    ]},
    { id: 'crm', label: 'CRM', first: 'delhub-crm.html', pages: [
      { name: 'Prospects',    href: 'delhub-crm.html',       icon: '🎯' },
      { name: 'Propositions', href: 'delhub-proposals.html', icon: '📝' },
      { name: 'Forecasting',  href: 'delhub-forecast.html',  icon: '📈' }
    ]},
    { id: 'business', label: 'Business', first: 'delhub-contracts.html', pages: [
      { name: 'Contrats',     href: 'delhub-contracts.html', icon: '📋' },
      { name: 'P&L',          href: 'delhub-pnl.html',      icon: '💰' },
      { name: 'Portefeuille', href: 'delhub-portfolio.html', icon: '📊' }
    ]},
    { id: 'delivery', label: 'Delivery', first: 'delhub-pipeline.html', pages: [
      { name: 'Pipeline',     href: 'delhub-pipeline.html',  icon: '🚀' },
      { name: 'SLA',          href: 'delhub-sla.html',       icon: '🎯' },
      { name: 'Capacity',     href: 'delhub-capacity.html',  icon: '👥' },
      { name: 'Releases',     href: 'delhub-releases.html',  icon: '📅' },
      { name: 'Incidents',    href: 'delhub-incidents.html',  icon: '🚨' }
    ]},
    { id: 'exec', label: 'Exec', first: 'delhub-exec.html', pages: [
      { name: 'Tableau Exec', href: 'delhub-exec.html',    icon: '🏛️' },
      { name: 'Rapports',     href: 'delhub-reports.html',  icon: '📄' }
    ]},
    { id: 'ai', label: 'Centre IA', first: 'delhub-ai.html', pages: [
      { name: 'Centre IA', href: 'delhub-ai.html', icon: '🤖' }
    ]},
    { id: 'admin', label: 'Admin', first: 'delhub-admin.html', pages: [
      { name: 'Utilisateurs', href: 'delhub-admin.html', icon: '👑' }
    ]},
    { id: 'config', label: 'Paramètres', first: 'delhub-settings.html', pages: [
      { name: 'Paramètres', href: 'delhub-settings.html', icon: '⚙️' }
    ]}
  ];

  var PAGE_TO_GROUP = {};
  GROUPS.forEach(function(g) {
    g.pages.forEach(function(p) {
      var key = (p.href || '').split('?')[0];
      PAGE_TO_GROUP[key] = g.id;
    });
  });
  PAGE_TO_GROUP['index.html'] = 'dashboard';

  function getCurrentGroup() {
    var key = path === 'index.html' ? 'delhub-dashboard.html' : path;
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
      var isActive = (p.href === path || (path === 'index.html' && p.href === 'delhub-dashboard.html'));
      return '<a class="nav-tab' + (isActive ? ' active' : '') + '" href="' + (p.href || '#') + '">' +
        (p.icon ? '<span class="nav-tab-icon">' + p.icon + '</span>' : '') + p.name + '</a>';
    }).join('');
    container.innerHTML = html;
  }

  function init() {
    renderNavContext();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
