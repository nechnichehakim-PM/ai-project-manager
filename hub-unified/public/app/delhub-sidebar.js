/**
 * DelHub — Sidebar dynamique par rôle
 * Filtrage automatique selon le rôle utilisateur (god, sales, business, delivery, head)
 */
(function() {
  'use strict';

  var path = (document.location.pathname || '').split('/').pop() || '';
  if (path === 'index.html') path = 'delhub-dashboard.html';

  var STORAGE_KEY = 'delhub_sidebar_open_';

  // Rôle utilisateur
  var profile = {};
  try { profile = JSON.parse(localStorage.getItem('delhub_profile') || '{}'); } catch(e) {}
  var baseRole = profile.role || 'delivery';
  var simulated = sessionStorage.getItem('delhub_simulated_role');
  var role = (simulated && baseRole === 'god') ? simulated : baseRole;
  var isGod = baseRole === 'god';

  // ── Structure sidebar ──
  var SIDEBAR_SECTIONS = [
    {
      sectionLabel: 'Admin',
      roles: ['god'],
      groups: [
        { label: 'Administration', links: [
          { name: 'Gestion utilisateurs', href: 'delhub-admin.html', icon: '👑' }
        ]}
      ]
    },
    {
      sectionLabel: 'Pilotage',
      roles: ['god', 'head'],
      groups: [
        { label: 'Direction', links: [
          { name: 'Dashboard',            href: 'delhub-dashboard.html', icon: '🏠' },
          { name: 'Tableau Exec',         href: 'delhub-exec.html',      icon: '🏛️' },
          { name: 'Rapports consolidés',  href: 'delhub-reports.html',   icon: '📄' }
        ]}
      ]
    },
    {
      sectionLabel: 'Commercial',
      roles: ['god', 'sales', 'business', 'head'],
      groups: [
        { label: 'Pipeline', links: [
          { name: 'CRM / Prospects',      href: 'delhub-crm.html',       icon: '🎯' },
          { name: 'Propositions & Devis', href: 'delhub-proposals.html', icon: '📝' },
          { name: 'Forecasting',          href: 'delhub-forecast.html',  icon: '📈' }
        ]}
      ]
    },
    {
      sectionLabel: 'Business',
      roles: ['god', 'business', 'delivery', 'head'],
      groups: [
        { label: 'Gestion', links: [
          { name: 'Contrats & Scope',     href: 'delhub-contracts.html',  icon: '📋' },
          { name: 'P&L / Marges',         href: 'delhub-pnl.html',       icon: '💰' },
          { name: 'Portefeuille Biz',     href: 'delhub-portfolio.html',  icon: '📊' }
        ]}
      ]
    },
    {
      sectionLabel: 'Delivery',
      roles: ['god', 'delivery', 'head'],
      groups: [
        { label: 'Livraison', links: [
          { name: 'Pipeline Delivery',     href: 'delhub-pipeline.html',   icon: '🚀' },
          { name: 'SLA & Engagements',     href: 'delhub-sla.html',        icon: '🎯' },
          { name: 'Capacity Planning',     href: 'delhub-capacity.html',   icon: '👥' },
          { name: 'Release Calendar',      href: 'delhub-releases.html',   icon: '📅' },
          { name: 'Incidents & Escalades', href: 'delhub-incidents.html',  icon: '🚨' }
        ]}
      ]
    },
    {
      sectionLabel: 'Outils',
      roles: ['god', 'sales', 'business', 'delivery', 'head'],
      groups: [
        { label: 'IA & Config', links: [
          { name: 'Centre IA',   href: 'delhub-ai.html',       icon: '🤖' },
          { name: 'Paramètres',  href: 'delhub-settings.html', icon: '⚙️' }
        ]}
      ]
    }
  ];

  // Sales sans section Pilotage → ajouter Dashboard dans Commercial
  if (role === 'sales') {
    SIDEBAR_SECTIONS.forEach(function(s) {
      if (s.sectionLabel === 'Commercial') {
        s.groups[0].links.unshift({ name: 'Dashboard', href: 'delhub-dashboard.html', icon: '🏠' });
      }
    });
  }
  // Delivery/Business sans section Pilotage → ajouter Dashboard en tête
  if (role === 'delivery' || role === 'business') {
    SIDEBAR_SECTIONS.forEach(function(s) {
      if ((role === 'delivery' && s.sectionLabel === 'Delivery') ||
          (role === 'business' && s.sectionLabel === 'Business')) {
        s.groups[0].links.unshift({ name: 'Dashboard', href: 'delhub-dashboard.html', icon: '🏠' });
      }
    });
  }

  // Filtrer par rôle
  var visibleSections = SIDEBAR_SECTIONS.filter(function(s) {
    return s.roles.indexOf(role) !== -1;
  });

  var SIDEBAR_GROUPS = visibleSections.reduce(function(acc, s) {
    return acc.concat(s.groups);
  }, []);

  function isActive(href) {
    if (!href) return false;
    var h = href.split('?')[0];
    return path === h || (path === '' && h === 'delhub-dashboard.html');
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

  function render() {
    var sidebar = document.getElementById('delhub-sidebar');
    if (!sidebar) return;

    var html = '';

    // Profile card
    html += '<div class="sb-profile">';
    html += '<div class="sb-avatar">' + ((profile.name || 'U').charAt(0).toUpperCase()) + '</div>';
    html += '<div class="sb-name">' + (profile.name || 'Utilisateur') + '</div>';
    html += '<div class="sb-role">' + getRoleLabel(baseRole) + '</div>';
    if (isGod) {
      html += '<div class="sb-badges">';
      html += '<span class="sb-badge g">GOD MODE</span>';
      if (simulated) {
        html += '<span class="sb-badge y">Vue: ' + simulated + '</span>';
      }
      html += '</div>';
    }
    html += '</div>';

    // Hub switcher (GOD only)
    if (isGod) {
      html += '<div style="padding:8px 16px;margin-bottom:8px">';
      html += '<a href="../hub/pm-hub.html" style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-muted);text-decoration:none;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;transition:var(--transition)"';
      html += ' onmouseover="this.style.borderColor=\'var(--primary)\';this.style.color=\'var(--primary)\'" onmouseout="this.style.borderColor=\'var(--border)\';this.style.color=\'var(--text-muted)\'">';
      html += '🔄 Switch → PM Hub</a></div>';
    }

    // Simulation banner (GOD only)
    if (isGod && simulated) {
      html += '<div style="padding:6px 16px;margin-bottom:8px">';
      html += '<div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:var(--radius-sm);padding:8px 12px;font-size:11px;color:var(--warning);display:flex;align-items:center;justify-content:space-between">';
      html += '<span>👁️ Vue ' + simulated + '</span>';
      html += '<a href="#" onclick="sessionStorage.removeItem(\'delhub_simulated_role\');location.reload();return false" style="color:var(--warning);font-size:10px">✕ Quitter</a>';
      html += '</div></div>';
    }

    // Sections
    visibleSections.forEach(function(section) {
      html += '<div class="sb-section">';
      html += '<div class="sb-section-label">' + section.sectionLabel + '</div>';

      section.groups.forEach(function(grp) {
        var hasActive = groupContainsActive(grp);
        var stored = getSectionOpen(grp.label);
        var isOpen = stored !== null ? stored : hasActive;

        html += '<div class="sb-group' + (hasActive ? ' active' : '') + '" data-group="' + grp.label + '">';
        html += '<div class="sb-group-toggle" onclick="window._delhubToggleGroup(this)" data-label="' + grp.label + '">';
        html += '<span>' + grp.label + '</span>';
        html += '<span class="sb-chevron' + (isOpen ? ' open' : '') + '">›</span>';
        html += '</div>';
        html += '<div class="sb-items" style="' + (isOpen ? '' : 'display:none') + '">';

        grp.links.forEach(function(link) {
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

    sidebar.innerHTML = html;
  }

  function getRoleLabel(r) {
    var labels = {
      god: 'GOD / Admin',
      head: 'Head / C-Level',
      business: 'Business Manager',
      delivery: 'Delivery Manager',
      sales: 'Sales / Commercial',
      pm: 'Chef de Projet'
    };
    return labels[r] || r;
  }

  window._delhubToggleGroup = function(el) {
    var label = el.getAttribute('data-label');
    var items = el.nextElementSibling;
    var chevron = el.querySelector('.sb-chevron');
    if (!items) return;
    var isOpen = items.style.display !== 'none';
    items.style.display = isOpen ? 'none' : '';
    if (chevron) chevron.classList.toggle('open', !isOpen);
    setSectionOpen(label, !isOpen);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
