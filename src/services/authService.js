import { api } from "@/utils/apiClient";

export async function register({ name, email, password, role }) {
  return api.post("/api/auth/register", { name, email, password, role });
}

export async function login({ email, password }) {
  return api.post("/api/auth/login", {
    email,
    password,
  });
}

export async function getMe() {
  return api.get("/api/auth/me");
}

export async function logout() {
  return api.post("/api/auth/logout");
}
