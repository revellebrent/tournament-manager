import { createContext, useContext, useEffect, useState } from "react";

// ---------------------------------------------------------
// TOGGLE BETWEEN MOCK MODE AND BACKEND MODE
// Friday: change this to false when backend is ready
// ---------------------------------------------------------
const USE_MOCK_AUTH = true;

// Backend API base URL (update Friday)
const API_BASE = "http://localhost:3001";

const AuthContext = createContext();

// ---------------------------------------------------------
// MOCK AUTH FUNCTIONS (WORK TODAY WITHOUT BACKEND)
// ---------------------------------------------------------
async function mockRegister({ name, email, password, role }) {
  const usersDb = JSON.parse(localStorage.getItem("mockUsersDb") || "{}");

  if (usersDb[email]) {
    throw new Error("User already exists");
  }

  usersDb[email] = { name, email, password, role };
  localStorage.setItem("mockUsersDb", JSON.stringify(usersDb));

  return { name, email, role };
}

async function mockLogin(email, password) {
  const usersDb = JSON.parse(localStorage.getItem("mockUsersDb") || "{}");

  const existing = usersDb[email];

  if (!existing) throw new Error("User not found");
  if (existing.password !== password) throw new Error("Incorrect password");

  return existing;
}

// ---------------------------------------------------------
// REAL BACKEND AUTH FUNCTIONS (ACTIVATE ON FRIDAY)
// ---------------------------------------------------------
async function backendRegister(userData) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!res.ok) throw new Error("Registration failed");

  return res.json();
}

async function backendLogin(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login failed");

  return res.json();
}

// ---------------------------------------------------------
// AUTH CONTEXT PROVIDER
// ---------------------------------------------------------
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  // Load from localStorage at startup
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedRole = localStorage.getItem("role");

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedRole) setRole(savedRole);
  }, []);

  // Save user + role to localStorage
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");

    if (role) localStorage.setItem("role", role);
    else localStorage.removeItem("role");
  }, [user, role]);

  // --------------------------------------------------
  // REGISTER HANDLER (mock or backend)
  // --------------------------------------------------
  const register = async (userData) => {
    const result = USE_MOCK_AUTH
      ? await mockRegister(userData)
      : await backendRegister(userData);

    return result;
  };

  // --------------------------------------------------
  // LOGIN HANDLER (mock or backend)
  // --------------------------------------------------
  const login = async (email, password) => {
    const result = USE_MOCK_AUTH
      ? await mockLogin(email, password)
      : await backendLogin(email, password);

    setUser({ name: result.name, email: result.email });
    setRole(result.role);

    return result;
  };

  // --------------------------------------------------
  // LOGOUT HANDLER
  // --------------------------------------------------
  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  };

  // --------------------------------------------------
  // CONTEXT VALUE
  // --------------------------------------------------
  const value = {
    user,
    role,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook for consuming the context
export function useAuth() {
  return useContext(AuthContext);
}
