// ============================================================
// a11y.js — Tiny helpers for accessible dynamic content.
// ============================================================

// Announce a message to screen readers via a live region.
// Creates the region on first use; reuses it after.
export function announce(message, politeness = 'polite') {
  let region = document.getElementById('a11y-live-region');
  if (!region) {
    region = document.createElement('div');
    region.id = 'a11y-live-region';
    region.className = 'visually-hidden';
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');
    document.body.appendChild(region);
  }
  // Setting textContent twice in a row doesn't re-trigger
  // the announcement in some browsers. Clearing first helps.
  region.textContent = '';
  requestAnimationFrame(() => { region.textContent = message; });
}

// Trap Tab focus inside a container (used by the modal).
export function trapFocus(container, event) {
  if (event.key !== 'Tab') return;
  const focusable = container.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault(); last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault(); first.focus();
  }
}