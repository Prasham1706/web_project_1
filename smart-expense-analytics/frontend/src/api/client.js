const API_BASE = import.meta.env.VITE_API_URL ?? ''

function authHeaders(token) {
  const h = { 'Content-Type': 'application/json' }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

async function parseJson(res) {
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { message: text || 'Invalid response' }
  }
  if (!res.ok) {
    const err = new Error(data.message || res.statusText || 'Request failed')
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export async function apiGet(path, token, query) {
  const q =
    query && Object.keys(query).length
      ? `?${new URLSearchParams(
          Object.fromEntries(Object.entries(query).filter(([, v]) => v != null && v !== ''))
        )}`
      : ''
  const res = await fetch(`${API_BASE}${path}${q}`, {
    headers: authHeaders(token),
  })
  return parseJson(res)
}

export async function apiPost(path, body, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body ?? {}),
  })
  return parseJson(res)
}

export async function apiPut(path, body, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(body ?? {}),
  })
  return parseJson(res)
}

export async function apiDelete(path, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  return parseJson(res)
}
