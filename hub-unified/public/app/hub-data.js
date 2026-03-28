/**
 * Hub Unifié — Couche de données PM + Delivery/Business
 * Abdelhakim Nechniche — Telecom & IT Project Manager
 *
 * Ce fichier contient :
 * 1. Theme no-flash + injection scripts
 * 2. Gestion unifiée des rôles (GOD, CDP, Delivery, Business, Sales, Head)
 * 3. const PMHUB  — données projet (ex hub-v2)
 * 4. const DELHUB — données delivery/business (ex hub-v3)
 */

// ══════════════════════════════════════════════════════════════
// 1. THEME NO-FLASH
// ══════════════════════════════════════════════════════════════
(function () {
  try {
    var t = localStorage.getItem('hub_theme') || localStorage.getItem('pmhub_theme') || localStorage.getItem('delhub_theme');
    if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
  } catch (e) {}
})();

// ══════════════════════════════════════════════════════════════
// 2. ROLE DETECTION + data-role attribute
// ══════════════════════════════════════════════════════════════
(function setRoleAttribute() {
  try {
    var profile = JSON.parse(localStorage.getItem('hub_profile') || localStorage.getItem('delhub_profile') || '{}');
    var role = profile.role || 'pm';
    // GOD peut simuler un rôle
    var simulated = sessionStorage.getItem('hub_simulated_role') || sessionStorage.getItem('delhub_simulated_role');
    if (simulated && role === 'god') role = simulated;
    document.documentElement.setAttribute('data-role', role);
  } catch (e) {
    document.documentElement.setAttribute('data-role', 'pm');
  }
})();

// ══════════════════════════════════════════════════════════════
// 3. INJECTION SCRIPTS PARTAGÉS
// ══════════════════════════════════════════════════════════════
(function injectThemeToggle() {
  if (document.getElementById('hub-theme-toggle-js')) return;
  var s = document.createElement('script');
  s.id = 'hub-theme-toggle-js';
  s.src = 'hub-theme-toggle.js';
  document.head.appendChild(s);
})();

(function injectSupabase() {
  if (document.getElementById('hub-supabase-cdn')) return;
  var cdn = document.createElement('script');
  cdn.id  = 'hub-supabase-cdn';
  cdn.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
  cdn.onload = function () {
    var auth = document.createElement('script');
    auth.src = 'hub-supabase.js';
    document.head.appendChild(auth);
  };
  document.head.appendChild(cdn);
})();

// ══════════════════════════════════════════════════════════════
// 4. UNIFIED ROLES & PAGE ACCESS
// ══════════════════════════════════════════════════════════════
const HUB_ROLES = {
  god:      { label: 'GOD / Admin',        level: 100, color: '#F59E0B' },
  pm:       { label: 'Chef de Projet',     level: 40,  color: '#818CF8' },
  delivery: { label: 'Delivery Manager',   level: 60,  color: '#2DD4BF' },
  business: { label: 'Business Manager',   level: 60,  color: '#F43F5E' },
  sales:    { label: 'Sales / Commercial', level: 40,  color: '#F97316' },
  head:     { label: 'Head / C-Level',     level: 80,  color: '#A855F7' },
};

// Matrice unifiée : filename (sans .html) → { role: 'CRUD'|'READ' }
// null = pas d'accès
const PAGE_ACCESS = {
  // PM Hub — Portefeuille
  'pm-hub':            { god:'CRUD', pm:'CRUD', delivery:'READ', head:'READ' },
  'pm-hub-portfolio':  { god:'CRUD', pm:'CRUD', delivery:'READ', head:'CRUD' },
  'pm-hub-executive':  { god:'CRUD', pm:'CRUD', head:'CRUD' },
  'pm-hub-transverse': { god:'CRUD', pm:'CRUD', delivery:'READ', head:'READ' },
  // PM Hub — Projet
  'pm-hub-project':    { god:'CRUD', pm:'CRUD', delivery:'READ', head:'READ' },
  'pm-hub-gantt':      { god:'CRUD', pm:'CRUD', delivery:'READ' },
  'pm-hub-wbs':        { god:'CRUD', pm:'CRUD', delivery:'READ' },
  'pm-hub-kanban':     { god:'CRUD', pm:'CRUD', delivery:'READ' },
  'pm-hub-agile':      { god:'CRUD', pm:'CRUD', delivery:'READ' },
  'pm-hub-raid':       { god:'CRUD', pm:'CRUD', delivery:'READ' },
  'pm-hub-budget':     { god:'CRUD', pm:'CRUD', delivery:'READ', business:'READ', head:'READ' },
  'pm-hub-resources':  { god:'CRUD', pm:'CRUD', delivery:'READ' },
  'pm-hub-governance': { god:'CRUD', pm:'CRUD', delivery:'READ', head:'READ' },
  'pm-hub-report':     { god:'CRUD', pm:'CRUD', delivery:'READ', head:'READ' },
  // Hub IA Unifié — accessible à tous les rôles
  'hub-ai':            { god:'CRUD', pm:'CRUD', delivery:'CRUD', business:'CRUD', sales:'CRUD', head:'CRUD' },
  // PM Hub — Outils
  'pm-hub-ai':         { god:'CRUD', pm:'CRUD' },
  'pm-hub-ai-chat':    { god:'CRUD', pm:'CRUD' },
  'pm-hub-ai-raid':    { god:'CRUD', pm:'CRUD' },
  'pm-hub-ai-redac':   { god:'CRUD', pm:'CRUD' },
  'pm-hub-ai-briefing':{ god:'CRUD', pm:'CRUD' },
  'pm-hub-ai-livrable':{ god:'CRUD', pm:'CRUD' },
  'pm-hub-templates':  { god:'CRUD', pm:'CRUD' },
  'pm-hub-knowledge':  { god:'CRUD', pm:'CRUD' },
  'pm-hub-wizard':     { god:'CRUD', pm:'CRUD' },
  'pm-hub-demo':       { god:'CRUD', pm:'CRUD' },
  'pm-hub-settings':   { god:'CRUD', pm:'CRUD', delivery:'CRUD', business:'CRUD', sales:'CRUD', head:'CRUD' },
  // DelHub — Admin
  'delhub-admin':      { god:'CRUD' },
  // DelHub — Pilotage
  'delhub-dashboard':  { god:'CRUD', delivery:'CRUD', business:'CRUD', sales:'CRUD', head:'CRUD' },
  'delhub-exec':       { god:'CRUD', delivery:'READ', business:'READ', head:'CRUD' },
  'delhub-reports':    { god:'CRUD', delivery:'CRUD', business:'CRUD', sales:'CRUD', head:'CRUD' },
  // DelHub — Commercial
  'delhub-crm':        { god:'CRUD', sales:'CRUD', business:'READ', head:'READ' },
  'delhub-proposals':  { god:'CRUD', sales:'CRUD', business:'CRUD', delivery:'READ', head:'READ' },
  'delhub-forecast':   { god:'CRUD', sales:'CRUD', business:'CRUD', head:'CRUD' },
  // DelHub — Business
  'delhub-contracts':  { god:'CRUD', business:'CRUD', delivery:'CRUD', sales:'READ', head:'READ' },
  'delhub-pnl':        { god:'CRUD', business:'CRUD', delivery:'READ', head:'CRUD' },
  'delhub-portfolio':  { god:'CRUD', business:'CRUD', delivery:'CRUD', sales:'READ', head:'CRUD' },
  // DelHub — Delivery
  'delhub-pipeline':   { god:'CRUD', delivery:'CRUD', business:'READ', head:'READ' },
  'delhub-sla':        { god:'CRUD', delivery:'CRUD', business:'READ', head:'READ' },
  'delhub-capacity':   { god:'CRUD', delivery:'CRUD', head:'READ' },
  'delhub-releases':   { god:'CRUD', delivery:'CRUD', business:'READ', head:'READ' },
  'delhub-incidents':  { god:'CRUD', delivery:'CRUD', business:'READ', head:'CRUD' },
  // DelHub — Outils
  'delhub-ai':         { god:'CRUD', delivery:'CRUD', business:'CRUD', sales:'CRUD', head:'CRUD' },
  'delhub-settings':   { god:'CRUD', delivery:'CRUD', business:'CRUD', sales:'CRUD', head:'CRUD' },
  // Login (toujours accessible)
  'hub-login':         { god:'CRUD', pm:'CRUD', delivery:'CRUD', business:'CRUD', sales:'CRUD', head:'CRUD' },
  'pm-hub-login':      { god:'CRUD', pm:'CRUD', delivery:'CRUD', business:'CRUD', sales:'CRUD', head:'CRUD' },
  'delhub-login':      { god:'CRUD', pm:'CRUD', delivery:'CRUD', business:'CRUD', sales:'CRUD', head:'CRUD' },
};

