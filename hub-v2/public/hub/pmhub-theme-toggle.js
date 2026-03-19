/**
 * PM Hub — Dark/Light Mode Toggle
 * Injecte le bouton dans .nav-links et gère la persistance localStorage.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'pmhub_theme';

  function getTheme() {
    try { return localStorage.getItem(STORAGE_KEY) || 'dark'; } catch (e) { return 'dark'; }
  }

  function applyTheme(theme, animate) {
    var html = document.documentElement;
    if (animate) {
      html.classList.add('theme-transitioning');
      setTimeout(function () { html.classList.remove('theme-transitioning'); }, 300);
    }
    if (theme === 'light') {
      html.setAttribute('data-theme', 'light');
    } else {
      html.removeAttribute('data-theme');
    }
  }

  function saveTheme(theme) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
  }

  function toggleTheme() {
    var next = getTheme() === 'dark' ? 'light' : 'dark';
    saveTheme(next);
    applyTheme(next, true);
    updateButton();
  }

  var SUN_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  var MOON_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  function updateButton() {
    var btn = document.getElementById('pmhub-theme-btn');
    if (!btn) return;
    var isDark = getTheme() === 'dark';
    btn.innerHTML = isDark ? SUN_ICON : MOON_ICON;
    btn.title = isDark ? 'Mode clair' : 'Mode sombre';
    btn.setAttribute('aria-label', isDark ? 'Passer en mode clair' : 'Passer en mode sombre');
  }

  function injectButton() {
    if (document.getElementById('pmhub-theme-btn')) return;
    var navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    var btn = document.createElement('button');
    btn.id = 'pmhub-theme-btn';
    btn.type = 'button';
    btn.style.cssText = [
      'background:transparent',
      'border:1px solid var(--glass-border)',
      'border-radius:var(--radius-sm)',
      'color:var(--text-muted)',
      'cursor:pointer',
      'display:inline-flex',
      'align-items:center',
      'justify-content:center',
      'width:36px',
      'height:36px',
      'padding:0',
      'transition:color 0.2s,background 0.2s,border-color 0.2s',
      'flex-shrink:0'
    ].join(';');

    btn.addEventListener('click', toggleTheme);
    btn.addEventListener('mouseenter', function () {
      btn.style.color = 'var(--text)';
      btn.style.background = 'rgba(99,102,241,0.08)';
      btn.style.borderColor = 'var(--border-active)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.color = 'var(--text-muted)';
      btn.style.background = 'transparent';
      btn.style.borderColor = 'var(--glass-border)';
    });

    navLinks.insertBefore(btn, navLinks.firstChild);
    updateButton();
  }

  // Apply theme immediately (already done by no-flash snippet, but re-apply to be safe)
  applyTheme(getTheme(), false);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectButton);
  } else {
    injectButton();
  }

  // Re-inject after pmhub:update (sidebar re-renders sometimes replace nav)
  window.addEventListener('pmhub:update', function () {
    setTimeout(injectButton, 0);
  });
})();
