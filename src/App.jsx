import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthPage from './pages/AuthPage/AuthPage';
import GodsPage from './pages/GodsPage/GodsPage';
import ConversationsPage from './pages/ConversationsPage/ConversationsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/gods" element={<GodsPage />} />
        <Route path="/conversations" element={<ConversationsPage />} />
        <Route path="/conversations/:conversationId" element={<ConversationsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
