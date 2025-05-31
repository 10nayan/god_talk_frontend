import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaTimes } from 'react-icons/fa';
import axiosInstance from '../../utils/axios';
import './Feedback.css';

const Feedback = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [likes, setLikes] = useState('');
  const [dislikes, setDislikes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await axiosInstance.post('/feedback', {
        rating,
        likes,
        dislikes
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setRating(0);
        setLikes('');
        setDislikes('');
      }, 2000);
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="feedback-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="feedback-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <button className="close-button" onClick={onClose}>
              <FaTimes />
            </button>

            <h2>Share Your Feedback</h2>
            
            {success ? (
              <motion.div 
                className="success-message"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Thank you for your feedback!
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="rating-container">
                  <label>How would you rate your experience?</label>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`star ${star <= rating ? 'active' : ''}`}
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>
                </div>

                <div className="input-group">
                  <label>What did you like about the site?</label>
                  <textarea
                    value={likes}
                    onChange={(e) => setLikes(e.target.value)}
                    placeholder="Share what you enjoyed..."
                    rows={3}
                  />
                </div>

                <div className="input-group">
                  <label>What could be improved?</label>
                  <textarea
                    value={dislikes}
                    onChange={(e) => setDislikes(e.target.value)}
                    placeholder="Share your suggestions..."
                    rows={3}
                  />
                </div>

                {error && <div className="error-message">{error}</div>}

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Feedback; 