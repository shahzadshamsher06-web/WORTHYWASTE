import React from 'react';

const Profile = ({ user }) => {
  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <div className="profile-details">
        <p><strong>Name:</strong> {user?.name || 'Not provided'}</p>
        <p><strong>Email:</strong> {user?.email || 'Not provided'}</p>
        <p><strong>Phone:</strong> {user?.phone || 'Not provided'}</p>
        <p><strong>Green Coins:</strong> {user?.greenCoins || 0}</p>
      </div>
    </div>
  );
};

export default Profile;
