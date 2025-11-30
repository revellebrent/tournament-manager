import ModalWithForm from "../ModalWithForm/ModalWithForm.jsx";
import "./RegisterModal.css";

export default function RegisterModal({ isOpen, onClose, onSubmit }) {
  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (onSubmit) {
      await onSubmit(e);
    }
  }

  return (
    <ModalWithForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Create account"
      submitButtonText="Sign up"
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

      <label className="field">
        <span className="field__label">Role</span>
        <select
          className="field__input"
          name="role"
          defaultValue="coach"
          required
        >
          <option value="" disabled>
            Select a role
          </option>
          <option value="coach">Coach</option>
          <option value="director">Director</option>
          <option value="parent">Parent</option>
        </select>
      </label>
    </ModalWithForm>
  );
}
