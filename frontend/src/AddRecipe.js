import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing
import './AddRecipe.css'; // Import the scoped CSS file

const AddRecipe = () => {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [chefId, setChefId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate(); // Initialize navigate function

  const handleSubmit = async (e) => {
    e.preventDefault();

    const recipeData = {
      title,
      ingredients: JSON.stringify(ingredients.split(',')), // Convert to array
      instructions,
      chefId,
      imageUrl,
    };

    try {
      const response = await fetch('http://localhost:3000/add-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message);
        // Clear the form fields
        setTitle('');
        setIngredients('');
        setInstructions('');
        setChefId('');
        setImageUrl('');

        // Redirect to the recipe page (for example, '/recipes')
        navigate('/recipes');
      } else {
        setMessage(result.error || 'Failed to add recipe.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again later.');
      console.error('Error:', error);
    }
  };

  // Handle navigation to the recipes page
  const goToRecipes = () => {
    navigate('/recipes');
  };

  return (
    <div className="add-recipe-container">
      {/* "Recipes" Button */}
      <button className="recipes-button" onClick={goToRecipes}>
        Recipes
      </button>

      <h1>Add a New Recipe</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter recipe title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="ingredients">Ingredients (comma-separated):</label>
          <input
            id="ingredients"
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Enter ingredients, e.g., sugar, salt, flour"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="instructions">Instructions:</label>
          <textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Enter cooking instructions"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="chefId">Chef ID:</label>
          <input
            id="chefId"
            type="text"
            value={chefId}
            onChange={(e) => setChefId(e.target.value)}
            placeholder="Enter your Chef ID"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">Image URL:</label>
          <input
            id="imageUrl"
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Enter an image URL"
            required
          />
        </div>

        <button type="submit">Add Recipe</button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default AddRecipe;
