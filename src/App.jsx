import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthPage from './AuthPage';
import GodsPage from './GodsPage';
import ConversationsPage from './ConversationsPage';

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
