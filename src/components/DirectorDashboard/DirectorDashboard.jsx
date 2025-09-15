import { useEffect, useState } from "react";
import "./DirectorDashboard.css";
import { useAuth } from "../../context/AuthContext";
import { listSharesTo, getDocumentById, ensureUser } from "../../utils/db";

export default function DirectorDashboard() {
  const { user, role } = useAuth();
  const email = user?.email;
  const [inbox, setInbox] = useState([]);

  useEffect(() => {
    if (!email) return;
    ensureUser({ email, role, name: user?.name });
    const items = listSharesTo(email).map((s) => ({
      ...s,
      doc: getDocumentById(s.documentId),
    }));
    setInbox(items);
  }, [email, role, user?.name]);

  return (
    <main className="director container">
      <h1 className="director__title">Director Dashboard</h1>
      <section className="section">
        <h2 className="director__h2">Received Player Cards</h2>
        {inbox.length === 0 ? (
          <p className="director__muted">No documents yet.</p>
        ) : (
          <ul className="director__list">
            {inbox.map((i) => (
              <li key={i.id} className="director__item">
                <div className="director__meta">
                  From: {i.fromEmail} &middot; Doc:{" "}
                  <strong>{i.doc?.name}</strong>
                </div>
                {i.doc?.mime === "image/jpeg" && (
                  <img
                    className="director__preview"
                    src={i.doc.dataUrl}
                    alt="Player card"
                  />
                )}
                {i.doc?.mime === "application/pdf" && (
                  <object
                    className="director__preview"
                    data={i.doc.dataUrl}
                    type="application/pdf"
                    aria-label="Player card PDF"
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
