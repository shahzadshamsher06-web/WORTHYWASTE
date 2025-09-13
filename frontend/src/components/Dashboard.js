import React, { useState, useEffect, useCallback } from 'react';
import { inventoryAPI, analyticsAPI } from '../services/api';

// Skeleton loading component
const SkeletonLoader = ({ count = 1 }) => (
  <div className="skeleton-loader">
    {Array(count).fill(0).map((_, i) => (
      <div key={i} className="skeleton-item" />
    ))}
  </div>
);

// Error component with retry functionality
const ErrorMessage = ({ message, onRetry }) => (
  <div className="error-message">
    <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
    <span>{message}</span>
    {onRetry && (
      <button 
        onClick={onRetry} 
        className="btn btn-link"
        aria-label="Retry loading data"
      >
        Retry
      </button>
    )}
  </div>
);

const Dashboard = ({ user }) => {
  const [inventory, setInventory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const loadDashboardData = useCallback(async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      setError('');

      // Set default analytics immediately to prevent undefined errors
      setAnalytics({
        savedFoodCount: 0,
        greenCoinsEarned: 0,
        totalEarned: 0,
        environmentalImpact: { co2Saved: 0 },
        insights: [
          'Loading your dashboard...',
          'This should only take a moment',
          'We\'re getting your data ready'
        ]
      });

      const [inventoryResponse, analyticsResponse] = await Promise.all([
        inventoryAPI.list(user._id).catch(err => {
          console.error('Inventory API error:', err);
          return { data: { success: false, message: 'Failed to load inventory' }};
        }),
        analyticsAPI.getUserSummary(user._id).catch(err => {
          console.error('Analytics API error:', err);
          return { data: { success: false, message: 'Failed to load analytics' }};
        })
      ]);

      // Handle inventory response
      if (inventoryResponse?.data?.success) {
        setInventory(Array.isArray(inventoryResponse.data.items) ? inventoryResponse.data.items : []);
      } else {
        console.warn('Inventory load warning:', inventoryResponse?.data?.message);
        // Don't throw error, just log and continue with empty inventory
        setInventory([]);
      }

      // Handle analytics response
      if (analyticsResponse?.data?.success) {
        setAnalytics({
          savedFoodCount: analyticsResponse.data.summary?.savedFoodCount || 0,
          greenCoinsEarned: analyticsResponse.data.summary?.greenCoinsEarned || 0,
          totalEarned: analyticsResponse.data.summary?.totalEarned || 0,
          environmentalImpact: {
            co2Saved: analyticsResponse.data.summary?.environmentalImpact?.co2Saved || 0
          },
          insights: Array.isArray(analyticsResponse.data.summary?.insights) && 
                   analyticsResponse.data.summary.insights.length > 0
            ? analyticsResponse.data.summary.insights 
            : [
                'Start adding food items to get personalized insights',
                'Check your inventory regularly to prevent food waste',
                'Visit the marketplace to sell excess food items'
              ]
        });
      } else {
        console.warn('Analytics load warning:', analyticsResponse?.data?.message);
        // Keep default analytics with a warning message
        setAnalytics(prev => ({
          ...prev,
          insights: [
            'Analytics data is currently limited',
            'Some features may not be available',
            'Please try refreshing the page if the issue persists'
          ]
        }));
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err.message || 'Failed to load dashboard data');
      // Auto-retry up to 3 times
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  // Add retryCount to dependencies to trigger retry
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData, retryCount]);

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await inventoryAPI.delete(itemId);
      if (response.data.success) {
        setInventory(inventory.filter(item => item._id !== itemId));
        // Reload analytics to update stats
        loadDashboardData();
      }
    } catch (err) {
      console.error('Delete item error:', err);
      alert('Failed to delete item. Please try again.');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'fresh': return 'status-fresh';
      case 'expiring_soon': return 'status-expiring';
      case 'expired': return 'status-expired';
      default: return 'status-fresh';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Loading state with skeleton loaders
  if (loading) {
    return (
      <div className="main-content" aria-busy="true" aria-live="polite">
        <div className="container">
          <div className="card">
            <div className="card-header">
              <h1 className="card-title">
                <i className="fas fa-home" aria-hidden="true"></i>
                Loading your dashboard...
              </h1>
              <div className="card-subtitle">
                We're getting your data ready
              </div>
            </div>
            
            <div className="stats-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="stat-card" aria-hidden="true">
                  <div className="skeleton-stat" style={{ width: '60px', height: '32px' }} />
                  <div className="skeleton-label" style={{ width: '80px', height: '16px', marginTop: '8px' }} />
                </div>
              ))}
            </div>
            
            <div className="card" style={{ margin: '24px' }}>
              <div className="card-header">
                <h2 className="card-title">
                  <i className="fas fa-apple-alt" aria-hidden="true"></i>
                  Loading your food items...
                </h2>
                <div className="card-subtitle">
                  <span className="skeleton-subtitle" style={{ width: '120px', display: 'inline-block' }} />
                </div>
              </div>
              <SkeletonLoader count={3} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="container">
        <div className="card">
          <div className="card-header">
            <div>
              <h1 className="card-title">
                <i className="fas fa-home"></i>
                Welcome back, {user?.name || 'User'}!
              </h1>
              <div className="card-subtitle">
                Track your food inventory and reduce waste
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message-container">
              <ErrorMessage 
                message={error} 
                onRetry={() => {
                  setRetryCount(0);
                  loadDashboardData();
                }} 
              />
            </div>
          )}

          {/* Quick Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{analytics.savedFoodCount}</div>
              <div className="stat-label">Food Items Saved</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{analytics.greenCoinsEarned}</div>
              <div className="stat-label">Green Coins</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">₹{analytics.totalEarned}</div>
              <div className="stat-label">Total Earned</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{analytics.environmentalImpact?.co2Saved || 0}kg</div>
              <div className="stat-label">CO₂ Saved</div>
            </div>
          </div>

          {/* Food Inventory */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <i className="fas fa-apple-alt"></i>
                Food Inventory
              </h2>
              <div className="card-subtitle">
                {inventory.length} items • Sorted by expiry date
              </div>

            {inventory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
                <i className="fas fa-inbox" style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}></i>
                <p>No food items in your inventory yet.</p>
                <p>Add some items to start tracking your food and reducing waste!</p>
              </div>
            ) : (
              <div>
                {inventory.map(item => (
                  <div key={item._id} className="food-item">
                    <div className="food-item-info">
                      <div className="food-item-name">{item.name}</div>
                      <div className="food-item-details">
                        {item.quantity} {item.unit} • 
                        Expires: {formatDate(item.expiryDate)} • 
                        Storage: {item.storage} • 
                        {item.calories} cal
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className={`food-item-status ${getStatusClass(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteItem(item._id);
                        }}
                        title="Delete item"
                        aria-label={`Delete ${item.name}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleDeleteItem(item._id);
                          }
                        }}
                        tabIndex={0}
                      >
                        <i className="fas fa-trash" aria-hidden="true"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-2">
            <div className="card">
              <h3 className="card-title">
                <i className="fas fa-plus-circle"></i>
                Quick Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ color: '#718096', fontSize: '0.9rem' }}>
                  Get started with these common actions:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <span className="btn btn-secondary btn-small">
                    <i className="fas fa-plus"></i>
                    Add Food Item
                  </span>
                  <span className="btn btn-secondary btn-small">
                    <i className="fas fa-camera"></i>
                    Classify Waste
                  </span>
                  <span className="btn btn-secondary btn-small">
                    <i className="fas fa-store"></i>
                    Visit Marketplace
                  </span>
                </div>
              </div>

            <div className="card">
              <h3 className="card-title">
                <i className="fas fa-lightbulb"></i>
                Tips & Insights
              </h3>
              <div style={{ fontSize: '0.9rem', color: '#4a5568' }}>
                {analytics?.insights && analytics.insights.length > 0 ? (
                  <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    {analytics.insights.map((insight, index) => (
                      <li key={index} style={{ marginBottom: '8px' }}>
                        {insight}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    Start adding food items to get personalized insights about your food waste patterns and environmental impact!
                  </p>
                )}
              </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
  </div>
  );
};

export default Dashboard;
