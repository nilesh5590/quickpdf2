// ============================================================
// ProgressBar.js — Accessible progress indicator.
// The element uses role="progressbar" so assistive tech reads it.
// ============================================================

export class ProgressBar {
  constructor(label = 'Progress') {
    this.root = document.createElement('div');
    this.root.className = 'progress';
    this.root.setAttribute('role', 'progressbar');
    this.root.setAttribute('aria-label', label);
    this.root.setAttribute('aria-valuemin', '0');
    this.root.setAttribute('aria-valuemax', '100');
    this.root.setAttribute('aria-valuenow', '0');

    this.bar = document.createElement('div');
    this.bar.className = 'progress-bar';
    this.root.appendChild(this.bar);
  }

  // Value 0–100. Pass -1 for indeterminate.
  set(value) {
    if (value < 0) {
      this.root.removeAttribute('aria-valuenow');
      this.bar.style.width = '100%';
      this.bar.style.opacity = '0.5';
      return;
    }
    this.bar.style.opacity = '1';
    this.bar.style.width = value + '%';
    this.root.setAttribute('aria-valuenow', String(Math.round(value)));
  }

  remove() { this.root.remove(); }
}