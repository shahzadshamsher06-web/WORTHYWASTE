import React, { useState, useEffect } from 'react';
import './styles.css';

// Import components
import Login from './components/Login';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AddFood from './components/AddFood';
import ClassifyWaste from './components/ClassifyWaste';
import Marketplace from './components/Marketplace';
import Analytics from './components/Analytics';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Check for existing user session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('nutritrack_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('nutritrack_user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('nutritrack_user', JSON.stringify(userData));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('nutritrack_user');
    setCurrentPage('dashboard');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFoodAdded = (newFoodItem) => {
    // This callback can be used to refresh data in other components
    // For now, we'll just log it
    console.log('New food item added:', newFoodItem);
  };

  // Show loading spinner while checking for saved user
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        flexDirection: 'column',
        backgroundColor: '#f9fafb'
      }}>
        <div className="loading-spinner" style={{ width: '50px', height: '50px', marginBottom: '20px' }}></div>
        <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Loading Worthy Waste...</p>
      </div>
    );
  }

  // Show login page if user is not authenticated
  if (!user) {
    return (
      <div className="app">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  // Main app with navigation
  return (
    <div className="app">
      <Navbar 
        user={user} 
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onLogout={handleLogout}
      />
      
      <main className="app-main">
        {currentPage === 'dashboard' && (
          <Dashboard user={user} />
        )}
        
        {currentPage === 'add-food' && (
          <AddFood 
            user={user} 
            onFoodAdded={handleFoodAdded}
          />
        )}
        
        {currentPage === 'classify-waste' && (
          <ClassifyWaste user={user} />
        )}
        
        {currentPage === 'marketplace' && (
          <Marketplace user={user} />
        )}
        
        {currentPage === 'analytics' && (
          <Analytics user={user} />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        color: 'white',
        padding: '40px 0',
        marginTop: '60px'
      }}>
        <div className="container">
          <div className="grid grid-4" style={{ gap: '32px', marginBottom: '32px' }}>
            <div>
              <h4 style={{ marginBottom: '16px', color: '#f3f4f6' }}>
                <i className="fas fa-leaf" style={{ marginRight: '8px', color: '#10b981' }}></i>
                Worthy Waste
              </h4>
              <p style={{ color: '#d1d5db', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Reducing food waste through AI-powered classification and smart marketplace connections.
              </p>
            </div>
            <div>
              <h5 style={{ marginBottom: '12px', color: '#f3f4f6' }}>Features</h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '8px' }}>
                  <button 
                    onClick={() => window.scrollTo(0, 0)}
                    style={{ 
                      background: 'none',
                      border: 'none',
                      color: '#d1d5db',
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: '0.9rem',
                      textAlign: 'left',
                      width: '100%'
                    }}
                  >
                    Food Inventory
                  </button>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <button 
                    onClick={() => window.scrollTo(0, 0)}
                    style={{ 
                      background: 'none',
                      border: 'none',
                      color: '#d1d5db',
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: '0.9rem',
                      textAlign: 'left',
                      width: '100%'
                    }}
                  >
                    Waste Classification
                  </button>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <button 
                    onClick={() => window.scrollTo(0, 0)}
                    style={{ 
                      background: 'none',
                      border: 'none',
                      color: '#d1d5db',
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: '0.9rem',
                      textAlign: 'left',
                      width: '100%'
                    }}
                  >
                    Marketplace
                  </button>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <button 
                    onClick={() => window.scrollTo(0, 0)}
                    style={{ 
                      background: 'none',
                      border: 'none',
                      color: '#d1d5db',
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: '0.9rem',
                      textAlign: 'left',
                      width: '100%'
                    }}
                  >
                    Analytics
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h5 style={{ marginBottom: '12px', color: '#f3f4f6' }}>Impact</h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '8px', color: '#d1d5db', fontSize: '0.9rem' }}>
                  <i className="fas fa-seedling" style={{ marginRight: '8px', color: '#10b981' }}></i>
                  Reduce Food Waste
                </li>
                <li style={{ marginBottom: '8px', color: '#d1d5db', fontSize: '0.9rem' }}>
                  <i className="fas fa-leaf" style={{ marginRight: '8px', color: '#10b981' }}></i>
                  Lower CO₂ Emissions
                </li>
                <li style={{ marginBottom: '8px', color: '#d1d5db', fontSize: '0.9rem' }}>
                  <i className="fas fa-heart" style={{ marginRight: '8px', color: '#ef4444' }}></i>
                  Help Communities
                </li>
                <li style={{ marginBottom: '8px', color: '#d1d5db', fontSize: '0.9rem' }}>
                  <i className="fas fa-coins" style={{ marginRight: '8px', color: '#f59e0b' }}></i>
                  Earn Green Coins
                </li>
              </ul>
            </div>
            <div>
              <h5 style={{ marginBottom: '12px', color: '#f3f4f6' }}>Connect</h5>
              <div style={{ display: 'flex', gap: '12px' }}>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#d1d5db', 
                    fontSize: '1.2rem',
                    transition: 'color 0.2s',
                    display: 'inline-block',
                    textDecoration: 'none'
                  }}
                  onMouseOver={(e) => e.target.style.color = '#10b981'}
                  onMouseOut={(e) => e.target.style.color = '#d1d5db'}
                  aria-label="Twitter"
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#d1d5db', 
                    fontSize: '1.2rem',
                    transition: 'color 0.2s',
                    display: 'inline-block',
                    textDecoration: 'none'
                  }}
                  onMouseOver={(e) => e.target.style.color = '#10b981'}
                  onMouseOut={(e) => e.target.style.color = '#d1d5db'}
                  aria-label="LinkedIn"
                >
                  <i className="fab fa-linkedin"></i>
                </a>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#d1d5db', 
                    fontSize: '1.2rem',
                    transition: 'color 0.2s',
                    display: 'inline-block',
                    textDecoration: 'none'
                  }}
                  onMouseOver={(e) => e.target.style.color = '#10b981'}
                  onMouseOut={(e) => e.target.style.color = '#d1d5db'}
                  aria-label="GitHub"
                >
                  <i className="fab fa-github"></i>
                </a>
              </div>
            </div>
          </div>
          
          <div style={{
            borderTop: '1px solid #374151',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem' }}>
              © 2024 Worthy Waste. Built for a sustainable future.
            </p>
            <div style={{ display: 'flex', gap: '24px' }}>
              <button 
                onClick={() => window.scrollTo(0, 0)}
                style={{ 
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '0.9rem',
                  textDecoration: 'none'
                }}
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => window.scrollTo(0, 0)}
                style={{ 
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '0.9rem',
                  textDecoration: 'none'
                }}
              >
                Terms of Service
              </button>
              <button 
                onClick={() => window.scrollTo(0, 0)}
                style={{ 
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '0.9rem',
                  textDecoration: 'none'
                }}
              >
                Support
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
