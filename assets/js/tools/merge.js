// ============================================================
// merge.js — Merge tool logic.
// Wires the shared components together; contains no PDF code.
// All PDF work delegates to /assets/modules/pdf-core.js.
// ============================================================

import { mergePdfs } from '../../modules/pdf-core.js';
import { validatePdfFiles, formatBytes, LIMITS } from '../utils/file-validation.js';
import { downloadBlob, safeFilename } from '../utils/download.js';
import { showAlert } from '../components/Alert.js';
import { ProgressBar } from '../components/ProgressBar.js';
import { FileDropzone } from '../components/FileDropzone.js';
import { announce } from '../utils/a11y.js';

// ---- State ----
// Single source of truth. The DOM is only ever a rendering of this.
let files = [];

// ---- DOM refs ----
const alertsEl   = document.getElementById('merge-alerts');
const listEl     = document.getElementById('merge-file-list');
const mergeBtn   = document.getElementById('merge-btn');
const resetBtn   = document.getElementById('merge-reset');
const progressEl = document.getElementById('merge-progress');
const outputEl   = document.getElementById('merge-output');

// ---- Dropzone ----
const dropzone = new FileDropzone({
  accept: 'application/pdf,.pdf',
  multiple: true,
  title: 'Drop PDFs here, or click to choose',
  hint: `PDF only · max ${LIMITS.HARD_MB} MB per file`,
  onFiles: handleNewFiles,
});
document.getElementById('merge-dropzone').appendChild(dropzone.root);

// ---- Handlers ----
async function handleNewFiles(fileList) {
  alertsEl.textContent = '';
  const { accepted, rejected, warnings } = await validatePdfFiles(fileList);

  if (rejected.length) {
    showAlert(alertsEl, {
      type: 'error',
      message: rejected.map(r => `${r.name}: ${r.reason}`).join(' · '),
    });
  } else if (warnings.length) {
    showAlert(alertsEl, {
      type: 'warning',
      message: warnings.map(w => `${w.name}: ${w.reason}`).join(' · '),
    });
  }

  if (accepted.length) {
    files = files.concat(accepted);
    render();
    announce(`${accepted.length} file(s) added. Total ${files.length}.`);
  }
}

function render() {
  // Rebuild list from state. Simple and impossible to desync.
  listEl.textContent = '';
  files.forEach((file, i) => {
    const li = document.createElement('li');

    const nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    // textContent — filenames are user-controlled and must never be HTML.
    nameSpan.textContent = file.name;

    const sizeSpan = document.createElement('span');
    sizeSpan.className = 'size';
    sizeSpan.textContent = formatBytes(file.size);

    const up = mkBtn('↑', 'Move up', i === 0, () => {
      [files[i - 1], files[i]] = [files[i], files[i - 1]];
      render();
    });
    up.setAttribute('aria-label', `Move ${file.name} up`);

    const down = mkBtn('↓', 'Move down', i === files.length - 1, () => {
      [files[i + 1], files[i]] = [files[i], files[i + 1]];
      render();
    });
    down.setAttribute('aria-label', `Move ${file.name} down`);

    const rm = mkBtn('✕', 'Remove', false, () => {
      files.splice(i, 1);
      render();
    });
    rm.setAttribute('aria-label', `Remove ${file.name}`);

    li.append(nameSpan, sizeSpan, up, down, rm);
    listEl.appendChild(li);
  });

  mergeBtn.disabled = files.length < 2;
  resetBtn.hidden = files.length === 0;
  outputEl.textContent = '';
}

function mkBtn(label, title, disabled, onClick) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  b.title = title;
  b.disabled = disabled;
  b.addEventListener('click', onClick);
  return b;
}

// ---- Merge action ----
mergeBtn.addEventListener('click', async () => {
  if (files.length < 2) return;

  alertsEl.textContent = '';
  outputEl.textContent = '';
  progressEl.textContent = '';
  mergeBtn.disabled = true;

  const bar = new ProgressBar('Merging PDFs');
  progressEl.appendChild(bar.root);
  bar.set(0);
  announce('Merging started.');

  try {
    const blob = await mergePdfs(files, p => bar.set(p));
    bar.remove();

    // Download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.className = 'btn';
    a.href = url;
    a.download = safeFilename('merged.pdf');
    a.textContent = `Download merged PDF (${formatBytes(blob.size)})`;
    // Revoke when the user has clicked (or after 5 min)
    a.addEventListener('click', () => setTimeout(() => URL.revokeObjectURL(url), 1000), { once: true });

    outputEl.appendChild(a);
    showAlert(alertsEl, { type: 'success', message: `Merged ${files.length} files into one PDF.` });
    announce('Merge complete. Download link ready.');
  } catch (err) {
    bar.remove();
    showAlert(alertsEl, { type: 'error', message: err.message || 'Merge failed.' });
    announce('Merge failed: ' + (err.message || 'unknown error'), 'assertive');
  } finally {
    mergeBtn.disabled = files.length < 2;
  }
});

// ---- Reset ----
resetBtn.addEventListener('click', () => {
  files = [];
  alertsEl.textContent = '';
  outputEl.textContent = '';
  render();
});

// ---- Initial paint ----
render();