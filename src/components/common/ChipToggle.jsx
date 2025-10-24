
export default function ChipToggle({ options, value, onChange, ariaLabel }) {
  return (
    <div className="chips" role="group" aria-label={ariaLabel || "Toggle options"}>
      {options.map((opt) => (
        <button
         key={opt.value}
         type="button"
         className={`chip ${value === opt.value ? "chip--on" : ""}`}
         aria-pressed={value === opt.value}
         title={opt.title}
         onClick={() => onChange && onChange(value === opt.value ? "all" : opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}