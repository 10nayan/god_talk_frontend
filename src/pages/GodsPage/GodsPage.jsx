import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaCompass, FaPray, FaUser, FaSearch, FaComments, FaArrowRight } from 'react-icons/fa';
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
          {god.description}
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

      const response = await axios.get(`${import.meta.env.VITE_BACKEND_HOST_URL}/gods`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_HOST_URL}/conversations`, 
        { 
          god_id: godId,
          title: `Chat with ${gods.find(god => god.id === godId)?.name || 'God'}`
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      navigate(`/conversations/${response.data.id}`);
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

      {/* Sticky Bottom Bar */}
      <div className="sticky-bottom-bar">
        <button className="bottom-bar-btn" onClick={() => navigate('/conversations')}>
          Go to Conversations
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
};

export default GodsPage;
