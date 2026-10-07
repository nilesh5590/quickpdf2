// ============================================================
// FileDropzone.js — Keyboard-accessible file picker + drag/drop.
// Note: the <input type="file"> inside is the real control.
// The visible dropzone is a <label>, so clicking anywhere opens
// the OS picker AND keyboard users can Tab to it and press Enter.
// ============================================================

export class FileDropzone {
  /**
   * @param {Object} opts
   * @param {string} opts.accept   - e.g. "application/pdf,.pdf"
   * @param {boolean} opts.multiple
   * @param {string} opts.title
   * @param {string} opts.hint
   * @param {(files: FileList) => void} opts.onFiles
   */
  constructor({ accept, multiple = false, title, hint, onFiles }) {
    this.onFiles = onFiles;

    const id = 'dz-' + Math.random().toString(36).slice(2, 9);

    this.root = document.createElement('div');

    // The file input is hidden but fully functional.
    this.input = document.createElement('input');
    this.input.type = 'file';
    this.input.id = id;
    this.input.accept = accept;
    this.input.multiple = multiple;
    this.input.className = 'visually-hidden';

    // The label wraps the visual UI; clicking it activates the input.
    this.label = document.createElement('label');
    this.label.htmlFor = id;
    this.label.className = 'dropzone';
    this.label.tabIndex = 0; // keyboard focusable
    this.label.innerHTML = `
      <div class="dropzone-icon" aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
             stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </div>
      <p></p>
      <small></small>
    `;
    // Set text via textContent, not innerHTML, so titles can't inject markup.
    this.label.querySelector('p').textContent = title;
    this.label.querySelector('small').textContent = hint;

    this.root.append(this.input, this.label);

    // ---- Events ----
    this.input.addEventListener('change', e => {
      if (e.target.files?.length) this.onFiles(e.target.files);
      this.input.value = ''; // allow re-selecting the same file
    });

    // Drop handling — preventDefault on dragover is REQUIRED
    // or the browser will navigate to the dropped file.
    ['dragenter', 'dragover'].forEach(evt =>
      this.label.addEventListener(evt, e => {
        e.preventDefault();
        this.label.classList.add('is-dragover');
      })
    );
    ['dragleave', 'drop'].forEach(evt =>
      this.label.addEventListener(evt, e => {
        e.preventDefault();
        this.label.classList.remove('is-dragover');
      })
    );
    this.label.addEventListener('drop', e => {
      if (e.dataTransfer?.files?.length) this.onFiles(e.dataTransfer.files);
    });

    // Keyboard activation on the label.
    this.label.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.input.click();
      }
    });
  }
}