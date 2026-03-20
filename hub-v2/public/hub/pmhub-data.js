/**
 * PM HUB — Couche de données partagée v2.0
 * Abdelhakim Nechniche — Telecom & IT Project Manager
 */

// ── THEME NO-FLASH (exécuté en premier pour éviter le flash) ────
(function () {
  try {
    var t = localStorage.getItem('pmhub_theme');
    if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
  } catch (e) {}
})();

// ── INJECTION SCRIPTS PARTAGÉS ──────────────────────────────────
(function injectThemeToggle() {
  if (document.getElementById('pmhub-theme-toggle-js')) return;
  var s = document.createElement('script');
  s.id = 'pmhub-theme-toggle-js';
  s.src = 'pmhub-theme-toggle.js';
  document.head.appendChild(s);
})();

// ── INJECTION SUPABASE (chargé avant le reste) ─────────────────
(function injectSupabase() {
  if (document.getElementById('pmhub-supabase-cdn')) return;
  var cdn = document.createElement('script');
  cdn.id  = 'pmhub-supabase-cdn';
  cdn.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
  cdn.onload = function () {
    var auth = document.createElement('script');
    auth.src = 'pmhub-supabase.js';
    document.head.appendChild(auth);
  };
  document.head.appendChild(cdn);
})();