// Helper : rôle unifié
function _getHubProfile() {
  try {
    return JSON.parse(localStorage.getItem('hub_profile') || localStorage.getItem('delhub_profile') || localStorage.getItem('pmhub_profile') || '{}');
  } catch(e) { return {}; }
}

function getHubRole() {
  return _getHubProfile().role || 'pm';
}

function getHubEffectiveRole() {
  var simulated = sessionStorage.getItem('hub_simulated_role') || sessionStorage.getItem('delhub_simulated_role');
  if (simulated && getHubRole() === 'god') return simulated;
  return getHubRole();
}

function isHubGod() { return getHubRole() === 'god'; }

function hubCanAccess(pageKey) {
  var role = getHubEffectiveRole();
  if (role === 'god') return 'CRUD';
  var entry = PAGE_ACCESS[pageKey];
  return entry && entry[role] || null;
}

function hubCanWrite(pageKey) {
  return hubCanAccess(pageKey) === 'CRUD';
}

// Expose unified role helpers globally
window.HUB_ROLES = HUB_ROLES;
window.PAGE_ACCESS = PAGE_ACCESS;
window.getHubRole = getHubRole;
window.getHubEffectiveRole = getHubEffectiveRole;
window.isHubGod = isHubGod;
window.hubCanAccess = hubCanAccess;
window.hubCanWrite = hubCanWrite;

// Default landing page per role
window.HUB_DEFAULT_PAGE = {
  god:      'pm-hub.html',
  pm:       'pm-hub.html',
  delivery: 'delhub-dashboard.html',
  business: 'delhub-contracts.html',
  sales:    'delhub-crm.html',
  head:     'pm-hub.html',
};


