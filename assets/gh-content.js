<!-- File: assets/gh-content.js -->
<script>
(() => {
  // Repo coordinates and branch to read from
  const OWNER  = 'mikaoberg';
  const REPO   = 'service_testing';
  const BRANCH = 'main';
  const API    = 'https://api.github.com';

  async function gh(path) {
    const r = await fetch(`${API}${path}`, {
      headers: {
        'accept': 'application/vnd.github+json',
        'x-github-api-version': '2022-11-28'
      }
    });
    if (!r.ok) throw new Error(`GitHub API ${r.status} for ${path}`);
    return r.json();
  }

  function decodeBase64(b64) {
    try { return decodeURIComponent(escape(atob(b64))); }
    catch { return atob(b64); }
  }

  async function fetchJson(path) {
    const obj = await gh(`/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`);
    if (!obj.content) throw new Error(`No content at ${path}`);
    return JSON.parse(decodeBase64(obj.content));
  }

  async function listServices() {
    try {
      const items = await gh(`/repos/${OWNER}/${REPO}/contents/data/services?ref=${BRANCH}`);
      const files = Array.isArray(items)
        ? items.filter(i => i.type === 'file' && i.name.endsWith('.json'))
        : [];
      const all = await Promise.all(files.map(f => fetchJson(`data/services/${f.name}`)));
      return all;
    } catch (e) {
      console.warn('No /data/services directory yet; using in-memory demo data.', e);
      return null;
    }
  }

  async function init() {
    const services = await listServices();
    if (services && Array.isArray(services) && services.length) {
      if (Array.isArray(window.SERVICES)) {
        window.SERVICES.splice(0, window.SERVICES.length, ...services);
      } else {
        window.SERVICES = services;
      }
      if (typeof window.renderServices === 'function') {
        window.renderServices();
      }
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
</script>
