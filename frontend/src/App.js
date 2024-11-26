import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login';
import AddRecipe from './AddRecipe';
import Recipes from './Recipes';
import AddReview from './AddReview';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  return (
    <Router>
      <div>
        <h1>Recipe Finder</h1>
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/add-recipe" element={<AddRecipe user={user} />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/add-review" element={<AddReview />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
