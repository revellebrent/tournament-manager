import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import "./ModalWithForm.css";

export default function ModalWithForm({
  isOpen,
  onClose,
  onSubmit,
  title = "Modal",
  submitLabel = "Submit",
  children,
}) {
  const headingId = useId();
  const panelRef = useRef(null);
  const firstFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const t = setTimeout(() => firstFocusRef.current?.focus(), 0);
    return () => {
      document.documentElement.style.overflow = prev;
      clearTimeout(t);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal" role="presentation">
      <button
        type="button"
        className="modal__backdrop"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div
        className="modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        ref={panelRef}
      >
        <header className="modal__header">
          <h2 id={headingId} className="modal__title">
            {title}
          </h2>
          <button
            type="button"
            className="modal__close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <form className="modal__form" onSubmit={onSubmit}>
          <div className="modal__content">
            <span ref={firstFocusRef} tabIndex={-1} />
            {children}
          </div>

          <footer className="modal__actions">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              {submitLabel}
            </button>
          </footer>
        </form>
      </div>
    </div>,
    document.body
  );
}
