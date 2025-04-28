import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

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
        // Login
        const formDataObj = new FormData();
        formDataObj.append('username', formData.username);
        formDataObj.append('password', formData.password);

        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_HOST_URL}/auth/token`,
          formDataObj,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        // Store the token
        localStorage.setItem('token', response.data.access_token);
        navigate('/gods');
      } else {
        // Register
        await axios.post(
          `${import.meta.env.VITE_BACKEND_HOST_URL}/auth/register`,
          formData
        );
        // Switch to login after successful registration
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
    <div className="d-flex align-items-center justify-content-center vh-100 w-100">
      <div className="card shadow-lg" style={{ width: '360px' }}>
        <div className="card-body p-4">
          <h1 className="text-center mb-4 text-primary fw-bold">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h1>
          
          {error && (
            <div className={`alert ${error.includes('successful') ? 'alert-success' : 'alert-danger'} mb-4`}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            <div className="form-floating">
              <input
                type="text"
                className="form-control"
                id="username"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <label htmlFor="username">Username</label>
            </div>

            {!isLogin && (
              <div className="form-floating">
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="email">Email</label>
              </div>
            )}

            <div className="form-floating">
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <label htmlFor="password">Password</label>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-100 mt-3">
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>

          <p className="text-center mt-4 mb-0">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              className="btn btn-link p-0 text-primary"
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
