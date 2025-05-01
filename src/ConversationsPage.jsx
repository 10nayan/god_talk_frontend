import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaPaperPlane, FaPhone, FaEllipsisV } from 'react-icons/fa';
import './ConversationsPage.css';

const ConversationsPage = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_HOST_URL}/conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setConversations(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/');
      } else {
        setError('Error fetching conversations: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const fetchConversationDetails = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_HOST_URL}/conversations/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCurrentConversation(response.data);
    } catch (error) {
      setError('Error fetching conversation details: ' + (error.response?.data?.detail || error.message));
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_HOST_URL}/conversations/chat`,
        {
          conversation_id: conversationId,
          message: message.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage('');
      fetchConversationDetails(conversationId);
    } catch (error) {
      setError('Error sending message: ' + (error.response?.data?.detail || error.message));
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (conversationId) {
      fetchConversationDetails(conversationId);
    }
  }, [conversationId]);

  if (!conversationId) {
    return (
      <div className="conversations-list">
        <div className="header">
          <h1>My Conversations</h1>
          <button onClick={() => navigate('/gods')}>Back to Gods</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}

        <div className="conversations-grid">
          {conversations.map(conversation => (
            <motion.div
              key={conversation.id}
              className="conversation-card"
              onClick={() => navigate(`/conversations/${conversation.id}`)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3>{conversation.title}</h3>
              <p className="timestamp">
                Last updated: {new Date(conversation.updated_at).toLocaleString()}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-content">
          <div className="left-section">
            <button className="back-button" onClick={() => navigate('/conversations')}>
              <FaArrowLeft />
            </button>
            <div className="god-info">
              <img 
                src={currentConversation?.god?.image_url} 
                alt={currentConversation?.god?.name}
                className="god-avatar"
              />
              <div className="text-info">
                <h2>{currentConversation?.god?.name}</h2>
                <p>King of the Gods • Online</p>
              </div>
            </div>
          </div>
          <div className="right-section">
            <button className="icon-button">
              <FaPhone />
            </button>
            <button className="icon-button">
              <FaEllipsisV />
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="messages-container">
        {currentConversation?.messages?.map((msg, index) => (
          <motion.div
            key={index}
            className={`message ${msg.is_from_user ? 'user-message' : 'god-message'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {!msg.is_from_user && (
              <div className="god-icon">
                <img 
                  src={currentConversation.god.image_url} 
                  alt={currentConversation.god.name} 
                />
              </div>
            )}
            <div className="message-content">
              {!msg.is_from_user && <div className="god-name">{currentConversation.god.name}</div>}
              <div className="message-text">{msg.content}</div>
              <div className="message-time">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="message-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message the Gods..."
        />
        <button type="submit" disabled={!message.trim()}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default ConversationsPage;
