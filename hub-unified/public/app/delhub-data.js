/**
 * DelHub — Couche de données Delivery & Business Hub v1.0
 * Abdelhakim Nechniche — Telecom & IT Project Manager
 */

// ── THEME NO-FLASH ────────────────────────────────────────────────
(function () {
  try {
    var t = localStorage.getItem('delhub_theme');
    if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
  } catch (e) {}
})();

// ── INJECTION SUPABASE ────────────────────────────────────────────
(function injectSupabase() {
  if (document.getElementById('delhub-supabase-cdn')) return;
  var cdn = document.createElement('script');
  cdn.id  = 'delhub-supabase-cdn';
  cdn.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
  cdn.onload = function () {
    var auth = document.createElement('script');
    auth.src = 'delhub-supabase.js';
    document.head.appendChild(auth);
  };
  document.head.appendChild(cdn);
})();

// ── INJECTION THEME TOGGLE ────────────────────────────────────────
(function injectThemeToggle() {
  if (document.getElementById('delhub-theme-toggle-js')) return;
  var s = document.createElement('script');
  s.id = 'delhub-theme-toggle-js';
  s.src = 'delhub-theme-toggle.js';
  document.head.appendChild(s);
})();

const DELHUB = (() => {

  const KEYS = {
    profile:       'delhub_profile',
    aiSettings:    'delhub_ai_settings',
    // Sales / CRM
    crm:           'delhub_crm',
    proposals:     'delhub_proposals',
    // Business
    contracts:     'delhub_contracts',
    pnl:           'delhub_pnl',
    forecast:      'delhub_forecast',
    // Delivery
    engagements:   'delhub_engagements',
    pipeline:      'delhub_pipeline',
    releases:      'delhub_releases',
    capacity:      'delhub_capacity',
    incidents:     'delhub_incidents',
    // Exec
    execSessions:  'delhub_exec_sessions',
    // Admin
    users:         'delhub_users',
  };

  // ── ROLES & PERMISSIONS ─────────────────────────────────────────
  const ROLES = {
    god:      { label: 'GOD / Admin',       level: 100 },
    head:     { label: 'Head / C-Level',    level: 80 },
    business: { label: 'Business Manager',  level: 60 },
    delivery: { label: 'Delivery Manager',  level: 60 },
    sales:    { label: 'Sales / Commercial', level: 40 },
    pm:       { label: 'Chef de Projet',    level: 40 },
  };

  // Pages visibles par rôle (— = pas visible, READ = lecture, CRUD = complet)
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

  // ── AI SETTINGS ─────────────────────────────────────────────────
  const DEFAULT_AI_SETTINGS = {
    provider: '', apiKey: '', model: '', endpoint: '', enabled: false,
  };

  const AI_PROVIDERS = {
    openai:    { label:'OpenAI (ChatGPT)',   endpoint:'https://api.openai.com/v1/chat/completions',   models:['gpt-5.4','gpt-5-mini','gpt-4.1','gpt-4.1-mini','gpt-4o','gpt-4o-mini'], headerKey:'Authorization', headerPrefix:'Bearer ' },
    anthropic: { label:'Anthropic (Claude)', endpoint:'https://api.anthropic.com/v1/messages',        models:['claude-opus-4-5','claude-sonnet-4-5','claude-haiku-4-5'], headerKey:'x-api-key', headerPrefix:'' },
    mistral:   { label:'Mistral AI',         endpoint:'https://api.mistral.ai/v1/chat/completions',   models:['mistral-large-latest','mistral-medium-latest','mistral-small-latest'], headerKey:'Authorization', headerPrefix:'Bearer ' },
    custom:    { label:'API Personnalisée',  endpoint:'', models:[], headerKey:'Authorization', headerPrefix:'Bearer ' },
  };

  // ── DEFAULT PROFILE ─────────────────────────────────────────────
  const DEFAULT_PROFILE = {
    name: '',
    email: '',
    role: 'delivery',
    org: '',
  };

  // ── HELPERS ─────────────────────────────────────────────────────
  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch(e) { return fallback; }
  }

  var SYNC_TS_KEY = 'delhub_sync_ts';
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
      stampLocal(key);
      window.dispatchEvent(new CustomEvent('delhub:update', { detail: { key } }));
      if (window.DELHUB_AUTH && window.DELHUB_AUTH.saveToCloud) {
        window.DELHUB_AUTH.saveToCloud(key, data);
      }
      return true;
    } catch(e) { return false; }
  }

  // ── ROLE HELPERS ────────────────────────────────────────────────
  function getRole() {
    const p = getProfile();
    return p.role || 'delivery';
  }

  function getEffectiveRole() {
    // GOD peut simuler un rôle via sessionStorage
    const simulated = sessionStorage.getItem('delhub_simulated_role');
    if (simulated && getRole() === 'god') return simulated;
    return getRole();
  }

  function isGod() {
    return getRole() === 'god';
  }

  function canAccess(page) {
    const role = getEffectiveRole();
    if (role === 'god') return 'CRUD';
    return VISIBILITY[page] && VISIBILITY[page][role] || null;
  }

  function canWrite(page) {
    const access = canAccess(page);
    return access === 'CRUD';
  }

  // ── PROFILE ─────────────────────────────────────────────────────
  function getProfile()       { return load(KEYS.profile, DEFAULT_PROFILE); }
  function saveProfile(data)  { return save(KEYS.profile, data); }

  // ── CRM / PROSPECTS ─────────────────────────────────────────────
  function getCRM()           { return load(KEYS.crm, []); }
  function saveCRM(list)      { return save(KEYS.crm, list); }

  function addCRMEntry(entry) {
    const list = getCRM();
    entry.id = entry.id || Date.now();
    entry.createdAt = new Date().toISOString();
    entry.stage = entry.stage || 'prospect';
    list.unshift(entry);
    saveCRM(list);
    return entry;
  }

  function updateCRMEntry(id, changes) {
    const list = getCRM();
    const idx = list.findIndex(e => e.id === id);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...changes, updatedAt: new Date().toISOString() };
    saveCRM(list);
    return list[idx];
  }

  function deleteCRMEntry(id) {
    saveCRM(getCRM().filter(e => e.id !== id));
  }

  function getCRMById(id) {
    return getCRM().find(e => String(e.id) === String(id)) || null;
  }

  // CRM Stages
  const CRM_STAGES = [
    { id: 'prospect',    label: 'Prospect',           color: '#9CA3AF' },
    { id: 'qualified',   label: 'Qualifié',           color: '#6366F1' },
    { id: 'proposal',    label: 'Proposition envoyée', color: '#F59E0B' },
    { id: 'negotiation', label: 'Négociation',        color: '#8B5CF6' },
    { id: 'won',         label: 'Gagné',              color: '#22C55E' },
    { id: 'lost',        label: 'Perdu',              color: '#EF4444' },
  ];

  function getCRMStats() {
    const list = getCRM();
    const byStage = {};
    CRM_STAGES.forEach(s => { byStage[s.id] = { count: 0, amount: 0 }; });
    list.forEach(e => {
      if (byStage[e.stage]) {
        byStage[e.stage].count++;
        byStage[e.stage].amount += Number(e.amount) || 0;
      }
    });
    const active = list.filter(e => !['won','lost'].includes(e.stage));
    const won = list.filter(e => e.stage === 'won');
    const total = list.filter(e => ['won','lost'].includes(e.stage)).length;
    return {
      totalOpportunities: list.length,
      activeOpportunities: active.length,
      pipelineValue: active.reduce((s,e) => s + (Number(e.amount) || 0), 0),
      wonValue: won.reduce((s,e) => s + (Number(e.amount) || 0), 0),
      winRate: total > 0 ? Math.round(won.length / total * 100) : 0,
      avgDealSize: active.length > 0 ? Math.round(active.reduce((s,e) => s + (Number(e.amount) || 0), 0) / active.length) : 0,
      byStage,
    };
  }

  // ── PROPOSALS ───────────────────────────────────────────────────
  function getProposals()         { return load(KEYS.proposals, []); }
  function saveProposals(list)    { return save(KEYS.proposals, list); }

  function addProposal(proposal) {
    const list = getProposals();
    proposal.id = proposal.id || Date.now();
    proposal.createdAt = new Date().toISOString();
    proposal.status = proposal.status || 'draft';
    list.unshift(proposal);
    saveProposals(list);
    return proposal;
  }

  function updateProposal(id, changes) {
    const list = getProposals();
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...changes };
    saveProposals(list);
    return list[idx];
  }

  function deleteProposal(id) {
    saveProposals(getProposals().filter(p => p.id !== id));
  }

  // ── CONTRACTS ───────────────────────────────────────────────────
  function getContracts()         { return load(KEYS.contracts, []); }
  function saveContracts(list)    { return save(KEYS.contracts, list); }

  function addContract(contract) {
    const list = getContracts();
    contract.id = contract.id || Date.now();
    contract.createdAt = new Date().toISOString();
    contract.status = contract.status || 'draft';
    list.unshift(contract);
    saveContracts(list);
    return contract;
  }

  function updateContract(id, changes) {
    const list = getContracts();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...changes };
    saveContracts(list);
    return list[idx];
  }

  function deleteContract(id) {
    saveContracts(getContracts().filter(c => c.id !== id));
  }

  // ── P&L ─────────────────────────────────────────────────────────
  function getPnL()           { return load(KEYS.pnl, []); }
  function savePnL(list)      { return save(KEYS.pnl, list); }

  function addPnLEntry(entry) {
    const list = getPnL();
    entry.id = entry.id || Date.now();
    list.unshift(entry);
    savePnL(list);
    return entry;
  }

  function updatePnLEntry(id, changes) {
    const list = getPnL();
    const idx = list.findIndex(e => e.id === id);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...changes };
    savePnL(list);
    return list[idx];
  }

  function deletePnLEntry(id) {
    savePnL(getPnL().filter(e => e.id !== id));
  }

  // ── FORECAST ────────────────────────────────────────────────────
  function getForecasts()         { return load(KEYS.forecast, []); }
  function saveForecasts(list)    { return save(KEYS.forecast, list); }

  function addForecast(entry) {
    const list = getForecasts();
    entry.id = entry.id || Date.now();
    list.unshift(entry);
    saveForecasts(list);
    return entry;
  }

  function updateForecast(id, changes) {
    const list = getForecasts();
    const idx = list.findIndex(e => e.id === id);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...changes };
    saveForecasts(list);
    return list[idx];
  }

  function deleteForecast(id) {
    saveForecasts(getForecasts().filter(e => e.id !== id));
  }

  // ── ENGAGEMENTS / SLA ───────────────────────────────────────────
  function getEngagements()       { return load(KEYS.engagements, []); }
  function saveEngagements(list)  { return save(KEYS.engagements, list); }

  function addEngagement(entry) {
    const list = getEngagements();
    entry.id = entry.id || Date.now();
    entry.status = entry.status || 'met';
    list.unshift(entry);
    saveEngagements(list);
    return entry;
  }

  function updateEngagement(id, changes) {
    const list = getEngagements();
    const idx = list.findIndex(e => e.id === id);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...changes };
    saveEngagements(list);
    return list[idx];
  }

  function deleteEngagement(id) {
    saveEngagements(getEngagements().filter(e => e.id !== id));
  }

  // ── PIPELINE DELIVERY ──────────────────────────────────────────
  function getPipeline()          { return load(KEYS.pipeline, []); }
  function savePipeline(list)     { return save(KEYS.pipeline, list); }

  function addPipelineItem(item) {
    const list = getPipeline();
    item.id = item.id || Date.now();
    item.phase = item.phase || 'backlog';
    list.unshift(item);
    savePipeline(list);
    return item;
  }

  function updatePipelineItem(id, changes) {
    const list = getPipeline();
    const idx = list.findIndex(i => i.id === id);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...changes };
    savePipeline(list);
    return list[idx];
  }

  function deletePipelineItem(id) {
    savePipeline(getPipeline().filter(i => i.id !== id));
  }

  // ── RELEASES ────────────────────────────────────────────────────
  function getReleases()          { return load(KEYS.releases, []); }
  function saveReleases(list)     { return save(KEYS.releases, list); }

  function addRelease(release) {
    const list = getReleases();
    release.id = release.id || Date.now();
    release.status = release.status || 'planned';
    release.goNoGo = release.goNoGo || 'pending';
    list.unshift(release);
    saveReleases(list);
    return release;
  }

  function updateRelease(id, changes) {
    const list = getReleases();
    const idx = list.findIndex(r => r.id === id);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...changes };
    saveReleases(list);
    return list[idx];
  }

  function deleteRelease(id) {
    saveReleases(getReleases().filter(r => r.id !== id));
  }

  // ── CAPACITY ────────────────────────────────────────────────────
  function getCapacity()          { return load(KEYS.capacity, []); }
  function saveCapacity(list)     { return save(KEYS.capacity, list); }

  function addCapacityEntry(entry) {
    const list = getCapacity();
    entry.id = entry.id || Date.now();
    list.unshift(entry);
    saveCapacity(list);
    return entry;
  }

  function updateCapacityEntry(id, changes) {
    const list = getCapacity();
    const idx = list.findIndex(e => e.id === id);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...changes };
    saveCapacity(list);
    return list[idx];
  }

  function deleteCapacityEntry(id) {
    saveCapacity(getCapacity().filter(e => e.id !== id));
  }

  // ── INCIDENTS ───────────────────────────────────────────────────
  function getIncidents()         { return load(KEYS.incidents, []); }
  function saveIncidents(list)    { return save(KEYS.incidents, list); }

  function addIncident(incident) {
    const list = getIncidents();
    incident.id = incident.id || Date.now();
    incident.status = incident.status || 'open';
    incident.createdAt = new Date().toISOString();
    list.unshift(incident);
    saveIncidents(list);
    return incident;
  }

  function updateIncident(id, changes) {
    const list = getIncidents();
    const idx = list.findIndex(i => i.id === id);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...changes };
    saveIncidents(list);
    return list[idx];
  }

  function deleteIncident(id) {
    saveIncidents(getIncidents().filter(i => i.id !== id));
  }

  // ── EXEC SESSIONS ──────────────────────────────────────────────
  function getExecSessions()      { return load(KEYS.execSessions, []); }
  function saveExecSessions(list) { return save(KEYS.execSessions, list); }

  function addExecSession(session) {
    const list = getExecSessions();
    session.id = session.id || Date.now();
    list.unshift(session);
    saveExecSessions(list);
    return session;
  }

  // ── AI ──────────────────────────────────────────────────────────
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

    const headers = { 'Content-Type': 'application/json' };
    headers[provider.headerKey] = provider.headerPrefix + s.apiKey;
    if (s.provider === 'anthropic') headers['anthropic-version'] = '2023-06-01';

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
    if (s.provider === 'anthropic') return data.content?.[0]?.text || '';
    return data.choices?.[0]?.message?.content || '';
  }

  // ── DASHBOARD KPIs ──────────────────────────────────────────────
  function getDashboardKPIs(role) {
    const r = role || getEffectiveRole();
    const kpis = {};

    if (['god','sales','head'].includes(r)) {
      kpis.crm = getCRMStats();
    }
    if (['god','business','head'].includes(r)) {
      const contracts = getContracts();
      const active = contracts.filter(c => c.status === 'active');
      const pnl = getPnL();
      kpis.business = {
        totalContracts: contracts.length,
        activeContracts: active.length,
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

  // ── URL PARAMS ──────────────────────────────────────────────────
  function getParam(name)        { return new URLSearchParams(window.location.search).get(name); }
  function goTo(page, params={}) {
    const q = new URLSearchParams(params).toString();
    window.location.href = q ? `${page}?${q}` : page;
  }

  // ── EVENTS ──────────────────────────────────────────────────────
  function onChange(cb) {
    window.addEventListener('delhub:update', cb);
    window.addEventListener('storage', e => {
      if (e.key && e.key.startsWith('delhub_')) cb({ detail: { key: e.key } });
    });
  }

  // ── PUBLIC API ──────────────────────────────────────────────────
  return {
    // Role & Auth
    getRole, getEffectiveRole, isGod, canAccess, canWrite,
    ROLES, VISIBILITY, CRM_STAGES,
    // Profile
    getProfile, saveProfile,
    // CRM
    getCRM, saveCRM, addCRMEntry, updateCRMEntry, deleteCRMEntry, getCRMById, getCRMStats,
    // Proposals
    getProposals, saveProposals, addProposal, updateProposal, deleteProposal,
    // Contracts
    getContracts, saveContracts, addContract, updateContract, deleteContract,
    // P&L
    getPnL, savePnL, addPnLEntry, updatePnLEntry, deletePnLEntry,
    // Forecast
    getForecasts, saveForecasts, addForecast, updateForecast, deleteForecast,
    // Engagements / SLA
    getEngagements, saveEngagements, addEngagement, updateEngagement, deleteEngagement,
    // Pipeline
    getPipeline, savePipeline, addPipelineItem, updatePipelineItem, deletePipelineItem,
    // Releases
    getReleases, saveReleases, addRelease, updateRelease, deleteRelease,
    // Capacity
    getCapacity, saveCapacity, addCapacityEntry, updateCapacityEntry, deleteCapacityEntry,
    // Incidents
    getIncidents, saveIncidents, addIncident, updateIncident, deleteIncident,
    // Exec
    getExecSessions, saveExecSessions, addExecSession,
    // AI
    getAISettings, saveAISettings, isAIEnabled, callAI, AI_PROVIDERS,
    // Dashboard
    getDashboardKPIs,
    // Utils
    getParam, goTo, onChange,
    KEYS,
  };

})();
