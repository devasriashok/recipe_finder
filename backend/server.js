const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

// MongoDB Connection
const MONGO_URI = 'mongodb://localhost:27017/recipe_finder'; // Update if needed
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define Mongoose Schemas
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true },
});

const RecipeSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  ingredients: [String],
  instructions: { type: String, required: true },
  chefId: { type: String, required: true },
  imageUrl: { type: String, required: true }, // URL for the image
  reviews: [{ rating: Number, comment: String }], // Reviews array
  averageRating: { type: Number, default: 0 }, // Avg rating field
});

const User = mongoose.model('User', UserSchema);
const Recipe = mongoose.model('Recipe', RecipeSchema);

// ========== Routes & APIs ==========

// User Signup
app.post('/signup', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ error: 'Username or email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, passwordHash: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'An error occurred during signup.', details: err.message });
  }
});

// User Login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.passwordHash)) {
      res.status(200).json({ message: 'Login successful!', role: user.role, id: user._id });
    } else {
      res.status(401).json({ error: 'Invalid credentials.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'An error occurred during login.', details: err.message });
  }
});

// Add Recipe
app.post('/add-recipe', async (req, res) => {
  try {
    const { title, ingredients, instructions, chefId, imageUrl } = req.body;
    if (!title || !ingredients || !instructions || !chefId || !imageUrl) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const newRecipe = new Recipe({
      title,
      ingredients: JSON.parse(ingredients), // Ensure it's an array
      instructions,
      chefId,
      imageUrl,
      reviews: [],
      averageRating: 0,
    });

    await newRecipe.save();
    res.status(201).json({ message: 'Recipe added successfully!', recipe: newRecipe });
  } catch (err) {
    res.status(500).json({ error: 'An error occurred while adding the recipe.', details: err.message });
  }
});

// Get All Recipes
app.get('/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ error: 'An error occurred while fetching recipes.', details: err.message });
  }
});

// Get Recipe by Title
app.get('/recipe/:title', async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ title: req.params.title });
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.status(200).json(recipe);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching recipe.', details: err.message });
  }
});

// Add Review to a Recipe
app.post('/add-review', async (req, res) => {
  try {
    const { recipeName, rating, comment } = req.body;
    if (!recipeName || !rating || !comment) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const recipe = await Recipe.findOne({ title: recipeName });
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    recipe.reviews.push({ rating: parseInt(rating, 10), comment });
    const totalRatings = recipe.reviews.reduce((acc, review) => acc + review.rating, 0);
    recipe.averageRating = totalRatings / recipe.reviews.length;
    
    await recipe.save();
    res.status(200).json({ message: 'Review added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add review.', details: err.message });
  }
});

// Delete Recipe
app.delete('/delete-recipe/:id', async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!deletedRecipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting recipe.', details: err.message });
  }
});

// Update Recipe
app.put('/update-recipe/:id', async (req, res) => {
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRecipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.status(200).json({ message: 'Recipe updated successfully', recipe: updatedRecipe });
  } catch (err) {
    res.status(500).json({ error: 'Error updating recipe.', details: err.message });
  }
});

// Server Start
const PORT = process.env.PORT || 4000; // Change to 4000 or another free port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});