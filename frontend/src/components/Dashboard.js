import React, { useState, useEffect, useCallback } from 'react';
import { inventoryAPI, analyticsAPI } from '../services/api';

const Dashboard = ({ user }) => {
  const [inventory, setInventory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = useCallback(async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      setError('');

      const [inventoryResponse, analyticsResponse] = await Promise.all([
        inventoryAPI.list(user._id),
        analyticsAPI.getSummary(user._id)
      ]);

      if (inventoryResponse?.data?.success) {
        setInventory(inventoryResponse.data.items || []);
      }

      if (analyticsResponse?.data?.success) {
        setAnalytics(analyticsResponse.data.summary);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

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

  if (loading) {
    return (
      <div className="main-content">
        <div className="container">
          <div className="loading">
            <div className="loading-spinner"></div>
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
            <div className="error">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          {/* Quick Stats */}
          {analytics && (
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
          )}

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
                        onClick={() => handleDeleteItem(item._id)}
                        title="Delete item"
                      >
                        <i className="fas fa-trash"></i>
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
  );
};

export default Dashboard;