// ══════════════════════════════════════════════════════════════
// 5. PMHUB — Données Projet (ex hub-v2/pmhub-data.js)
// ══════════════════════════════════════════════════════════════
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

  const DEFAULT_AI_SETTINGS = {
    provider:   '',
    apiKey:     '',
    model:      '',
    endpoint:   '',
    enabled:    false,
  };

  const AI_PROVIDERS = {
    openai:    { label:'OpenAI (ChatGPT)',   endpoint:'https://api.openai.com/v1/chat/completions',   models:['gpt-5.4','gpt-5-mini','gpt-4.1','gpt-4.1-mini','gpt-4.1-nano','gpt-4o','gpt-4o-mini','gpt-4-turbo','gpt-4o-2024-08-06','gpt-4o-mini-2024-07-18','o1','o1-mini','o3-mini','gpt-3.5-turbo'], headerKey:'Authorization', headerPrefix:'Bearer ' },
    anthropic: { label:'Anthropic (Claude)', endpoint:'https://api.anthropic.com/v1/messages',        models:['claude-opus-4-5','claude-sonnet-4-5','claude-haiku-4-5'], headerKey:'x-api-key', headerPrefix:'' },
    mistral:   { label:'Mistral AI',         endpoint:'https://api.mistral.ai/v1/chat/completions',   models:['mistral-large-latest','mistral-medium-latest','mistral-small-latest','codestral-latest'], headerKey:'Authorization', headerPrefix:'Bearer ' },
    custom:    { label:'API Personnalisée',  endpoint:'', models:[], headerKey:'Authorization', headerPrefix:'Bearer ' },
  };

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

  const DEFAULT_PROJECTS = [
    {
      id: 1, ref: 'PRJ-2025-001', name: 'AI-Driven Smart Data Center',
      desc: 'Déploiement d\'un Data Center intelligent piloté par IA : automatisation des opérations, optimisation énergétique, monitoring prédictif.',
      status: 'active', progress: 35, type: 'R&D / Innovation',
      start: '2025-11-01', end: '2026-09-30', budget: '450 000',
      sponsor: 'Direction Innovation AMARIS', team: ['AN', 'ML', 'KB', 'SC'],
      icon: '🧠', color: '#63d2b4', priority: 'Critique', phase: 'Planification',
      methodology: 'waterfall', client: 'Interne / Grand Compte',
      risks: 3, actions: 7, createdAt: '2025-11-01T09:00:00.000Z'
    },
    {
      id: 2, ref: 'PRJ-2024-008', name: 'Orange PMPR / BLIM',
      desc: 'Programme de modernisation du réseau Orange — gestion des migrations BLIM et pilotage des projets réseau (PMPR).',
      status: 'closed', progress: 100, type: 'Télécoms / Réseau',
      start: '2023-09-01', end: '2025-06-30', budget: '—',
      sponsor: 'Orange France', team: ['AN', 'RC', 'FD'],
      icon: '📡', color: '#e8c97a', priority: 'Haute', phase: 'Clôture',
      methodology: 'waterfall', client: 'Orange France',
      risks: 0, actions: 0, createdAt: '2023-09-01T08:00:00.000Z'
    },
    {
      id: 3, ref: 'PRJ-2025-002', name: 'Tableau de Bord Power BI — R&D',
      desc: 'Développement d\'un système de reporting analytique R&D sous Power BI.',
      status: 'closed', progress: 100, type: 'Data / Analytics',
      start: '2025-07-01', end: '2025-11-30', budget: '—',
      sponsor: 'Direction R&D AMARIS', team: ['AN', 'TD'],
      icon: '📊', color: '#7ab8e8', priority: 'Haute', phase: 'Clôture',
      methodology: 'waterfall', client: 'Interne AMARIS',
      risks: 0, actions: 0, createdAt: '2025-07-01T08:00:00.000Z'
    },
    {
      id: 4, ref: 'PRJ-2023-004', name: 'FTTA Bouygues — AMARIS Tunis',
      desc: 'Déploiement Fiber-To-The-Antenna pour Bouygues Télécom.',
      status: 'closed', progress: 100, type: 'Télécoms / Infrastructure',
      start: '2020-06-01', end: '2023-08-31', budget: '—',
      sponsor: 'Bouygues Télécom', team: ['AN', 'MB', 'YA'],
      icon: '📶', color: '#b07ae8', priority: 'Normale', phase: 'Clôture',
      methodology: 'waterfall', client: 'Bouygues Télécom',
      risks: 0, actions: 0, createdAt: '2020-06-01T08:00:00.000Z'
    }
  ];

  const DEFAULT_RESOURCES = [
    { id: 'AN', name: 'Abdelhakim Nechniche', role: 'Project Manager', level: 'Senior', availability: 80, skills: ['PMP', 'PRINCE2', 'Jira', 'Power BI', 'Télécoms'], color: '#63d2b4' },
    { id: 'ML', name: 'Marc Leblanc',         role: 'Data Architect',   level: 'Senior', availability: 60, skills: ['Data Engineering', 'Python', 'SQL', 'Azure'], color: '#7ab8e8' },
    { id: 'KB', name: 'Karim Benali',         role: 'Infrastructure Engineer', level: 'Confirmé', availability: 80, skills: ['Datacenter', 'Réseau', 'VMware', 'Linux'], color: '#e8c97a' },
    { id: 'SC', name: 'Sophie Carré',         role: 'AI/ML Engineer',  level: 'Confirmé', availability: 70, skills: ['ML', 'Python', 'TensorFlow', 'MLOps'], color: '#e07070' },
  ];

  // Helpers
  function load(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch(e) { return fallback; }
  }

  var SYNC_TS_KEY = 'pmhub_sync_ts';
  function getSyncTs() { try { return JSON.parse(localStorage.getItem(SYNC_TS_KEY) || '{}'); } catch(e) { return {}; } }
  function stampLocal(key) {
    try { var ts = getSyncTs(); ts[key] = new Date().toISOString(); localStorage.setItem(SYNC_TS_KEY, JSON.stringify(ts)); } catch(e) {}
  }

  function save(key, data) {
    try {
      // 1. Cache local immédiat (pour UX réactive)
      localStorage.setItem(key, JSON.stringify(data));
      stampLocal(key);
      // 2. Refresh UI
      window.dispatchEvent(new CustomEvent('pmhub:update', { detail: { key: key, source: 'local' } }));
      // 3. Sync Supabase (source de vérité) — retry 1x si erreur
      if (window.HUB_AUTH && window.HUB_AUTH.saveToCloud) {
        window.HUB_AUTH.saveToCloud(key, data).then(function(r) {
          if (r && r.error) {
            console.warn('[PMHUB] Retry saveToCloud:', key);
            setTimeout(function() { window.HUB_AUTH.saveToCloud(key, data); }, 2000);
          }
        }).catch(function() {
          setTimeout(function() { window.HUB_AUTH.saveToCloud(key, data); }, 2000);
        });
      }
      return true;
    } catch(e) { return false; }
  }

  // API Projets
  function getProjects()           { return load(KEYS.projects, DEFAULT_PROJECTS); }
  function saveProjects(list)      { return save(KEYS.projects, list); }
  function addProject(project)     { const list = getProjects(); project.id = project.id || Date.now(); list.unshift(project); saveProjects(list); return project; }
  function updateProject(id, changes) { const list = getProjects(); const idx = list.findIndex(p => p.id === id); if (idx === -1) return false; list[idx] = { ...list[idx], ...changes }; saveProjects(list); return list[idx]; }
  function deleteProject(id)       { const list = getProjects().filter(p => p.id != id); saveProjects(list); const tpls = load(KEYS.templates, {}); Object.keys(tpls).forEach(k => { if (k.startsWith(id + '_')) delete tpls[k]; }); save(KEYS.templates, tpls); }
  function getProjectById(id)      { return getProjects().find(p => String(p.id) === String(id)) || null; }

  // API Templates
  function getTemplate(projectId, templateId) { const tpls = load(KEYS.templates, {}); return tpls[`${projectId}_${templateId}`] || null; }
  function saveTemplate(projectId, templateId, data) { const tpls = load(KEYS.templates, {}); tpls[`${projectId}_${templateId}`] = { ...data, projectId, templateId, savedAt: new Date().toISOString() }; return save(KEYS.templates, tpls); }
  function getProjectTemplates(projectId) { const tpls = load(KEYS.templates, {}); return Object.entries(tpls).filter(([k]) => k.startsWith(projectId + '_')).map(([, v]) => v); }
  function countSavedTemplates(projectId) { return getProjectTemplates(projectId).length; }

  // API RAID
  function getRaids(projectId)     { const all = load(KEYS.raids, {}); return all[projectId] || { risks: [], actions: [], issues: [], decisions: [] }; }
  function saveRaids(projectId, data) { const all = load(KEYS.raids, {}); all[projectId] = data; return save(KEYS.raids, all); }
  function addRaidItem(projectId, type, item) { const data = getRaids(projectId); item.id = Date.now(); item.createdAt = new Date().toISOString(); data[type].push(item); saveRaids(projectId, data); return item; }
  function updateRaidItem(projectId, type, itemId, changes) { const data = getRaids(projectId); const idx = data[type].findIndex(i => i.id === itemId); if (idx !== -1) { data[type][idx] = { ...data[type][idx], ...changes }; saveRaids(projectId, data); } }
  function deleteRaidItem(projectId, type, itemId) { const data = getRaids(projectId); data[type] = data[type].filter(i => i.id !== itemId); saveRaids(projectId, data); }

  // API Gantt
  function getGanttTasks(projectId) { try { const raw = typeof localStorage !== 'undefined' && localStorage.getItem(KEYS.ganttPrefix + projectId); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }
  function saveGanttTasks(projectId, tasks) { if (typeof localStorage === 'undefined') return; localStorage.setItem(KEYS.ganttPrefix + projectId, JSON.stringify(tasks)); }

  // API Stakeholders
  function getStakeholders(projectId) { const all = load(KEYS.stakeholders, {}); return all[projectId] || []; }
  function saveStakeholders(projectId, list) { const all = load(KEYS.stakeholders, {}); all[projectId] = list; return save(KEYS.stakeholders, all); }

  // API Communication
  function getCommunicationPlan(projectId) { const all = load(KEYS.communication, {}); return all[projectId] || { plan: [], history: [] }; }
  function saveCommunicationPlan(projectId, data) { const all = load(KEYS.communication, {}); all[projectId] = data; return save(KEYS.communication, all); }

  // API Budget
  function getBudget(projectId) { const all = load(KEYS.budget, {}); return all[projectId] || { planned: 0, committed: 0, consumed: 0, currency: '€', entries: [] }; }
  function saveBudget(projectId, data) { const all = load(KEYS.budget, {}); all[projectId] = data; return save(KEYS.budget, all); }

  // API Livrables
  function getDeliverables(projectId) { const all = load(KEYS.deliverables, {}); return all[projectId] || []; }
  function saveDeliverables(projectId, list) { const all = load(KEYS.deliverables, {}); all[projectId] = list; return save(KEYS.deliverables, all); }

  // API One-Pager
  function getOnePagerReports(projectId) { const all = load(KEYS.onePager, {}); return all[projectId] || []; }
  function saveOnePagerReports(projectId, list) { const all = load(KEYS.onePager, {}); all[projectId] = list; return save(KEYS.onePager, all); }

  // API Rex / Rétro
  function getRetros(projectId) { const all = load(KEYS.retros, {}); return all[projectId] || []; }
  function saveRetros(projectId, list) { const all = load(KEYS.retros, {}); all[projectId] = list; return save(KEYS.retros, all); }

  // API Ressources
  function getResources()      { return load(KEYS.resources, DEFAULT_RESOURCES); }
  function saveResources(list) { return save(KEYS.resources, list); }

  // API Wizard
  function getWizardState(projectId) { const all = load(KEYS.wizard, {}); return all[projectId] || { currentStep: 0, completedSteps: [], data: {} }; }
  function saveWizardState(projectId, state) { const all = load(KEYS.wizard, {}); all[projectId] = state; return save(KEYS.wizard, all); }

  // Profil
  function getProfile()       { return load(KEYS.profile, DEFAULT_PROFILE); }
  function saveProfile(data)  { return save(KEYS.profile, data); }

  // Stats
  function getStats() {
    const list = getProjects().filter(p => p.status !== 'archived');
    return {
      total: list.length, active: list.filter(p => p.status === 'active').length,
      risk: list.filter(p => p.status === 'risk').length, hold: list.filter(p => p.status === 'hold').length,
      closed: list.filter(p => p.status === 'closed').length,
      archived: getProjects().filter(p => p.status === 'archived').length,
      avgProgress: list.length ? Math.round(list.reduce((s,p) => s + (p.progress||0), 0) / list.length) : 0
    };
  }

  function archiveProject(id) { return updateProject(id, { status: 'archived' }); }
  function restoreProject(id) { return updateProject(id, { status: 'active' }); }

  // Portfolio / PMO KPIs
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
      totalProjects: list.length, activeProjects: active.length,
      healthyCount: active.length - criticalCount - atRiskCount,
      atRiskCount, criticalCount,
      totalBudget: Math.round(totalBudget), consumedBudget: Math.round(consumedBudget),
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
    return { score, rag, trend: 'neutral', openRisks, openIssues, milestonesTotal: milestones.length, milestonesDone, nextDeadline: p.end || null, teamCapacity: (p.team || []).length ? 85 : 0 };
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
    return { bac: planned, ac: Math.round(ac), pv: Math.round(pv), ev: Math.round(ev), cpi: Math.round(cpi * 100) / 100, spi: Math.round(spi * 100) / 100, eac: Math.round(eac), cv: Math.round(ev - ac), sv: Math.round(ev - pv) };
  }

  function getResourceAllocations() {
    const resources = getResources();
    const projects = getProjects().filter(p => p.status === 'active');
    return resources.map(r => {
      const assigned = projects.filter(p => (p.team || []).indexOf(r.id) >= 0).length;
      const load = assigned * 25;
      return { id: r.id, name: r.name, role: r.role, availability: r.availability || 0, allocatedPercent: Math.min(100, load), overload: load > (r.availability || 0) };
    });
  }

  // URL Params
  function getParam(name)        { return new URLSearchParams(window.location.search).get(name); }
  function goTo(page, params={}) { const q = new URLSearchParams(params).toString(); window.location.href = q ? `${page}?${q}` : page; }

  // Écoute
  function onChange(cb) {
    window.addEventListener('pmhub:update', cb);
    window.addEventListener('storage', e => { if (e.key && e.key.startsWith('pmhub_')) cb({ detail: { key: e.key } }); });
  }

  // Méthodologies
  const METHODOLOGIES = {
    waterfall: {
      id: 'waterfall', label: 'Waterfall (Cycle en V)', shortLabel: 'Waterfall',
      desc: 'Projet séquentiel : cadrage → planification détaillée → exécution → clôture.',
      phases: ['Initialisation', 'Planification', 'Exécution', 'Contrôle', 'Clôture'],
      artifacts: ['Charte', 'WBS', 'Gantt', 'RAID', 'RACI', 'Rapports de statut', 'Change Request', 'REX'],
      steps: [
        { id: 'cadrage', label: 'Cadrage', icon: '🎯', desc: 'Périmètre, objectifs SMART, parties prenantes' },
        { id: 'charte', label: 'Charte Projet', icon: '📋', desc: 'Project Charter — document officiel de lancement' },
        { id: 'wbs', label: 'WBS / Livrables', icon: '🌳', desc: 'Work Breakdown Structure' },
        { id: 'raci', label: 'RACI', icon: '👥', desc: 'Matrice des responsabilités par livrable' },
        { id: 'raid', label: 'RAID Initial', icon: '⚠️', desc: 'Risques, Actions, Issues, Décisions' },
        { id: 'planning', label: 'Planning', icon: '📅', desc: 'Jalons, dépendances, chemin critique' },
        { id: 'gouvernance', label: 'Gouvernance', icon: '🏛️', desc: 'Comités, reporting, escalade, KPIs' },
      ],
    },
    agile: {
      id: 'agile', label: 'Scrum', shortLabel: 'Scrum',
      desc: 'Framework Scrum : itérations, Product Backlog, cérémonies, Definition of Done.',
      phases: ['Discovery', 'Release Planning', 'Sprints', 'Release', 'Rétrospective'],
      artifacts: ['Product Backlog', 'Sprint Backlog', 'Increment', 'Burndown', 'Definition of Done', 'RAID', 'Rétro'],
      steps: [
        { id: 'vision', label: 'Vision & Produit', icon: '🎯', desc: 'Vision produit, personas, objectifs utilisateur' },
        { id: 'backlog', label: 'Product Backlog', icon: '📋', desc: 'User stories priorisées, valeur métier' },
        { id: 'raci', label: 'Rôles Scrum', icon: '👥', desc: 'Product Owner, Scrum Master, équipe' },
        { id: 'raid', label: 'RAID Initial', icon: '⚠️', desc: 'Risques, Actions, Issues, Décisions' },
        { id: 'sprints', label: 'Sprints & Rituals', icon: '📅', desc: 'Durée sprint, planning, daily, review, rétro' },
        { id: 'definition_of_done', label: 'Definition of Done', icon: '✅', desc: 'Critères d\'acceptation' },
        { id: 'gouvernance', label: 'Gouvernance', icon: '🏛️', desc: 'Stakeholder review, métriques, escalade' },
      ],
    },
    hybride: {
      id: 'hybride', label: 'Hybride', shortLabel: 'Hybride',
      desc: 'Combine planification cadrée et flexibilité Agile.',
      phases: ['Cadrage', 'Planification', 'Exécution itérative', 'Clôture'],
      artifacts: ['Charte', 'Backlog maître', 'WBS par lot', 'Gantt jalons', 'RAID', 'RACI', 'Rapports'],
      steps: [
        { id: 'cadrage', label: 'Cadrage', icon: '🎯', desc: 'Périmètre, objectifs, parties prenantes' },
        { id: 'charte', label: 'Charte Projet', icon: '📋', desc: 'Project Charter — lancement formel' },
        { id: 'backlog_hybrid', label: 'Backlog & WBS', icon: '🌳', desc: 'Backlog priorisé + découpage par lots' },
        { id: 'raci', label: 'RACI', icon: '👥', desc: 'Matrice des responsabilités' },
        { id: 'raid', label: 'RAID Initial', icon: '⚠️', desc: 'Risques, Actions, Issues, Décisions' },
        { id: 'planning', label: 'Planning', icon: '📅', desc: 'Jalons, itérations, livraisons' },
        { id: 'gouvernance', label: 'Gouvernance', icon: '🏛️', desc: 'Comités, reporting, KPIs' },
      ],
    },
  };

  function getMethodologies() { return METHODOLOGIES; }
  function getWizardSteps(methodology) { const m = methodology && METHODOLOGIES[methodology] ? methodology : 'waterfall'; return METHODOLOGIES[m].steps; }
  function getMethodology(id) { return METHODOLOGIES[id] || METHODOLOGIES.waterfall; }

  const WIZARD_STEPS = METHODOLOGIES.waterfall.steps;

  // AI
  function getAISettings()       { return load(KEYS.aiSettings, DEFAULT_AI_SETTINGS); }
  function saveAISettings(data)  { return save(KEYS.aiSettings, { ...DEFAULT_AI_SETTINGS, ...data }); }
  function isAIEnabled()         { const s = getAISettings(); return s.enabled && s.apiKey && s.provider; }

  async function callAI(systemPrompt, userPrompt) {
    const s = getAISettings();
    if (!s.enabled || !s.apiKey || !s.provider) throw new Error('IA non configurée. Allez dans Paramètres → IA.');
    const provider = AI_PROVIDERS[s.provider];
    const endpoint = s.provider === 'custom' ? s.endpoint : provider.endpoint;
    const model    = s.model || provider.models[0];
    const headers = { 'Content-Type': 'application/json' };
    headers[provider.headerKey] = provider.headerPrefix + s.apiKey;
    if (s.provider === 'anthropic') headers['anthropic-version'] = '2023-06-01';
    let body;
    if (s.provider === 'anthropic') {
      body = { model, max_tokens: 4096, system: systemPrompt, messages: [{ role:'user', content: userPrompt }] };
    } else {
      body = { model, messages: [{ role:'system', content: systemPrompt }, { role:'user', content: userPrompt }], temperature: 0.7, max_completion_tokens: 4096 };
    }
    console.log('[PMHUB.callAI] Requete:', s.provider, model, 'system:', systemPrompt.length, 'user:', userPrompt.length);
    const res = await fetch(endpoint, { method:'POST', headers, body: JSON.stringify(body) });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err?.error?.message || `Erreur API ${res.status}`); }
    const data = await res.json();
    const content = s.provider === 'anthropic' ? (data.content?.[0]?.text || '') : (data.choices?.[0]?.message?.content || '');
    if (!content) {
      console.warn('[PMHUB.callAI] Reponse VIDE! Brut:', JSON.stringify(data).substring(0, 800));
      console.warn('[PMHUB.callAI] finish_reason:', data.choices?.[0]?.finish_reason, 'refusal:', data.choices?.[0]?.message?.refusal);
    }
    return content;
  }

  // PUBLIC API
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
    getPortfolioKpis, getProjectHealth, getBudgetEVM, getResourceAllocations,
    getParam, goTo, onChange,
    WIZARD_STEPS, METHODOLOGIES, getMethodologies, getWizardSteps, getMethodology,
    AI_PROVIDERS, KEYS
  };

})();


