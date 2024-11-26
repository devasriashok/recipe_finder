import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import './Recipes.css';

const RecipeList = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // State for the search input

  // Fetch recipes from the server
  const fetchRecipes = async () => {
    try {
      const response = await axios.get('http://localhost:3000/recipes');
      setRecipes(response.data);
    } catch (err) {
      console.error('Error fetching recipes:', err);
    }
  };

  useEffect(() => {
    fetchRecipes(); // Fetch recipes on component mount
  }, []); // Empty dependency array to run only once

  // Handle the search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter recipes based on the search query
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function addReview(data) {
    const title = data.title;
    navigate('/add-review', { state: title });
  }

  return (
    <div className="recipe-list-container">
      {/* Heading */}
      <h2 className="recipe-heading">Recipes</h2>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search recipes by name"
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>
       <br></br>
      {/* Displaying filtered recipes */}
      <div className="recipe-items-container">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <div key={recipe.id} className="recipe-container">
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="recipe-image"
              />
              <h3>{recipe.title}</h3>
              <p className="ingredients">{recipe.ingredients.join(', ')}</p>
              <p className="instructions">{recipe.instructions}</p>
              <p className="average-rating">
                Rating: {recipe.averageRating || 'No ratings yet'}
              </p>

              <button className="add-review-btn" onClick={() => addReview(recipe)}>
                Add Review
              </button>
            </div>
          ))
        ) : (
          <p>No recipes found</p>
        )}
      </div>
    </div>
  );
};

export default RecipeList;
