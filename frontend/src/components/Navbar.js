import React from 'react';

const Navbar = ({ user, currentPage, onPageChange, onLogout }) => {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'fas fa-home' },
    { key: 'add-food', label: 'Add Food', icon: 'fas fa-plus-circle' },
    { key: 'classify-waste', label: 'Classify', icon: 'fas fa-camera' },
    { key: 'marketplace', label: 'Marketplace', icon: 'fas fa-store' },
    { key: 'analytics', label: 'Analytics', icon: 'fas fa-chart-bar' }
  ];

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <div className="navbar-brand">
            <i className="fas fa-leaf"></i>
            Worthy Waste
          </div>
          
          <div className="navbar-nav">
            {navItems.map(item => (
              <button
                key={item.key}
                className={`nav-button ${currentPage === item.key ? 'active' : ''}`}
                onClick={() => onPageChange(item.key)}
              >
                <i className={item.icon}></i>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
            
            <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#667eea' }}>
                <i className="fas fa-coins"></i>
                <span style={{ fontWeight: '600' }}>{user?.greenCoins || 0}</span>
              </div>
              
              <div style={{ fontSize: '0.9rem', color: '#718096' }}>
                {user?.name || user?.phone || 'User'}
              </div>
              
              <button
                className="btn btn-secondary btn-small"
                onClick={onLogout}
                title="Logout"
              >
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
