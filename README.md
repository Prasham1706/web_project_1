# Smart Expense Analytics Platform

A simple full-stack web application to track daily expenses and understand spending patterns.

This project goes beyond basic expense tracking by showing insights like category-wise spending, monthly trends, and a simple prediction of future expenses.

---

## Overview

Most expense trackers only store data. This project focuses on helping users understand their spending habits.

Users can:

* Add and manage expenses
* View spending by category
* Track overall expenses
* See simple predictions based on current data

---

## Tech Stack

**Frontend**

* React (Vite)
* Axios
* Recharts

**Backend**

* Node.js
* Express.js

**Storage**

* Local JSON file (used instead of MongoDB for simplicity)

---

## Features

* Add, view, and delete expenses
* Category-wise expense tracking
* Basic analytics and summaries
* Simple prediction of total spending
* Clean and responsive UI

---

## Project Structure

```
smart-expense-analytics/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── data.json
│   └── server.js
│
├── frontend/
│
└── README.md
```

---

## How to Run

### 1. Clone the repository

```
git clone https://github.com/dharmikd2905/smart-expense-analytics.git
```

---

### 2. Run Backend

```
cd smart-expense-analytics/backend
npm install
node server.js
```

Server runs on:

```
http://localhost:5000
```

---

### 3. Run Frontend

```
cd smart-expense-analytics/frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## Notes

* This project uses a local JSON file instead of a database for easier setup.
* Authentication is disabled for testing purposes.
* The structure is designed so it can be easily extended to MongoDB in future.

---

## Future Improvements

* Add proper authentication system
* Connect to MongoDB database
* Improve prediction logic
* Add export (PDF/CSV)
* Mobile-friendly enhancements

---

## Author

Dharmik Dudhat

---

## Final Note

This project was built as part of learning full-stack development and focuses on combining backend logic with a clean frontend interface.
