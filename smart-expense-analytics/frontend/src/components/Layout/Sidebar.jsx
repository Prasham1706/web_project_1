import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
              <i className="icon-dashboard"></i>
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/analytics" className={({ isActive }) => (isActive ? 'active' : '')}>
              <i className="icon-analytics"></i>
              <span>Analytics</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/transactions" className={({ isActive }) => (isActive ? 'active' : '')}>
              <i className="icon-transactions"></i>
              <span>Transactions</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
              <i className="icon-profile"></i>
              <span>My Profile</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
