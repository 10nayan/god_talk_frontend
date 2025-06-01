import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaComments, FaArrowRight, FaStar, FaBook, FaGlobe, FaOm, FaUser } from 'react-icons/fa';
import { FaHandsPraying } from 'react-icons/fa6';
import Feedback from '../../components/Feedback/Feedback'; // Assuming Feedback component might be used here too later
import './LandingPage.css';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false); // Assuming Feedback component might be used here too later
  const navigate = useNavigate();

  // Placeholder data for conversation examples
  const conversationExamples = [
    {
      id: 1,
      question: 'How can I find my life\'s purpose?',
      answerPreview: 'Your purpose lies in using your unique gifts to serve others...'
    },
    {
      id: 2,
      question: 'What is the path to inner peace?',
      answerPreview: 'Inner peace comes from accepting what is and letting go...'
    },
    {
      id: 3,
      question: 'How to overcome challenges?',
      answerPreview: 'Every challenge is an opportunity for growth...'
    }
  ];

  const handleAskQuestionClick = () => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/gods');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <div className="top-header">
        <button className="menu-button" onClick={() => setIsMenuOpen(true)}>
          <FaBars />
        </button>
        <img src="/LiveGodsLogo.png" alt="LiveGods Logo" className="header-logo" />
      </div>

      {/* Hamburger Menu Overlay */}
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
              {/* Menu items - adjust as needed for landing page */}
              <button className="menu-item" onClick={() => {
                navigate('/login'); // Example: navigate to login
                setIsMenuOpen(false);
              }}>
                Login / Sign Up
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
              {/* Add other relevant landing page menu items */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

       {/* Feedback Modal - Assuming it might be used here */}
      <Feedback
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      {/* Hero Section */}
      <div className="hero-section">
        <img src="BrandImage.png" alt="Divine Guide" className="hero-image" /> {/* Replace with actual hero image */}
        
        <div className="hero-content">
          <h1>Your Divine Guide for Daily Life</h1>
          <p>in your language, on your time</p>
          <button className="cta-button" onClick={handleAskQuestionClick}>
            Ask Your Question Now
          </button>
        </div>
      </div>

      {/* Why Choose Section */}
      <div className="why-choose-section">
        <h2>Why Choose LiveGods</h2>
        <p className="section-subtitle">Experience divine wisdom in the modern age</p>
        <div className="feature-cards-container">
          <div className="feature-card">
            <FaStar className="feature-icon" />
            <h3>Personal Divine Guide <span className="tag">24/7</span></h3>
            <ul>
              <li>Get spiritual wisdom and answers anytime, anywhere</li>
              <li>No need to wait for temples or astrologers—get guidance on demand</li>
            </ul>
          </div>
          <div className="feature-card">
            <FaBook className="feature-icon" />
            <h3>Ancient Wisdom, Modern Way</h3>
            <ul>
              <li>Gods answer life\'s questions with insights from scriptures</li>
              <li>Balanced spiritual and practical advice for daily life</li>
            </ul>
          </div>
          <div className="feature-card">
            <FaGlobe className="feature-icon" />
            <h3>Multi-Language Support</h3>
            <ul>
              <li>Available in Hindi, English, Marathi, Tamil, Telugu & more</li>
              <li>Experience divine guidance in your native language</li>
            </ul>
          </div>
          <div className="feature-card">
            <FaOm className="feature-icon" /> {/* Using FaOm for Personalized Guidance */}
            <h3>Personalized Guidance</h3>
            <ul>
              <li>Ask about career, relationships, health, or personal matters</li>
              <li>Receive tailored answers with timeless wisdom</li>
            </ul>
          </div>
        </div>
        <button className="cta-button" onClick={handleAskQuestionClick}>
           Ask Your Question Now
        </button>
      </div>

      {/* Divine Conversations Section */}
      <div className="divine-conversations-section">
        <h2>Divine Conversations</h2>
        <div className="conversation-examples-container">
          {conversationExamples.map(example => (
            <div key={example.id} className="conversation-example-card">
              <div className="avatars">
                <FaUser className="avatar user-icon" /> 
                <FaHandsPraying className="avatar god-icon" /> 
              </div>
              <div className="conversation-text">
                <p className="question">{example.question}</p>
                <p className="answer-preview">{example.answerPreview}</p>
              </div>
               <button className="ask-question-button" onClick={handleAskQuestionClick}>
                Ask Your Question
              </button>
            </div>
          ))}
        </div>
        <button className="show-more-button" onClick={() => navigate('/conversations')}>
          Show More
        </button>
      </div>

      {/* Footer or other sections can be added here */}

    </div>
  );
};

export default LandingPage; 