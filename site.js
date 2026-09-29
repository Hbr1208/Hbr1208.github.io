/* Optional PDF links become visible only after the corresponding PDF is uploaded.
   Paths are relative, so the site also works under a GitHub project subdirectory. */
async function hasPdf(path) {
  if (location.protocol === 'file:') return false;
  try {
    const response = await fetch(path, { method: 'HEAD', cache: 'no-store' });
    const type = (response.headers.get('content-type') || '').toLowerCase();
    return response.ok && type.includes('application/pdf');
  } catch { return false; }
}
document.querySelectorAll('[data-optional-pdf]').forEach(async link => {
  if (await hasPdf(link.getAttribute('href'))) link.hidden = false;
});
hasPdf('files/CV.pdf').then(available => {
  if (!available) return;
  document.querySelectorAll('[data-cv-link]').forEach(link => {
    link.href = 'files/CV.pdf';
    link.setAttribute('aria-label', 'Curriculum Vitae (PDF)');
  });
  const download = document.querySelector('[data-cv-download]');
  if (download) {
    download.hidden = false;
    document.querySelector('[data-cv-pending]').hidden = true;
  }
});
