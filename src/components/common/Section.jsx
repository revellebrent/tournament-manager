import "./dashboard-shared.css";

export default function Section({ title, children, id, actions }) {
  return (
    <section id={id} className="section">
      {title ? (
        <div className="section__header">
          <h2 className="section__h2">{title}</h2>
          {actions ? <div className="section__actions">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
