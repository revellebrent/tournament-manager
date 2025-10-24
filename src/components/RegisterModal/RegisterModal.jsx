import ModalWithForm from "../ModalWithForm/ModalWithForm.jsx";
import "./RegisterModal.css";

export default function RegisterModal({ isOpen, onClose, onSubmit }) {
  return (
    <ModalWithForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Create account"
      submitText="Sign up"
    >
      <label className="field">
        <span className="field__label">Name</span>
        <input
          className="field__input"
          type="text"
          name="name"
          placeholder="Your name"
          required
          minLength="2"
          maxLength="30"
        />
      </label>
      <label className="field">
        <span className="field__label">Email</span>
        <input
          className="field__input"
          type="email"
          name="email"
          placeholder="you@example.com"
          required
        />
      </label>
      <label className="field">
        <span className="field__label">Password</span>
        <input
          className="field__input"
          type="password"
          name="password"
          placeholder="Create a password"
          required
          minLength="6"
        />
      </label>
    </ModalWithForm>
  );
}
