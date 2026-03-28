/**
 * DelHub — Dark/Light theme toggle
 */
(function() {
  'use strict';
  var THEME_KEY = 'delhub_theme';

  function getTheme() {
    return localStorage.getItem(THEME_KEY) || 'dark';
  }

  function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.classList.add('theme-transitioning');
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    setTimeout(function() {
      document.documentElement.classList.remove('theme-transitioning');
    }, 300);
  }

  function injectToggle() {
    var navLinks = document.querySelector('.nav-links');
    if (!navLinks || document.getElementById('themeToggleBtn')) return;
    var btn = document.createElement('button');
    btn.id = 'themeToggleBtn';
    btn.className = 'nav-icon';
    btn.title = 'Changer le thème';
    btn.style.cssText = 'background:none;border:1px solid var(--border);cursor:pointer;font-size:16px;';
    btn.textContent = getTheme() === 'light' ? '🌙' : '☀️';
    btn.addEventListener('click', function() {
      var next = getTheme() === 'dark' ? 'light' : 'dark';
      setTheme(next);
      btn.textContent = next === 'light' ? '🌙' : '☀️';
    });
    navLinks.insertBefore(btn, navLinks.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectToggle);
  } else {
    injectToggle();
  }
})();
