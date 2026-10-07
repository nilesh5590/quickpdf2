// ============================================================
// file-validation.js — Strict type + size checking.
// Never trust file.type or extension alone; check magic bytes.
// ============================================================

export const LIMITS = {
  SOFT_MB: 25,   // warn above this
  HARD_MB: 150,  // refuse above this
};

// Read the first 8 bytes and confirm it looks like a PDF.
// Every PDF starts with "%PDF-" (25 50 44 46 2D).
export async function isPdfMagic(file) {
  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  return head[0] === 0x25 && head[1] === 0x50 &&
         head[2] === 0x44 && head[3] === 0x46 && head[4] === 0x2D;
}

// Magic bytes for common image formats we accept in Images→PDF.
const IMAGE_SIGNATURES = [
  { mime: 'image/jpeg', bytes: [0xFF, 0xD8, 0xFF] },
  { mime: 'image/png',  bytes: [0x89, 0x50, 0x4E, 0x47] },
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF....WEBP
];

export async function detectImageType(file) {
  const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  for (const sig of IMAGE_SIGNATURES) {
    if (sig.bytes.every((b, i) => head[i] === b)) return sig.mime;
  }
  return null;
}

// Human-readable size.
export function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

/**
 * Validate a FileList for PDF operations.
 * Returns { accepted: File[], rejected: [{name, reason}], warnings: [{name, reason}] }
 * Never throws — the caller decides what to do with rejections.
 */
export async function validatePdfFiles(fileList) {
  const accepted = [], rejected = [], warnings = [];
  const files = Array.from(fileList);

  for (const file of files) {
    // 1. Hard size limit
    if (file.size > LIMITS.HARD_MB * 1024 * 1024) {
      rejected.push({ name: file.name, reason: `Over ${LIMITS.HARD_MB} MB — too large for browser processing.` });
      continue;
    }
    // 2. Extension / MIME (cheap first pass)
    const looksPdf = file.type === 'application/pdf' ||
                     file.name.toLowerCase().endsWith('.pdf');
    if (!looksPdf) {
      rejected.push({ name: file.name, reason: 'Not a PDF file.' });
      continue;
    }
    // 3. Magic bytes (unspoofable)
    try {
      if (!await isPdfMagic(file)) {
        rejected.push({ name: file.name, reason: 'File does not contain a valid PDF header.' });
        continue;
      }
    } catch {
      rejected.push({ name: file.name, reason: 'Could not read file.' });
      continue;
    }
    // 4. Soft warning
    if (file.size > LIMITS.SOFT_MB * 1024 * 1024) {
      warnings.push({ name: file.name, reason: `Large file (${formatBytes(file.size)}) — processing may be slow.` });
    }

    accepted.push(file);
  }
  return { accepted, rejected, warnings };
}