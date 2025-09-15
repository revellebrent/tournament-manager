import { useEffect, useMemo, useState } from "react";
import "./Profile.css";
import FileUpload from "../FileUpload/FileUpload";
import { useAuth } from "../../context/AuthContext";
import {
  ensureUser,
  listUsersByRole,
  addDocuments,
  listDocumentsByOwner,
  shareDocument,
} from "../../utils/db";

export default function Profile() {
  const { user, role } = useAuth();
  const email = user?.email;
  const [docs, setDocs] = useState([]);
  const coaches = useMemo(() => listUsersByRole("coach"), []);
  const [toCoach, setToCoach] = useState(coaches[0]?.email || "");

  useEffect(() => {
    if (email) ensureUser({ email, role, name: user?.name });
    if (email) setDocs(listDocumentsByOwner(email));
  }, [email, role, user?.name]);

  function handleSave(docsToSave) {
    const saved = addDocuments(email, docsToSave);
    setDocs((prev) => [...saved, ...prev]);
  }

  function handleSend(docId) {
    if (!toCoach) return;
    shareDocument({
      fromEmail: email,
      toEmail: toCoach,
      documentId: docId,
      message: "Player card",
    });
    alert("Sent to coach");
  }

  return (
    <main className="profile container">
      <h1 className="profile__title">My Profile</h1>

      <section className="section">
        <h2 className="profile__h2">Player Cards</h2>
        <FileUpload onSave={handleSave} />

        {docs.length === 0 ? (
          <p className="profile__muted">No player cards yet.</p>
        ) : (
          <ul className="profile__docs">
            {docs.map((d) => (
              <li key={d.id} className="profile__doc">
                <span className="profile__docname">{d.name}</span>
                <div className="profile__docactions">
                  <label className="profile__label">
                    Send to coach:
                    <select
                      className="profile__select"
                      value={toCoach}
                      onChange={(e) => setToCoach(e.target.value)}
                    >
                      {coaches.map((c) => (
                        <option key={c.email} value={c.email}>
                          {c.name} ({c.email})
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="button"
                    type="button"
                    onClick={() => handleSend(d.id)}
                  >
                    Send
                  </button>
                </div>
                <Preview mime={d.mime} dataUrl={d.dataUrl} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Preview({ mime, dataUrl }) {
  if (mime === "image/jpeg")
    return <img className="profile__preview" src={dataUrl} alt="player card" />;
  if (mime === "application/pdf")
    return (
      <object
        className="profile__preview"
        data={dataUrl}
        type="application/pdf"
        aria-label="Player card PDF"
      />
    );
  return null;
}
