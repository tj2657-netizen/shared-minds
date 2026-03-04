import React, { useState } from 'react';
import { loginUser } from '../../services/authService';
import '../styles/Auth.css';

/**
 * Login component for user authentication
 * @param {Function} onLoginSuccess - Callback function after successful login
 */
export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await loginUser(email, password);
      setEmail('');
      setPassword('');
      onLoginSuccess?.(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      const user = await loginUser('demo@example.com', 'demo123456');
      onLoginSuccess?.(user);
    } catch (err) {
      // Create demo account if it doesn't exist
      alert(
        'To use demo, please register first with demo@example.com / demo123456'
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🌌 Parallel Stories</h1>
        <p className="auth-subtitle">
          Explore infinite narrative universes
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-divider">OR</div>

        <button
          onClick={handleDemoLogin}
          className="btn btn-secondary"
          disabled={loading}
        >
          Try Demo Mode
        </button>

        <p className="auth-link">
          Don't have an account?{' '}
          <a href="#register" onClick={(e) => e.preventDefault()}>
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
