/**
 * PM Hub — Notifications navigateur pour jalons à venir
 * Rappels pour les jalons (Gantt) et dates de fin de projet aujourd'hui ou demain.
 */
(function() {
  'use strict';

  const STORAGE_KEY_ENABLED = 'pmhub_notifications_enabled';
  const STORAGE_KEY_NOTIFIED = 'pmhub_notified_';

  function isEnabled() {
    try { return localStorage.getItem(STORAGE_KEY_ENABLED) === '1'; } catch (e) { return false; }
  }
  function setEnabled(v) {
    try { localStorage.setItem(STORAGE_KEY_ENABLED, v ? '1' : '0'); } catch (e) {}
  }

  function getTodayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function getTomorrowStr() {
    var d = new Date();
    d.setDate(d.getDate() + 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function getNotifiedIds(dateStr) {
    try {
      var raw = localStorage.getItem(STORAGE_KEY_NOTIFIED + dateStr);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function markNotified(dateStr, id) {
    try {
      var ids = getNotifiedIds(dateStr);
      if (ids.indexOf(id) === -1) ids.push(id);
      localStorage.setItem(STORAGE_KEY_NOTIFIED + dateStr, JSON.stringify(ids));
    } catch (e) {}
  }

  function getUpcomingMilestones() {
    if (typeof PMHUB === 'undefined') return [];
    var today = getTodayStr();
    var tomorrow = getTomorrowStr();
    var out = [];
    var projects = PMHUB.getProjects && PMHUB.getProjects();
    if (!projects) return out;

    projects.forEach(function(p) {
      var projectName = p.name || p.ref || 'Projet ' + p.id;
      if (p.end) {
        var endStr = String(p.end).split('T')[0];
        if (endStr === today) out.push({ id: 'proj-end-' + p.id, title: 'Fin de projet aujourd\'hui', date: endStr, projectName: projectName, type: 'project_end' });
        if (endStr === tomorrow) out.push({ id: 'proj-end-' + p.id, title: 'Fin de projet demain', date: endStr, projectName: projectName, type: 'project_end' });
      }
      var tasks = PMHUB.getGanttTasks && PMHUB.getGanttTasks(p.id);
      if (!tasks || !Array.isArray(tasks)) return;
      tasks.forEach(function(t, idx) {
        if (!t.end) return;
        var endStr = String(t.end).split('T')[0];
        if (endStr !== today && endStr !== tomorrow) return;
        var label = (t.type === 'milestone' ? 'Jalon' : 'Échéance') + (endStr === today ? ' aujourd\'hui' : ' demain');
        var taskId = (t.id != null ? t.id : 'i' + idx);
        out.push({ id: 'task-' + p.id + '-' + taskId, title: label + ' : ' + (t.name || 'Sans nom'), date: endStr, projectName: projectName, type: t.type === 'milestone' ? 'milestone' : 'task' });
      });
    });
    return out;
  }

  function checkAndNotify() {
    if (typeof Notification === 'undefined' || !isEnabled()) return;
    if (Notification.permission !== 'granted') return;

    var today = getTodayStr();
    var notified = getNotifiedIds(today);
    var milestones = getUpcomingMilestones();

    milestones.forEach(function(m) {
      if (notified.indexOf(m.id) !== -1) return;
      try {
        new Notification('PM Hub — ' + m.projectName, { body: m.title, icon: '/favicon.ico', tag: m.id });
        markNotified(today, m.id);
      } catch (e) {}
    });
  }

  function requestPermission() {
    if (typeof Notification === 'undefined') return Promise.resolve(false);
    if (Notification.permission === 'granted') { setEnabled(true); return Promise.resolve(true); }
    if (Notification.permission === 'denied') return Promise.resolve(false);
    return Notification.requestPermission().then(function(perm) {
      if (perm === 'granted') { setEnabled(true); return true; }
      return false;
    });
  }

  window.PMHUB_Notifications = {
    isEnabled: isEnabled,
    setEnabled: setEnabled,
    requestPermission: requestPermission,
    checkAndNotify: checkAndNotify,
    getUpcomingMilestones: getUpcomingMilestones
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(checkAndNotify, 2000);
      setInterval(checkAndNotify, 60 * 1000);
    });
  } else {
    setTimeout(checkAndNotify, 2000);
    setInterval(checkAndNotify, 60 * 1000);
  }
})();