const PMHUB = (() => {

  const KEYS = {
    projects:      'pmhub_projects',
    templates:     'pmhub_templates',
    raids:         'pmhub_raids',
    resources:     'pmhub_resources',
    reports:       'pmhub_reports',
    wizard:        'pmhub_wizard',
    profile:       'pmhub_profile',
    aiSettings:    'pmhub_ai_settings',
    ganttPrefix:   'pmhub_tasks_',
    stakeholders:  'pmhub_stakeholders',
    communication: 'pmhub_communication',
    budget:        'pmhub_budget',
    deliverables:  'pmhub_deliverables',
    onePager:      'pmhub_onepager',
    retros:        'pmhub_retros',
  };

  // ── AI SETTINGS DEFAULT ───────────────────────────────────────
  const DEFAULT_AI_SETTINGS = {
    provider:   '',        // 'openai' | 'anthropic' | 'mistral' | 'custom'
    apiKey:     '',
    model:      '',
    endpoint:   '',        // pour custom
    enabled:    false,
  };

  const AI_PROVIDERS = {
    openai:    { label:'OpenAI (ChatGPT)',   endpoint:'https://api.openai.com/v1/chat/completions',   models:['gpt-5.4','gpt-5-mini','gpt-4.1','gpt-4.1-mini','gpt-4.1-nano','gpt-4o','gpt-4o-mini','gpt-4-turbo','gpt-4o-2024-08-06','gpt-4o-mini-2024-07-18','o1','o1-mini','o3-mini','gpt-3.5-turbo'], headerKey:'Authorization', headerPrefix:'Bearer ' },
    anthropic: { label:'Anthropic (Claude)', endpoint:'https://api.anthropic.com/v1/messages',        models:['claude-opus-4-5','claude-sonnet-4-5','claude-haiku-4-5'], headerKey:'x-api-key', headerPrefix:'' },
    mistral:   { label:'Mistral AI',         endpoint:'https://api.mistral.ai/v1/chat/completions',   models:['mistral-large-latest','mistral-medium-latest','mistral-small-latest','codestral-latest'], headerKey:'Authorization', headerPrefix:'Bearer ' },
    custom:    { label:'API Personnalisée',  endpoint:'', models:[], headerKey:'Authorization', headerPrefix:'Bearer ' },
  };

  // ── PROFIL RÉEL ───────────────────────────────────────────────
  const DEFAULT_PROFILE = {
    initials:    'AN',
    name:        'Abdelhakim Nechniche',
    title:       'Telecom & IT Project Manager · PMP® · PRINCE2 7th · Agile Scrum Master',
    badges:      ['PMP®', 'PRINCE2 7th', 'Agile Scrum Master', 'PMOCP 🔄'],
    tools:       ['MS Project', 'Jira', 'Power BI'],
    languages:   ['Français', 'Anglais courant'],
    specialties: ['Télécoms & Infrastructure Réseau', 'Data & AI Projects', 'Transformation Digitale'],
    location:    'Orvault, France',
    company:     'AMARIS Consulting',
    available:   true
  };

  // ── PROJETS RÉELS ─────────────────────────────────────────────
  const DEFAULT_PROJECTS = [
    {
      id: 1,
      ref: 'PRJ-2025-001',
      name: 'AI-Driven Smart Data Center',
      desc: 'Déploiement d\'un Data Center intelligent piloté par IA : automatisation des opérations, optimisation énergétique, monitoring prédictif. Projet phare en cours.',
      status: 'active',
      progress: 35,
      type: 'R&D / Innovation',
      start: '2025-11-01',
      end: '2026-09-30',
      budget: '450 000',
      sponsor: 'Direction Innovation AMARIS',
      team: ['AN', 'ML', 'KB', 'SC'],
      icon: '🧠',
      color: '#63d2b4',
      priority: 'Critique',
      phase: 'Planification',
      methodology: 'waterfall',
      client: 'Interne / Grand Compte',
      risks: 3,
      actions: 7,
      createdAt: '2025-11-01T09:00:00.000Z'
    },
    {
      id: 2,
      ref: 'PRJ-2024-008',
      name: 'Orange PMPR / BLIM',
      desc: 'Programme de modernisation du réseau Orange — gestion des migrations BLIM et pilotage des projets réseau (PMPR). Périmètre national, coordination multi-équipes.',
      status: 'closed',
      progress: 100,
      type: 'Télécoms / Réseau',
      start: '2023-09-01',
      end: '2025-06-30',
      budget: '—',
      sponsor: 'Orange France',
      team: ['AN', 'RC', 'FD'],
      icon: '📡',
      color: '#e8c97a',
      priority: 'Haute',
      phase: 'Clôture',
      methodology: 'waterfall',
      client: 'Orange France',
      risks: 0,
      actions: 0,
      createdAt: '2023-09-01T08:00:00.000Z'
    },
    {
      id: 3,
      ref: 'PRJ-2025-002',
      name: 'Tableau de Bord Power BI — R&D',
      desc: 'Développement d\'un système de reporting analytique R&D sous Power BI. Modélisation des données, KPIs projets, dashboards interactifs pour le management.',
      status: 'closed',
      progress: 100,
      type: 'Data / Analytics',
      start: '2025-07-01',
      end: '2025-11-30',
      budget: '—',
      sponsor: 'Direction R&D AMARIS',
      team: ['AN', 'TD'],
      icon: '📊',
      color: '#7ab8e8',
      priority: 'Haute',
      phase: 'Clôture',
      methodology: 'waterfall',
      client: 'Interne AMARIS',
      risks: 0,
      actions: 0,
      createdAt: '2025-07-01T08:00:00.000Z'
    },
    {
      id: 4,
      ref: 'PRJ-2023-004',
      name: 'FTTA Bouygues — AMARIS Tunis',
      desc: 'Déploiement Fiber-To-The-Antenna pour Bouygues Télécom. Étude et coordination des déploiements antennes fibre, reporting terrain et suivi des jalons opérateurs.',
      status: 'closed',
      progress: 100,
      type: 'Télécoms / Infrastructure',
      start: '2020-06-01',
      end: '2023-08-31',
      budget: '—',
      sponsor: 'Bouygues Télécom',
      team: ['AN', 'MB', 'YA'],
      icon: '📶',
      color: '#b07ae8',
      priority: 'Normale',
      phase: 'Clôture',
      methodology: 'waterfall',
      client: 'Bouygues Télécom',
      risks: 0,
      actions: 0,
      createdAt: '2020-06-01T08:00:00.000Z'
    }
  ];

  // ── RESSOURCES RÉELLES ────────────────────────────────────────
  const DEFAULT_RESOURCES = [
    { id: 'AN', name: 'Abdelhakim Nechniche', role: 'Project Manager', level: 'Senior', availability: 80, skills: ['PMP', 'PRINCE2', 'Jira', 'Power BI', 'Télécoms'], color: '#63d2b4' },
    { id: 'ML', name: 'Marc Leblanc',         role: 'Data Architect',   level: 'Senior', availability: 60, skills: ['Data Engineering', 'Python', 'SQL', 'Azure'], color: '#7ab8e8' },
    { id: 'KB', name: 'Karim Benali',         role: 'Infrastructure Engineer', level: 'Confirmé', availability: 80, skills: ['Datacenter', 'Réseau', 'VMware', 'Linux'], color: '#e8c97a' },
    { id: 'SC', name: 'Sophie Carré',         role: 'AI/ML Engineer',  level: 'Confirmé', availability: 70, skills: ['ML', 'Python', 'TensorFlow', 'MLOps'], color: '#e07070' },
  ];

  // ── HELPERS ───────────────────────────────────────────────────
  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch(e) { return fallback; }
  }

  var SYNC_TS_KEY = 'pmhub_sync_ts';
  function getSyncTs() {
    try { return JSON.parse(localStorage.getItem(SYNC_TS_KEY) || '{}'); } catch(e) { return {}; }
  }
  function stampLocal(key) {
    try {
      var ts = getSyncTs();
      ts[key] = new Date().toISOString();
      localStorage.setItem(SYNC_TS_KEY, JSON.stringify(ts));
    } catch(e) {}
  }

  function save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      stampLocal(key); // horodater la modification locale
      window.dispatchEvent(new CustomEvent('pmhub:update', { detail: { key } }));
      // Sync vers Supabase en arrière-plan (non-bloquant)
      if (window.PMHUB_AUTH && window.PMHUB_AUTH.saveToCloud) {
        window.PMHUB_AUTH.saveToCloud(key, data);
      }
      return true;
    } catch(e) { return false; }
  }

  // ── API PROJETS ───────────────────────────────────────────────
  function getProjects()           { return load(KEYS.projects, DEFAULT_PROJECTS); }
  function saveProjects(list)      { return save(KEYS.projects, list); }

  function addProject(project) {
    const list = getProjects();
    project.id = project.id || Date.now();
    list.unshift(project);
    saveProjects(list);
    return project;
  }

  function updateProject(id, changes) {
    const list = getProjects();
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...changes };
    saveProjects(list);
    return list[idx];
  }

  function deleteProject(id) {
    const list = getProjects().filter(p => p.id != id);
    saveProjects(list);
    const tpls = load(KEYS.templates, {});
    Object.keys(tpls).forEach(k => { if (k.startsWith(id + '_')) delete tpls[k]; });
    save(KEYS.templates, tpls);
  }

  function getProjectById(id) {
    return getProjects().find(p => String(p.id) === String(id)) || null;
  }

  // ── API TEMPLATES ─────────────────────────────────────────────
  function getTemplate(projectId, templateId) {
    const tpls = load(KEYS.templates, {});
    return tpls[`${projectId}_${templateId}`] || null;
  }

  function saveTemplate(projectId, templateId, data) {
    const tpls = load(KEYS.templates, {});
    tpls[`${projectId}_${templateId}`] = { ...data, projectId, templateId, savedAt: new Date().toISOString() };
    return save(KEYS.templates, tpls);
  }

  function getProjectTemplates(projectId) {
    const tpls = load(KEYS.templates, {});
    return Object.entries(tpls).filter(([k]) => k.startsWith(projectId + '_')).map(([, v]) => v);
  }

  function countSavedTemplates(projectId) {
    return getProjectTemplates(projectId).length;
  }

  // ── API RAID ──────────────────────────────────────────────────
  function getRaids(projectId) {
    const all = load(KEYS.raids, {});
    return all[projectId] || { risks: [], actions: [], issues: [], decisions: [] };
  }

  function saveRaids(projectId, data) {
    const all = load(KEYS.raids, {});
    all[projectId] = data;
    return save(KEYS.raids, all);
  }

  function addRaidItem(projectId, type, item) {
    const data = getRaids(projectId);
    item.id = Date.now();
    item.createdAt = new Date().toISOString();
    data[type].push(item);
    saveRaids(projectId, data);
    return item;
  }

  function updateRaidItem(projectId, type, itemId, changes) {
    const data = getRaids(projectId);
    const idx = data[type].findIndex(i => i.id === itemId);
    if (idx !== -1) { data[type][idx] = { ...data[type][idx], ...changes }; saveRaids(projectId, data); }
  }

  function deleteRaidItem(projectId, type, itemId) {
    const data = getRaids(projectId);
    data[type] = data[type].filter(i => i.id !== itemId);
    saveRaids(projectId, data);
  }

  // ── API GANTT (tâches par projet, sync wizard → Gantt) ─────────
  function getGanttTasks(projectId) {
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem(KEYS.ganttPrefix + projectId);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function saveGanttTasks(projectId, tasks) {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(KEYS.ganttPrefix + projectId, JSON.stringify(tasks));
  }

  // ── API STAKEHOLDERS (parties prenantes, matrice pouvoir/intérêt) ─
  function getStakeholders(projectId) {
    const all = load(KEYS.stakeholders, {});
    return all[projectId] || [];
  }
  function saveStakeholders(projectId, list) {
    const all = load(KEYS.stakeholders, {});
    all[projectId] = list;
    return save(KEYS.stakeholders, all);
  }

  // ── API COMMUNICATION (plan + historique) ──────────────────────
  function getCommunicationPlan(projectId) {
    const all = load(KEYS.communication, {});
    return all[projectId] || { plan: [], history: [] };
  }
  function saveCommunicationPlan(projectId, data) {
    const all = load(KEYS.communication, {});
    all[projectId] = data;
    return save(KEYS.communication, all);
  }

  // ── API BUDGET (prévu / engagé / consommé par projet) ──────────
  function getBudget(projectId) {
    const all = load(KEYS.budget, {});
    return all[projectId] || { planned: 0, committed: 0, consumed: 0, currency: '€', entries: [] };
  }
  function saveBudget(projectId, data) {
    const all = load(KEYS.budget, {});
    all[projectId] = data;
    return save(KEYS.budget, all);
  }

  // ── API LIVRABLES (documentation, statut brouillon/revue/validé) ─
  function getDeliverables(projectId) {
    const all = load(KEYS.deliverables, {});
    return all[projectId] || [];
  }
  function saveDeliverables(projectId, list) {
    const all = load(KEYS.deliverables, {});
    all[projectId] = list;
    return save(KEYS.deliverables, all);
  }

  // ── API ONE-PAGER (rapport d'avancement une page) ───────────────
  function getOnePagerReports(projectId) {
    const all = load(KEYS.onePager, {});
    return all[projectId] || [];
  }
  function saveOnePagerReports(projectId, list) {
    const all = load(KEYS.onePager, {});
    all[projectId] = list;
    return save(KEYS.onePager, all);
  }

  // ── API REX / RÉTROSPECTIVE ───────────────────────────────────
  function getRetros(projectId) {
    const all = load(KEYS.retros, {});
    return all[projectId] || [];
  }
  function saveRetros(projectId, list) {
    const all = load(KEYS.retros, {});
    all[projectId] = list;
    return save(KEYS.retros, all);
  }

  // ── API RESSOURCES ────────────────────────────────────────────
  function getResources()      { return load(KEYS.resources, DEFAULT_RESOURCES); }
  function saveResources(list) { return save(KEYS.resources, list); }

  // ── API WIZARD ────────────────────────────────────────────────
  function getWizardState(projectId) {
    const all = load(KEYS.wizard, {});
    return all[projectId] || { currentStep: 0, completedSteps: [], data: {} };
  }

  function saveWizardState(projectId, state) {
    const all = load(KEYS.wizard, {});
    all[projectId] = state;
    return save(KEYS.wizard, all);
  }

  // ── PROFIL ────────────────────────────────────────────────────
  function getProfile()       { return load(KEYS.profile, DEFAULT_PROFILE); }
  function saveProfile(data)  { return save(KEYS.profile, data); }

  // ── STATS (hors archivés) ──────────────────────────────────────
  function getStats() {
    const list = getProjects().filter(p => p.status !== 'archived');
    return {
      total:       list.length,
      active:      list.filter(p => p.status === 'active').length,
      risk:        list.filter(p => p.status === 'risk').length,
      hold:        list.filter(p => p.status === 'hold').length,
      closed:      list.filter(p => p.status === 'closed').length,
      archived:    getProjects().filter(p => p.status === 'archived').length,
      avgProgress: list.length
        ? Math.round(list.reduce((s,p) => s + (p.progress||0), 0) / list.length)
        : 0
    };
  }

  function archiveProject(id) {
    return updateProject(id, { status: 'archived' });
  }

  function restoreProject(id) {
    return updateProject(id, { status: 'active' });
  }

  // ── PORTFOLIO / PMO KPIs ──────────────────────────────────────
  function getPortfolioKpis() {
    const list = getProjects();
    const active = list.filter(p => p.status === 'active');
    let totalBudget = 0, consumedBudget = 0, criticalCount = 0, atRiskCount = 0;
    active.forEach(p => {
      const b = getBudget(p.id);
      const planned = Number(String(p.budget || b.planned || 0).replace(/\s/g,'').replace(/[^\d.]/g,'')) || 0;
      totalBudget += planned;
      consumedBudget += (b.consumed || 0) + (planned * (p.progress || 0) / 100) * 0.6;
      if (p.priority === 'Critique') criticalCount++;
      else if (p.status === 'risk' || (p.risks || 0) > 2) atRiskCount++;
    });
    const resources = getResources();
    const capacityUsed = resources.length ? resources.reduce((s,r) => s + (r.availability || 0), 0) / resources.length : 0;
    return {
      totalProjects: list.length,
      activeProjects: active.length,
      healthyCount: active.length - criticalCount - atRiskCount,
      atRiskCount,
      criticalCount,
      totalBudget: Math.round(totalBudget),
      consumedBudget: Math.round(consumedBudget),
      capacityUsedPercent: Math.round(capacityUsed),
      avgProgress: active.length ? Math.round(active.reduce((s,p) => s + (p.progress||0), 0) / active.length) : 0
    };
  }

  function getProjectHealth(projectId) {
    const p = getProjectById(projectId);
    if (!p) return { score: 0, rag: 'grey', trend: 'neutral', openRisks: 0, openIssues: 0, milestonesDone: 0, nextDeadline: null };
    const raid = getRaids(projectId);
    const openRisks = (raid.risks || []).filter(r => r.status !== 'closed').length;
    const openIssues = (raid.issues || []).filter(i => i.status !== 'closed').length;
    const tasks = getGanttTasks(projectId);
    const milestones = (tasks && tasks.tasks) ? tasks.tasks.filter(t => t.milestone) : [];
    const milestonesDone = milestones.filter(m => m.progress >= 100).length;
    let score = 100 - (openRisks * 8) - (openIssues * 12) - Math.max(0, 100 - (p.progress || 0));
    score = Math.max(0, Math.min(100, Math.round(score)));
    let rag = 'green';
    if (score < 50 || openRisks > 2) rag = 'red';
    else if (score < 75 || openRisks > 0) rag = 'amber';
    return {
      score,
      rag,
      trend: 'neutral',
      openRisks,
      openIssues,
      milestonesTotal: milestones.length,
      milestonesDone,
      nextDeadline: p.end || null,
      teamCapacity: (p.team || []).length ? 85 : 0
    };
  }

  function getBudgetEVM(projectId) {
    const p = getProjectById(projectId);
    const b = getBudget(projectId);
    const planned = Number(String(p && p.budget ? p.budget : b.planned).replace(/\s/g,'').replace(/[^\d.]/g,'')) || 0;
    const ac = b.consumed || (planned * ((p && p.progress) || 0) / 100 * 0.7);
    const pv = planned * 0.35;
    const ev = planned * ((p && p.progress) || 0) / 100;
    const cpi = ac > 0 ? ev / ac : 1;
    const spi = pv > 0 ? ev / pv : 1;
    const eac = ac > 0 && cpi > 0 ? ac + (planned - ev) / cpi : planned;
    return {
      bac: planned,
      ac: Math.round(ac),
      pv: Math.round(pv),
      ev: Math.round(ev),
      cpi: Math.round(cpi * 100) / 100,
      spi: Math.round(spi * 100) / 100,
      eac: Math.round(eac),
      cv: Math.round(ev - ac),
      sv: Math.round(ev - pv)
    };
  }

  function getResourceAllocations() {
    const resources = getResources();
    const projects = getProjects().filter(p => p.status === 'active');
    return resources.map(r => {
      const assigned = projects.filter(p => (p.team || []).indexOf(r.id) >= 0).length;
      const load = assigned * 25;
      return {
        id: r.id,
        name: r.name,
        role: r.role,
        availability: r.availability || 0,
        allocatedPercent: Math.min(100, load),
        overload: load > (r.availability || 0)
      };
    });
  }

  // ── URL PARAMS ────────────────────────────────────────────────
  function getParam(name)        { return new URLSearchParams(window.location.search).get(name); }
  function goTo(page, params={}) {
    const q = new URLSearchParams(params).toString();
    window.location.href = q ? `${page}?${q}` : page;
  }

  // ── ÉCOUTE ────────────────────────────────────────────────────
  function onChange(cb) {
    window.addEventListener('pmhub:update', cb);
    window.addEventListener('storage', e => {
      if (e.key && e.key.startsWith('pmhub_')) cb({ detail: { key: e.key } });
    });
  }

  // ── MÉTHODOLOGIES (Waterfall, Agile, Hybride) ─────────────────
  const METHODOLOGIES = {
    waterfall: {
      id: 'waterfall',
      label: 'Waterfall (Cycle en V)',
      shortLabel: 'Waterfall',
      desc: 'Projet séquentiel : cadrage → planification détaillée → exécution → clôture. Idéal pour périmètre fixe, contrats cadrés, livrables bien définis.',
      phases: ['Initialisation', 'Planification', 'Exécution', 'Contrôle', 'Clôture'],
      artifacts: ['Charte', 'WBS', 'Gantt', 'RAID', 'RACI', 'Rapports de statut', 'Change Request', 'REX'],
      steps: [
        { id: 'cadrage',     label: 'Cadrage',         icon: '🎯', desc: 'Périmètre, objectifs SMART, parties prenantes' },
        { id: 'charte',      label: 'Charte Projet',   icon: '📋', desc: 'Project Charter — document officiel de lancement' },
        { id: 'wbs',         label: 'WBS / Livrables', icon: '🌳', desc: 'Work Breakdown Structure, décomposition des livrables' },
        { id: 'raci',        label: 'RACI',            icon: '👥', desc: 'Matrice des responsabilités par livrable' },
        { id: 'raid',        label: 'RAID Initial',    icon: '⚠️',  desc: 'Risques, Actions, Issues, Décisions' },
        { id: 'planning',    label: 'Planning',        icon: '📅', desc: 'Jalons, dépendances, chemin critique' },
        { id: 'gouvernance', label: 'Gouvernance',     icon: '🏛️', desc: 'Comités, reporting, escalade, KPIs' },
      ],
    },
    agile: {
      id: 'agile',
      label: 'Scrum',
      shortLabel: 'Scrum',
      desc: 'Framework Scrum : itérations (sprints), Product Backlog, cérémonies (Planning, Daily, Review, Rétro), Definition of Done. Idéal pour produit évolutif et équipe autonome.',
      phases: ['Discovery', 'Release Planning', 'Sprints', 'Release', 'Rétrospective'],
      artifacts: ['Product Backlog', 'Sprint Backlog', 'Increment', 'Burndown', 'Definition of Done', 'RAID', 'Rétro'],
      steps: [
        { id: 'vision',      label: 'Vision & Produit', icon: '🎯', desc: 'Vision produit, personas, objectifs utilisateur' },
        { id: 'backlog',     label: 'Product Backlog',  icon: '📋', desc: 'User stories priorisées, valeur métier' },
        { id: 'raci',        label: 'Rôles Scrum',      icon: '👥', desc: 'Product Owner, Scrum Master, équipe de développement' },
        { id: 'raid',        label: 'RAID Initial',    icon: '⚠️',  desc: 'Risques, Actions, Issues, Décisions' },
        { id: 'sprints',    label: 'Sprints & Rituals', icon: '📅', desc: 'Durée sprint, planning, daily, review, rétro' },
        { id: 'definition_of_done', label: 'Definition of Done', icon: '✅', desc: 'Critères d\'acceptation et de livrabilité' },
        { id: 'gouvernance', label: 'Gouvernance',     icon: '🏛️', desc: 'Stakeholder review, métriques, escalade' },
      ],
    },
    hybride: {
      id: 'hybride',
      label: 'Hybride',
      shortLabel: 'Hybride',
      desc: 'Combine planification cadrée (phases, jalons) et flexibilité Agile (backlog, itérations). Idéal pour grands projets avec lots en waterfall et équipes en agile.',
      phases: ['Cadrage', 'Planification', 'Exécution itérative', 'Clôture'],
      artifacts: ['Charte', 'Backlog maître', 'WBS par lot', 'Gantt jalons', 'RAID', 'RACI', 'Rapports'],
      steps: [
        { id: 'cadrage',     label: 'Cadrage',         icon: '🎯', desc: 'Périmètre, objectifs, parties prenantes' },
        { id: 'charte',      label: 'Charte Projet',   icon: '📋', desc: 'Project Charter — lancement formel' },
        { id: 'backlog_hybrid', label: 'Backlog & WBS', icon: '🌳', desc: 'Backlog priorisé + découpage par lots' },
        { id: 'raci',        label: 'RACI',            icon: '👥', desc: 'Matrice des responsabilités' },
        { id: 'raid',        label: 'RAID Initial',    icon: '⚠️',  desc: 'Risques, Actions, Issues, Décisions' },
        { id: 'planning',    label: 'Planning',        icon: '📅', desc: 'Jalons, itérations, livraisons' },
        { id: 'gouvernance', label: 'Gouvernance',     icon: '🏛️', desc: 'Comités, reporting, KPIs' },
      ],
    },
  };

  function getMethodologies() {
    return METHODOLOGIES;
  }

  function getWizardSteps(methodology) {
    const m = methodology && METHODOLOGIES[methodology] ? methodology : 'waterfall';
    return METHODOLOGIES[m].steps;
  }

  function getMethodology(id) {
    return METHODOLOGIES[id] || METHODOLOGIES.waterfall;
  }

  // ── WIZARD STEPS (legacy: défaut Waterfall) ─────────────────────
  const WIZARD_STEPS = METHODOLOGIES.waterfall.steps;

  // ── API IA ────────────────────────────────────────────────────
  function getAISettings()       { return load(KEYS.aiSettings, DEFAULT_AI_SETTINGS); }
  function saveAISettings(data)  { return save(KEYS.aiSettings, { ...DEFAULT_AI_SETTINGS, ...data }); }

  function isAIEnabled() {
    const s = getAISettings();
    return s.enabled && s.apiKey && s.provider;
  }

  async function callAI(systemPrompt, userPrompt) {
    const s = getAISettings();
    if (!s.enabled || !s.apiKey || !s.provider) throw new Error('IA non configurée. Allez dans Paramètres → IA.');

    const provider = AI_PROVIDERS[s.provider];
    const endpoint = s.provider === 'custom' ? s.endpoint : provider.endpoint;
    const model    = s.model || provider.models[0];

    // Build headers
    const headers = { 'Content-Type': 'application/json' };
    headers[provider.headerKey] = provider.headerPrefix + s.apiKey;
    if (s.provider === 'anthropic') headers['anthropic-version'] = '2023-06-01';

    // Build body
    let body;
    if (s.provider === 'anthropic') {
      body = { model, max_tokens: 2048, system: systemPrompt, messages: [{ role:'user', content: userPrompt }] };
    } else {
      body = { model, messages: [{ role:'system', content: systemPrompt }, { role:'user', content: userPrompt }], temperature: 0.7, max_completion_tokens: 2048 };
    }

    const res = await fetch(endpoint, { method:'POST', headers, body: JSON.stringify(body) });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Erreur API ${res.status}`);
    }
    const data = await res.json();

    // Extract text
    if (s.provider === 'anthropic') return data.content?.[0]?.text || '';
    return data.choices?.[0]?.message?.content || '';
  }

  // ── PUBLIC API ────────────────────────────────────────────────
  return {
    getProjects, saveProjects, addProject, updateProject, deleteProject, archiveProject, restoreProject, getProjectById,
    getTemplate, saveTemplate, getProjectTemplates, countSavedTemplates,
    getRaids, saveRaids, addRaidItem, updateRaidItem, deleteRaidItem,
    getGanttTasks, saveGanttTasks,
    getStakeholders, saveStakeholders,
    getCommunicationPlan, saveCommunicationPlan,
    getBudget, saveBudget,
    getDeliverables, saveDeliverables,
    getOnePagerReports, saveOnePagerReports,
    getRetros, saveRetros,
    getResources, saveResources,
    getWizardState, saveWizardState,
    getProfile, saveProfile,
    getAISettings, saveAISettings, isAIEnabled, callAI,
    getStats,
    getPortfolioKpis,
    getProjectHealth,
    getBudgetEVM,
    getResourceAllocations,
    getParam, goTo,
    onChange,
    WIZARD_STEPS,
    METHODOLOGIES,
    getMethodologies,
    getWizardSteps,
    getMethodology,
    AI_PROVIDERS,
    KEYS
  };

})();
