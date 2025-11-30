import { useAuth } from "@/context/AuthContext";
import * as auth from "@/services/authService";
import { useState } from "react";

const ROLES = ["coach", "director", "parent"];

export default function SignUp() {
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "parent",
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await auth.register(form);
      await login(form.email, form.password);
    } catch (e) {
      setErr(e?.message || "Sign up failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="form">
      <h2>Create an account</h2>
      {err && <p className="error">{err}</p>}

      <label>
        Name
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </label>

      <label>
        Email
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
      </label>

      <label>
        Role
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <button type="submit" disabled={busy}>
        {busy ? "Creating..." : "Create account"}
      </button>
    </form>
  );
}
