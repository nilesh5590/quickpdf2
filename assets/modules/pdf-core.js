// ============================================================
// pdf-core.js — The ONLY file that imports pdf-lib directly.
// If we ever swap libraries, this is the single place to change.
//
// pdf-lib is imported from a CDN as an ES module. The browser
// caches it after the first tool use. This keeps GitHub Pages
// bandwidth cost near zero.
// ============================================================

const PDFLIB_URL = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm';

// Cache the module import so multiple tools don't re-fetch it.
let pdfLibPromise = null;

function loadPdfLib() {
  if (!pdfLibPromise) pdfLibPromise = import(PDFLIB_URL);
  return pdfLibPromise;
}

/**
 * Load a PDF from a File or ArrayBuffer.
 * Rejects encrypted PDFs (we don't handle passwords).
 */
export async function loadPdf(source) {
  const { PDFDocument } = await loadPdfLib();
  const bytes = source instanceof ArrayBuffer
    ? new Uint8Array(source)
    : new Uint8Array(await source.arrayBuffer());

  try {
    return await PDFDocument.load(bytes, {
      ignoreEncryption: false, // throw on encrypted PDFs
      updateMetadata: false,
    });
  } catch (err) {
    if (/encrypt/i.test(err.message)) {
      throw new Error('This PDF is password-protected. QuickPDF does not handle encrypted files.');
    }
    throw new Error('This file could not be read as a PDF. It may be corrupt.');
  }
}

/** Merge multiple File objects into one Blob. */
export async function mergePdfs(files, onProgress) {
  const { PDFDocument } = await loadPdfLib();
  const out = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const src = await loadPdf(files[i]);
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach(p => out.addPage(p));
    onProgress?.(((i + 1) / files.length) * 100);
  }

  const bytes = await out.save({ useObjectStreams: true });
  return new Blob([bytes], { type: 'application/pdf' });
}

/** Extract a page range (1-based, inclusive) into a new PDF. */
export async function extractPages(file, fromPage, toPage) {
  const { PDFDocument } = await loadPdfLib();
  const src = await loadPdf(file);
  const indices = [];
  for (let i = fromPage - 1; i <= toPage - 1 && i < src.getPageCount(); i++) {
    indices.push(i);
  }
  if (!indices.length) throw new Error('No pages in that range.');

  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, indices);
  pages.forEach(p => out.addPage(p));
  const bytes = await out.save({ useObjectStreams: true });
  return new Blob([bytes], { type: 'application/pdf' });
}

/** Read metadata without loading the whole document into memory. */
export async function readPdfInfo(file) {
  const { PDFDocument } = await loadPdfLib();
  const doc = await loadPdf(file);
  return {
    pageCount: doc.getPageCount(),
    title: doc.getTitle() || '',
    author: doc.getAuthor() || '',
    subject: doc.getSubject() || '',
    creator: doc.getCreator() || '',
    producer: doc.getProducer() || '',
    creationDate: doc.getCreationDate() || null,
    modificationDate: doc.getModificationDate() || null,
    // Sizes of each page in PDF points (1pt = 1/72 inch).
    pageSizes: doc.getPages().map(p => p.getSize()),
  };
}