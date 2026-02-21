import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../api';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Initialize default user
  useState(() => {
    fetch('/api/init', { method: 'POST' }).catch(() => {});
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data));
        navigate('/stock');
      } else {
        setError(result.message);
      }
    } catch {
      setError('Login failed. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left branding panel */}
      <div className="login-brand-panel">
        <div className="login-brand-logo">SM</div>
        <h1 className="login-brand-title">
          Stock <span>Management</span> System
        </h1>
        <p className="login-brand-subtitle">
          A complete inventory and billing solution to manage your products, track stock levels, and generate professional invoices.
        </p>
        <div className="login-features">
          <div className="login-feature">
            <div className="login-feature-icon">📦</div>
            <div className="login-feature-text">
              <span className="login-feature-title">Inventory Tracking</span>
              <span className="login-feature-desc">Real-time stock levels with low-stock alerts</span>
            </div>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">🧾</div>
            <div className="login-feature-text">
              <span className="login-feature-title">Billing & Invoicing</span>
              <span className="login-feature-desc">Generate professional invoices instantly</span>
            </div>
          </div>
          <div className="login-feature">
            <div className="login-feature-icon">📊</div>
            <div className="login-feature-text">
              <span className="login-feature-title">Business Analytics</span>
              <span className="login-feature-desc">Revenue tracking and inventory insights</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-form-panel">
        <div className="login-form-wrapper">
          {/* Mobile-only logo */}
          <div className="login-mobile-logo">
            <div className="login-mobile-logo-icon">SM</div>
            <h3>Stock Management</h3>
            <p>Inventory & Billing System</p>
          </div>

          <div className="login-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="login-error">
              <span className="login-error-icon">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="username">Username</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">👤</span>
                <input
                  type="text"
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>
            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">🔒</span>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="login-credentials-hint">
            <p>Default: <code>admin</code> / <code>admin123</code></p>
          </div>

          <div className="login-footer">
            Stock Management System &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
}
