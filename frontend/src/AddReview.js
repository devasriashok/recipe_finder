import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './AddReview.css';

const AddReview = ({ refreshRecipes }) => {
  const location = useLocation();
  const recipeTitle = location.state; // Access recipe title from location state
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    rating: '',
    comment: '',
  });
  const [successPopup, setSuccessPopup] = useState(false); // State for showing the popup
  const [error, setError] = useState("");

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/add-review', {
        recipeName: recipeTitle,
        rating: Number(formData.rating), // Convert rating to number
        comment: formData.comment,
      });

      setSuccessPopup(true); // Show success popup
      refreshRecipes(); // Refresh the recipes list
      setTimeout(() => {
        setSuccessPopup(false);
        navigate('/recipes'); // Redirect to recipes page after success
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error adding review',error);
    }
  };

  return (
    <div className="add-review-container">
      {/* Recipes Button */}
      <div className="top-right-button">
        <button
          className="recipes-button"
          onClick={() => navigate('/recipes')}
        >
          Recipes
        </button>
      </div>

      <h2>Add Review</h2>
      {successPopup && <div className="success-popup">Review added successfully!</div>}
      <form className="add-review-form" onSubmit={handleSubmit}>
        <label htmlFor="rating">Rating (1-5):</label>
        <input
          type="number"
          id="rating"
          name="rating"
          value={formData.rating}
          onChange={handleChange}
          placeholder="Enter a rating between 1 and 5"
          min="1"
          max="5"
          required
        />

        <label htmlFor="comment">Comment:</label>
        <textarea
          id="comment"
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          placeholder="Enter your comment"
          required
        ></textarea>

        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
};

export default AddReview;
