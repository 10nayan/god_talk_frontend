import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage/AuthPage';
import GodsPage from './pages/GodsPage/GodsPage';
import ConversationsPage from './pages/ConversationsPage/ConversationsPage';
import './App.css';

// Import axios and axios instance
import axios from 'axios';
import axiosInstance from './utils/axios';

// Set axios defaults to match our instance
Object.assign(axios.defaults, axiosInstance.defaults);
axios.interceptors.request = axiosInstance.interceptors.request;
axios.interceptors.response = axiosInstance.interceptors.response;

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/gods" element={<GodsPage />} />
      <Route path="/conversations" element={<ConversationsPage />} />
      <Route path="/conversations/:conversationId" element={<ConversationsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App; 