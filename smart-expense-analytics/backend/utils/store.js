const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE = path.join(__dirname, '..', 'data.json');

const DEFAULT_BUDGET = {
  Food: 5000,
  Transport: 3000,
  Shopping: 4000,
  Entertainment: 2000,
  Bills: 8000,
  Healthcare: 2000,
  Education: 3000,
  Other: 2000,
};

function emptyState() {
  return { users: [], transactions: [] };
}

/**
 * Normalize parsed JSON: support legacy root array (transactions only).
 */
function normalize(raw) {
  if (raw == null) return emptyState();
  if (Array.isArray(raw)) {
    const transactions = raw.map((t) => ({
      _id: t._id || (t.id != null ? String(t.id) : crypto.randomUUID()),
      userId: t.userId || null,
      amount: Number(t.amount) || 0,
      category: t.category || 'Other',
      description: t.description || '',
      date: t.date ? new Date(t.date).toISOString() : new Date().toISOString(),
      isRecurring: !!t.isRecurring,
      createdAt: t.createdAt || new Date().toISOString(),
      updatedAt: t.updatedAt || new Date().toISOString(),
    }));
    return { users: [], transactions };
  }
  if (typeof raw !== 'object') return emptyState();
  return {
    users: Array.isArray(raw.users) ? raw.users : [],
    transactions: Array.isArray(raw.transactions) ? raw.transactions : [],
  };
}

function readDb() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initial = emptyState();
      writeDb(initial);
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    if (!raw.trim()) {
      const initial = emptyState();
      writeDb(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return normalize(parsed);
  } catch (err) {
    console.error('readDb:', err.message);
    throw new Error(`Failed to read data file: ${err.message}`);
  }
}

function writeDb(data) {
  try {
    const normalized = normalize(data);
    fs.writeFileSync(DATA_FILE, JSON.stringify(normalized, null, 2), 'utf8');
  } catch (err) {
    console.error('writeDb:', err.message);
    throw new Error(`Failed to write data file: ${err.message}`);
  }
}

function findUserById(id) {
  const db = readDb();
  return db.users.find((u) => u.id === id) || null;
}

function findUserByEmail(email) {
  const db = readDb();
  const e = String(email).toLowerCase().trim();
  return db.users.find((u) => u.email === e) || null;
}

function createUser(user) {
  const db = readDb();
  db.users.push(user);
  writeDb(db);
  return user;
}

function updateUser(id, patch) {
  const db = readDb();
  const i = db.users.findIndex((u) => u.id === id);
  if (i === -1) return null;
  db.users[i] = { ...db.users[i], ...patch };
  writeDb(db);
  return db.users[i];
}

function listTransactionsForUser(userId, filter = {}) {
  const db = readDb();
  let list = db.transactions.filter((t) => t.userId === userId);

  if (filter.startDate || filter.endDate) {
    const start = filter.startDate ? new Date(filter.startDate).getTime() : null;
    const end = filter.endDate ? new Date(filter.endDate).getTime() : null;
    list = list.filter((t) => {
      const ts = new Date(t.date).getTime();
      if (start != null && ts < start) return false;
      if (end != null && ts > end) return false;
      return true;
    });
  }
  if (filter.category) {
    list = list.filter((t) => t.category === filter.category);
  }

  list.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (filter.limit && Number.isFinite(Number(filter.limit))) {
    list = list.slice(0, parseInt(filter.limit, 10));
  }
  return list;
}

function getTransactionById(txId) {
  const db = readDb();
  return db.transactions.find((t) => t._id === txId) || null;
}

function addTransactionDoc(doc) {
  const db = readDb();
  db.transactions.push(doc);
  writeDb(db);
  return doc;
}

function deleteTransactionById(txId) {
  const db = readDb();
  const i = db.transactions.findIndex((t) => t._id === txId);
  if (i === -1) return false;
  db.transactions.splice(i, 1);
  writeDb(db);
  return true;
}

function newUserPayload({ name, email, passwordHash }) {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: String(email).toLowerCase().trim(),
    passwordHash,
    monthlyBudget: { ...DEFAULT_BUDGET },
    savingsGoal: { targetAmount: 0, deadline: null, currentProgress: 0 },
    createdAt: new Date().toISOString(),
  };
}

module.exports = {
  DATA_FILE,
  readDb,
  writeDb,
  findUserById,
  findUserByEmail,
  createUser,
  updateUser,
  listTransactionsForUser,
  getTransactionById,
  addTransactionDoc,
  deleteTransactionById,
  newUserPayload,
  DEFAULT_BUDGET,
};
