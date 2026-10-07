// ============================================================
// tools-registry.js — Every tool in one place.
// The homepage grid, sitemap, and llms.txt all derive from this.
// Adding a tool = one object here + one HTML file + one module.
// ============================================================

export const TOOLS = [
  { slug: 'merge',         title: 'Merge PDF',      desc: 'Combine several PDFs into one, in any order.',        icon: 'merge' },
  { slug: 'split',         title: 'Split PDF',      desc: 'Extract pages or split a PDF into separate files.',   icon: 'split' },
  { slug: 'compress',      title: 'Compress PDF',   desc: 'Shrink PDFs by rasterising pages as JPEG.',           icon: 'compress' },
  { slug: 'ocr',           title: 'OCR PDF',        desc: 'Extract text from scanned PDFs (English).',           icon: 'ocr' },
  { slug: 'sign',          title: 'Sign PDF',       desc: 'Draw, type, or upload a signature. Stored locally.',  icon: 'sign' },
  { slug: 'images-to-pdf', title: 'Images to PDF',  desc: 'Turn JPGs and PNGs into a single PDF.',               icon: 'images' },
  { slug: 'pdf-info',      title: 'PDF Information',desc: 'Page count, metadata, size, and more.',               icon: 'info' },
];

// Inline SVG icons. Kept here so the homepage is one file to edit.
export const ICONS = {
  merge:    '<path d="M8 3h8l4 4v14H8z"/><path d="M16 3v4h4"/>',
  split:    '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M10 13h6"/><path d="M10 17h6"/>',
  compress: '<path d="M12 3v6"/><path d="M9 6l3 3 3-3"/><path d="M12 21v-6"/><path d="M9 18l3-3 3 3"/>',
  ocr:      '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/>',
  sign:     '<path d="M4 18s2-8 6-8 4 6 8 4"/><path d="M14 5l3 3"/>',
  images:   '<rect x="3" y="5" width="14" height="14" rx="2"/><circle cx="8" cy="10" r="1.5"/><path d="M3 16l4-4 4 4 3-3 3 3"/><rect x="7" y="3" width="14" height="14" rx="2" fill="none"/>',
  info:     '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>',
};