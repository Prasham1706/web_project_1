export function formatINR(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(n))
}

export function formatINRDecimal(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(n))
}

export function formatDate(d) {
  if (!d) return '—'
  const date = typeof d === 'string' ? new Date(d) : d
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(date)
}

export function monthInputValue(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function transactionsToCsv(rows) {
  const headers = ['Date', 'Amount', 'Category', 'Description', 'Recurring']
  const lines = [headers.join(',')]
  for (const t of rows) {
    const date = new Date(t.date).toISOString().slice(0, 10)
    const desc = String(t.description || '').replace(/"/g, '""')
    lines.push(
      [
        date,
        t.amount,
        t.category,
        `"${desc}"`,
        t.isRecurring ? 'yes' : 'no',
      ].join(',')
    )
  }
  return lines.join('\n')
}

export function downloadTextFile(filename, content, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
