import ModalWithForm from "../ModalWithForm/ModalWithForm.jsx";
import "./LoginModal.css";

export default function LoginModal({ isOpen, onClose, onSubmit }) {
  return (
    <ModalWithForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Sign in"
      submitButtonText="Sign in"
    >
      <label className="field">
        <span className="field__label">Email</span>
        <input
          className="field__input"
          type="email"
          name="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          autoFocus
        />
      </label>

      <label className="field">
        <span className="field__label">Password</span>
        <input
          className="field__input"
          type="password"
          name="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />
      </label>

      <label className="field">
        <span className="field__label">Role</span>
        <select
          className="field__input"
          name="role"
          defaultValue="coach"
          required
        >
          <option value="coach">Coach</option>
          <option value="director">Director</option>
          <option value="parent">Parent</option>
        </select>
      </label>
    </ModalWithForm>
  );
}
