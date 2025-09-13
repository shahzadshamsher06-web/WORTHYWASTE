import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { analyticsAPI } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = ({ user }) => {
  const [userSummary, setUserSummary] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const [summaryRes, leaderboardRes, globalRes, trendsRes, achievementsRes] = await Promise.all([
        analyticsAPI.getUserSummary(user._id),
        analyticsAPI.getLeaderboard(),
        analyticsAPI.getGlobalStats(),
        analyticsAPI.getMonthlyTrends(),
        analyticsAPI.getAchievements(user._id)
      ]);

      if (summaryRes.data.success) setUserSummary(summaryRes.data.summary);
      if (leaderboardRes.data.success) setLeaderboard(leaderboardRes.data.leaderboard);
      if (globalRes.data.success) setGlobalStats(globalRes.data.stats);
      if (trendsRes.data.success) setMonthlyTrends(trendsRes.data.trends);
      if (achievementsRes.data.success) setAchievements(achievementsRes.data.achievements);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Chart configurations
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const monthlyTrendsData = {
    labels: monthlyTrends.map(trend => trend.month),
    datasets: [
      {
        label: 'Food Saved (kg)',
        data: monthlyTrends.map(trend => trend.foodSaved),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.1,
      },
      {
        label: 'CO₂ Saved (kg)',
        data: monthlyTrends.map(trend => trend.co2Saved),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const impactData = userSummary ? {
    labels: ['CO₂ Saved', 'Water Saved', 'Energy Saved'],
    datasets: [
      {
        data: [
          userSummary.environmentalImpact.co2Saved,
          userSummary.environmentalImpact.waterSaved,
          userSummary.environmentalImpact.energySaved,
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(59, 130, 246)',
          'rgb(245, 158, 11)',
        ],
        borderWidth: 2,
      },
    ],
  } : null;

  const categoryData = userSummary ? {
    labels: Object.keys(userSummary.categoryBreakdown),
    datasets: [
      {
        data: Object.values(userSummary.categoryBreakdown),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderWidth: 2,
      },
    ],
  } : null;

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="main-content">
      <div className="container">
        <div className="card">
          <div className="card-header">
            <div>
              <h1 className="card-title">
                <i className="fas fa-chart-line"></i>
                Analytics & Leaderboard
              </h1>
              <div className="card-subtitle">
                Track your impact and see how you compare with others
              </div>
            </div>
          </div>

          {error && (
            <div className="error">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          {/* Tab Navigation */}
          <div style={{ 
            display: 'flex', 
            borderBottom: '2px solid #e5e7eb', 
            marginBottom: '24px',
            gap: '0'
          }}>
            {[
              { id: 'overview', label: 'Overview', icon: 'fas fa-tachometer-alt' },
              { id: 'leaderboard', label: 'Leaderboard', icon: 'fas fa-trophy' },
              { id: 'trends', label: 'Trends', icon: 'fas fa-chart-line' },
              { id: 'achievements', label: 'Achievements', icon: 'fas fa-medal' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  borderBottom: selectedTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                  color: selectedTab === tab.id ? '#3b82f6' : '#6b7280',
                  fontWeight: selectedTab === tab.id ? 'bold' : 'normal',
                  transition: 'all 0.2s'
                }}
              >
                <i className={tab.icon} style={{ marginRight: '8px' }}></i>
                {tab.label}
              </button>
            ))}
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="loading-spinner" style={{ width: '40px', height: '40px', margin: '0 auto 16px' }}></div>
              <p>Loading analytics data...</p>
            </div>
          )}

          {/* Overview Tab */}
          {selectedTab === 'overview' && !loading && userSummary && (
            <div>
              {/* Personal Stats */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '16px' }}>Your Impact Summary</h3>
                <div className="grid grid-4" style={{ gap: '16px' }}>
                  <div className="card" style={{ padding: '20px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🥗</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                      {userSummary.totalFoodSaved}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Food Items Saved</div>
                  </div>
                  <div className="card" style={{ padding: '20px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💰</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                      ${userSummary.totalEarned.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Total Earned</div>
                  </div>
                  <div className="card" style={{ padding: '20px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🪙</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                      {userSummary.greenCoins}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Green Coins</div>
                  </div>
                  <div className="card" style={{ padding: '20px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🌱</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                      {userSummary.environmentalImpact.co2Saved.toFixed(1)}kg
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>CO₂ Saved</div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-2" style={{ gap: '24px', marginBottom: '32px' }}>
                <div className="card" style={{ padding: '20px' }}>
                  <h4 style={{ marginBottom: '16px' }}>Environmental Impact</h4>
                  {impactData && (
                    <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Doughnut data={impactData} options={{ maintainAspectRatio: false }} />
                    </div>
                  )}
                </div>
                <div className="card" style={{ padding: '20px' }}>
                  <h4 style={{ marginBottom: '16px' }}>Food Categories Saved</h4>
                  {categoryData && (
                    <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Doughnut data={categoryData} options={{ maintainAspectRatio: false }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Global Stats */}
              {globalStats && (
                <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid #bae6fd' }}>
                  <h4 style={{ marginBottom: '16px', color: '#0c4a6e' }}>
                    <i className="fas fa-globe"></i>
                    Global Platform Impact
                  </h4>
                  <div className="grid grid-4" style={{ gap: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0369a1' }}>
                        {formatNumber(globalStats.totalUsers)}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#075985' }}>Active Users</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0369a1' }}>
                        {formatNumber(globalStats.totalFoodSaved)}kg
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#075985' }}>Food Saved</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0369a1' }}>
                        {formatNumber(globalStats.totalCO2Saved)}kg
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#075985' }}>CO₂ Prevented</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0369a1' }}>
                        {formatNumber(globalStats.totalTransactions)}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#075985' }}>Transactions</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Leaderboard Tab */}
          {selectedTab === 'leaderboard' && !loading && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3>Top Food Waste Warriors</h3>
                <p style={{ color: '#6b7280' }}>
                  See how you rank among other users making a difference
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {leaderboard.map((entry, index) => (
                  <div 
                    key={entry.userId} 
                    className="card" 
                    style={{ 
                      padding: '20px', 
                      border: entry.userId === user._id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                      background: entry.userId === user._id ? '#f0f9ff' : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ 
                          fontSize: '1.5rem', 
                          fontWeight: 'bold', 
                          marginRight: '16px',
                          minWidth: '60px',
                          textAlign: 'center'
                        }}>
                          {getRankIcon(index + 1)}
                        </div>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${entry.color || '#3b82f6'}, ${entry.color || '#1d4ed8'})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          marginRight: '16px'
                        }}>
                          {entry.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', color: '#1f2937' }}>
                            {entry.name}
                            {entry.userId === user._id && (
                              <span style={{ 
                                marginLeft: '8px', 
                                fontSize: '0.8rem', 
                                color: '#3b82f6',
                                fontWeight: 'normal'
                              }}>
                                (You)
                              </span>
                            )}
                          </h4>
                          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                            Level {entry.level} • {entry.greenCoins} Green Coins
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="grid grid-3" style={{ gap: '16px' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981' }}>
                              {entry.foodSaved}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Food Saved</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#3b82f6' }}>
                              {entry.co2Saved.toFixed(1)}kg
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>CO₂ Saved</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f59e0b' }}>
                              ${entry.totalEarned.toFixed(0)}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Earned</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trends Tab */}
          {selectedTab === 'trends' && !loading && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3>Monthly Trends</h3>
                <p style={{ color: '#6b7280' }}>
                  Track your progress over time and see your impact growing
                </p>
              </div>

              <div className="card" style={{ padding: '20px' }}>
                <div style={{ height: '400px' }}>
                  <Line data={monthlyTrendsData} options={{ ...chartOptions, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {selectedTab === 'achievements' && !loading && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h3>Your Achievements</h3>
                <p style={{ color: '#6b7280' }}>
                  Unlock badges and milestones as you make a positive impact
                </p>
              </div>

              <div className="grid grid-3" style={{ gap: '20px' }}>
                {achievements.map(achievement => (
                  <div 
                    key={achievement.id} 
                    className="card" 
                    style={{ 
                      padding: '20px', 
                      textAlign: 'center',
                      border: achievement.unlocked ? '2px solid #10b981' : '1px solid #e5e7eb',
                      opacity: achievement.unlocked ? 1 : 0.6
                    }}
                  >
                    <div style={{ 
                      fontSize: '3rem', 
                      marginBottom: '12px',
                      filter: achievement.unlocked ? 'none' : 'grayscale(100%)'
                    }}>
                      {achievement.icon}
                    </div>
                    <h4 style={{ 
                      margin: '0 0 8px 0', 
                      color: achievement.unlocked ? '#1f2937' : '#9ca3af' 
                    }}>
                      {achievement.title}
                    </h4>
                    <p style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '0.9rem', 
                      color: '#6b7280',
                      lineHeight: '1.4'
                    }}>
                      {achievement.description}
                    </p>
                    {achievement.unlocked ? (
                      <div style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        backgroundColor: '#ecfdf5',
                        color: '#065f46',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}>
                        <i className="fas fa-check"></i>
                        Unlocked
                      </div>
                    ) : (
                      <div style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280',
                        borderRadius: '12px',
                        fontSize: '0.8rem'
                      }}>
                        {achievement.progress}/{achievement.target}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
