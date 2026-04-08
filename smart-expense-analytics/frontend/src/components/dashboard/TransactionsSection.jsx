import { useMemo, useState } from 'react'
import { EXPENSE_CATEGORIES } from '../../constants/categories'
import { formatDate, formatINRDecimal, downloadTextFile, transactionsToCsv } from '../../utils/format'

export default function TransactionsSection({
  transactions,
  loading,
  error,
  onAdd,
  onUpdate,
  onDelete,
  onExportCsv,
}) {
  const [filterCat, setFilterCat] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    isRecurring: false,
  })

  const filtered = useMemo(() => {
    if (!filterCat) return transactions
    return transactions.filter((t) => t.category === filterCat)
  }, [transactions, filterCat])

  function resetForm() {
    setForm({
      amount: '',
      category: 'Food',
      description: '',
      date: new Date().toISOString().slice(0, 10),
      isRecurring: false,
    })
  }

  async function submitAdd(e) {
    e.preventDefault()
    await onAdd({
      amount: Number(form.amount),
      category: form.category,
      description: form.description.trim(),
      date: form.date,
      isRecurring: form.isRecurring,
    })
    resetForm()
  }

  function startEdit(t) {
    setEditingId(t._id)
    setForm({
      amount: String(t.amount),
      category: t.category,
      description: t.description,
      date: new Date(t.date).toISOString().slice(0, 10),
      isRecurring: !!t.isRecurring,
    })
  }

  async function submitEdit(e) {
    e.preventDefault()
    await onUpdate(editingId, {
      amount: Number(form.amount),
      category: form.category,
      description: form.description.trim(),
      date: form.date,
      isRecurring: form.isRecurring,
    })
    setEditingId(null)
    resetForm()
  }

  function handleExport() {
    const csv = transactionsToCsv(transactions)
    const name = `expenses-${new Date().toISOString().slice(0, 10)}.csv`
    downloadTextFile(name, csv)
    onExportCsv?.()
  }

  if (loading && !transactions.length) {
    return (
      <div className="section-loading">
        <div className="spinner" />
        <span className="muted">Loading transactions…</span>
      </div>
    )
  }

  return (
    <div className="transactions-panel">
      {error ? (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="transactions-toolbar">
        <h2>Add expense</h2>
        <div className="toolbar-actions">
          <button type="button" className="btn btn--secondary" onClick={handleExport}>
            Export CSV
          </button>
        </div>
      </div>

      <form
        className="card form form--inline"
        onSubmit={editingId ? submitEdit : submitAdd}
      >
        <div className="form-row">
          <label className="field field--compact">
            <span>Amount (₹)</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </label>
          <label className="field field--compact">
            <span>Category</span>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="field field--grow">
            <span>Description</span>
            <input
              type="text"
              maxLength={100}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Coffee, fuel, subscription…"
            />
          </label>
          <label className="field field--compact">
            <span>Date</span>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>
          <label className="field field--check">
            <input
              type="checkbox"
              checked={form.isRecurring}
              onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
            />
            <span>Recurring</span>
          </label>
        </div>
        <div className="form-actions">
          {editingId ? (
            <>
              <button className="btn btn--primary" type="submit">
                Save changes
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setEditingId(null)
                  resetForm()
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button className="btn btn--primary" type="submit">
              Add transaction
            </button>
          )}
        </div>
      </form>

      <div className="table-toolbar">
        <label className="field field--compact">
          <span className="sr-only">Filter category</span>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
            <option value="">All categories</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <span className="muted small">{filtered.length} shown</span>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Description</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t._id}>
                <td>{formatDate(t.date)}</td>
                <td className="num">{formatINRDecimal(t.amount)}</td>
                <td>
                  <span className="pill">{t.category}</span>
                  {t.isRecurring ? <span className="badge">Recurring</span> : null}
                </td>
                <td>{t.description}</td>
                <td className="actions">
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => startEdit(t)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-link btn-link--danger"
                    onClick={() => {
                      if (window.confirm('Delete this transaction?')) onDelete(t._id)
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="muted empty-hint pad">No transactions match this filter.</p>
        ) : null}
      </div>
    </div>
  )
}
