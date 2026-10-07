// assets/js/tools/pdf-info.js
import { readPdfInfo } from '../../modules/pdf-core.js';
import { validatePdfFiles, formatBytes } from '../utils/file-validation.js';
import { showAlert } from '../components/Alert.js';
import { FileDropzone } from '../components/FileDropzone.js';

const alertsEl = document.getElementById('info-alerts');
const outputEl = document.getElementById('info-output');

const dz = new FileDropzone({
  accept: 'application/pdf,.pdf',
  multiple: false,
  title: 'Drop a PDF here, or click to choose',
  hint: 'PDF only',
  onFiles: async fileList => {
    alertsEl.textContent = '';
    outputEl.textContent = '';

    const { accepted, rejected, warnings } = await validatePdfFiles(fileList);
    if (rejected.length) {
      return showAlert(alertsEl, { type: 'error', message: rejected[0].reason });
    }
    if (warnings.length) {
      showAlert(alertsEl, { type: 'warning', message: warnings[0].reason });
    }

    const file = accepted[0];
    if (!file) return;

    try {
      const info = await readPdfInfo(file);
      render(info, file);
    } catch (err) {
      showAlert(alertsEl, { type: 'error', message: err.message });
    }
  },
});
document.getElementById('info-dropzone').appendChild(dz.root);

function render(info, file) {
  const dl = document.createElement('dl');
  dl.className = 'info-grid';

  const rows = [
    ['File name', file.name],
    ['File size', formatBytes(file.size)],
    ['Pages', String(info.pageCount)],
    ['Title', info.title || '—'],
    ['Author', info.author || '—'],
    ['Subject', info.subject || '—'],
    ['Creator', info.creator || '—'],
    ['Producer', info.producer || '—'],
    ['Created', info.creationDate ? info.creationDate.toLocaleString() : '—'],
    ['Modified', info.modificationDate ? info.modificationDate.toLocaleString() : '—'],
  ];

  // First page dimensions — most useful single-page metric.
  const p1 = info.pageSizes[0];
  if (p1) rows.push(['First page size', `${p1.width.toFixed(0)} × ${p1.height.toFixed(0)} pt`]);

  for (const [label, value] of rows) {
    const dt = document.createElement('dt'); dt.textContent = label;
    const dd = document.createElement('dd'); dd.textContent = value;
    dl.append(dt, dd);
  }
  outputEl.appendChild(dl);
}