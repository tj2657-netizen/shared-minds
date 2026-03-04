import React, { useState } from 'react';
import { logoutUser } from '../../services/authService';
import '../styles/Auth.css';

/**
 * User profile component - displays user info and logout
 * @param {Object} user - User object with profile data
 * @param {Function} onLogout - Callback after logout
 */
export default function UserProfile({ user, onLogout }) {
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    onLogout?.();
  };

  if (!user) return null;

  return (
    <div className="user-profile">
      <button
        className="profile-button"
        onClick={() => setShowProfile(!showProfile)}
        title={user.displayName || user.email}
      >
        <img
          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=random`}
          alt={user.displayName}
          className="avatar"
        />
        <span className="user-name">{user.displayName || 'User'}</span>
      </button>

      {showProfile && (
        <div className="profile-dropdown">
          <div className="profile-info">
            <h3>{user.displayName || 'Anonymous'}</h3>
            <p>{user.email}</p>
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
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-danger btn-small"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
