import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatINR, formatINRDecimal } from '../../utils/format'

const PIE_COLORS = [
  '#14b8a6',
  '#6366f1',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
  '#10b981',
  '#ef4444',
  '#64748b',
]

export default function OverviewSection({
  trends,
  categoryData,
  predict,
  loading,
  error,
}) {
  const lineData = (trends || []).map((t) => ({
    date: t._id?.slice(5) || t._id,
    total: t.dailyTotal ?? 0,
  }))

  const pieData = (categoryData?.breakdown || []).map((c) => ({
    name: c.category,
    value: c.total,
  }))

  if (loading) {
    return (
      <div className="section-loading">
        <div className="spinner" />
        <span className="muted">Loading analytics…</span>
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

  const trendWord = predict?.trend === 'increasing' ? 'above' : 'below'

  return (
    <div className="overview">
      <div className="kpi-grid">
        <article className="kpi">
          <span className="kpi__label">Spent this month</span>
          <strong className="kpi__value">{formatINR(predict?.spentSoFar)}</strong>
          <span className="kpi__hint muted">So far in {new Date().toLocaleString('en-IN', { month: 'long' })}</span>
        </article>
        <article className="kpi kpi--accent">
          <span className="kpi__label">Predicted month-end</span>
          <strong className="kpi__value">{formatINR(predict?.predictedTotal)}</strong>
          <span className="kpi__hint muted">
            ~{formatINRDecimal(predict?.dailyAverage)} / day · {predict?.daysRemaining ?? 0} days left
          </span>
        </article>
        <article className="kpi">
          <span className="kpi__label">Last month total</span>
          <strong className="kpi__value">{formatINR(predict?.lastMonthTotal)}</strong>
          <span className="kpi__hint muted">
            Projection is {trendWord} last month’s pace
          </span>
        </article>
      </div>

      <div className="charts-grid">
        <div className="card chart-card">
          <div className="chart-card__head">
            <h2>Daily spending</h2>
            <p className="muted">Last 30 days (₹ per day)</p>
          </div>
          <div className="chart-card__body">
            {lineData.length === 0 ? (
              <p className="muted empty-hint">Add transactions to see your trend line.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={lineData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [formatINRDecimal(value), 'Spent']}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#0d9488"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSpend)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card chart-card">
          <div className="chart-card__head">
            <h2>Categories this month</h2>
            <p className="muted">Share of spending</p>
          </div>
          <div className="chart-card__body chart-card__body--split">
            {pieData.length === 0 ? (
              <p className="muted empty-hint">No category data for this month yet.</p>
            ) : (
              <>
                <div className="pie-wrap">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={2}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatINRDecimal(value)}
                        contentStyle={{
                          background: 'var(--surface-elevated)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="legend-list">
                  {(categoryData?.breakdown || []).map((c, i) => (
                    <li key={c.category}>
                      <span
                        className="legend-dot"
                        style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="legend-name">{c.category}</span>
                      <span className="legend-val">{formatINR(c.total)}</span>
                      <span className="legend-pct muted">{c.percentage}%</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
