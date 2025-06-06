import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaPaperPlane, FaPhone, FaEllipsisV, FaBars, FaTimes, FaCircle, FaRegLightbulb, FaHome, FaComments, FaUser } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Feedback from '../../components/Feedback/Feedback';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [god, setGod] = useState(null);
  const [showQuestionSuggestions, setShowQuestionSuggestions] = useState(false);
  const [latestGodMessageId, setLatestGodMessageId] = useState(null);
  const messagesEndRef = useRef(null);

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

      const response = await axiosInstance.get('/conversations');
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

      const response = await axiosInstance.get(`/conversations/${id}`);
      setCurrentConversation(response.data);
      setGod(response.data.god);
      setMessages(response.data.messages);
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
      const response = await axiosInstance.post('/conversations/chat', {
        conversation_id: conversationId,
        message: optimisticMsg.content,
      });
      // After god's response, fetch the updated conversation
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
          // Optionally handle error
          setQuestions([]);
        }
      } else {
        setQuestions([]);
      }
    };
    fetchQuestions();
  }, [currentConversation?.god?.id]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    // Optimistically add the user's message
    const optimisticMsg = {
      content: inputMessage.trim(),
      is_from_user: true,
      created_at: new Date().toISOString(),
    };
    setCurrentConversation(prev => ({
      ...prev,
      messages: [...(prev?.messages || []), optimisticMsg],
    }));
    setInputMessage('');
    setIsSending(true);
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.post('/conversations/chat', {
        conversation_id: conversationId,
        message: optimisticMsg.content,
      });
      // After god's response, fetch the updated conversation
      await fetchConversationDetails(conversationId);
    } catch (error) {
      setError('Error sending message: ' + (error.response?.data?.detail || error.message));
      // Optionally: remove the optimistic message or mark it as failed
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  const handleQuestionSelect = (question) => {
    setInputMessage(question);
    setShowQuestionSuggestions(false);
  };

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
        <div className="top-header">
          <button className="menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          <img 
            src="/LiveGodsLogo.png" 
            alt="LiveGods Logo" 
            className="header-logo" 
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="menu-overlay"
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.3 }}
            >
              <button className="close-button" onClick={() => setIsMenuOpen(false)}>
                <FaTimes />
              </button>
              <div className="menu-content">
                <button className="menu-item" onClick={() => {
                  navigate('/gods');
                  setIsMenuOpen(false);
                }}>
                  Back to Gods
                </button>
                <button 
                  className="menu-item"
                  onClick={() => {
                    setIsFeedbackOpen(true);
                    setIsMenuOpen(false);
                  }}
                >
                  Give Feedback
                </button>
                <button 
                  className="menu-item logout"
                  onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/');
                  }}
                >
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Feedback 
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
        />

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
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="top-header">
        <button className="menu-button" onClick={() => setIsMenuOpen(true)}>
          <FaBars />
        </button>
        <img 
          src="/LiveGodsLogo.png" 
          alt="LiveGods Logo" 
          className="header-logo" 
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        />
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="menu-overlay"
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.3 }}
          >
            <button className="close-button" onClick={() => setIsMenuOpen(false)}>
              <FaTimes />
            </button>
            <div className="menu-content">
              <button className="menu-item" onClick={() => {
                navigate('/gods');
                setIsMenuOpen(false);
              }}>
                Go to Gods
              </button>
              <button
                className="menu-item"
                onClick={() => {
                  setIsFeedbackOpen(true);
                  setIsMenuOpen(false);
                }}
              >
                Give Feedback
              </button>
              <button
                className="menu-item logout"
                onClick={() => {
                  localStorage.removeItem('token');
                  navigate('/');
                }}
              >
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Feedback
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

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
          <img 
            src="/LiveGodsLogo.png" 
            alt="LiveGods Logo" 
            className="header-logo" 
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="messages-container" ref={messagesEndRef}>
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
