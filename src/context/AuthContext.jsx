import { api } from "@/utils/apiClient";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on startup
  useEffect(() => {
    const token = localStorage.getItem("tm_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/users/me")
      .then((data) => {
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
        });
        setRole(data.role);
      })
      .catch(() => localStorage.removeItem("tm_token"))
      .finally(() => setLoading(false));
  }, []);

  // REGISTER
  const register = async ({ name, email, password, role }) => {
    return await api.post("/users/register", {
      name,
      email,
      password,
      role,
    });
  };

  // LOGIN
  const login = async (email, password) => {
    console.log("LOGIN FN CALLED", email);
    try {
      const data = await api.post("/users/login", { email, password });
      console.log("LOGIN RESPONSE", data);

      // Try to get token from common response shapes
      const token = data?.token || data?.data?.token || null;
      if (token) {
        localStorage.setItem("tm_token", token);
      }

      // Populate user by calling /users/me (backend may return user or only token)
      try {
        const me = await api.get("/users/me");
        setUser({ id: me.id, name: me.name, email: me.email });
        setRole(me.role);
      } catch (err) {
        console.error("Failed to fetch /users/me after login:", err);
        // Fallback: if login returned user data, use it
        if (data?.user) {
          setUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
          });
          setRole(data.user.role);
        }
      }

      return data;
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("tm_token");
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        login,
        logout,
        register,
        // compatibility: some components expect `isLoggedIn`
        isLoggedIn: !!user,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
