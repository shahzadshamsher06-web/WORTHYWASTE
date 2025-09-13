import React, { useState, useEffect, useCallback } from 'react';
import { marketplaceAPI } from '../services/api';

const Marketplace = ({ user }) => {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTab, setSelectedTab] = useState('buyers');
  const [sellModal, setSellModal] = useState({ show: false, buyer: null, foodItem: null });
  const [sellForm, setSellForm] = useState({
    quantity: '',
    price: '',
    type: 'sell'
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const buyersRes = await marketplaceAPI.getBuyers();
      
      if (buyersRes?.data?.success) setBuyers(buyersRes.data.buyers);
    } catch (err) {
      console.error('Load data error:', err);
      setError('Failed to load marketplace data');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSellClick = (buyer, foodItem) => {
    setSellModal({ show: true, buyer, foodItem });
    setSellForm({
      quantity: foodItem.quantity ? foodItem.quantity.toString() : '1',
      price: (foodItem.quantity ? foodItem.quantity * 2 : 2).toFixed(2),
      type: 'sell'
    });
  };

  const handleDonateClick = (buyer, foodItem) => {
    setSellModal({ show: true, buyer, foodItem });
    setSellForm({
      quantity: foodItem.quantity ? foodItem.quantity.toString() : '1',
      price: '0',
      type: 'donate'
    });
  };

  const handleSellSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const quantity = parseFloat(sellForm.quantity);
      const price = parseFloat(sellForm.price);

      if (quantity <= 0) {
        throw new Error('Invalid quantity');
      }

      if (sellForm.type === 'sell' && price <= 0) {
        throw new Error('Price must be greater than 0 for sales');
      }

      const transactionData = {
        sellerId: user._id,
        buyerId: sellModal.buyer?._id || 'any',
        foodItemId: sellModal.foodItem?._id || 'any',
        quantity,
        price,
        type: sellForm.type
      };

      const response = await marketplaceAPI.createTransaction(transactionData);

      if (response.data.success) {
        setSuccess(`${sellForm.type === 'sell' ? 'Sale' : 'Donation'} created successfully!`);
        setSellModal({ show: false, buyer: null, foodItem: null });
        loadData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response.data.message || 'Transaction failed');
      }
    } catch (err) {
      console.error('Transaction error:', err);
      setError(err.response?.data?.message || err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="container">
        <div className="card">
          <div className="card-header">
            <div>
              <h1 className="card-title">
                <i className="fas fa-store"></i>
                Marketplace
              </h1>
              <div className="card-subtitle">
                Connect with buyers to sell or donate your excess food
              </div>
            </div>
          </div>

          {error && (
            <div className="error">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          {success && (
            <div className="success">
              <i className="fas fa-check-circle"></i>
              {success}
            </div>
          )}

          <div style={{ 
            display: 'flex',
            flexWrap: 'wrap',
            borderBottom: '2px solid #e5e7eb',
            marginBottom: '24px',
            gap: '4px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
              display: 'none'
            }
          }}>
            {[
              { id: 'buyers', label: 'Find Buyers', icon: 'fas fa-users' },
              { id: 'transactions', label: 'Transactions', icon: 'fas fa-exchange-alt' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  borderBottom: selectedTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                  color: selectedTab === tab.id ? '#3b82f6' : '#6b7280',
                  fontWeight: selectedTab === tab.id ? 'bold' : 'normal',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  fontSize: '14px',
                  flex: '1 0 auto',
                  minWidth: 'fit-content',
                  textAlign: 'center'
                }}
              >
                <i className={tab.icon} style={{ marginRight: '8px' }}></i>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="loading-spinner" style={{ width: '40px', height: '40px', margin: '0 auto 16px' }}></div>
              <p>Loading marketplace data...</p>
            </div>
          )}

          {selectedTab === 'buyers' && !loading && (
            <div className="responsive-container">
              <div style={{ marginBottom: '20px' }}>
                <h3>Available Buyers</h3>
                <p style={{ color: '#6b7280' }}>
                  Connect with local buyers interested in purchasing or receiving food donations
                </p>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
                padding: '0 10px'
              }}>
                {buyers.map(buyer => (
                  <div key={buyer._id} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    background: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px',
                        fontSize: '20px',
                        color: '#6b7280'
                      }}>
                        <i className="fas fa-user"></i>
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0' }}>{buyer.name}</h4>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                          <i className="fas fa-map-marker-alt" style={{ marginRight: '4px' }}></i>
                          {buyer.location || 'Location not specified'}
                        </div>
                      </div>
                    </div>
                    <div style={{ margin: '16px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#6b7280' }}>Distance:</span>
                        <span>{buyer.distance ? `${buyer.distance} km` : 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#6b7280' }}>Looking for:</span>
                        <span>{buyer.preferences?.join(', ') || 'Any food'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => handleSellClick(buyer, {})}
                        className="btn btn-primary"
                        style={{
                          flex: '1',
                          minWidth: '120px',
                          padding: '8px 12px',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <i className="fas fa-hand-holding-usd"></i>
                        <span>Sell Items</span>
                      </button>
                      <button 
                        onClick={() => handleDonateClick(buyer, {})}
                        className="btn btn-secondary"
                        style={{
                          flex: '1',
                          minWidth: '120px',
                          padding: '8px 12px',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <i className="fas fa-gift"></i>
                        <span>Donate</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'transactions' && (
            <div className="responsive-container" style={{ padding: '20px' }}>
              <h3>Your Transactions</h3>
              <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                View your sales and donation history
              </p>
              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <i className="fas fa-exchange-alt" style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}></i>
                <p>No transactions yet</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {sellModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '500px', maxWidth: '90vw' }}>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#1f2937' }}>
                  {sellForm.type === 'sell' ? 'Sell Food Item' : 'Donate Food Item'}
                </h3>
                <button
                  onClick={() => setSellModal({ show: false, buyer: null, foodItem: null })}
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSellSubmit}>
                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#6b7280' }}>
                    <strong>Buyer:</strong> {sellModal.buyer?.name || 'N/A'}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>
                    <strong>Type:</strong> {sellForm.type === 'sell' ? 'Sale' : 'Donation'}
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    value={sellForm.quantity}
                    onChange={(e) => setSellForm({ ...sellForm, quantity: e.target.value })}
                    className="form-input"
                    min="0.1"
                    step="0.1"
                    required
                  />
                </div>

                {sellForm.type === 'sell' && (
                  <div className="form-group">
                    <label className="form-label">Price ($)</label>
                    <input
                      type="number"
                      value={sellForm.price}
                      onChange={(e) => setSellForm({ ...sellForm, price: e.target.value })}
                      className="form-input"
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setSellModal({ show: false, buyer: null, foodItem: null })}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className={sellForm.type === 'sell' ? 'fas fa-dollar-sign' : 'fas fa-heart'}></i>
                        {sellForm.type === 'sell' ? 'Create Sale' : 'Create Donation'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

document.head.insertAdjacentHTML('beforeend', `
  <style>
    @media (max-width: 768px) {
      .main-content { padding: 12px; }
      .card { border-radius: 8px; margin: 0; width: 100%; }
      .card-header { padding: 16px; }
      .card-title { font-size: 20px; }
      .tab-label { display: none; }
      .btn { padding: 8px 12px; font-size: 14px; }
      .responsive-container { padding: 0 8px; }
      input, select, textarea { font-size: 16px !important; }
    }
    button { min-height: 44px; min-width: 44px; }
    .modal-content { margin: 20px; width: auto; max-width: 100%; }
    @media (max-width: 640px) {
      table { display: block; overflow-x: auto; white-space: nowrap; }
      .card { border-radius: 0; }
      .container { padding: 0; }
    }
  </style>
`);

export default Marketplace;
