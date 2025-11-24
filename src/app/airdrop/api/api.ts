export const API = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function apiGet(path: string) {
  const res = await fetch(`${API}${path}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API Error ${res.status}`);
  return res.json();
}

export async function apiPost(path: string, data: any) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`API Error ${res.status}`);
  return res.json();
}
