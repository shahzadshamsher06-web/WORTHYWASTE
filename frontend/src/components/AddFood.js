import React, { useState, useEffect } from 'react';
import api from '../services/auth'; // Using our new auth service
import { getCurrentUser } from '../services/auth';

const AddFood = ({ user, onFoodAdded }) => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const storageOptions = [
    { value: 'refrigerator', label: 'Refrigerator' },
    { value: 'freezer', label: 'Freezer' },
    { value: 'pantry', label: 'Pantry' },
    { value: 'counter', label: 'Counter' }
  ];

  const categoryOptions = [
    { value: 'fruits', label: 'Fruits' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'meat', label: 'Meat' },
    { value: 'grains', label: 'Grains' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'other', label: 'Other' }
  ];

  const unitOptions = [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'g', label: 'Grams (g)' },
    { value: 'l', label: 'Liters (l)' },
    { value: 'ml', label: 'Milliliters (ml)' },
    { value: 'pieces', label: 'Pieces' },
    { value: 'packets', label: 'Packets' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Food name is required');
      }
      if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
        throw new Error('Please enter a valid quantity');
      }
      if (!formData.purchaseDate) {
        throw new Error('Purchase date is required');
      }
      if (!formData.expiryDate) {
        throw new Error('Expiry date is required');
      }

      // Validate dates
      const purchaseDate = new Date(formData.purchaseDate);
      const expiryDate = new Date(formData.expiryDate);
      
      // Get current user
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      // Create food item data
      const foodData = {
        ...formData,
        userId: currentUser._id,
        quantity: parseFloat(formData.quantity),
        calories: formData.calories ? parseInt(formData.calories) : 0,
        status: 'available'
      };
      
      console.log('Submitting food item:', foodData);
      
      // Call the API
      const response = await api.post('/inventory/add', foodData);
      console.log('Add food response:', response);
      
      if (response.data.success) {
        setSuccess('Food item added successfully!');
        setFormData({
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
        
        // Refresh the food items list
        await loadFoodItems();
        
        // Notify parent component
        if (onFoodAdded) {
          onFoodAdded(response.data.foodItem);
        }
      } else {
        throw new Error(response.data.message || 'Failed to add food item');
      }
    } catch (err) {
      console.error('Add food error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to add food item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Set default dates
  React.useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    if (!formData.purchaseDate) {
      setFormData(prev => ({ ...prev, purchaseDate: today }));
    }
    if (!formData.expiryDate) {
      setFormData(prev => ({ ...prev, expiryDate: nextWeekStr }));
    }
  }, [formData.purchaseDate, formData.expiryDate]);

  const loadFoodItems = async () => {
    try {
      console.log('Starting to load food items...');
      setLoading(true);
      
      // Get current user
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      console.log('Fetching food items for user:', currentUser._id);
      const response = await api.get('/food/items');
      console.log('API Response:', response);
      
      if (!response) {
        throw new Error('No response received from the server');
      }
      
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      if (!response.data) {
        throw new Error('No data in response');
      }
      
      console.log('Response data:', response.data);
      
      if (response.data.success) {
        const items = Array.isArray(response.data.foodItems) ? response.data.foodItems : [];
        console.log('Setting food items:', items);
        setFoodItems(items);
      } else {
        throw new Error(response.data.message || 'Failed to load food items');
      }
    } catch (err) {
      console.error('Error loading food items:', err);
      setError(err.message || 'Failed to load food items');
    } finally {
      setLoading(false);
    }
  };

  // Load food items on component mount and when user changes
  useEffect(() => {
    loadFoodItems();
  }, [user]); // Add user to dependency array to reload if user changes
  
  // Debug log when foodItems changes
  useEffect(() => {
    console.log('Current food items:', foodItems);
  }, [foodItems]);

  return (
    <div className="main-content">
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h2>Food Inventory</h2>
          </div>
          
          {/* Food Items Table */}
          <div style={{ padding: '20px' }}>
            <h3>Current Food Items</h3>
            {loading ? (
              <div>Loading food items... (Check browser console for details)</div>
            ) : error ? (
              <div style={{ color: 'red' }}>
                <p>Error: {error}</p>
                <p>Check browser console for more details.</p>
              </div>
            ) : foodItems.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Quantity</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Storage</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foodItems.map((item) => (
                      <tr key={item._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px' }}>{item.name}</td>
                        <td style={{ padding: '12px' }}>{item.quantity} {item.unit}</td>
                        <td style={{ padding: '12px', textTransform: 'capitalize' }}>{item.storage}</td>
                        <td style={{ padding: '12px' }}>{new Date(item.expiryDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>No food items found. Add some using the form below.</div>
            )}
          </div>
          
          <div className="card-header">
            <div>
              <h1 className="card-title">
                <i className="fas fa-plus-circle"></i>
                Add Food Item
              </h1>
              <div className="card-subtitle">
                Track your food inventory to reduce waste
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

          <form onSubmit={handleSubmit}>
            <div className="grid grid-3">
              <div className="form-group">
                <label className="form-label">Food Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., Apples, Milk, Bread"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-select"
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 1.5"
                    step="0.1"
                    min="0.1"
                    required
                  />
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="form-select"
                    style={{ minWidth: '100px' }}
                  >
                    {unitOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Purchase Date *</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expiry Date *</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Storage Location</label>
                <select
                  name="storage"
                  value={formData.storage}
                  onChange={handleChange}
                  className="form-select"
                >
                  {storageOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Calories (Optional)</label>
                <input
                  type="number"
                  name="calories"
                  value={formData.calories}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., 150"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-2" style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Any additional notes about this food item..."
                  rows="3"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setFormData({
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
                      setError('');
                      setSuccess('');
                    }}
                  >
                    <i className="fas fa-undo"></i>
                    Reset Form
                  </button>
                  
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus"></i>
                        Add Food Item
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div style={{ marginTop: '24px', padding: '16px', background: '#f7fafc', borderRadius: '8px', fontSize: '0.9rem', color: '#4a5568' }}>
            <h4 style={{ marginBottom: '8px', color: '#2d3748' }}>
              <i className="fas fa-lightbulb"></i>
              Tips for better tracking:
            </h4>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
              <li>Be accurate with expiry dates to get better waste prevention alerts</li>
              <li>Include calories to track nutritional value of saved food</li>
              <li>Use notes to remember specific details about the item</li>
              <li>Choose the right storage location for optimal freshness</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFood;
