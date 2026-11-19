export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(data.error || 'Request failed. Please try again.'); e.status = res.status; throw e; }
  return data;
}

function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Downloads a file from a protected API route (sends the login token)
export async function downloadFile(path, name) {
  const token = localStorage.getItem('token');
  const res = await fetch('/api' + path, { headers: { Authorization: 'Bearer ' + token } });
  if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Could not download the file.'); }
  saveBlob(await res.blob(), name);
}

export const downloadPdf = certNo => downloadFile(`/certificates/${certNo}/pdf`, certNo + '.pdf');
export const downloadJson = (obj, name) => saveBlob(new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }), name);
