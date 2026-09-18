export async function api(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || "Request failed. Please try again."), { status: res.status });
  return data;
}
export function jsonBody(body, method = "POST") { return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }; }
