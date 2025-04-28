import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaArrowLeft, FaPaperPlane } from 'react-icons/fa';

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
      <div className="container-fluid bg-light min-vh-100 py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="display-4 text-primary mb-0">My Conversations</h1>
            <button 
              className="btn btn-outline-primary btn-lg"
              onClick={() => navigate('/gods')}
            >
              Back to Gods
            </button>
          </div>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="row g-4">
            {conversations.map(conversation => (
              <motion.div
                key={conversation.id}
                className="col-12 col-md-6 col-lg-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div 
                  className="card h-100 shadow-sm border-0 conversation-card"
                  onClick={() => navigate(`/conversations/${conversation.id}`)}
                  style={{ cursor: 'pointer', borderRadius: '15px' }}
                >
                  <div className="card-body p-4">
                    <h3 className="h4 text-primary mb-3">{conversation.title}</h3>
                    <p className="text-muted mb-0">
                      <small>
                        Last updated: {new Date(conversation.updated_at).toLocaleString()}
                      </small>
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light min-vh-100 p-0">
      <div className="chat-header bg-white shadow-sm py-3 px-4 mb-4">
        <div className="container">
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-link text-primary p-0 me-3"
              onClick={() => navigate('/conversations')}
            >
              <FaArrowLeft size={20} />
            </button>
            <h2 className="h3 mb-0 text-primary">{currentConversation?.title}</h2>
          </div>
        </div>
      </div>

      <div className="container pb-5">
        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            {error}
          </div>
        )}

      <div className="messages-container bg-white shadow-sm rounded-3 p-4 mb-4">
        {currentConversation?.messages?.map((msg, index) => (
          <div
            key={index}
            className={`d-flex ${msg.is_from_user ? 'justify-content-end' : 'justify-content-start'} mb-3`}
          >
            <div className={`chat-message ${msg.is_from_user ? 'user' : 'god'} rounded-3 p-3 ${msg.is_from_user ? 'bg-primary text-white' : 'bg-success-subtle text-dark'}`} style={{maxWidth: '75%'}}>
              <div className="message-text">
                {msg.content}
              </div>
              <div className={`message-time mt-2 ${msg.is_from_user ? 'text-white-50' : 'text-muted'} small`}>
                {new Date(msg.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

        <form onSubmit={sendMessage} className="message-form bg-white shadow-sm rounded-3 p-3">
          <div className="input-group">
            <input
              type="text"
              className="form-control form-control-lg border-0 bg-light"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
            />
            <button 
              type="submit" 
              className="btn btn-primary btn-lg px-4"
              disabled={!message.trim()}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConversationsPage;
