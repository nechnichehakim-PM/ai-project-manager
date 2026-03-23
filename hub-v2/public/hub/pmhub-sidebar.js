/**
 * PM Hub — Sidebar dynamique PMO
 * Une seule source de vérité pour la navigation latérale.
 */
(function() {
  'use strict';

  var path = (document.location.pathname || '').split('/').pop() || '';
  if (path === 'index.html') path = 'pm-hub.html';

  var STORAGE_KEY = 'pmhub_sidebar_open_';

  // ── Structure : 3 niveaux — Portefeuille / Projet / Outils ──
  var SIDEBAR_SECTIONS = [
    {
      sectionLabel: 'Portefeuille',
      groups: [
        { label: 'Tableau de bord', links: [
          { name: 'Dashboard', href: 'pm-hub.html', icon: '🏠' }
        ]},
        { label: 'Portefeuille', links: [
          { name: 'Vue portefeuille', href: 'pm-hub-portfolio.html', icon: '📊' },
          { name: 'COMEX',            href: 'pm-hub-executive.html',  icon: '🎯' },
          { name: 'Transverse',       href: 'pm-hub-transverse.html', icon: '🔀' }
        ]}
      ]
    },
    {
      sectionLabel: 'Projet',
      groups: [
        { label: 'Projet', links: [
          { name: 'Synthèse projet', href: 'pm-hub-project.html', icon: '📋' }
        ]},
        { label: 'Planification', links: [
          { name: 'Gantt',               href: 'pm-hub-gantt.html',  icon: '📅', methodologies: ['waterfall','hybride'] },
          { name: 'WBS & Dépendances',   href: 'pm-hub-wbs.html',    icon: '🌳', methodologies: ['waterfall','hybride'] },
          { name: 'Kanban',              href: 'pm-hub-kanban.html', icon: '🔲', methodologies: ['agile','hybride'] },
          { name: 'Sprints & Métriques', href: 'pm-hub-agile.html',  icon: '🔄', methodologies: ['agile','hybride'] }
        ]},
        { label: 'Suivi & Contrôle', links: [
          { name: 'RAID',        href: 'pm-hub-raid.html',       icon: '⚠️' },
          { name: 'Finance',     href: 'pm-hub-budget.html',     icon: '💰' },
          { name: 'Ressources',  href: 'pm-hub-resources.html',  icon: '👥' }
        ]},
        { label: 'Gouvernance projet', links: [
          { name: 'Gouvernance', href: 'pm-hub-governance.html', icon: '🏛️' },
          { name: 'Rapports',    href: 'pm-hub-report.html',     icon: '📄' }
        ]}
      ]
    },
    {
      sectionLabel: 'Outils',
      groups: [
        { label: 'Centre IA', links: [
          { name: 'Accueil IA',   href: 'pm-hub-ai.html',          icon: '🤖' },
          { name: 'Assistant',    href: 'pm-hub-ai-chat.html',      icon: '💬' },
          { name: 'Analyse RAID', href: 'pm-hub-ai-raid.html',      icon: '⚠️' },
          { name: 'Rédacteur PM', href: 'pm-hub-ai-redac.html',     icon: '✍️' },
          { name: 'Briefing',     href: 'pm-hub-ai-briefing.html',  icon: '📊' },
          { name: 'Livrables IA', href: 'pm-hub-ai-livrable.html',  icon: '⚡' }
        ]},
        { label: 'Bibliothèque', links: [
          { name: 'Templates',          href: 'pm-hub-templates.html', icon: '📐' },
          { name: 'Base de connaissance',href: 'pm-hub-knowledge.html', icon: '📚' }
        ]},
        { label: 'Paramètres', links: [
          { name: 'Paramètres', href: 'pm-hub-settings.html', icon: '⚙️' }
        ]}
      ]
    }
  ];

  // Aplatir pour les helpers qui travaillent sur une liste de groupes
  var SIDEBAR_GROUPS = SIDEBAR_SECTIONS.reduce(function(acc, s) {
    return acc.concat(s.groups);
  }, []);

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

    // Détection de la méthodologie du projet courant
    // Priorité : ?project= URL → pmhub_current_project localStorage → pas de filtre
    var currentMethodology = '';
    try {
      var urlProjectId = new URLSearchParams(window.location.search).get('project');
      var storedId = localStorage.getItem('pmhub_current_project');
      var resolvedId = urlProjectId || storedId;
      if (resolvedId && typeof PMHUB !== 'undefined' && PMHUB.getProjectById) {
        var currentProj = PMHUB.getProjectById(resolvedId);
        if (currentProj) currentMethodology = currentProj.methodology || '';
      }
    } catch(e) {}
    var raidCount = 0;
    if (typeof PMHUB !== 'undefined' && PMHUB.getRaids) {
      projects.slice(0, 1).forEach(function(p) {
        var r = PMHUB.getRaids(p.id);
        raidCount += (r.risks || []).filter(function(x) { return x.status !== 'closed'; }).length;
      });
    }

    var userEmail = window.PMHUB_AUTH && window.PMHUB_AUTH._user ? window.PMHUB_AUTH._user.email : '';

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
    html += '</div>';
    if (userEmail) {
      html += '<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:8px;">';
      html += '<span style="font-size:10px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;" title="' + userEmail + '">🔐 ' + userEmail + '</span>';
      html += '<button onclick="if(window.PMHUB_AUTH)window.PMHUB_AUTH.signOut()" style="flex-shrink:0;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.25);border-radius:6px;padding:3px 8px;font-size:10px;color:var(--danger);cursor:pointer;font-family:var(--font-body);">Quitter</button>';
      html += '</div>';
    }
    html += '</div>';

    SIDEBAR_SECTIONS.forEach(function(section, si) {
      // Séparateur de niveau
      html += '<div class="sb-level-sep' + (si === 0 ? ' first' : '') + '">';
      html += '<span class="sb-level-label">' + section.sectionLabel.toUpperCase() + '</span>';
      html += '</div>';

      section.groups.forEach(function(grp) {
        var stored = getSectionOpen(grp.label);
        var isOpen = stored !== null ? stored : groupContainsActive(grp);
        html += '<div class="sb-section' + (isOpen ? ' open' : '') + '" data-section="' + grp.label.replace(/"/g, '&quot;') + '">';
        html += '<div class="sb-section-toggle" role="button" tabindex="0" aria-expanded="' + isOpen + '" title="Cliquer pour ' + (isOpen ? 'replier' : 'déplier') + '">';
        html += '<span class="sb-section-chevron" aria-hidden="true"></span>';
        html += '<span class="sb-section-label-text">' + grp.label + '</span>';
        html += '</div>';
        html += '<div class="sb-section-content">';
        grp.links.forEach(function(link) {
          // Filtrage par méthodologie : si le lien a une liste de méthodologies autorisées
          // et qu'on connaît la méthodologie du projet courant, masquer si pas dans la liste
          if (link.methodologies && currentMethodology && link.methodologies.indexOf(currentMethodology) === -1) return;
          var active = isActive(link.href) ? ' active' : '';
          var badge = link.href === 'pm-hub-raid.html' && raidCount > 0 ? ' <span class="sb-badge-count red" id="sbRaidCount">' + raidCount + '</span>' : '';
          // Pour les liens avec methodologies, préserver le ?project= courant dans l'URL
          var href = link.href || '#';
          try {
            var curProjectId = new URLSearchParams(window.location.search).get('project') || localStorage.getItem('pmhub_current_project');
            if (link.methodologies && curProjectId) href = link.href + '?project=' + curProjectId;
          } catch(e) {}
          html += '<a class="sb-group' + active + '" data-group="' + (link.dataGroup || link.href) + '" href="' + href + '"><span class="sb-item-icon">' + link.icon + '</span> ' + link.name + badge + '</a>';
        });
        html += '</div></div>';
      });
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
      var currentProjId = (new URLSearchParams(window.location.search).get('project')) || localStorage.getItem('pmhub_current_project') || '';
      var projHtml = projs.length ? projs.map(function(p) {
        var isActive = String(p.id) === String(currentProjId);
        return '<a class="proj-chip' + (isActive ? ' active' : '') + '" href="pm-hub-project.html?project=' + p.id + '"><div class="proj-dot" style="background:' + (p.color || 'var(--primary)') + '"></div><div class="proj-name">' + (p.name || p.ref) + '</div></a>';
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
  window.addEventListener('pmhub:synced', render);
})();
