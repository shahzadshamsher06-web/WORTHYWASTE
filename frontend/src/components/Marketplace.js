import React, { useState, useEffect, useCallback } from 'react';
import { marketplaceAPI, inventoryAPI } from '../services/api';

const Marketplace = ({ user }) => {
  const [buyers, setBuyers] = useState([]);
  const [inventory, setInventory] = useState([]);
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
  const [addFoodModal, setAddFoodModal] = useState({ show: false });
  const [addFoodForm, setAddFoodForm] = useState({
    name: '',
    quantity: '',
    unit: 'kg',
    purchaseDate: '',
    expiryDate: '',
    storage: 'pantry',
    calories: '',
    category: 'other',
    notes: ''
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const [buyersRes, inventoryRes] = await Promise.all([
        marketplaceAPI.getBuyers(),
        inventoryAPI.list(user?._id || '')
      ]);

      console.log('Inventory API Response:', inventoryRes?.data);
      
      if (buyersRes?.data?.success) setBuyers(buyersRes.data.buyers);
      if (inventoryRes?.data?.success) {
        console.log('Raw inventory data:', inventoryRes.data.inventory);
        setInventory(inventoryRes.data.inventory);
      }
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
      quantity: foodItem.quantity.toString(),
      price: (foodItem.quantity * 2).toFixed(2), // Default price: $2 per unit
      type: 'sell'
    });
  };

  const handleDonateClick = (buyer, foodItem) => {
    setSellModal({ show: true, buyer, foodItem });
    setSellForm({
      quantity: foodItem.quantity.toString(),
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

      if (quantity <= 0 || quantity > sellModal.foodItem.quantity) {
        throw new Error('Invalid quantity');
      }

      if (sellForm.type === 'sell' && price <= 0) {
        throw new Error('Price must be greater than 0 for sales');
      }

      const transactionData = {
        sellerId: user._id,
        buyerId: sellModal.buyer._id,
        foodItemId: sellModal.foodItem._id,
        quantity,
        price,
        type: sellForm.type
      };

      const response = await marketplaceAPI.createTransaction(transactionData);

      if (response.data.success) {
        setSuccess(`${sellForm.type === 'sell' ? 'Sale' : 'Donation'} created successfully!`);
        setSellModal({ show: false, buyer: null, foodItem: null });
        loadData(); // Refresh data
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

  const handleAddFoodChange = (e) => {
    setAddFoodForm({
      ...addFoodForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAddFoodSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const foodData = {
        userId: user._id,
        name: addFoodForm.name.trim(),
        quantity: parseFloat(addFoodForm.quantity),
        unit: addFoodForm.unit,
        purchaseDate: addFoodForm.purchaseDate || new Date().toISOString().split('T')[0],
        expiryDate: addFoodForm.expiryDate,
        storage: addFoodForm.storage,
        calories: addFoodForm.calories ? parseInt(addFoodForm.calories) : 0,
        category: addFoodForm.category,
        notes: addFoodForm.notes.trim()
      };

      console.log('Adding food item:', foodData);
      const response = await inventoryAPI.add(foodData);
      console.log('Add food response:', response.data);

      if (response.data.success) {
        setSuccess(`${addFoodForm.name} added to inventory successfully!`);
        setAddFoodModal({ show: false });
        
        // Reset form
        setAddFoodForm({
          name: '',
          quantity: '',
          unit: 'kg',
          purchaseDate: '',
          expiryDate: '',
          storage: 'pantry',
          calories: '',
          category: 'other',
          notes: ''
        });
        
        // Refresh inventory to show new item immediately
        await loadData();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response.data.message || 'Failed to add food item');
      }
    } catch (err) {
      console.error('Add food error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to add food item');
    } finally {
      setLoading(false);
    }
  };

  // Status color and icon functions removed as they were unused

  const availableInventory = (inventory || []).filter(item => 
    item.status === 'fresh' || item.status === 'expiring_soon'
  );

  console.log('All inventory items:', inventory);
  console.log('Filtered available inventory:', availableInventory);
  console.log('Available inventory count:', availableInventory.length);

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

          {/* Tab Navigation */}
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
              { id: 'inventory', label: 'My Inventory', icon: 'fas fa-boxes' },
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

          {/* Buyers Tab */}
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

          {/* Inventory Tab */}
          {selectedTab === 'inventory' && !loading && (
            <div className="responsive-container" style={{ overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3>My Food Inventory</h3>
                  <p style={{ color: '#6b7280', margin: '4px 0 0' }}>
                    Manage your available food items for sale or donation
                  </p>
                </div>
                <button 
                  onClick={() => setAddFoodModal({ show: true })}
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                    padding: '8px 16px',
                    fontSize: '14px'
                  }}
                >
                  <i className="fas fa-plus"></i>
                  <span>Add Food Item</span>
                </button>
              </div>
              
              <div style={{ minWidth: '100%', width: 'max-content' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>Item</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>Quantity</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>Status</th>
                      <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600', color: '#374151' }}>Expires</th>
                      <th style={{ textAlign: 'right', padding: '12px', fontWeight: '600', color: '#374151' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableInventory.map(item => (
                      <tr key={item._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '8px',
                              background: '#f3f4f6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#6b7280',
                              flexShrink: 0
                            }}>
                              <i className="fas fa-utensils"></i>
                            </div>
                            <div>
                              <div style={{ fontWeight: '500' }}>{item.name}</div>
                              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                {item.category}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                          {item.quantity} {item.unit}
                        </td>
                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: item.status === 'fresh' ? '#d1fae5' : 
                                       item.status === 'expiring_soon' ? '#fef3c7' : '#e5e7eb',
                            color: item.status === 'fresh' ? '#065f46' : 
                                  item.status === 'expiring_soon' ? '#92400e' : '#4b5563',
                            textTransform: 'capitalize'
                          }}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                          {new Date(item.expiryDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => handleSellClick({ _id: 'any' }, item)}
                              className="btn btn-sm btn-primary"
                              style={{
                                padding: '4px 12px',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <i className="fas fa-hand-holding-usd" style={{ fontSize: '12px' }}></i>
                              <span>Sell</span>
                            </button>
                            <button 
                              onClick={() => handleDonateClick({ _id: 'any' }, item)}
                              className="btn btn-sm btn-secondary"
                              style={{
                                padding: '4px 12px',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <i className="fas fa-gift" style={{ fontSize: '12px' }}></i>
                              <span>Donate</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {availableInventory.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                          <i className="fas fa-inbox" style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}></i>
                          <div>No food items available for sale or donation</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Food Modal */}
      {addFoodModal.show && (
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
                  Add Food Item
                </h3>
                <button
                  onClick={() => setAddFoodModal({ show: false })}
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAddFoodSubmit}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    value={addFoodForm.name}
                    onChange={handleAddFoodChange}
                    name="name"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    value={addFoodForm.quantity}
                    onChange={handleAddFoodChange}
                    name="quantity"
                    className="form-input"
                    min="0.1"
                    step="0.1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select
                    value={addFoodForm.unit}
                    onChange={handleAddFoodChange}
                    name="unit"
                    className="form-input"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="l">l</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Purchase Date</label>
                  <input
                    type="date"
                    value={addFoodForm.purchaseDate}
                    onChange={handleAddFoodChange}
                    name="purchaseDate"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="date"
                    value={addFoodForm.expiryDate}
                    onChange={handleAddFoodChange}
                    name="expiryDate"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Storage</label>
                  <select
                    value={addFoodForm.storage}
                    onChange={handleAddFoodChange}
                    name="storage"
                    className="form-input"
                  >
                    <option value="pantry">Pantry</option>
                    <option value="fridge">Fridge</option>
                    <option value="freezer">Freezer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Calories</label>
                  <input
                    type="number"
                    value={addFoodForm.calories}
                    onChange={handleAddFoodChange}
                    name="calories"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={addFoodForm.category}
                    onChange={handleAddFoodChange}
                    name="category"
                    className="form-input"
                  >
                    <option value="other">Other</option>
                    <option value="meat">Meat</option>
                    <option value="dairy">Dairy</option>
                    <option value="fruits">Fruits</option>
                    <option value="vegetables">Vegetables</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    value={addFoodForm.notes}
                    onChange={handleAddFoodChange}
                    name="notes"
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setAddFoodModal({ show: false })}
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
    <i className="fas fa-plus"></i>
    Add Food Item
  </>
)}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sell/Donate Modal */}
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
                    <strong>Item:</strong> {sellModal.foodItem?.name}
                  </p>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#6b7280' }}>
                    <strong>Buyer:</strong> {sellModal.buyer?.name}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>
                    <strong>Available:</strong> {sellModal.foodItem?.quantity} {sellModal.foodItem?.unit}
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    value={sellForm.quantity}
                    onChange={(e) => setSellForm({ ...sellForm, quantity: e.target.value })}
                    className="form-input"
                    max={sellModal.foodItem?.quantity}
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