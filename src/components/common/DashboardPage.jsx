import "./dashboard-shared.css";

export default function DashboardPage({ title, children, toolbar }) {
  return (
    <main className="container">
      <h1 className="section__title">{title}</h1>
      {toolbar ? <div className="section__toolbar">{toolbar}</div> : null}
      {children}
    </main>
  );
}