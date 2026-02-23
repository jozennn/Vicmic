import React from 'react';
import VicmisLogo from '../assets/logo.png'; 
import api from '@/api/axios';

// Make sure 'setUser' is passed as a prop from App.jsx
const Sidebar = ({ activeItem, setActiveItem, checkAccess, setUser }) => {
  const menuItems = [
    { name: 'Dashboard', icon: '🏠' },
    { name: 'Project', icon: '📝' },
    { name: 'Inventory', icon: '📦' },
    { name: 'Human Resource', icon: '🧑‍🤝‍🧑' },
    { name: 'Documents', icon: '📑' },
    { name: 'Customer', icon: '👤' },
    { name: 'Reports', icon: '⚙️' },
  ];

const handleLogout = async () => {
  try {
    // Laravel will clear the cookie on the server side
    await api.post('/logout'); 

    // Update your React state
    if (setUser) setUser(null); 
    
    // Redirect to login
    window.location.href = '/login'; 
  } catch (error) {
    console.error("Logout failed", error);
    // Still clear the UI state and redirect
    if (setUser) setUser(null);
    window.location.href = '/login';
  }
};

  return (
    <div className="sidebar h-full flex flex-col justify-between">
      <div className="sidebar-top">
        <div className="logo">
          <img src={VicmisLogo} alt="VICMIS Logo" className="sidebar-logo-img"/>
          VICMIS
        </div>
        <nav className="nav-menu">
          <ul>
            {menuItems.map((item) => {
              const isAllowed = checkAccess ? checkAccess(item.name) : true;
              return (
                <li
                  key={item.name}
                  className={`nav-item ${item.name === activeItem ? 'active' : ''} ${!isAllowed ? 'disabled' : ''}`}
                  onClick={() => isAllowed && setActiveItem(item.name)}
                >
                  <span className="icon">{item.icon}</span>
                  {item.name}
                  {!isAllowed && <span className="lock-icon">🔒</span>}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="sidebar-footer">
        <button className="btn-logout" onClick={handleLogout}>
          <span className="icon">🚪</span>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;