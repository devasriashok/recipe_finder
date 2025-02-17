import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Recipes.css';

const RecipeList = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [chefId, setChefId] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

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
    const userChefId = localStorage.getItem('chefId');
    setChefId(userChefId);
    fetchRecipes();
  }, []);

  // Handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter recipes based on the search query
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle selection of a recipe for detailed view
  const handleSelectRecipe = (recipe) => {
    setSelectedRecipe(recipe);
  };

  // Handle going back to recipe list
  const handleBackClick = () => {
    setSelectedRecipe(null);
  };

  // Handle selecting recipes for deletion
  const handleSelectForDeletion = (recipeId) => {
    setSelectedRecipes((prev) => {
      if (prev.includes(recipeId)) {
        return prev.filter((id) => id !== recipeId);
      }
      return [...prev, recipeId];
    });
  };

  // Handle deleting selected recipes
  const handleDeleteRecipes = async () => {
    if (!chefId) {
      alert('You must be logged in as a chef to delete recipes.');
      return;
    }

    const enteredChefId = prompt('Enter your Chef ID to confirm deletion:');
    if (enteredChefId !== chefId) {
      alert('Chef ID does not match. You are not authorized to delete these recipes.');
      return;
    }

    try {
      for (let recipeId of selectedRecipes) {
        const response = await axios.delete(`http://localhost:3000/recipes/${recipeId}`, {
          data: { chefId },
        });

        if (response.data.success) {
          setRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe.id !== recipeId));
        } else {
          alert('An error occurred while deleting the recipe.');
        }
      }

      alert('Selected recipes deleted successfully!');
      setSelectedRecipes([]);
    } catch (err) {
      console.error('Error deleting recipes:', err);
      alert('An error occurred while deleting the recipes.');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('chefId');
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className="recipe-list-container">
      {/* Top navigation */}
      <div className="logout-container">
        
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {selectedRecipe ? (
        <div
          className="recipe-details-container"
          style={{ backgroundColor: 'orange', color: '#fff' }}
        >
          <button className="back-btn" onClick={handleBackClick}>
            Back to Recipes
          </button>
          <h2>{selectedRecipe.title}</h2>
          <img
            src={selectedRecipe.imageUrl}
            alt={selectedRecipe.title}
            className="recipe-detail-image"
          />
          <h3>Ingredients:</h3>
          <ul>
            {selectedRecipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
          <h3>Instructions:</h3>
          <p>{selectedRecipe.instructions}</p>
          <p className="average-rating">
            Rating: {selectedRecipe.averageRating || 'No ratings yet'}
          </p>
          <button
            className="add-review-btn"
            onClick={() => navigate('/add-review', { state: selectedRecipe.title })}
          >
            Add Review
          </button>
        </div>
      ) : (
        <>
          <div className="action-buttons">
            <h2 className="recipe-heading">Recipes</h2>
            {chefId && (
              <button
                className="add-recipe-btn"
                onClick={() => navigate('/add-recipe')}
              >
                Add Recipe
              </button>
            )}
          </div>

          {chefId && selectedRecipes.length > 0 && (
            <button className="delete-btn" onClick={handleDeleteRecipes}>
              Delete Selected Recipes
            </button>
          )}

          <div className="search-container">
            <input
              type="text"
              placeholder="Search recipes by name"
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <div className="recipe-items-container">
            {filteredRecipes.length > 0 ? (
              filteredRecipes.map((recipe) => (
                <div key={recipe.id} className="recipe-container">
                  {chefId && (
                    <input
                      type="checkbox"
                      checked={selectedRecipes.includes(recipe.id)}
                      onChange={() => handleSelectForDeletion(recipe.id)}
                    />
                  )}
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="recipe-image"
                    onClick={() => handleSelectRecipe(recipe)}
                  />
                  <h3>{recipe.title}</h3>
                  <p className="average-rating">
                    Rating: {recipe.averageRating || 'No ratings yet'}
                  </p>
                </div>
              ))
            ) : (
              <p>No recipes found</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RecipeList;
