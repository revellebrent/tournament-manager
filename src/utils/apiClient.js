const API_BASE = (
  import.meta.env.VITE_API_BASE ?? window.location.origin
).replace(/\/+$/, "");

async function request(
  path,
  { method = "GET", body, headers = {}, credentials = "include" } = {}
) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJSON = contentType.includes("application/json");
  const data = isJSON ? await res.json() : await res.text();

  if (!res.ok) {
    const message = isJSON ? data?.message || JSON.stringify(data) : data;
    throw new Error(message || `Request failed: ${res.status}`);
  }
  return data;
}

export const api = {
  get: (path, opts) => request(path, { method: "GET", ...opts }),
  post: (path, body, opts) => request(path, { method: "POST", body, ...opts }),
  put: (path, body, opts) => request(path, { method: "PUT", body, ...opts }),
  patch: (path, body, opts) =>
    request(path, { method: "PATCH", body, ...opts }),
  del: (path, opts) => request(path, { method: "DELETE", ...opts }),
};

export { API_BASE };
