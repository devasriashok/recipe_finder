const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors()); // Enable CORS for all routes

// MongoDB configuration
const MONGO_URI = 'mongodb://localhost:27017/recipe_finder'; // Replace with your MongoDB connection string
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define Mongoose schemas
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  passwordHash: String,
  role: String,
});

const RecipeSchema = new mongoose.Schema({
  title: String,
  ingredients: [String],
  instructions: String,
  chefId: String,
  imageUrl: String, // New field for the image URL
  reviews: [{ rating: Number, comment: String }], // Store reviews here
  averageRating: { type: Number, default: 0 }, // Field for average rating
});

const ReviewSchema = new mongoose.Schema({
  recipeId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  rating: Number,
  comment: String,
});

const User = mongoose.model('User', UserSchema);
const Recipe = mongoose.model('Recipe', RecipeSchema);
const Review = mongoose.model('Review', ReviewSchema);

// Routes and APIs

// Sign Up
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

// Login
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

// Add Recipe with Image URL
app.post('/add-recipe', async (req, res) => {
  try {
    const { title, ingredients, instructions, chefId, imageUrl } = req.body;

    // Check if all required fields are provided
    if (!title || !ingredients || !instructions || !chefId || !imageUrl) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Create a new recipe object and save it to the database
    const newRecipe = new Recipe({
      title,
      ingredients: JSON.parse(ingredients), // Ensure ingredients is an array
      instructions,
      chefId,
      imageUrl, // Save the provided image URL
      reviews: [], // Initialize with an empty reviews array
      averageRating: 0, // Set initial average rating to 0
    });

    await newRecipe.save();

    // Return success message upon successful recipe creation
    res.status(201).json({ message: 'Recipe added successfully!', recipe: newRecipe });
  } catch (err) {
    // Handle any errors that might occur during the database operation
    res.status(500).json({ error: 'An error occurred while adding the recipe.', details: err.message });
  }
});

// Get Recipes
app.get('/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    const formattedRecipes = recipes.map(recipe => ({
      id: recipe._id,
      title: recipe.title,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      imageUrl: recipe.imageUrl, // Include image URL in the response
      averageRating: recipe.averageRating, // Include average rating in the response
    }));

    res.status(200).json(formattedRecipes);
  } catch (err) {
    res.status(500).json({ error: 'An error occurred while fetching recipes.', details: err.message });
  }
});

// Add Review
// Add Review
app.post('/add-review', async (req, res) => {
  const { recipeName, rating, comment } = req.body;
  
  if (!recipeName || !rating || !comment) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Find the recipe by title
    const recipe = await Recipe.findOne({ title: recipeName });

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Add the review to the recipe's reviews array
    const newReview = {
      rating: parseInt(rating, 10), // Ensure rating is a number
      comment,
    };

    recipe.reviews.push(newReview);

    // Update the average rating
    const totalRatings = recipe.reviews.reduce((acc, review) => acc + review.rating, 0);
    recipe.averageRating = totalRatings / recipe.reviews.length;

    // Save the updated recipe
    await recipe.save();

    res.status(200).json({ message: 'Review added successfully' });
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ error: 'Failed to add review.', details: err.message });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
