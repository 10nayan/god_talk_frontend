import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaPaperPlane, FaPhone, FaEllipsisV } from 'react-icons/fa';
import './ConversationsPage.css';

const defaultGodImage = 'https://billmuehlenberg.com/wp-content/uploads/2023/04/2nd-coming-2.webp';

const ConversationsPage = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isGodTyping, setIsGodTyping] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
  }, [navigate]);

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
      if (!token) {
        navigate('/');
        return;
      }

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
      if (error.response?.status === 401) {
        navigate('/');
      } else {
        setError('Error fetching conversation details: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    // Optimistically add the user's message
    const optimisticMsg = {
      content: message.trim(),
      is_from_user: true,
      created_at: new Date().toISOString(),
    };
    setCurrentConversation(prev => ({
      ...prev,
      messages: [...(prev?.messages || []), optimisticMsg],
    }));
    setMessage('');
    setIsSending(true);
    setIsGodTyping(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_HOST_URL}/conversations/chat`,
        {
          conversation_id: conversationId,
          message: optimisticMsg.content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // After god's response, fetch the updated conversation (or just append god's message)
      await fetchConversationDetails(conversationId);
    } catch (error) {
      setError('Error sending message: ' + (error.response?.data?.detail || error.message));
      // Optionally: remove the optimistic message or mark it as failed
    } finally {
      setIsSending(false);
      setIsGodTyping(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchConversations();
        if (conversationId) {
          await fetchConversationDetails(conversationId);
        }
      } catch (error) {
        setError('Error loading data: ' + (error.response?.data?.detail || error.message));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [conversationId]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading conversation...</p>
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="conversations-list">
        <div className="header">
          <h1>My Conversations</h1>
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
        <div className="sticky-bottom-bar">
          <button className="bottom-bar-btn" onClick={() => navigate('/gods')}>
            Back to Gods
          </button>
          <button
            className="bottom-bar-btn logout"
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/');
            }}
          >
            Logout
          </button>
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
            <div className="god-conversation-info">
              <img 
                src={currentConversation?.god?.image_url || defaultGodImage} 
                alt={currentConversation?.god?.name}
                className="god-avatar"
              />
              <div className="name-status">
                <h2>{currentConversation?.god?.name}</h2>
                <p>Online</p>
              </div>
            </div>
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
                  src={currentConversation.god.image_url || defaultGodImage} 
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
        {isGodTyping && (
          <div className="message god-message god-typing-indicator">
            <div className="god-icon">
              <img 
                src={currentConversation?.god?.image_url || defaultGodImage} 
                alt={currentConversation?.god?.name} 
              />
            </div>
            <div className="message-content">
              <div className="god-name">{currentConversation?.god?.name}</div>
              <div className="message-text typing">is typing...</div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="message-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message the Gods..."
          disabled={isSending}
        />
        <button type="submit" disabled={!message.trim() || isSending}>
          {isSending ? (
            <div className="small-loader"></div>
          ) : (
            <FaPaperPlane />
          )}
        </button>
      </form>
    </div>
  );
};

export default ConversationsPage;
