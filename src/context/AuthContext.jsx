import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("auth")) || { isLoggedIn: false, role: "guest", user: null };
    } catch {
      return { isLoggedIn: false, role: "guest", user: null };
    }
  });

  useEffect(() => {
    localStorage.setItem("auth", JSON.stringify(state));
  }, [state]);

  function login({ role = "coach", name ="Demo User", email = "" } = {}) {
    setState({ isLoggedIn: true, role, user: { name, email } });
  }

  function logout() {
    setState({ isLoggedIn: false, role: "guest", user: null });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}