import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AuthPage.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const formDataObj = new FormData();
        formDataObj.append('username', formData.username);
        formDataObj.append('password', formData.password);

        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_HOST_URL}/auth/token`,
          formDataObj,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );

        localStorage.setItem('token', response.data.access_token);
        navigate('/gods');
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_HOST_URL}/auth/register`,
          formData
        );
        setIsLogin(true);
        setError('Registration successful! Please login.');
      }
    } catch (error) {
      setError(error.response?.data?.detail || 'An error occurred');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-body">
          <h1 className="auth-header">{isLogin ? 'Welcome Back!' : 'Create Account'}</h1>

          {error && (
            <div className={`auth-message ${error.includes('successful') ? 'auth-success' : 'auth-error'}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="d-flex flex-column">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="auth-input"
            />

            {!isLogin && (
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="auth-input"
              />
            )}

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="auth-input"
            />

            <button type="submit" className="auth-button">
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>

          <p className="auth-toggle-text">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              className="auth-toggle-button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;