import { formatINR, formatINRDecimal } from '../../utils/format'

export default function InsightsSection({
  insightsPayload,
  highSpending,
  predict,
  loading,
  error,
}) {
  if (loading) {
    return (
      <div className="section-loading">
        <div className="spinner" />
        <span className="muted">Loading insights…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert--error" role="alert">
        {error}
      </div>
    )
  }

  const insights = insightsPayload?.insights || []
  const month = insightsPayload?.month

  return (
    <div className="insights-panel">
      <div className="insights-grid">
        <article className="card insight-card">
          <h2>Monthly narrative</h2>
          <p className="muted small">{month}</p>
          <ul className="insight-list">
            {insights.length === 0 ? (
              <li className="muted">Add a few transactions to generate personalized tips.</li>
            ) : (
              insights.map((line, i) => (
                <li key={i}>{line}</li>
              ))
            )}
          </ul>
          {insightsPayload?.topCategory && insightsPayload.topCategory !== 'None' ? (
            <p className="insight-highlight">
              Top category: <strong>{insightsPayload.topCategory}</strong> at{' '}
              {formatINR(insightsPayload.topCategoryAmount)}
            </p>
          ) : null}
        </article>

        <article className="card insight-card">
          <h2>High-spending alerts</h2>
          <p className="muted">
            Categories at or above 80% of their monthly budget.
          </p>
          {(highSpending || []).length === 0 ? (
            <p className="muted empty-hint">No categories over threshold—nice control.</p>
          ) : (
            <ul className="alert-list">
              {(highSpending || []).map((h) => (
                <li key={h.category}>
                  <span className="alert-list__cat">{h.category}</span>
                  <span className="alert-list__pct">{h.percentage}% of budget</span>
                  <span className="muted small">
                    {formatINRDecimal(h.spent)} / {formatINR(h.budget)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="card insight-card insight-card--wide">
          <h2>Forecast snapshot</h2>
          <p className="muted">
            Linear projection from your spending so far—useful for course-correcting before month end.
          </p>
          <div className="forecast-inline">
            <div>
              <span className="muted small">Predicted total</span>
              <p className="forecast-num">{formatINRDecimal(predict?.predictedTotal)}</p>
            </div>
            <div>
              <span className="muted small">Daily average</span>
              <p className="forecast-num">{formatINRDecimal(predict?.dailyAverage)}</p>
            </div>
            <div>
              <span className="muted small">Days remaining</span>
              <p className="forecast-num">{predict?.daysRemaining ?? '—'}</p>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
