/**
 * Hub Unifié — Sidebar dynamique par rôle
 * Fusionne pmhub-sidebar.js + delhub-sidebar.js
 * Sections PM (Portefeuille, Projet, Outils PM) + Del (Admin, Pilotage, Commercial, Business, Delivery, Outils)
 */
(function() {
  'use strict';

  var path = (document.location.pathname || '').split('/').pop() || '';
  if (path === 'index.html') path = 'pm-hub.html';

  var STORAGE_KEY = 'hub_sidebar_open_';

  // ── Rôle utilisateur ──
  var profile = {};
  try { profile = JSON.parse(localStorage.getItem('hub_profile') || localStorage.getItem('delhub_profile') || localStorage.getItem('pmhub_profile') || '{}'); } catch(e) {}
  var baseRole = profile.role || 'pm';
  var simulated = sessionStorage.getItem('hub_simulated_role') || sessionStorage.getItem('delhub_simulated_role');
  var role = (simulated && baseRole === 'god') ? simulated : baseRole;
  var isGod = baseRole === 'god';

  // ── Projet actif (pour les pages PM) ──
  var activeProject = null;
  try {
    if (typeof PMHUB !== 'undefined') {
      var pid = new URLSearchParams(window.location.search).get('project');
      if (pid) activeProject = PMHUB.getProjectById(pid);
      if (!activeProject) {
        var projects = PMHUB.getProjects();
        activeProject = projects.find(function(p) { return p.status === 'active'; }) || projects[0] || null;
      }
    }
  } catch(e) {}

  var methodology = activeProject ? (activeProject.methodology || 'waterfall') : 'waterfall';

  // ── Structure sidebar unifiée ──
  var SIDEBAR_SECTIONS = [
    // ─── ADMIN (GOD only) ───
    {
      sectionLabel: 'Admin',
      roles: ['god'],
      groups: [
        { label: 'Administration', links: [
          { name: 'Gestion utilisateurs', href: 'delhub-admin.html', icon: '👑' }
        ]}
      ]
    },
    // ─── PM HUB — PORTEFEUILLE ───
    {
      sectionLabel: 'Portefeuille',
      roles: ['god', 'pm', 'delivery', 'head'],
      groups: [
        { label: 'Tableau de bord', links: [
          { name: 'Dashboard',    href: 'pm-hub.html',            icon: '📊' },
          { name: 'Portfolio',    href: 'pm-hub-portfolio.html',  icon: '📁' },
          { name: 'COMEX',        href: 'pm-hub-executive.html',  icon: '🏛️' },
          { name: 'Transverse',   href: 'pm-hub-transverse.html', icon: '🔀' },
        ]}
      ]
    },
    // ─── PM HUB — PROJET ───
    {
      sectionLabel: 'Projet',
      roles: ['god', 'pm', 'delivery', 'head'],
      groups: [
        { label: 'Planification', links: [
          { name: 'Gantt',      href: 'pm-hub-gantt.html',    icon: '📅', methodologies: ['waterfall', 'hybride'] },
          { name: 'WBS',        href: 'pm-hub-wbs.html',      icon: '🌳', methodologies: ['waterfall', 'hybride'] },
          { name: 'Kanban',     href: 'pm-hub-kanban.html',   icon: '📋' },
          { name: 'Sprints',    href: 'pm-hub-agile.html',    icon: '🔄', methodologies: ['agile', 'hybride'] },
        ]},
        { label: 'Suivi & Contrôle', links: [
          { name: 'RAID',        href: 'pm-hub-raid.html',       icon: '⚠️' },
          { name: 'Budget / EVM', href: 'pm-hub-budget.html',    icon: '💰' },
          { name: 'Ressources',  href: 'pm-hub-resources.html',  icon: '👥' },
        ]},
        { label: 'Gouvernance', links: [
          { name: 'Gouvernance', href: 'pm-hub-governance.html', icon: '🏛️' },
          { name: 'Rapports',    href: 'pm-hub-report.html',     icon: '📄' },
        ]}
      ]
    },
    // ─── PM HUB — OUTILS ───
    {
      sectionLabel: 'Outils PM',
      roles: ['god', 'pm'],
      groups: [
        { label: 'Centre IA', links: [
          { name: 'Centre IA Unifié', href: 'hub-ai.html',              icon: '🤖' },
          { name: 'Analyse RAID',     href: 'pm-hub-ai-raid.html',     icon: '🔍' },
          { name: 'Rédacteur PM',     href: 'pm-hub-ai-redac.html',    icon: '✍️' },
          { name: 'Briefing',         href: 'pm-hub-ai-briefing.html', icon: '📋' },
          { name: 'Livrables',        href: 'pm-hub-ai-livrable.html', icon: '📦' },
        ]},
        { label: 'Bibliothèque', links: [
          { name: 'Templates',      href: 'pm-hub-templates.html',  icon: '📑' },
          { name: 'Knowledge Base', href: 'pm-hub-knowledge.html',  icon: '📚' },
        ]}
      ]
    },
    // ─── DELHUB — PILOTAGE ───
    {
      sectionLabel: 'Pilotage',
      roles: ['god', 'head'],
      groups: [
        { label: 'Direction', links: [
          { name: 'Dashboard Del',      href: 'delhub-dashboard.html', icon: '🏠' },
          { name: 'Tableau Exec',       href: 'delhub-exec.html',      icon: '🏛️' },
          { name: 'Rapports consolidés', href: 'delhub-reports.html',  icon: '📄' },
        ]}
      ]
    },
    // ─── DELHUB — COMMERCIAL ───
    {
      sectionLabel: 'Commercial',
      roles: ['god', 'sales', 'business', 'head'],
      groups: [
        { label: 'Pipeline', links: [
          { name: 'CRM / Prospects',      href: 'delhub-crm.html',       icon: '🎯' },
          { name: 'Propositions & Devis', href: 'delhub-proposals.html', icon: '📝' },
          { name: 'Forecasting',          href: 'delhub-forecast.html',  icon: '📈' },
        ]}
      ]
    },
    // ─── DELHUB — BUSINESS ───
    {
      sectionLabel: 'Business',
      roles: ['god', 'business', 'delivery', 'head'],
      groups: [
        { label: 'Gestion', links: [
          { name: 'Contrats & Scope',  href: 'delhub-contracts.html', icon: '📋' },
          { name: 'P&L / Marges',      href: 'delhub-pnl.html',      icon: '💰' },
          { name: 'Portefeuille Biz',  href: 'delhub-portfolio.html', icon: '📊' },
        ]}
      ]
    },
    // ─── DELHUB — DELIVERY ───
    {
      sectionLabel: 'Delivery',
      roles: ['god', 'delivery', 'head'],
      groups: [
        { label: 'Livraison', links: [
          { name: 'Pipeline Delivery',     href: 'delhub-pipeline.html',  icon: '🚀' },
          { name: 'SLA & Engagements',     href: 'delhub-sla.html',       icon: '🎯' },
          { name: 'Capacity Planning',     href: 'delhub-capacity.html',  icon: '👥' },
          { name: 'Release Calendar',      href: 'delhub-releases.html',  icon: '📅' },
          { name: 'Incidents & Escalades', href: 'delhub-incidents.html', icon: '🚨' },
        ]}
      ]
    },
    // ─── OUTILS COMMUNS ───
    {
      sectionLabel: 'Outils',
      roles: ['god', 'delivery', 'business', 'sales', 'head'],
      groups: [
        { label: 'IA & Config', links: [
          { name: 'Centre IA Unifié', href: 'hub-ai.html', icon: '🤖' },
        ]}
      ]
    },
    // ─── PARAMÈTRES (tous) ───
    {
      sectionLabel: 'Paramètres',
      roles: ['god', 'pm', 'delivery', 'business', 'sales', 'head'],
      groups: [
        { label: 'Configuration', links: [
          { name: 'Paramètres',   href: 'pm-hub-settings.html', icon: '⚙️' },
        ]}
      ]
    }
  ];

  // Roles sans section Pilotage → ajouter un lien Dashboard en tête de leur section principale
  if (role === 'sales') {
    SIDEBAR_SECTIONS.forEach(function(s) {
      if (s.sectionLabel === 'Commercial') {
        s.groups[0].links.unshift({ name: 'Dashboard', href: 'delhub-dashboard.html', icon: '🏠' });
      }
    });
  }
  if (role === 'delivery') {
    SIDEBAR_SECTIONS.forEach(function(s) {
      if (s.sectionLabel === 'Delivery') {
        s.groups[0].links.unshift({ name: 'Dashboard', href: 'delhub-dashboard.html', icon: '🏠' });
      }
    });
  }
  if (role === 'business') {
    SIDEBAR_SECTIONS.forEach(function(s) {
      if (s.sectionLabel === 'Business') {
        s.groups[0].links.unshift({ name: 'Dashboard', href: 'delhub-dashboard.html', icon: '🏠' });
      }
    });
  }

  // Filtrer par rôle
  var visibleSections = SIDEBAR_SECTIONS.filter(function(s) {
    return s.roles.indexOf(role) !== -1;
  });

  // ── Helpers ──
  function isActive(href) {
    if (!href) return false;
    var h = href.split('?')[0];
    return path === h || (path === '' && h === 'pm-hub.html');
  }

  function groupContainsActive(grp) {
    return grp.links.some(function(link) { return isActive(link.href); });
  }

  function getSectionOpen(grpLabel) {
    try {
      var key = STORAGE_KEY + grpLabel.replace(/\s+/g, '_');
      var stored = localStorage.getItem(key);
      if (stored !== null) return stored === '1';
    } catch (e) {}
    return null;
  }

  function setSectionOpen(grpLabel, open) {
    try {
      var key = STORAGE_KEY + grpLabel.replace(/\s+/g, '_');
      localStorage.setItem(key, open ? '1' : '0');
    } catch (e) {}
  }

  function linkMatchesMethodology(link) {
    if (!link.methodologies) return true;
    return link.methodologies.indexOf(methodology) !== -1;
  }

  function getRoleLabel(r) {
    var labels = {
      god: 'GOD / Admin', head: 'Head / C-Level', business: 'Business Manager',
      delivery: 'Delivery Manager', sales: 'Sales / Commercial', pm: 'Chef de Projet'
    };
    return labels[r] || r;
  }

  // ── Render ──
  function render() {
    var sidebar = document.getElementById('hub-sidebar') || document.getElementById('pmhub-sidebar') || document.getElementById('delhub-sidebar');
    if (!sidebar) return;

    var html = '';

    // Profile card
    var displayName = profile.name || 'Utilisateur';
    var initials = displayName.charAt(0).toUpperCase();
    html += '<div class="sb-profile">';
    html += '<div class="sb-avatar">' + initials + '</div>';
    html += '<div class="sb-name">' + displayName + '</div>';
    html += '<div class="sb-role">' + getRoleLabel(baseRole) + '</div>';
    if (isGod) {
      html += '<div class="sb-badges">';
      html += '<span class="sb-badge role-badge-god" style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:9px;font-weight:700;letter-spacing:0.1em">GOD MODE</span>';
      if (simulated) {
        html += ' <span class="sb-badge" style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:9px;font-weight:600;background:rgba(245,158,11,0.15);color:#F59E0B;border:1px solid rgba(245,158,11,0.3)">Vue: ' + simulated + '</span>';
      }
      html += '</div>';
    }
    html += '</div>';

    // Active project chip (PM pages)
    if (activeProject && ['god','pm','delivery','head'].indexOf(role) !== -1) {
      html += '<div style="padding:4px 16px 8px">';
      html += '<div class="proj-chip" style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);font-size:11px">';
      html += '<span style="font-size:14px">' + (activeProject.icon || '📂') + '</span>';
      html += '<div style="min-width:0">';
      html += '<div style="font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + activeProject.name + '</div>';
      html += '<div style="font-size:9px;color:var(--text-muted);font-family:var(--font-mono)">' + (activeProject.methodology || '').toUpperCase() + '</div>';
      html += '</div></div></div>';
    }

    // GOD: role switcher + simulation banner
    if (isGod) {
      html += '<div style="padding:6px 16px;margin-bottom:8px">';
      html += '<div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:var(--radius-sm);padding:8px 10px">';
      html += '<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--warning);margin-bottom:6px">Voir comme</div>';
      html += '<div style="display:flex;flex-wrap:wrap;gap:4px">';
      var roleOptions = [
        { key:'god', label:'GOD', color:'#F59E0B' },
        { key:'pm', label:'CDP', color:'#818CF8' },
        { key:'delivery', label:'Del', color:'#2DD4BF' },
        { key:'business', label:'Biz', color:'#F43F5E' },
        { key:'sales', label:'Sales', color:'#F97316' },
        { key:'head', label:'Head', color:'#A855F7' }
      ];
      roleOptions.forEach(function(opt) {
        var isCurrent = (!simulated && opt.key === 'god') || (simulated === opt.key);
        html += '<button onclick="window._hubSwitchRole(\'' + opt.key + '\')" style="padding:3px 8px;border-radius:12px;font-size:9px;font-weight:600;border:1px solid ' + (isCurrent ? opt.color : 'var(--border)') + ';background:' + (isCurrent ? opt.color + '22' : 'transparent') + ';color:' + (isCurrent ? opt.color : 'var(--text-muted)') + ';cursor:pointer;transition:all 0.15s">' + opt.label + '</button>';
      });
      html += '</div></div></div>';
    }

    // Sections
    visibleSections.forEach(function(section) {
      html += '<div class="sb-section">';
      html += '<div class="sb-section-label">' + section.sectionLabel + '</div>';

      section.groups.forEach(function(grp) {
        // Filter links by methodology
        var visibleLinks = grp.links.filter(linkMatchesMethodology);
        if (visibleLinks.length === 0) return;

        var hasActive = visibleLinks.some(function(l) { return isActive(l.href); });
        var stored = getSectionOpen(grp.label);
        var isOpen = stored !== null ? stored : hasActive;

        html += '<div class="sb-group' + (hasActive ? ' active' : '') + '" data-group="' + grp.label + '">';
        html += '<div class="sb-group-toggle" onclick="window._hubToggleGroup(this)" data-label="' + grp.label + '">';
        html += '<span style="flex:1">' + grp.label + '</span>';
        html += '<span class="sb-chevron' + (isOpen ? ' open' : '') + '"></span>';
        html += '</div>';
        html += '<div class="sb-items" style="' + (isOpen ? '' : 'display:none') + '">';

        visibleLinks.forEach(function(link) {
          var active = isActive(link.href);
          html += '<a class="sb-item' + (active ? ' active' : '') + '" href="' + link.href + '">';
          html += '<span class="sb-icon">' + link.icon + '</span>';
          html += '<span>' + link.name + '</span>';
          html += '</a>';
        });

        html += '</div></div>';
      });

      html += '</div>';
    });

    // Sign out (compatible Supabase + demo mode)
    html += '<div style="padding:16px;margin-top:auto">';
    html += '<button onclick="window._hubSignOut()" style="width:100%;padding:8px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-muted);font-size:11px;cursor:pointer;transition:var(--transition)" onmouseover="this.style.borderColor=\'var(--danger)\';this.style.color=\'var(--danger)\'" onmouseout="this.style.borderColor=\'var(--border)\';this.style.color=\'var(--text-muted)\'">\u2190 D\u00e9connexion</button>';
    html += '</div>';

    sidebar.innerHTML = html;
  }

  // GOD role switcher
  window._hubSwitchRole = function(newRole) {
    if (newRole === 'god') {
      sessionStorage.removeItem('hub_simulated_role');
      sessionStorage.removeItem('delhub_simulated_role');
    } else {
      sessionStorage.setItem('hub_simulated_role', newRole);
      sessionStorage.setItem('delhub_simulated_role', newRole);
    }
    // Redirect to default page of the new role
    var defaults = window.HUB_DEFAULT_PAGE || { god:'pm-hub.html', pm:'pm-hub.html', delivery:'delhub-dashboard.html', business:'delhub-contracts.html', sales:'delhub-crm.html', head:'pm-hub.html' };
    window.location.href = defaults[newRole] || 'pm-hub.html';
  };

  // Sign out compatible Supabase + demo mode
  window._hubSignOut = function() {
    if (window.HUB_AUTH && window.HUB_AUTH._user) {
      window.HUB_AUTH.signOut();
    } else {
      // Demo mode — clear profile and redirect
      localStorage.removeItem('hub_profile');
      localStorage.removeItem('delhub_profile');
      localStorage.removeItem('pmhub_profile');
      sessionStorage.removeItem('hub_simulated_role');
      sessionStorage.removeItem('delhub_simulated_role');
      window.location.href = 'hub-login.html';
    }
  };

  window._hubToggleGroup = function(el) {
    var label = el.getAttribute('data-label');
    var items = el.nextElementSibling;
    var chevron = el.querySelector('.sb-chevron');
    if (!items) return;
    var isOpen = items.style.display !== 'none';
    items.style.display = isOpen ? 'none' : '';
    if (chevron) chevron.classList.toggle('open', !isOpen);
    setSectionOpen(label, !isOpen);
  };

  // Re-render on data changes
  window.addEventListener('pmhub:update', render);
  window.addEventListener('pmhub:synced', render);
  window.addEventListener('delhub:update', render);
  window.addEventListener('delhub:synced', render);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
