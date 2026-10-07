// ============================================================
// ThemeToggle.js — Sets data-theme on <html>, persists to localStorage.
// No flash on load: main.js reads localStorage before the first paint.
// ============================================================

const KEY = 'quickpdf:theme';

export function initTheme() {
  // Called before paint by main.js — the inline <script> in <head> also
  // does this so the theme is correct on the very first frame.
  const stored = localStorage.getItem(KEY);
  const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
}

export function mountThemeToggle(button) {
  const update = () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(KEY, next);
    button.setAttribute('aria-label',
      next === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  };
  button.addEventListener('click', update);
}