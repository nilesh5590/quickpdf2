// ============================================================
// Alert.js — Render a dismissible message with proper ARIA.
// Never uses innerHTML for user-supplied text.
// ============================================================

const ICONS = { success: '✓', error: '✕', warning: '!', info: 'i' };

export function showAlert(container, { type = 'info', message, dismissible = true }) {
  // Wipe previous alerts in this container.
  container.textContent = '';

  const el = document.createElement('div');
  el.className = `alert alert-${type}`;
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');

  const icon = document.createElement('span');
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = ICONS[type] || 'i';

  const text = document.createElement('span');
  text.textContent = message; // textContent, not innerHTML — no XSS

  el.append(icon, text);

  if (dismissible) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-secondary';
    btn.textContent = 'Dismiss';
    btn.style.marginLeft = 'auto';
    btn.addEventListener('click', () => el.remove());
    el.appendChild(btn);
  }

  container.appendChild(el);
}