// ══════════════════════════════════════════════════════════════
// 6. DELHUB — Données Delivery & Business (ex hub-v3/delhub-data.js)
// ══════════════════════════════════════════════════════════════
const DELHUB = (() => {

  const KEYS = {
    profile:       'delhub_profile',
    aiSettings:    'pmhub_ai_settings',  // unifié : mêmes settings IA que PMHUB
    crm:           'delhub_crm',
    proposals:     'delhub_proposals',
    contracts:     'delhub_contracts',
    pnl:           'delhub_pnl',
    forecast:      'delhub_forecast',
    engagements:   'delhub_engagements',
    pipeline:      'delhub_pipeline',
    releases:      'delhub_releases',
    capacity:      'delhub_capacity',
    incidents:     'delhub_incidents',
    execSessions:  'delhub_exec_sessions',
    users:         'delhub_users',
  };

  const ROLES = {
    god:      { label: 'GOD / Admin',       level: 100 },
    head:     { label: 'Head / C-Level',    level: 80 },
    business: { label: 'Business Manager',  level: 60 },
    delivery: { label: 'Delivery Manager',  level: 60 },
    sales:    { label: 'Sales / Commercial', level: 40 },
    pm:       { label: 'Chef de Projet',    level: 40 },
  };

  const VISIBILITY = {
    crm:         { god: 'CRUD', sales: 'CRUD', business: 'READ', head: 'READ' },
    proposals:   { god: 'CRUD', sales: 'CRUD', business: 'CRUD', delivery: 'READ', head: 'READ' },
    forecast:    { god: 'CRUD', sales: 'CRUD', business: 'CRUD', head: 'CRUD' },
    contracts:   { god: 'CRUD', business: 'CRUD', delivery: 'CRUD', sales: 'READ', head: 'READ' },
    pnl:         { god: 'CRUD', business: 'CRUD', delivery: 'READ', head: 'CRUD' },
    portfolio:   { god: 'CRUD', business: 'CRUD', delivery: 'CRUD', sales: 'READ', head: 'CRUD' },
    pipeline:    { god: 'CRUD', delivery: 'CRUD', business: 'READ', head: 'READ' },
    engagements: { god: 'CRUD', delivery: 'CRUD', business: 'READ', head: 'READ' },
    capacity:    { god: 'CRUD', delivery: 'CRUD', head: 'READ' },
    releases:    { god: 'CRUD', delivery: 'CRUD', business: 'READ', head: 'READ' },
    incidents:   { god: 'CRUD', delivery: 'CRUD', business: 'READ', head: 'CRUD' },
    exec:        { god: 'CRUD', head: 'CRUD', delivery: 'READ', business: 'READ' },
    reports:     { god: 'CRUD', head: 'CRUD', delivery: 'CRUD', business: 'CRUD', sales: 'CRUD' },
    ai:          { god: 'CRUD', head: 'CRUD', delivery: 'CRUD', business: 'CRUD', sales: 'CRUD' },
    settings:    { god: 'CRUD', head: 'CRUD', delivery: 'CRUD', business: 'CRUD', sales: 'CRUD' },
    admin:       { god: 'CRUD' },
  };

  const DEFAULT_AI_SETTINGS = { provider: '', apiKey: '', model: '', endpoint: '', enabled: false };

  const AI_PROVIDERS = {
    openai:    { label:'OpenAI (ChatGPT)',   endpoint:'https://api.openai.com/v1/chat/completions',   models:['gpt-5.4','gpt-5-mini','gpt-4.1','gpt-4.1-mini','gpt-4o','gpt-4o-mini'], headerKey:'Authorization', headerPrefix:'Bearer ' },
    anthropic: { label:'Anthropic (Claude)', endpoint:'https://api.anthropic.com/v1/messages',        models:['claude-opus-4-5','claude-sonnet-4-5','claude-haiku-4-5'], headerKey:'x-api-key', headerPrefix:'' },
    mistral:   { label:'Mistral AI',         endpoint:'https://api.mistral.ai/v1/chat/completions',   models:['mistral-large-latest','mistral-medium-latest','mistral-small-latest'], headerKey:'Authorization', headerPrefix:'Bearer ' },
    custom:    { label:'API Personnalisée',  endpoint:'', models:[], headerKey:'Authorization', headerPrefix:'Bearer ' },
  };

  const DEFAULT_PROFILE = { name: '', email: '', role: 'delivery', org: '' };

  // Helpers
  function load(key, fallback) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch(e) { return fallback; } }

  var SYNC_TS_KEY = 'delhub_sync_ts';
  function getSyncTs() { try { return JSON.parse(localStorage.getItem(SYNC_TS_KEY) || '{}'); } catch(e) { return {}; } }
  function stampLocal(key) { try { var ts = getSyncTs(); ts[key] = new Date().toISOString(); localStorage.setItem(SYNC_TS_KEY, JSON.stringify(ts)); } catch(e) {} }

  function save(key, data) {
    try {
      // 1. Cache local immédiat (pour UX réactive)
      localStorage.setItem(key, JSON.stringify(data));
      stampLocal(key);
      // 2. Refresh UI
      window.dispatchEvent(new CustomEvent('delhub:update', { detail: { key: key, source: 'local' } }));
      // 3. Sync Supabase (source de vérité) — retry 1x si erreur
      if (window.HUB_AUTH && window.HUB_AUTH.saveToCloud) {
        window.HUB_AUTH.saveToCloud(key, data).then(function(r) {
          if (r && r.error) {
            console.warn('[DELHUB] Retry saveToCloud:', key);
            setTimeout(function() { window.HUB_AUTH.saveToCloud(key, data); }, 2000);
          }
        }).catch(function() {
          setTimeout(function() { window.HUB_AUTH.saveToCloud(key, data); }, 2000);
        });
      }
      return true;
    } catch(e) { return false; }
  }

  // Role helpers
  function getRole()          { const p = getProfile(); return p.role || 'delivery'; }
  function getEffectiveRole() { const simulated = sessionStorage.getItem('hub_simulated_role') || sessionStorage.getItem('delhub_simulated_role'); if (simulated && getRole() === 'god') return simulated; return getRole(); }
  function isGod()            { return getRole() === 'god'; }
  function canAccess(page)    { const role = getEffectiveRole(); if (role === 'god') return 'CRUD'; return VISIBILITY[page] && VISIBILITY[page][role] || null; }
  function canWrite(page)     { return canAccess(page) === 'CRUD'; }

  // Profile
  function getProfile()       { return load(KEYS.profile, DEFAULT_PROFILE); }
  function saveProfile(data)  { return save(KEYS.profile, data); }

  // CRM
  const CRM_STAGES = [
    { id: 'prospect',    label: 'Prospect',           color: '#9CA3AF' },
    { id: 'qualified',   label: 'Qualifié',           color: '#6366F1' },
    { id: 'proposal',    label: 'Proposition envoyée', color: '#F59E0B' },
    { id: 'negotiation', label: 'Négociation',        color: '#8B5CF6' },
    { id: 'won',         label: 'Gagné',              color: '#22C55E' },
    { id: 'lost',        label: 'Perdu',              color: '#EF4444' },
  ];

  function getCRM()           { return load(KEYS.crm, []); }
  function saveCRM(list)      { return save(KEYS.crm, list); }
  function addCRMEntry(entry) { const list = getCRM(); entry.id = entry.id || Date.now(); entry.createdAt = new Date().toISOString(); entry.stage = entry.stage || 'prospect'; list.unshift(entry); saveCRM(list); return entry; }
  function updateCRMEntry(id, changes) { const list = getCRM(); const idx = list.findIndex(e => e.id === id); if (idx === -1) return false; list[idx] = { ...list[idx], ...changes, updatedAt: new Date().toISOString() }; saveCRM(list); return list[idx]; }
  function deleteCRMEntry(id) { saveCRM(getCRM().filter(e => e.id !== id)); }
  function getCRMById(id)     { return getCRM().find(e => String(e.id) === String(id)) || null; }

  function getCRMStats() {
    const list = getCRM();
    const byStage = {};
    CRM_STAGES.forEach(s => { byStage[s.id] = { count: 0, amount: 0 }; });
    list.forEach(e => { if (byStage[e.stage]) { byStage[e.stage].count++; byStage[e.stage].amount += Number(e.amount) || 0; } });
    const active = list.filter(e => !['won','lost'].includes(e.stage));
    const won = list.filter(e => e.stage === 'won');
    const total = list.filter(e => ['won','lost'].includes(e.stage)).length;
    return {
      totalOpportunities: list.length, activeOpportunities: active.length,
      pipelineValue: active.reduce((s,e) => s + (Number(e.amount) || 0), 0),
      wonValue: won.reduce((s,e) => s + (Number(e.amount) || 0), 0),
      winRate: total > 0 ? Math.round(won.length / total * 100) : 0,
      avgDealSize: active.length > 0 ? Math.round(active.reduce((s,e) => s + (Number(e.amount) || 0), 0) / active.length) : 0,
      byStage,
    };
  }

  // Proposals
  function getProposals()         { return load(KEYS.proposals, []); }
  function saveProposals(list)    { return save(KEYS.proposals, list); }
  function addProposal(proposal)  { const list = getProposals(); proposal.id = proposal.id || Date.now(); proposal.createdAt = new Date().toISOString(); proposal.status = proposal.status || 'draft'; list.unshift(proposal); saveProposals(list); return proposal; }
  function updateProposal(id, changes) { const list = getProposals(); const idx = list.findIndex(p => p.id === id); if (idx === -1) return false; list[idx] = { ...list[idx], ...changes }; saveProposals(list); return list[idx]; }
  function deleteProposal(id)     { saveProposals(getProposals().filter(p => p.id !== id)); }

  // Contracts
  function getContracts()         { return load(KEYS.contracts, []); }
  function saveContracts(list)    { return save(KEYS.contracts, list); }
  function addContract(contract)  { const list = getContracts(); contract.id = contract.id || Date.now(); contract.createdAt = new Date().toISOString(); contract.status = contract.status || 'draft'; list.unshift(contract); saveContracts(list); return contract; }
  function updateContract(id, changes) { const list = getContracts(); const idx = list.findIndex(c => c.id === id); if (idx === -1) return false; list[idx] = { ...list[idx], ...changes }; saveContracts(list); return list[idx]; }
  function deleteContract(id)     { saveContracts(getContracts().filter(c => c.id !== id)); }

  // P&L
  function getPnL()           { return load(KEYS.pnl, []); }
  function savePnL(list)      { return save(KEYS.pnl, list); }
  function addPnLEntry(entry) { const list = getPnL(); entry.id = entry.id || Date.now(); list.unshift(entry); savePnL(list); return entry; }
  function updatePnLEntry(id, changes) { const list = getPnL(); const idx = list.findIndex(e => e.id === id); if (idx === -1) return false; list[idx] = { ...list[idx], ...changes }; savePnL(list); return list[idx]; }
  function deletePnLEntry(id) { savePnL(getPnL().filter(e => e.id !== id)); }

  // Forecast
  function getForecasts()         { return load(KEYS.forecast, []); }
  function saveForecasts(list)    { return save(KEYS.forecast, list); }
  function addForecast(entry)     { const list = getForecasts(); entry.id = entry.id || Date.now(); list.unshift(entry); saveForecasts(list); return entry; }
  function updateForecast(id, changes) { const list = getForecasts(); const idx = list.findIndex(e => e.id === id); if (idx === -1) return false; list[idx] = { ...list[idx], ...changes }; saveForecasts(list); return list[idx]; }
  function deleteForecast(id)     { saveForecasts(getForecasts().filter(e => e.id !== id)); }

  // Engagements / SLA
  function getEngagements()       { return load(KEYS.engagements, []); }
  function saveEngagements(list)  { return save(KEYS.engagements, list); }
  function addEngagement(entry)   { const list = getEngagements(); entry.id = entry.id || Date.now(); entry.status = entry.status || 'met'; list.unshift(entry); saveEngagements(list); return entry; }
  function updateEngagement(id, changes) { const list = getEngagements(); const idx = list.findIndex(e => e.id === id); if (idx === -1) return false; list[idx] = { ...list[idx], ...changes }; saveEngagements(list); return list[idx]; }
  function deleteEngagement(id)   { saveEngagements(getEngagements().filter(e => e.id !== id)); }

  // Pipeline
  function getPipeline()          { return load(KEYS.pipeline, []); }
  function savePipeline(list)     { return save(KEYS.pipeline, list); }
  function addPipelineItem(item)  { const list = getPipeline(); item.id = item.id || Date.now(); item.phase = item.phase || 'backlog'; list.unshift(item); savePipeline(list); return item; }
  function updatePipelineItem(id, changes) { const list = getPipeline(); const idx = list.findIndex(i => i.id === id); if (idx === -1) return false; list[idx] = { ...list[idx], ...changes }; savePipeline(list); return list[idx]; }
  function deletePipelineItem(id) { savePipeline(getPipeline().filter(i => i.id !== id)); }

  // Releases
  function getReleases()          { return load(KEYS.releases, []); }
  function saveReleases(list)     { return save(KEYS.releases, list); }
  function addRelease(release)    { const list = getReleases(); release.id = release.id || Date.now(); release.status = release.status || 'planned'; release.goNoGo = release.goNoGo || 'pending'; list.unshift(release); saveReleases(list); return release; }
  function updateRelease(id, changes) { const list = getReleases(); const idx = list.findIndex(r => r.id === id); if (idx === -1) return false; list[idx] = { ...list[idx], ...changes }; saveReleases(list); return list[idx]; }
  function deleteRelease(id)      { saveReleases(getReleases().filter(r => r.id !== id)); }

  // Capacity
  function getCapacity()          { return load(KEYS.capacity, []); }
  function saveCapacity(list)     { return save(KEYS.capacity, list); }
  function addCapacityEntry(entry){ const list = getCapacity(); entry.id = entry.id || Date.now(); list.unshift(entry); saveCapacity(list); return entry; }
  function updateCapacityEntry(id, changes) { const list = getCapacity(); const idx = list.findIndex(e => e.id === id); if (idx === -1) return false; list[idx] = { ...list[idx], ...changes }; saveCapacity(list); return list[idx]; }
  function deleteCapacityEntry(id){ saveCapacity(getCapacity().filter(e => e.id !== id)); }

  // Incidents
  function getIncidents()         { return load(KEYS.incidents, []); }
  function saveIncidents(list)    { return save(KEYS.incidents, list); }
  function addIncident(incident)  { const list = getIncidents(); incident.id = incident.id || Date.now(); incident.status = incident.status || 'open'; incident.createdAt = new Date().toISOString(); list.unshift(incident); saveIncidents(list); return incident; }
  function updateIncident(id, changes) { const list = getIncidents(); const idx = list.findIndex(i => i.id === id); if (idx === -1) return false; list[idx] = { ...list[idx], ...changes }; saveIncidents(list); return list[idx]; }
  function deleteIncident(id)     { saveIncidents(getIncidents().filter(i => i.id !== id)); }

  // Exec Sessions
  function getExecSessions()      { return load(KEYS.execSessions, []); }
  function saveExecSessions(list) { return save(KEYS.execSessions, list); }
  function addExecSession(session){ const list = getExecSessions(); session.id = session.id || Date.now(); list.unshift(session); saveExecSessions(list); return session; }

  // AI
  function getAISettings()       { return load(KEYS.aiSettings, DEFAULT_AI_SETTINGS); }
  function saveAISettings(data)  { return save(KEYS.aiSettings, { ...DEFAULT_AI_SETTINGS, ...data }); }
  function isAIEnabled()         { const s = getAISettings(); return s.enabled && s.apiKey && s.provider; }

  async function callAI(systemPrompt, userPrompt) {
    const s = getAISettings();
    if (!s.enabled || !s.apiKey || !s.provider) throw new Error('IA non configurée. Allez dans Paramètres → IA.');
    const provider = AI_PROVIDERS[s.provider];
    const endpoint = s.provider === 'custom' ? s.endpoint : provider.endpoint;
    const model    = s.model || provider.models[0];
    const headers = { 'Content-Type': 'application/json' };
    headers[provider.headerKey] = provider.headerPrefix + s.apiKey;
    if (s.provider === 'anthropic') headers['anthropic-version'] = '2023-06-01';
    let body;
    if (s.provider === 'anthropic') {
      body = { model, max_tokens: 4096, system: systemPrompt, messages: [{ role:'user', content: userPrompt }] };
    } else {
      body = { model, messages: [{ role:'system', content: systemPrompt }, { role:'user', content: userPrompt }], temperature: 0.7, max_completion_tokens: 4096 };
    }
    console.log('[DELHUB.callAI] Requete:', s.provider, model, 'system:', systemPrompt.length, 'user:', userPrompt.length);
    const res = await fetch(endpoint, { method:'POST', headers, body: JSON.stringify(body) });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err?.error?.message || `Erreur API ${res.status}`); }
    const data = await res.json();
    const content = s.provider === 'anthropic' ? (data.content?.[0]?.text || '') : (data.choices?.[0]?.message?.content || '');
    if (!content) {
      console.warn('[DELHUB.callAI] Reponse VIDE! Brut:', JSON.stringify(data).substring(0, 800));
      console.warn('[DELHUB.callAI] finish_reason:', data.choices?.[0]?.finish_reason, 'refusal:', data.choices?.[0]?.message?.refusal);
    }
    return content;
  }

  // Dashboard KPIs
  function getDashboardKPIs(role) {
    const r = role || getEffectiveRole();
    const kpis = {};
    if (['god','sales','head'].includes(r)) { kpis.crm = getCRMStats(); }
    if (['god','business','head'].includes(r)) {
      const contracts = getContracts();
      const active = contracts.filter(c => c.status === 'active');
      const pnl = getPnL();
      kpis.business = {
        totalContracts: contracts.length, activeContracts: active.length,
        totalValue: active.reduce((s,c) => s + (Number(c.value) || 0), 0),
        totalRevenue: pnl.reduce((s,e) => s + (Number(e.revenue) || 0), 0),
        totalCosts: pnl.reduce((s,e) => s + (Number(e.costs) || 0), 0),
        totalMargin: pnl.reduce((s,e) => s + (Number(e.margin) || 0), 0),
      };
    }
    if (['god','delivery','head'].includes(r)) {
      const eng = getEngagements();
      const incidents = getIncidents();
      const releases = getReleases();
      const pipeline = getPipeline();
      kpis.delivery = {
        slaMet: eng.filter(e => e.status === 'met').length,
        slaAtRisk: eng.filter(e => e.status === 'at_risk').length,
        slaBreached: eng.filter(e => e.status === 'breached').length,
        slaCompliance: eng.length > 0 ? Math.round(eng.filter(e => e.status === 'met').length / eng.length * 100) : 100,
        openIncidents: incidents.filter(i => ['open','investigating'].includes(i.status)).length,
        p1Incidents: incidents.filter(i => i.severity === 'P1' && i.status !== 'closed').length,
        upcomingReleases: releases.filter(r => r.status === 'planned' || r.status === 'ready').length,
        pipelineItems: pipeline.length,
        delivered: pipeline.filter(p => p.phase === 'delivered').length,
      };
    }
    return kpis;
  }

  // URL Params
  function getParam(name)        { return new URLSearchParams(window.location.search).get(name); }
  function goTo(page, params={}) { const q = new URLSearchParams(params).toString(); window.location.href = q ? `${page}?${q}` : page; }

  // Events
  function onChange(cb) {
    window.addEventListener('delhub:update', cb);
    window.addEventListener('storage', e => { if (e.key && e.key.startsWith('delhub_')) cb({ detail: { key: e.key } }); });
  }

  // PUBLIC API
  return {
    getRole, getEffectiveRole, isGod, canAccess, canWrite,
    ROLES, VISIBILITY, CRM_STAGES,
    getProfile, saveProfile,
    getCRM, saveCRM, addCRMEntry, updateCRMEntry, deleteCRMEntry, getCRMById, getCRMStats,
    getProposals, saveProposals, addProposal, updateProposal, deleteProposal,
    getContracts, saveContracts, addContract, updateContract, deleteContract,
    getPnL, savePnL, addPnLEntry, updatePnLEntry, deletePnLEntry,
    getForecasts, saveForecasts, addForecast, updateForecast, deleteForecast,
    getEngagements, saveEngagements, addEngagement, updateEngagement, deleteEngagement,
    getPipeline, savePipeline, addPipelineItem, updatePipelineItem, deletePipelineItem,
    getReleases, saveReleases, addRelease, updateRelease, deleteRelease,
    getCapacity, saveCapacity, addCapacityEntry, updateCapacityEntry, deleteCapacityEntry,
    getIncidents, saveIncidents, addIncident, updateIncident, deleteIncident,
    getExecSessions, saveExecSessions, addExecSession,
    getAISettings, saveAISettings, isAIEnabled, callAI, AI_PROVIDERS,
    getDashboardKPIs,
    getParam, goTo, onChange, KEYS,
  };

})();

// ══════════════════════════════════════════════════════════════
// GLOBAL REALTIME REFRESH
// Quand Supabase Realtime pousse un changement (source: 'realtime'),
// on rafraîchit automatiquement la page.
// ══════════════════════════════════════════════════════════════
(function() {
  var _debounceTimer = null;

  function handleRealtimeRefresh(e) {
    if (!e.detail || e.detail.source !== 'realtime') return;
    // Debounce : attendre 300ms pour grouper les updates multiples
    clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(function() {
      console.log('[Hub] Realtime refresh — re-rendering page');
      // Chercher une fonction renderAll ou render globale
      if (typeof window.renderAll === 'function') { window.renderAll(); return; }
      if (typeof window.render === 'function') { window.render(); return; }
      // Mettre à jour les charts Chart.js
      if (window.Chart) {
        Object.keys(Chart.instances || {}).forEach(function(id) {
          try { Chart.instances[id].update(); } catch(e) {}
        });
      }
    }, 300);
  }

  window.addEventListener('pmhub:update', handleRealtimeRefresh);
  window.addEventListener('delhub:update', handleRealtimeRefresh);
})();
