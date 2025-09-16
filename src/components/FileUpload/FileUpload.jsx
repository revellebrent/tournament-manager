import { useState } from "react";
import "./FileUpload.css";

export default function FileUpload({
  onSave,
  accept = "image/jpeg,application/pdf",
}) {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);

  function handleChange(e) {
    setFiles(Array.from(e.target.files || []));
  }

  async function readAsDataURL(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }

  async function handleSave() {
    if (!files.length) return;
    setBusy(true);
    try {
      const docs = [];
      for (const f of files) {
        if (!["image/jpeg", "application/pdf"].includes(f.type)) continue;
        const dataUrl = await readAsDataURL(f);
        docs.push({ name: f.name, mime: f.type, size: f.size, dataUrl });
      }
      if (docs.length) {
        onSave?.(docs);
        setFiles([]);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fu">
      <input
        className="fu__input"
        type="file"
        accept={accept}
        multiple
        onChange={handleChange}
      />
      <div className="fu__actions">
        <button
          type="button"
          className="button"
          onClick={handleSave}
          disabled={!files.length || busy}
        >
          {busy ? "Saving..." : "Save files"}
        </button>
      </div>
      {files.length > 0 && (
        <ul className="fu__list">
          {files.map((f) => (
            <li key={f.name} className="fu__item">
              {f.name}{" "}
              <span className="fu__muted">
                ({Math.round(f.size / 1024)} KB)
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
