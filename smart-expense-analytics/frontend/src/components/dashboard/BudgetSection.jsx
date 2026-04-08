import { useEffect, useState } from 'react'
import { EXPENSE_CATEGORIES } from '../../constants/categories'
import { formatINR } from '../../utils/format'

function clampPct(n) {
  return Math.min(100, Math.max(0, Number(n) || 0))
}

export default function BudgetSection({
  user,
  budgetStatus,
  loading,
  error,
  onUpdateBudget,
  onUpdateSavingsGoal,
  refreshUser,
}) {
  const [localBudgets, setLocalBudgets] = useState({})
  const [goal, setGoal] = useState({ targetAmount: '', deadline: '' })

  useEffect(() => {
    if (user?.monthlyBudget) {
      setLocalBudgets({ ...user.monthlyBudget })
    }
    if (user?.savingsGoal) {
      setGoal({
        targetAmount: user.savingsGoal.targetAmount || '',
        deadline: user.savingsGoal.deadline
          ? new Date(user.savingsGoal.deadline).toISOString().slice(0, 10)
          : '',
      })
    }
  }, [user])

  async function saveBudget(category) {
    const amount = Number(localBudgets[category])
    if (Number.isNaN(amount) || amount < 0) return
    await onUpdateBudget(category, amount)
    await refreshUser?.()
  }

  async function saveGoal(e) {
    e.preventDefault()
    const targetAmount = Number(goal.targetAmount)
    if (Number.isNaN(targetAmount) || targetAmount < 0) return
    await onUpdateSavingsGoal({
      targetAmount,
      deadline: goal.deadline || undefined,
    })
    await refreshUser?.()
  }

  const byCategory = Object.fromEntries(
    (budgetStatus || []).map((b) => [b.category, b])
  )

  if (loading && !budgetStatus) {
    return (
      <div className="section-loading">
        <div className="spinner" />
        <span className="muted">Loading budgets…</span>
      </div>
    )
  }

  return (
    <div className="budget-panel">
      {error ? (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="card">
        <h2>Monthly budgets by category</h2>
        <p className="muted">
          Compare what you planned versus actual spend this month. Update any row and save.
        </p>
        <div className="budget-list">
          {EXPENSE_CATEGORIES.map((cat) => {
            const row = byCategory[cat]
            const spent = row?.spent ?? 0
            const budget = Number(localBudgets[cat] ?? row?.budget ?? 0)
            const pct = budget > 0 ? clampPct((spent / budget) * 100) : 0
            const status = row?.status || 'good'
            return (
              <div key={cat} className="budget-row">
                <div className="budget-row__head">
                  <span className="budget-cat">{cat}</span>
                  <span className="budget-meta muted">
                    Spent {formatINR(spent)} / {formatINR(budget)}
                  </span>
                </div>
                <div className={`progress progress--${status}`}>
                  <div className="progress__bar" style={{ width: `${pct}%` }} />
                </div>
                <div className="budget-row__edit">
                  <label className="field field--compact">
                    <span className="sr-only">Budget {cat}</span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={localBudgets[cat] ?? ''}
                      onChange={(e) =>
                        setLocalBudgets({ ...localBudgets, [cat]: e.target.value })
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={() => saveBudget(cat)}
                  >
                    Save
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card">
        <h2>Savings goal</h2>
        <p className="muted">Set a target and optional deadline to visualize progress in your plan.</p>
        <form className="form form--row" onSubmit={saveGoal}>
          <label className="field field--compact">
            <span>Target (₹)</span>
            <input
              type="number"
              min="0"
              step="100"
              value={goal.targetAmount}
              onChange={(e) => setGoal({ ...goal, targetAmount: e.target.value })}
              required
            />
          </label>
          <label className="field field--compact">
            <span>Deadline</span>
            <input
              type="date"
              value={goal.deadline}
              onChange={(e) => setGoal({ ...goal, deadline: e.target.value })}
            />
          </label>
          <button className="btn btn--primary" type="submit">
            Update goal
          </button>
        </form>
      </div>
    </div>
  )
}
