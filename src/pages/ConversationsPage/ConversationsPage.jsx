import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaPaperPlane, FaPhone, FaEllipsisV } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
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
  const [questions, setQuestions] = useState([]);
  const [isGuest, setIsGuest] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (conversationId) {
          await fetchConversationDetails(conversationId);
        } else {
          const token = localStorage.getItem('token');
          if (token) {
            await fetchConversations();
          }
        }
      } catch (error) {
        if (error.response?.status === 401) {
          // Only redirect to login if it's not a guest conversation
          if (!isGuest) {
            navigate('/');
          }
        }
        setError('Error loading data: ' + (error.response?.data?.detail || error.message));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [conversationId]);

  const fetchConversations = async () => {
    try {
      const response = await axiosInstance.get('/conversations');
      setConversations(response.data);
    } catch (error) {
      setError('Error fetching conversations: ' + (error.response?.data?.detail || error.message));
    }
  };

  const fetchConversationDetails = async (id) => {
    try {
      const response = await axiosInstance.get(`/conversations/${id}`);
      setCurrentConversation(response.data);
      setIsGuest(response.data.is_guest || false);
      setMessageCount(response.data.messages?.length || 0);
    } catch (error) {
      if (error.response?.status === 401) {
        // Only redirect to login if it's not a guest conversation
        if (!isGuest) {
          navigate('/');
        }
      }
      setError('Error fetching conversation details: ' + (error.response?.data?.detail || error.message));
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    // Check message limit for guest users
    if (isGuest && messageCount >= 5) {
      setError('Guest users are limited to 5 messages. Please log in to continue chatting.');
      return;
    }

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
    setMessageCount(prev => prev + 1);

    try {
      const response = await axiosInstance.post('/conversations/chat', {
        conversation_id: conversationId,
        message: optimisticMsg.content,
      });
      // After god's response, fetch the updated conversation
      await fetchConversationDetails(conversationId);
    } catch (error) {
      if (error.response?.status === 401) {
        // Only redirect to login if it's not a guest conversation
        if (!isGuest) {
          navigate('/');
        }
      }
      setError('Error sending message: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsSending(false);
      setIsGodTyping(false);
    }
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      if (currentConversation?.god?.id) {
        try {
          const response = await axiosInstance.get(`/questions/god/${currentConversation.god.id}`);
          const topTen = response.data.slice(0, 10);
  
          // Shuffle and pick any 3
          const shuffled = [...topTen].sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 3);
  
          setQuestions(selected);
        } catch (err) {
          // Silently fail for questions - they're not critical
          console.log('Could not fetch questions:', err);
          setQuestions([]);
        }
      } else {
        setQuestions([]);
      }
    };
    fetchQuestions();
  }, [currentConversation?.god?.id]);

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

        {localStorage.getItem('token') ? (
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
                  Last updated: {new Date(conversation.updated_at).toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="guest-message">
            <p>Please log in to view your conversations.</p>
            <button className="login-btn" onClick={() => navigate('/')}>
              Login
            </button>
          </div>
        )}

        <div className="sticky-bottom-bar">
          <button className="bottom-bar-btn" onClick={() => navigate('/gods')}>
            Back to Gods
          </button>
          {localStorage.getItem('token') ? (
            <button
              className="bottom-bar-btn logout"
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/');
              }}
            >
              Logout
            </button>
          ) : (
            <button
              className="bottom-bar-btn"
              onClick={() => navigate('/')}
            >
              Login
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-content">
          <div className="left-section">
            <button className="back-button" onClick={() => navigate('/gods')}>
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
      {isGuest && messageCount >= 4 && (
        <div className="guest-limit-warning">
          You have {5 - messageCount} messages remaining. Please log in to continue chatting.
        </div>
      )}

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
              <div className="message-text">
                {msg.is_from_user ? (
                  msg.content
                ) : (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
              <div className="message-time">
                {new Date(msg.created_at).toLocaleString('en-US', { 
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                  month: 'short',
                  day: 'numeric'
                })}
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

      {questions.length > 0 && currentConversation?.messages?.length === 0 && (
        <>
          <div style={{ height: '180px' }} />
          <div className="question-suggestions-container">
            <div className="question-suggestions">
              {questions.map((q) => (
                <button
                  type="button"
                  key={q.id}
                  className="question-suggestion-btn"
                  onClick={() => setMessage(q.question)}
                >
                  {q.question}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <form onSubmit={sendMessage} className="message-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isGuest && messageCount >= 5 ? "Please log in to continue chatting..." : "Message the Gods..."}
          disabled={isSending || (isGuest && messageCount >= 5)}
        />
        <button type="submit" disabled={!message.trim() || isSending || (isGuest && messageCount >= 5)}>
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
