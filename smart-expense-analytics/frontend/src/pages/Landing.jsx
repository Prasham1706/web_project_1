import { Link } from 'react-router-dom'

const features = [
  {
    title: 'Smart analytics',
    text: 'Category breakdowns, spending trends, and automatic highlights for where money goes.',
    icon: '📊',
  },
  {
    title: 'Forecast & budgets',
    text: 'End-of-month projections from your daily pace, plus per-category budgets and alerts.',
    icon: '🎯',
  },
  {
    title: 'Goals & recurring',
    text: 'Track subscriptions and fixed costs, and set savings goals with clear progress.',
    icon: '🔁',
  },
  {
    title: 'Secure by design',
    text: 'JWT authentication and hashed passwords so your financial data stays private.',
    icon: '🔐',
  },
]

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing__nav">
        <Link to="/" className="brand">
          <span className="brand__mark" aria-hidden />
          Smart Expense Analytics
        </Link>
        <div className="landing__actions">
          <Link className="btn btn--ghost" to="/login">
            Sign in
          </Link>
          <Link className="btn btn--primary" to="/register">
            Get started
          </Link>
        </div>
      </header>

      <main>
        <section className="landing__hero">
          <p className="eyebrow">MERN · MongoDB · Express · React · Node</p>
          <h1>
            Turn everyday spending into{' '}
            <span className="text-gradient">clear, actionable insight</span>
          </h1>
          <p className="landing__lead">
            More than a ledger—this platform helps you see patterns, predict month-end totals,
            and stay inside budgets with a focused, lab-ready analytics experience.
          </p>
          <div className="landing__cta">
            <Link className="btn btn--primary btn--lg" to="/register">
              Create free account
            </Link>
            <Link className="btn btn--secondary btn--lg" to="/login">
              I already have an account
            </Link>
          </div>
        </section>

        <section className="landing__grid" aria-label="Features">
          {features.map((f) => (
            <article key={f.title} className="card card--feature">
              <span className="card__icon" aria-hidden>
                {f.icon}
              </span>
              <h2>{f.title}</h2>
              <p>{f.text}</p>
            </article>
          ))}
        </section>

        <section className="landing__footer-cta">
          <div className="card card--cta">
            <h2>Built for your web technology lab demo</h2>
            <p>
              REST APIs, aggregation pipelines, JWT auth, interactive charts, and export-ready
              reports—showing full-stack skills end to end.
            </p>
            <Link className="btn btn--primary" to="/register">
              Start the demo
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing__footer">
        <span>Smart Expense Analytics</span>
        <span className="muted">Local MERN project · Educational use</span>
      </footer>
    </div>
  )
}
