/**
 * Hub Unifié — Navigation contextuelle
 * Fusionne pmhub-nav-context.js + delhub-nav-context.js
 * Onglets du groupe actif dans la barre du haut.
 */
(function() {
  'use strict';

  var path = (document.location.pathname || '').split('/').pop() || '';

  // ── PM GROUPS ─────────────────────────────────────────────
  var PM_GROUPS = [
    { id: 'dashboard',  label: 'Dashboard', first: 'pm-hub.html', pages: [{ name: 'Vue d\'ensemble', href: 'pm-hub.html', icon: '\u{1F3E0}' }] },
    { id: 'planning',   label: 'Planning', first: 'pm-hub-gantt.html', pages: [
      { name: 'Gantt',    href: 'pm-hub-gantt.html',  icon: '\u{1F4C5}', methodologies: ['waterfall','hybride'] },
      { name: 'WBS',      href: 'pm-hub-wbs.html',    icon: '\u{1F333}', methodologies: ['waterfall','hybride'] },
      { name: 'Kanban',   href: 'pm-hub-kanban.html', icon: '\u{1F4CB}', methodologies: ['agile','hybride'] },
      { name: 'Sprints',  href: 'pm-hub-agile.html',  icon: '\u{1F504}', methodologies: ['agile','hybride'] }
    ]},
    { id: 'raid',       label: 'RAID', first: 'pm-hub-raid.html', pages: [{ name: 'RAID & Risques', href: 'pm-hub-raid.html', icon: '\u26A0\uFE0F' }] },
    { id: 'resources',  label: 'Ressources', first: 'pm-hub-resources.html', pages: [{ name: '\u00C9quipe & Charge', href: 'pm-hub-resources.html', icon: '\u{1F465}' }] },
    { id: 'budget',     label: 'Budget', first: 'pm-hub-budget.html', pages: [{ name: 'Budget / EVM', href: 'pm-hub-budget.html', icon: '\u{1F4B0}' }] },
    { id: 'portfolio',  label: 'Portefeuille', first: 'pm-hub-portfolio.html', pages: [{ name: 'Dashboard portefeuille', href: 'pm-hub-portfolio.html', icon: '\u{1F4CA}' }] },
    { id: 'executive',  label: 'COMEX', first: 'pm-hub-executive.html', pages: [{ name: 'Vue direction', href: 'pm-hub-executive.html', icon: '\u{1F3AF}' }] },
    { id: 'ai',         label: 'Centre IA', first: 'pm-hub-ai.html', pages: [
      { name: 'Accueil',      href: 'pm-hub-ai.html',          icon: '\u{1F3E0}' },
      { name: 'Assistant',    href: 'pm-hub-ai-chat.html',     icon: '\u{1F4AC}' },
      { name: 'Analyse RAID', href: 'pm-hub-ai-raid.html',     icon: '\u26A0\uFE0F' },
      { name: 'R\u00E9dacteur PM', href: 'pm-hub-ai-redac.html',    icon: '\u270D\uFE0F' },
      { name: 'Briefing',     href: 'pm-hub-ai-briefing.html', icon: '\u{1F4CA}' },
      { name: 'Livrables',    href: 'pm-hub-ai-livrable.html', icon: '\u26A1' }
    ]},
    { id: 'documents',  label: 'Documents', first: 'pm-hub-report.html', pages: [{ name: 'Rapport de statut', href: 'pm-hub-report.html', icon: '\u{1F4C4}' }] },
    { id: 'governance', label: 'Gouvernance', first: 'pm-hub-governance.html', pages: [{ name: 'Gouvernance', href: 'pm-hub-governance.html', icon: '\u{1F3DB}\uFE0F' }, { name: 'Pilotage', href: 'pm-hub-transverse.html', icon: '\u{1F3AF}' }] },
    { id: 'knowledge',  label: 'Base de connaissance', first: 'pm-hub-knowledge.html', pages: [{ name: 'Lessons learned', href: 'pm-hub-knowledge.html', icon: '\u{1F4DA}' }] },
    { id: 'config',     label: 'Param\u00E8tres', first: 'pm-hub-settings.html', pages: [{ name: 'Param\u00E8tres', href: 'pm-hub-settings.html', icon: '\u2699\uFE0F' }] }
  ];

  // ── HUB UNIFIED GROUPS ────────────────────────────────────
  var HUB_GROUPS = [
    { id: 'hub-ai', label: 'Centre IA', first: 'hub-ai.html', pages: [
      { name: 'Centre IA Unifie', href: 'hub-ai.html', icon: '\u{1F916}' }
    ]}
  ];

  // ── DEL GROUPS ────────────────────────────────────────────
  var DEL_GROUPS = [
    { id: 'del-dashboard', label: 'Dashboard', first: 'delhub-dashboard.html', pages: [
      { name: 'Vue d\'ensemble', href: 'delhub-dashboard.html', icon: '\u{1F3E0}' }
    ]},
    { id: 'crm', label: 'CRM', first: 'delhub-crm.html', pages: [
      { name: 'Prospects',    href: 'delhub-crm.html',       icon: '\u{1F3AF}' },
      { name: 'Propositions', href: 'delhub-proposals.html', icon: '\u{1F4DD}' },
      { name: 'Forecasting',  href: 'delhub-forecast.html',  icon: '\u{1F4C8}' }
    ]},
    { id: 'business', label: 'Business', first: 'delhub-contracts.html', pages: [
      { name: 'Contrats',     href: 'delhub-contracts.html', icon: '\u{1F4CB}' },
      { name: 'P&L',          href: 'delhub-pnl.html',      icon: '\u{1F4B0}' },
      { name: 'Portefeuille', href: 'delhub-portfolio.html', icon: '\u{1F4CA}' }
    ]},
    { id: 'delivery', label: 'Delivery', first: 'delhub-pipeline.html', pages: [
      { name: 'Pipeline',     href: 'delhub-pipeline.html',  icon: '\u{1F680}' },
      { name: 'SLA',          href: 'delhub-sla.html',       icon: '\u{1F3AF}' },
      { name: 'Capacity',     href: 'delhub-capacity.html',  icon: '\u{1F465}' },
      { name: 'Releases',     href: 'delhub-releases.html',  icon: '\u{1F4C5}' },
      { name: 'Incidents',    href: 'delhub-incidents.html',  icon: '\u{1F6A8}' }
    ]},
    { id: 'exec', label: 'Exec', first: 'delhub-exec.html', pages: [
      { name: 'Tableau Exec', href: 'delhub-exec.html',    icon: '\u{1F3DB}\uFE0F' },
      { name: 'Rapports',     href: 'delhub-reports.html',  icon: '\u{1F4C4}' }
    ]},
    { id: 'del-ai', label: 'Centre IA', first: 'delhub-ai.html', pages: [
      { name: 'Centre IA', href: 'delhub-ai.html', icon: '\u{1F916}' }
    ]},
    { id: 'del-admin', label: 'Admin', first: 'delhub-admin.html', pages: [
      { name: 'Utilisateurs', href: 'delhub-admin.html', icon: '\u{1F451}' }
    ]},
    { id: 'del-config', label: 'Param\u00E8tres', first: 'delhub-settings.html', pages: [
      { name: 'Param\u00E8tres', href: 'delhub-settings.html', icon: '\u2699\uFE0F' }
    ]}
  ];

  var ALL_GROUPS = PM_GROUPS.concat(HUB_GROUPS).concat(DEL_GROUPS);

  // Build page→group map
  var PAGE_TO_GROUP = {};
  ALL_GROUPS.forEach(function(g) {
    g.pages.forEach(function(p) {
      var key = (p.href || '').split('?')[0];
      PAGE_TO_GROUP[key] = g.id;
    });
  });
  // Aliases
  PAGE_TO_GROUP['index.html'] = 'dashboard';
  PAGE_TO_GROUP['pm-hub-project.html'] = 'dashboard';
  PAGE_TO_GROUP['pm-hub-agile.html'] = 'planning';
  PAGE_TO_GROUP['pm-hub-wbs.html'] = 'planning';
  PAGE_TO_GROUP['pm-hub-templates.html'] = 'documents';
  PAGE_TO_GROUP['pm-hub-transverse.html'] = 'governance';

  function getCurrentGroup() {
    var key = path;
    if (key === 'index.html') key = 'pm-hub.html';
    return PAGE_TO_GROUP[key] || 'dashboard';
  }

  function getGroupById(id) {
    return ALL_GROUPS.filter(function(g) { return g.id === id; })[0] || ALL_GROUPS[0];
  }

  function renderNavContext() {
    var container = document.getElementById('nav-context');
    if (!container) return;
    var g = getGroupById(getCurrentGroup());

    // Filter PM pages by methodology
    var currentMethodology = '';
    try {
      var urlProjId = new URLSearchParams(window.location.search).get('project') || localStorage.getItem('pmhub_current_project');
      if (urlProjId && typeof PMHUB !== 'undefined' && PMHUB.getProjectById) {
        var cp = PMHUB.getProjectById(urlProjId);
        if (cp) currentMethodology = cp.methodology || '';
      }
    } catch(e) {}

    var pages = g.pages.filter(function(p) {
      if (!p.methodologies || !currentMethodology) return true;
      return p.methodologies.indexOf(currentMethodology) !== -1;
    });

    var html = pages.map(function(p) {
      var isActive;
      var attrs;
      if (p.panel) {
        var activeEl = document.querySelector('.panel.active');
        var activePanel = activeEl ? (activeEl.id || '').replace('panel-', '') : '';
        isActive = (p.panel === activePanel);
        attrs = ' class="nav-tab' + (isActive ? ' active' : '') + '" data-panel="' + p.panel + '" href="#" onclick="if(typeof showPanel===\'function\')showPanel(\'' + p.panel + '\'); return false;"';
      } else {
        isActive = (p.href === path || (path === 'index.html' && (p.href === 'pm-hub.html' || p.href === 'delhub-dashboard.html')));
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
