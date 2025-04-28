import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';

const defaultGodImage = 'https://billmuehlenberg.com/wp-content/uploads/2023/04/2nd-coming-2.webp';

const GodsPage = () => {
  const [gods, setGods] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGods();
  }, []);

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
      setError('Failed to fetch gods. Please try again later.');
      console.error('Error fetching gods:', err);
    }
  };

  const startChat = async (godId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_HOST_URL}/conversations`, 
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
      setError('Failed to start chat. Please try again later.');
      console.error('Error starting chat:', err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="container-fluid py-5 bg-light min-vh-100">
      <motion.div 
        className="container"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="d-flex justify-content-between align-items-center mb-5">
          <h1 className="display-4 fw-bold text-primary mb-0">Choose Your God</h1>
          <button 
            className="btn btn-outline-primary btn-lg"
            onClick={() => navigate('/conversations')}
          >
            View Conversations
          </button>
        </div>

        {error && (
          <motion.div 
            className="alert alert-danger"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}

        <motion.div 
          className="row g-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {gods.map((god) => (
            <motion.div
              key={god.id}
              className="col-12 col-md-6 col-lg-4"
              variants={itemVariants}
            >
              <div 
                className="card h-100 shadow-sm border-0 bg-white"
                style={{ borderRadius: '15px', overflow: 'hidden' }}
              >
                <div 
                  className="card-img-top"
                  style={{
                    height: '200px',
                    backgroundImage: `url(${god.image_url || defaultGodImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <div className="card-body d-flex flex-column p-4">
                  <h2 className="card-title h3 text-primary mb-3">{god.name}</h2>
                  <p className="card-text text-muted flex-grow-1">{god.description}</p>
                  <motion.button
                    className="btn btn-primary btn-lg mt-3"
                    onClick={() => startChat(god.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Start Chat
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GodsPage;
