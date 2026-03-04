import React, { useState } from 'react';
import { logoutUser } from '../services/authService';
import './Auth.css';

export default function UserProfile({ user, onLogout }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    onLogout?.();
  };

  if (!user) return null;

  return (
    <div className="user-profile">
      <button
        className="profile-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <img
          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}`}
          alt={user.displayName}
          className="avatar"
        />
        <span>{user.displayName}</span>
      </button>

      {showDropdown && (
        <div className="profile-dropdown">
          <h4>{user.displayName}</h4>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-value">{user.reputation || 0}</span>
              <span className="stat-label">Reputation</span>
            </div>
            <div className="stat">
              <span className="stat-value">{user.contributions || 0}</span>
              <span className="stat-label">Contributions</span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-danger btn-small">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
