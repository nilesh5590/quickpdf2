// ============================================================
// download.js — Save a Blob to disk, then immediately free it.
// Keeping object URLs alive leaks memory; we revoke after use.
// ============================================================

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  // Not appended to the DOM — click() works on detached anchors.
  a.click();
  // Revoke on next tick so the browser has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Sanitise a filename for the download attribute.
// Strips path separators and characters that are illegal on Windows.
export function safeFilename(name, fallback = 'download') {
  const clean = String(name)
    .replace(/[\\/:*?"<>|\u0000-\u001F]/g, '_')
    .replace(/\.+$/, '')
    .trim();
  return clean || fallback;
}

// Replace a file's extension: ("a.pdf", ".png") → "a.png"
export function withExtension(name, ext) {
  return name.replace(/\.[^.]+$/, '') + ext;
}