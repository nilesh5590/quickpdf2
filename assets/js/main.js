// ============================================================
// main.js — Bootstraps every page.
//   1. Ensures the theme is applied.
//   2. Injects header/footer chrome (so HTML files stay small).
//   3. Builds the tool grid on the homepage.
//   4. Registers the service worker.
// ============================================================

import { TOOLS, ICONS } from './tools-registry.js';
import { initTheme, mountThemeToggle } from './components/ThemeToggle.js';

// ---- 1. Theme ----
// The inline <script> in each page's <head> already set data-theme
// pre-paint; this is a safety net.
initTheme();

// ---- 2. Chrome injection ----
// We inject the theme toggle button into any .theme-toggle-slot.
function mountToggles() {
  document.querySelectorAll('.theme-toggle-slot').forEach(slot => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.innerHTML = `
      <svg class="icon-moon" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round"
           stroke-linejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
      <svg class="icon-sun" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round"
           stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
      </svg>`;
    slot.replaceWith(btn);
    mountThemeToggle(btn);
  });
}

// ---- 3. Homepage grid ----
function buildToolGrid() {
  const grid = document.getElementById('tool-grid');
  if (!grid) return;
  const frag = document.createDocumentFragment();

  for (const tool of TOOLS) {
    const a = document.createElement('a');
    a.className = 'tool-card';
    a.href = `/${tool.slug}.html`;

    const iconWrap = document.createElement('div');
    iconWrap.className = 'tool-card-icon';
    iconWrap.setAttribute('aria-hidden', 'true');
    iconWrap.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="1.75"
      stroke-linecap="round" stroke-linejoin="round">${ICONS[tool.icon] || ''}</svg>`;

    const h3 = document.createElement('h3');
    h3.textContent = tool.title;

    const p = document.createElement('p');
    p.textContent = tool.desc;

    a.append(iconWrap, h3, p);
    frag.appendChild(a);
  }
  grid.appendChild(frag);
}

// ---- 4. Service worker ----
function registerSw() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* silent */ });
  });
}

// ---- Footer year ----
function setYear() {
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
}

// ---- Run ----
// `defer`-like: main.js is a module so it runs after parsing.
mountToggles();
buildToolGrid();
setYear();
registerSw();