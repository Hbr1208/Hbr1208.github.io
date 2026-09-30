/* Old bookmarked section links now open the corresponding standalone page. */
let redirectingToSection = false;
if (document.body.classList.contains('home-page')) {
  const routes = {research:'research.html',background:'background.html',teaching:'teaching.html',publications:'publications.html'};
  function followOldSectionLink() {
    const key = location.hash.slice(1);
    const target = routes[key] || (key.startsWith('pub-') ? 'publications.html' : null);
    if (target) {
      redirectingToSection = true;
      location.replace(target + location.hash);
    }
  }
  followOldSectionLink();
  window.addEventListener('hashchange', followOldSectionLink);
}

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

/* VISITOR COUNTER — site-wide PV and estimated UV, provided by Busuanzi.
   Runs on every HTML page that includes site.js; only the homepage shows totals.
   Local previews and other hosts never send a counting request.
   If the production domain changes, update COUNTER_HOSTNAME below.
   Data belongs to the external service; refreshing/republishing does not store
   or reset it locally. PDF downloads do not run this script. */
(function initializeVisitorCounter() {
  const COUNTER_HOSTNAME = 'hbr1208.github.io';
  const COUNTER_SCRIPT = 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
  const status = document.querySelector('[data-counter-status]');
  const setStatus = message => { if (status) status.textContent = message; };

  if (redirectingToSection) return;
  if (location.protocol !== 'https:' || location.hostname !== COUNTER_HOSTNAME) {
    setStatus('Local preview · statistics available on the published website.');
    return;
  }
  if (document.getElementById('visitor-counter-script')) return;

  setStatus('Loading visit statistics…');
  const values = ['site_pv', 'site_uv'].map(key =>
    document.getElementById('busuanzi_value_' + key));
  let observer;
  let timeout;
  const hasNumbers = () => values.every(value =>
    value && /^\d+$/.test(value.textContent.trim()));
  const updateStatus = () => {
    if (!hasNumbers()) return;
    setStatus('');
    clearTimeout(timeout);
    observer?.disconnect();
  };

  if (status) {
    observer = new MutationObserver(updateStatus);
    values.filter(Boolean).forEach(value =>
      observer.observe(value, {childList: true, subtree: true, characterData: true}));
    timeout = setTimeout(() => {
      if (!hasNumbers()) setStatus('Statistics temporarily unavailable.');
    }, 10000);
  }

  const script = document.createElement('script');
  script.id = 'visitor-counter-script';
  script.async = true;
  script.src = COUNTER_SCRIPT;
  script.onerror = () => {
    clearTimeout(timeout);
    setStatus('Statistics temporarily unavailable.');
  };
  document.head.appendChild(script);
})();
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
