import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-container">
          <img src="/logo.svg" alt="Smart Expense Logo" className="logo" />
          <h1>Smart Expense Analytics</h1>
        </div>
        <div className="user-nav">
          {user && (
            <>
              <span className="welcome-text">Welcome, {user.name}</span>
              <button onClick={logout} className="btn-logout">Logout</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
