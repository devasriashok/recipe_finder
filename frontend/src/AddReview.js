import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './AddReview.css';

const AddReview = ({ refreshRecipes, recipe }) => {

  const location = useLocation();

  const recipeTitle = location.state;
  console.log(recipeTitle);

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    rating: '',
    comment: '',
  });
  const [successPopup, setSuccessPopup] = useState(false); // State for showing the popup
  const [error,setError] = useState("");

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  // Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  try {

    console.log(formData.rating);
    console.log(formData.comment);

   const response =  await axios.post('http://localhost:3000/add-review', {
      recipeName: recipeTitle, 
      rating: Number(formData.rating), // Convert rating to number
      comment: formData.comment,
    });
    if(response.status === 200){
      setError("Review Successfully!!!");
    }
    else{
      setError("Error in Add Reviews !!!",error);
    }
    setSuccessPopup(true);
    refreshRecipes();
    setTimeout(() => {
      setSuccessPopup(false);
      navigate('/recipes');
    }, 2000);
  } catch (err) {
    setError(err.response?.data?.error || 'Error adding review');
  }
  
};


  return (
    <div className="add-review-container">
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
