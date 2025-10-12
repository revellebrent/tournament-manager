import { useEffect } from 'react';
import "./ModalWithForm.css";

export default function ModalWithForm({
  isOpen,
  title,
  children,
  submitText = "Submit",
  onSubmit,
  onClose,
}) {
  useEffect(() => {
    if (!isOpen) return;
    function onEscape(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const stop = (e) => e.stopPropagation();

  return (
    <div className="modal" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal__overlay" />
      <div className="modal__content" onClick={stop}>
        <div className="modal__header">
          <h2 className="modal__title">{title}</h2>
          <button className="modal__close" aria-label="Close" onClick={onClose}>&times;</button>
        </div>
        <form className="modal__form" onSubmit={onSubmit} noValidate>
          <div className="modal__body">{children}</div>
          <div className="modal__actions">
            <button type="submit" className="button">{submitText}</button>
          </div>
        </form>
      </div>
    </div>
  );
}