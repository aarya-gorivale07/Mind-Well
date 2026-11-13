const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function headers(withKey) {
  const h = { 'Content-Type': 'application/json' };
  const token = sessionStorage.getItem('mw_token');
  if (token) h.Authorization = `Bearer ${token}`;
  if (withKey) {
    const pass = sessionStorage.getItem('mw_pass');
    if (pass) h['x-journal-key'] = pass;
  }
  return h;
}

export async function api(path, { method = 'GET', body, key = false } = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: headers(key),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && sessionStorage.getItem('mw_token')) {
      sessionStorage.clear();
      window.location.href = '/login';
    }
    const err = new Error(data.error || 'Something went wrong. Try again.');
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function downloadExport() {
  const res = await fetch(`${BASE}/api/export`, { headers: headers(true) });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Export failed');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mindwell-export.json';
  a.click();
  URL.revokeObjectURL(url);
}
