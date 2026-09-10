import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleTab, setRoleTab] = useState<'ADMIN' | 'DOCTOR'>('ADMIN');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, token, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && user) {
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'DOCTOR') navigate('/doctor');
    }
  }, [token, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">H</div>
          <h1 className="login-title">Healix Operations</h1>
          <p className="login-subtitle">Sign in to manage clinical services</p>
        </div>

        <div className="role-tabs">
          <button
            type="button"
            className={`role-tab ${roleTab === 'ADMIN' ? 'active' : ''}`}
            onClick={() => setRoleTab('ADMIN')}
          >
            Administrator
          </button>
          <button
            type="button"
            className={`role-tab ${roleTab === 'DOCTOR' ? 'active' : ''}`}
            onClick={() => setRoleTab('DOCTOR')}
          >
            Doctor Portal
          </button>
        </div>

        {error ? <div className="login-error">{error}</div> : null}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. name@healix.pk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Verifying Credentials...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
