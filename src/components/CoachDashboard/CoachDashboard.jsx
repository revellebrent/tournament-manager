import { useEffect, useMemo, useState } from "react";
import "./CoachDashboard.css";
import { useAuth } from "../../context/AuthContext";
import {
  listSharesTo,
  getDocumentById,
  listUsersByRole,
  shareDocument,
  ensureUser,
} from "../../utils/db";
import TeamManager from "../TeamManager/TeamManager";
import ApplyForm from "../ApplyForm/ApplyForm";

export default function CoachDashboard() {
  const { user, role } = useAuth();
  const email = user?.email;
  const [inbox, setInbox] = useState([]);
  const directors = useMemo(() => listUsersByRole("director"), []);
  const [toDirector, setToDirector] = useState(directors[0]?.email || "");

  useEffect(() => {
    if (!email) return;
    ensureUser({ email, role, name: user?.name });
    const items = listSharesTo(email).map((s) => ({
      ...s,
      doc: getDocumentById(s.documentId),
    }));
    setInbox(items);
  }, [email, role, user?.name]);

  function forward(docId) {
    if (!toDirector) return;
    shareDocument({
      fromEmail: email,
      toEmail: toDirector,
      documentId: docId,
      message: "Coach forwarded player card",
    });
    alert("Forwarded to director");
  }

  return (
    <main className="coach container">
      <h1 className="coach__title">Coach Dashboard</h1>
      <ApplyForm />
      <TeamManager />

      <section className="section">
        <h2 className="coach__h2">Player Card Inbox</h2>

        {inbox.length === 0 ? (
          <p className="coach__muted">No player cards yet.</p>
        ) : (
          <ul className="coach__list">
            {inbox.map((i) => (
              <li key={i.id} className="coach__item">
                <div className="coach__row">
                  <div>
                    <div className="coach__from">From: {i.fromEmail}</div>
                    <div className="coach__doc">{i.doc?.name}</div>
                  </div>
                  <div className="coach__actions">
                    <label className="coach__label">
                      Director:
                      <select
                        className="coach__select"
                        value={toDirector}
                        onChange={(e) => setToDirector(e.target.value)}
                      >
                        {directors.map((d) => (
                          <option key={d.email} value={d.email}>
                            {d.name} ({d.email})
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      className="button"
                      type="button"
                      onClick={() => forward(i.documentId)}
                    >
                      Forward
                    </button>
                  </div>
                </div>

                {i.doc?.mime === "image/jpeg" && (
                  <img
                    className="coach__preview"
                    src={i.doc.dataUrl}
                    alt="Player card"
                  />
                )}
                {i.doc?.mime === "application/pdf" && (
                  <object
                    className="coach__preview"
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
