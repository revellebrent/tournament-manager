import ModalWithForm from '../ModalWithForm/ModalWithForm';
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
        <input className="field__input" type="email" name="email" placeholder="you@example.com" required />
      </label>
      <label className="field">
        <span className="field__label">Password</span>
        <input className="field__input" type="password" name="password" placeholder="Enter your password" required />
      </label>
    </ModalWithForm>
  );
}