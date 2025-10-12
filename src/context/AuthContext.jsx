import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("auth")) || {
          isLoggedIn: false,
          role: "guest",
          user: null,
        }
      );
    } catch {
      // localStorage may be unavailable
      return { isLoggedIn: false, role: "guest", user: null };
    }
  });

  useEffect(() => {
    try { localStorage.setItem("auth", JSON.stringify(state));
    } catch (err) {
      // ignore write errors (e.g., private mode)
      void err; // mark as used, also keeps block non-empty
    }
  }, [state]);

  function login({ role = "coach", name = "Demo User", email = "" } = {}) {
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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
