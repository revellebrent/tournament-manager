import "./Preloader.css";

export default function Preloader({ text = "Loading..." }) {
  return (
    <div className="preloader">
      <div className="preloader__spinner"></div>
      <p className="preloader__text">{text}</p>
    </div>
  );
}
