import { useRef } from "react";

export default function ScoreInputs({ row, onSave, toIntOrNull }) {
  const aRef = useRef(null);
  const bRef = useRef(null);

  const save = () => {
    if (!onSave) return;
    const a = toIntOrNull(aRef.current?.value ?? "");
    const b = toIntOrNull(bRef.current?.value ?? "");
    const curA = Number.isFinite(row.aScore) ? row.aScore : null;
    const curB = Number.isFinite(row.bScore) ? row.bScore : null;
    if (a === curA && b === curB) return;
    onSave(a, b);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    }
  };

  return (
    <span className="sched__scorebox">
      <input
       ref={aRef}
       className="sched__scoreinput"
       type="number"
       min="0"
       step="1"
       inputMode="numeric"
       maxLength={3}
       placeholder="—"
       defaultValue={Number.isFinite(row.aScore) ? row.aScore : ""}
       aria-label={`Score for ${row.aName}`}
       onBlur={save}
       onKeyDown={handleKeyDown}
       onWheel={(e) => e.currentTarget.blur()}
      />
      <span>:</span>
      <input
       ref={bRef}
       className="sched__scoreinput"
        type="number"
        min="0"
        step="1"
        inputMode="numeric"
        maxLength={3}
        placeholder="—"
        defaultValue={Number.isFinite(row.bScore) ? row.bScore : ""}
        aria-label={`Score for ${row.bName}`}
        onBlur={save}
        onKeyDown={handleKeyDown}
        onWheel={(e) => e.currentTarget.blur()}
      />
    </span>
  );
}