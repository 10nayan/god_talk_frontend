import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaCompass, FaPray, FaUser, FaSearch, FaComments, FaArrowRight, FaBars, FaTimes } from 'react-icons/fa';
import Feedback from '../../components/Feedback/Feedback';
import './GodsPage.css';

const defaultGodImage = 'https://billmuehlenberg.com/wp-content/uploads/2023/04/2nd-coming-2.webp';

const GodCard = ({ god, onStartChat }) => {
  const randomChatCount = `${Math.floor(Math.random() * (99 - 10 + 1) + 10)}.${Math.floor(Math.random() * 9)}k`;

  const handleStartChat = (e) => {
    e.stopPropagation();
    onStartChat(god.id);
  };

  return (
    <motion.div 
      className="god-card"
      onClick={handleStartChat}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <motion.img 
        src={god.image_url || defaultGodImage} 
        alt={god.name} 
        className="god-image"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      />
      <div className="god-info">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {god.name}
        </motion.h3>
        <motion.p 
          className="description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {god.description.length > 70 ? god.description.substring(0, 70) + '...' : god.description}
        </motion.p>
        <motion.div 
          className="card-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="chat-stats">
            <FaComments className="chat-icon" />
            <span className="chat-count">{randomChatCount}</span>
          </div>
          <motion.button
            className="start-chat-btn"
            onClick={handleStartChat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Chat <FaArrowRight className="arrow-icon" />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

const SearchBar = ({ value, onChange }) => (
  <motion.div 
    className="search-container"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="search-bar">
      <FaSearch className="search-icon" />
      <input
        type="text"
        placeholder="Search for Divine Guides"
        value={value}
        onChange={onChange}
      />
    </div>
  </motion.div>
);

const GodsPage = () => {
  const [gods, setGods] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    fetchGods();
  }, [navigate]);

  const fetchGods = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await axiosInstance.get('/gods');
      setGods(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/');
      } else {
        setError('Failed to fetch gods. Please try again later.');
        console.error('Error fetching gods:', err);
      }
    }
  };

  const startChat = async (godId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      // First, get all conversations
      const conversationsResponse = await axiosInstance.get('/conversations');

      // Check if there's an existing conversation with this god
      const existingConversation = conversationsResponse.data.find(
        conv => conv.god_id === godId
      );

      if (existingConversation) {
        // If conversation exists, navigate to it
        navigate(`/conversations/${existingConversation.id}`);
      } else {
        // If no conversation exists, create a new one
        const god = gods.find(g => g.id === godId);
        const response = await axiosInstance.post('/conversations', { 
          god_id: godId,
          title: `Chat with ${god?.name || 'God'}`
        });
        
        if (response.data && response.data.id) {
          navigate(`/conversations/${response.data.id}`);
        } else {
          throw new Error('Invalid response from server');
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/');
      } else {
        setError('Failed to start chat. Please try again later.');
        console.error('Error starting chat:', err);
      }
    }
  };

  const groupGodsByReligion = () => {
    const grouped = {};
    gods.forEach(god => {
      if (!grouped[god.religion]) {
        grouped[god.religion] = [];
      }
      grouped[god.religion].push(god);
    });

    // Ensure Hinduism comes first
    const orderedGroups = {};
    if (grouped['Hinduism']) {
      orderedGroups['Hinduism'] = grouped['Hinduism'];
      delete grouped['Hinduism'];
    }
    
    // Add remaining religions in alphabetical order
    Object.keys(grouped).sort().forEach(religion => {
      orderedGroups[religion] = grouped[religion];
    });

    return orderedGroups;
  };

  const filteredGods = searchQuery
    ? gods.filter(god => 
        god.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        god.religion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        god.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : groupGodsByReligion();

  return (
    <div className="gods-page">
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
                navigate('/conversations');
                setIsMenuOpen(false);
              }}>
                Go to Conversations
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

      <SearchBar 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <AnimatePresence>
        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {searchQuery ? (
          <motion.div 
            className="section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2>Search Results</h2>
            <div className="cards-container">
              <AnimatePresence>
                {filteredGods.map(god => (
                  <GodCard key={god.id} god={god} onStartChat={startChat} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          Object.entries(filteredGods).map(([religion, religionGods]) => (
            <motion.div 
              key={religion} 
              className="section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2>{religion}</h2>
              <div className="cards-container">
                <AnimatePresence>
                  {religionGods.map(god => (
                    <GodCard key={god.id} god={god} onStartChat={startChat} />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default GodsPage;
