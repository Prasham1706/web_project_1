import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiDelete, apiGet, apiPost, apiPut } from '../api/client'
import OverviewSection from '../components/dashboard/OverviewSection'
import TransactionsSection from '../components/dashboard/TransactionsSection'
import BudgetSection from '../components/dashboard/BudgetSection'
import InsightsSection from '../components/dashboard/InsightsSection'
import { formatDate, formatINRDecimal } from '../utils/format'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'budget', label: 'Budgets & goals' },
  { id: 'insights', label: 'Insights' },
]

export default function Dashboard() {
  const { token, user, logout, refreshUser } = useAuth()
  const [tab, setTab] = useState('overview')

  const [trends, setTrends] = useState([])
  const [categoryData, setCategoryData] = useState(null)
  const [predict, setPredict] = useState(null)
  const [budgetStatus, setBudgetStatus] = useState(null)
  const [insightsPayload, setInsightsPayload] = useState(null)
  const [highSpending, setHighSpending] = useState([])
  const [transactions, setTransactions] = useState([])

  const [loadOverview, setLoadOverview] = useState(true)
  const [loadTx, setLoadTx] = useState(true)
  const [loadBudget, setLoadBudget] = useState(true)
  const [loadInsights, setLoadInsights] = useState(true)

  const [errOverview, setErrOverview] = useState('')
  const [errTx, setErrTx] = useState('')
  const [errBudget, setErrBudget] = useState('')
  const [errInsights, setErrInsights] = useState('')

  const refreshOverview = useCallback(async () => {
    if (!token) return
    setErrOverview('')
    setLoadOverview(true)
    try {
      const [tRes, cRes, pRes] = await Promise.all([
        apiGet('/api/analytics/trends', token, { days: 30 }),
        apiGet('/api/analytics/categories', token, {}),
        apiGet('/api/analytics/predict', token, {}),
      ])
      setTrends(tRes.trends || [])
      setCategoryData(cRes)
      setPredict(pRes)
    } catch (e) {
      setErrOverview(e.message || 'Failed to load overview')
    } finally {
      setLoadOverview(false)
    }
  }, [token])

  const refreshTransactions = useCallback(async () => {
    if (!token) return
    setErrTx('')
    setLoadTx(true)
    try {
      const res = await apiGet('/api/transactions', token, { limit: 200 })
      setTransactions(res.transactions || [])
    } catch (e) {
      setErrTx(e.message || 'Failed to load transactions')
    } finally {
      setLoadTx(false)
    }
  }, [token])

  const refreshBudget = useCallback(async () => {
    if (!token) return
    setErrBudget('')
    setLoadBudget(true)
    try {
      const res = await apiGet('/api/analytics/budget', token, {})
      setBudgetStatus(res.budgetStatus || [])
    } catch (e) {
      setErrBudget(e.message || 'Failed to load budgets')
    } finally {
      setLoadBudget(false)
    }
  }, [token])

  const refreshInsightsBlock = useCallback(async () => {
    if (!token) return
    setErrInsights('')
    setLoadInsights(true)
    try {
      const [iRes, hRes] = await Promise.all([
        apiGet('/api/analytics/insights', token, {}),
        apiGet('/api/analytics/high-spending', token, { threshold: 80 }),
      ])
      setInsightsPayload(iRes)
      setHighSpending(hRes.highSpending || [])
    } catch (e) {
      setErrInsights(e.message || 'Failed to load insights')
    } finally {
      setLoadInsights(false)
    }
  }, [token])

  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshOverview(),
      refreshTransactions(),
      refreshBudget(),
      refreshInsightsBlock(),
      refreshUser?.(),
    ])
  }, [refreshOverview, refreshTransactions, refreshBudget, refreshInsightsBlock, refreshUser])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  async function handleAdd(body) {
    await apiPost('/api/transactions', body, token)
    await refreshAll()
  }

  async function handleUpdate(id, body) {
    await apiPut(`/api/transactions/${id}`, body, token)
    await refreshAll()
  }

  async function handleDelete(id) {
    await apiDelete(`/api/transactions/${id}`, token)
    await refreshAll()
  }

  async function handleUpdateBudget(category, amount) {
    await apiPut('/api/auth/budget', { category, amount }, token)
  }

  async function handleUpdateSavingsGoal(body) {
    await apiPut('/api/auth/savings-goal', body, token)
  }

  function handlePrintReport() {
    window.print()
  }

  const reportDate = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <div className="dashboard">
      <header className="dash-header no-print">
        <div className="dash-header__left">
          <Link to="/" className="brand brand--compact">
            <span className="brand__mark" aria-hidden />
            <span className="brand__text">Smart Expense</span>
          </Link>
          <nav className="tabs" aria-label="Dashboard sections">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`tab ${tab === t.id ? 'tab--active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="dash-header__right">
          <span className="user-pill" title={user?.email}>
            {user?.name}
          </span>
          <button type="button" className="btn btn--secondary btn--sm" onClick={handlePrintReport}>
            Print / Save PDF
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => logout()}>
            Sign out
          </button>
        </div>
      </header>

      <main className="dash-main no-print">
        {tab === 'overview' ? (
          <OverviewSection
            trends={trends}
            categoryData={categoryData}
            predict={predict}
            loading={loadOverview}
            error={errOverview}
          />
        ) : null}

        {tab === 'transactions' ? (
          <TransactionsSection
            transactions={transactions}
            loading={loadTx}
            error={errTx}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onExportCsv={() => {}}
          />
        ) : null}

        {tab === 'budget' ? (
          <BudgetSection
            user={user}
            budgetStatus={budgetStatus}
            loading={loadBudget}
            error={errBudget}
            onUpdateBudget={handleUpdateBudget}
            onUpdateSavingsGoal={handleUpdateSavingsGoal}
            refreshUser={refreshUser}
          />
        ) : null}

        {tab === 'insights' ? (
          <InsightsSection
            insightsPayload={insightsPayload}
            highSpending={highSpending}
            predict={predict}
            loading={loadInsights}
            error={errInsights}
          />
        ) : null}
      </main>

      {/* Print-friendly summary (same route; hidden on screen) */}
      <div className="print-root" aria-hidden="true">
        <h1>Smart Expense Analytics — summary</h1>
        <p className="print-meta">
          Prepared for <strong>{user?.name}</strong> · {reportDate}
        </p>
        <section>
          <h2>Forecast</h2>
          <ul>
            <li>Spent so far: {formatINRDecimal(predict?.spentSoFar)}</li>
            <li>Predicted month-end: {formatINRDecimal(predict?.predictedTotal)}</li>
            <li>Last month total: {formatINRDecimal(predict?.lastMonthTotal)}</li>
          </ul>
        </section>
        <section>
          <h2>Recent transactions</h2>
          <table className="print-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 25).map((t) => (
                <tr key={t._id}>
                  <td>{formatDate(t.date)}</td>
                  <td>{formatINRDecimal(t.amount)}</td>
                  <td>{t.category}</td>
                  <td>{t.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
