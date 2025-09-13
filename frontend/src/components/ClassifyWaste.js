import React, { useState } from 'react';
import { classifyAPI } from '../services/api';

const ClassifyWaste = ({ user }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [classification, setClassification] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setError('');
      setClassification(null);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    
    if (file) {
      // Create a fake event object for handleFileSelect
      const fakeEvent = {
        target: {
          files: [file]
        }
      };
      handleFileSelect(fakeEvent);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleClassify = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('userId', user._id);
      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }

      const response = await classifyAPI.classify(formData);

      if (response.data.success) {
        setClassification(response.data.classification);
      } else {
        throw new Error(response.data.message || 'Classification failed');
      }
    } catch (err) {
      console.error('Classification error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to classify waste. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setNotes('');
    setError('');
    setClassification(null);
    setLoading(false);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'compostable':
        return 'fas fa-seedling';
      case 'recyclable':
        return 'fas fa-recycle';
      case 'non-usable':
        return 'fas fa-trash';
      default:
        return 'fas fa-question-circle';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'compostable':
        return '#10b981';
      case 'recyclable':
        return '#3b82f6';
      case 'non-usable':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="main-content">
      <div className="container">
        <div className="card">
          <div className="card-header">
            <div>
              <h1 className="card-title">
                <i className="fas fa-camera"></i>
                Classify Waste
              </h1>
              <div className="card-subtitle">
                Upload an image to classify your waste and get disposal recommendations
              </div>
            </div>
          </div>

          {error && (
            <div className="error">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <div className="grid grid-2" style={{ gap: '24px' }}>
            {/* Upload Section */}
            <div>
              <div className="form-group">
                <label className="form-label">Upload Waste Image</label>
                <div
                  className="file-upload-area"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  style={{
                    border: '2px dashed #d1d5db',
                    borderRadius: '8px',
                    padding: '32px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                    backgroundColor: '#f9fafb'
                  }}
                  onClick={() => document.getElementById('file-input').click()}
                >
                  {previewUrl ? (
                    <div>
                      <img
                        src={previewUrl}
                        alt="Preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          borderRadius: '8px',
                          marginBottom: '16px'
                        }}
                      />
                      <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                        Click to change image
                      </p>
                    </div>
                  ) : (
                    <div>
                      <i className="fas fa-cloud-upload-alt" style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '16px' }}></i>
                      <p style={{ color: '#374151', marginBottom: '8px' }}>
                        Drop an image here or click to browse
                      </p>
                      <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                        Supports JPG, PNG, GIF up to 5MB
                      </p>
                    </div>
                  )}
                </div>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-textarea"
                  placeholder="Describe the waste item for better classification..."
                  rows="3"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleClassify}
                  className="btn btn-primary"
                  disabled={!selectedFile || loading}
                  style={{ flex: 1 }}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                      Classifying...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-search"></i>
                      Classify Waste
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleReset}
                  className="btn btn-secondary"
                >
                  <i className="fas fa-undo"></i>
                  Reset
                </button>
              </div>
            </div>

            {/* Results Section */}
            <div>
              {classification ? (
                <div>
                  <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>
                    <i className="fas fa-chart-line"></i>
                    Classification Results
                  </h3>
                  
                  <div className="card" style={{ border: `2px solid ${getCategoryColor(classification.category)}` }}>
                    <div style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                        <i 
                          className={getCategoryIcon(classification.category)}
                          style={{ 
                            fontSize: '32px', 
                            color: getCategoryColor(classification.category),
                            marginRight: '12px'
                          }}
                        ></i>
                        <div>
                          <h4 style={{ margin: 0, color: '#1f2937', textTransform: 'capitalize' }}>
                            {classification.category}
                          </h4>
                          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                            Confidence: {Math.round(classification.confidence * 100)}%
                          </p>
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <h5 style={{ marginBottom: '8px', color: '#374151' }}>
                          <i className="fas fa-lightbulb"></i>
                          Recommended Action:
                        </h5>
                        <p style={{ 
                          color: '#4b5563', 
                          lineHeight: '1.6',
                          padding: '12px',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '6px',
                          margin: 0
                        }}>
                          {classification.suggestedAction}
                        </p>
                      </div>

                      {classification.environmentalImpact && (
                        <div>
                          <h5 style={{ marginBottom: '8px', color: '#374151' }}>
                            <i className="fas fa-leaf"></i>
                            Environmental Impact:
                          </h5>
                          <div className="grid grid-2" style={{ gap: '8px' }}>
                            <div style={{ 
                              padding: '8px 12px', 
                              backgroundColor: '#ecfdf5', 
                              borderRadius: '6px',
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#059669' }}>
                                {classification.environmentalImpact.co2Saved}kg
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#065f46' }}>CO₂ Saved</div>
                            </div>
                            <div style={{ 
                              padding: '8px 12px', 
                              backgroundColor: '#eff6ff', 
                              borderRadius: '6px',
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2563eb' }}>
                                {classification.environmentalImpact.treesEquivalent}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: '#1e40af' }}>Trees Equivalent</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  color: '#9ca3af',
                  border: '2px dashed #e5e7eb',
                  borderRadius: '8px'
                }}>
                  <i className="fas fa-search" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                  <p style={{ margin: 0, fontSize: '1.1rem' }}>
                    Upload an image to see classification results
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div style={{ 
            marginTop: '32px', 
            padding: '20px', 
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
            borderRadius: '12px',
            border: '1px solid #bae6fd'
          }}>
            <h4 style={{ marginBottom: '16px', color: '#0c4a6e', display: 'flex', alignItems: 'center' }}>
              <i className="fas fa-info-circle" style={{ marginRight: '8px' }}></i>
              How Waste Classification Works
            </h4>
            <div className="grid grid-3" style={{ gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <i className="fas fa-seedling" style={{ color: '#10b981', marginRight: '8px' }}></i>
                  <strong style={{ color: '#065f46' }}>Compostable</strong>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#047857', margin: 0, lineHeight: '1.5' }}>
                  Organic waste that can be composted to create nutrient-rich soil
                </p>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <i className="fas fa-recycle" style={{ color: '#3b82f6', marginRight: '8px' }}></i>
                  <strong style={{ color: '#1e40af' }}>Recyclable</strong>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#1d4ed8', margin: 0, lineHeight: '1.5' }}>
                  Materials that can be processed and reused to make new products
                </p>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <i className="fas fa-trash" style={{ color: '#ef4444', marginRight: '8px' }}></i>
                  <strong style={{ color: '#dc2626' }}>Non-usable</strong>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#b91c1c', margin: 0, lineHeight: '1.5' }}>
                  Waste that cannot be recycled or composted and needs proper disposal
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassifyWaste;
