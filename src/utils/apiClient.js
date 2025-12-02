export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:3002/api";

export async function request(path, options = {}) {
  const token = localStorage.getItem("tm_token");

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJSON = contentType.includes("application/json");
  const data = isJSON ? await res.json() : await res.text();

  if (!res.ok) {
    throw new Error(data?.message || `Request failed: ${res.status}`);
  }

  return data;
}

export const api = {
  get: (p, o) => request(p, { method: "GET", ...o }),
  post: (p, b, o) => request(p, { method: "POST", body: b, ...o }),
  put: (p, b, o) => request(p, { method: "PUT", body: b, ...o }),
  patch: (p, b, o) => request(p, { method: "PATCH", body: b, ...o }),
  del: (p, o) => request(p, { method: "DELETE", ...o }),
};
