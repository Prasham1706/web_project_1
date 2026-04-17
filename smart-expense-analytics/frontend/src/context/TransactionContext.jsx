import { createContext, useContext, useState } from 'react';

const TransactionContext = createContext();

export const useTransactions = () => useContext(TransactionContext);

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalSpent: 0,
    budgetRemaining: 0,
    transactionCount: 0,
  });

  const addTransaction = (transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t._id !== id));
  };

  return (
    <TransactionContext.Provider value={{
      transactions,
      setTransactions,
      summary,
      setSummary,
      addTransaction,
      deleteTransaction
    }}>
      {children}
    </TransactionContext.Provider>
  );
};
