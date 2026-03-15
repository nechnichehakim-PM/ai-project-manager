/**
 * PM Hub — Sidebar dynamique PMO
 * Une seule source de vérité pour la navigation latérale.
 */
(function() {
  'use strict';

  var path = (document.location.pathname || '').split('/').pop() || '';
  if (path === 'index.html') path = 'pm-hub.html';

  var STORAGE_KEY = 'pmhub_sidebar_open_';
  var SIDEBAR_GROUPS = [
    { label: 'Vue d\'ensemble', links: [
      { name: 'Dashboard', href: 'pm-hub.html', icon: '🏠' }
    ]},
    { label: 'Planning', links: [
      { name: 'Gantt', href: 'pm-hub-gantt.html', icon: '📅' },
      { name: 'Kanban', href: 'pm-hub-kanban.html', icon: '📋' }
    ]},
    { label: 'RAID & Gouvernance', links: [
      { name: 'RAID', href: 'pm-hub-raid.html', icon: '⚠️' },
      { name: 'Gouvernance', href: 'pm-hub-governance.html', icon: '🏛️' }
    ]},
    { label: 'Ressources & Budget', links: [
      { name: 'Ressources', href: 'pm-hub-resources.html', icon: '👥' },
      { name: 'Budget', href: 'pm-hub-budget.html', icon: '💰' }
    ]},
    { label: 'Portefeuille & COMEX', links: [
      { name: 'Portefeuille', href: 'pm-hub-portfolio.html', icon: '📊' },
      { name: 'COMEX', href: 'pm-hub-executive.html', icon: '🎯' }
    ]},
    { label: 'Centre IA', links: [
      { name: 'Accueil IA', href: 'pm-hub-ai.html', icon: '🤖' },
      { name: 'Assistant', href: 'pm-hub-ai-chat.html', icon: '💬' },
      { name: 'Analyse RAID', href: 'pm-hub-ai-raid.html', icon: '⚠️' },
      { name: 'Rédacteur PM', href: 'pm-hub-ai-redac.html', icon: '✍️' },
      { name: 'Briefing', href: 'pm-hub-ai-briefing.html', icon: '📊' },
      { name: 'Livrables', href: 'pm-hub-ai-livrable.html', icon: '⚡' }
    ]},
    { label: 'Documents & Connaissance', links: [
      { name: 'Rapports', href: 'pm-hub-report.html', icon: '📄' },
      { name: 'Base de connaissance', href: 'pm-hub-knowledge.html', icon: '📚' },
      { name: 'Templates', href: 'pm-hub-templates.html', icon: '📐' }
    ]},
    { label: 'Configuration', links: [
      { name: 'Paramètres', href: 'pm-hub-settings.html', icon: '⚙️' }
    ]}
  ];

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

  function toggleSection(header) {
    var wrap = header.closest('.sb-section');
    if (!wrap) return;
    var isOpen = wrap.classList.toggle('open');
    setSectionOpen(wrap.getAttribute('data-section'), isOpen);
  }

  function render() {
    var el = document.getElementById('pmhub-sidebar');
    if (!el) return;
    var profile = (typeof PMHUB !== 'undefined' && PMHUB.getProfile) ? PMHUB.getProfile() : { initials: 'AN', name: 'Abdelhakim Nechniche', title: 'PM Telecom & IT · PMP® · PRINCE2 7th', badges: ['PMP®', 'PRINCE2 7th'] };
    var projects = (typeof PMHUB !== 'undefined' && PMHUB.getProjects) ? PMHUB.getProjects().filter(function(p) { return p.status === 'active'; }) : [];
    var raidCount = 0;
    if (typeof PMHUB !== 'undefined' && PMHUB.getRaids) {
      projects.slice(0, 1).forEach(function(p) {
        var r = PMHUB.getRaids(p.id);
        raidCount += (r.risks || []).filter(function(x) { return x.status !== 'closed'; }).length;
      });
    }

    var html = '';
    html += '<div class="sb-profile">';
    html += '<div class="sb-avatar" id="sbAvatar">' + (profile.initials || 'AN') + '</div>';
    html += '<div class="sb-name" id="sbName">' + (profile.name || '') + '</div>';
    html += '<div class="sb-role" id="sbRole">' + (profile.title || '') + '</div>';
    html += '<div class="sb-badges">';
    (profile.badges || []).slice(0, 4).forEach(function(b) {
      var cls = b.indexOf('PMP') >= 0 ? ' g' : (b.indexOf('PRINCE2') >= 0 ? ' y' : '');
      html += '<span class="sb-badge' + cls + '">' + b + '</span>';
    });
    html += '</div></div>';

    SIDEBAR_GROUPS.forEach(function(grp) {
      var stored = getSectionOpen(grp.label);
      var isOpen = stored !== null ? stored : groupContainsActive(grp);
      html += '<div class="sb-section' + (isOpen ? ' open' : '') + '" data-section="' + grp.label.replace(/"/g, '&quot;') + '">';
      html += '<div class="sb-section-toggle" role="button" tabindex="0" aria-expanded="' + isOpen + '" title="Cliquer pour ' + (isOpen ? 'replier' : 'déplier') + '">';
      html += '<span class="sb-section-chevron" aria-hidden="true"></span>';
      html += '<span class="sb-section-label-text">' + grp.label + '</span>';
      html += '</div>';
      html += '<div class="sb-section-content">';
      grp.links.forEach(function(link) {
        var active = isActive(link.href) ? ' active' : '';
        var badge = link.href === 'pm-hub-raid.html' && raidCount > 0 ? ' <span class="sb-badge-count red" id="sbRaidCount">' + raidCount + '</span>' : '';
        html += '<a class="sb-group' + active + '" data-group="' + (link.dataGroup || link.href) + '" href="' + (link.href || '#') + '"><span class="sb-item-icon">' + link.icon + '</span> ' + link.name + badge + '</a>';
      });
      html += '</div></div>';
    });

    html += '<div class="sb-section-label sb-section-projects">Projets actifs</div>';
    html += '<div id="sbProjects"></div>';
    html += '<div class="sb-footer"><div class="sb-status"><div class="status-dot"></div> Disponible · Orvault, FR</div></div>';

    el.innerHTML = html;

    el.querySelectorAll('.sb-section-toggle').forEach(function(btn) {
      btn.addEventListener('click', function() { toggleSection(btn); });
      btn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection(btn); }
      });
    });

    if (typeof PMHUB !== 'undefined' && PMHUB.getProjects && document.getElementById('sbProjects')) {
      var projs = PMHUB.getProjects().filter(function(p) { return p.status === 'active'; });
      var projHtml = projs.length ? projs.map(function(p, i) {
        return '<a class="proj-chip' + (i === 0 ? ' active' : '') + '" href="pm-hub.html?project=' + p.id + '"><div class="proj-dot" style="background:' + (p.color || 'var(--primary)') + '"></div><div class="proj-name">' + (p.name || p.ref) + '</div></a>';
      }).join('') : '<div class="sb-no-projects" style="font-size:10px;color:var(--text-muted);padding:8px;">Aucun projet actif</div>';
      document.getElementById('sbProjects').innerHTML = projHtml;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
  window.addEventListener('pmhub:update', render);
})();
