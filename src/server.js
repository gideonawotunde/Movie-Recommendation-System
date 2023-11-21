const path = require("path");
const express = require("express");
const cors = require('cors');
const fetch = require('node-fetch');
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const config = require('../main/api/config');
const app = express();
const API_KEY = "3b9911169259873b40c7c8420d4a37ce";
const port = process.env.PORT || 3000;

app.use(cors());

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("Error connecting to MongoDB:", err));

// Middleware for parsing JSON request bodies
app.use(express.json());

function authenticate(req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  // Extract the token from the "Bearer " prefix
  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, config.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token." });
  }
}

// Set up API routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "main", "public", "html", "login.html"));
});

app.post("/api/user/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body; // Add firstName and lastName here

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // Pass firstName and lastName when creating a new User instance
    const newUser = new User({ firstName, lastName, email, password });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Error during user registration:", error.message);
    console.error("Error details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, config.SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    console.error("Error during user login:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/user/favorites", authenticate, async (req, res) => {
  const { userId } = req.user;

  try {
    const user = await User.findById(userId);
    res.status(200).json(user.favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/api/user/favorites/add", authenticate, async (req, res) => {
  const { userId } = req.user;
  const { movieId, genres, actors } = req.body;

  try {
    const user = await User.findById(userId);
    await user.addToFavorites({ movieId, genres, actors });

    res.status(201).json({ message: "Favorite added successfully." });
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/user/favorites/remove", authenticate, async (req, res) => {
  const { userId } = req.user;
  const { movieId } = req.body;

  try {
    const user = await User.findById(userId);
    await user.removeFromFavorites(movieId);

    res.status(200).json({ message: "Favorite removed successfully." });
  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post('/api/favorite-movies', async (req, res) => {
  const movieIds = req.body.movieIds;
  
  try {
    const movieDetailsPromises = movieIds.map(movieId => getMovieDetails(movieId));
    const movieDetails = await Promise.all(movieDetailsPromises);
    res.json(movieDetails);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch favorite movie details' });
  }
});



// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "..", "main", "public")));


app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "main", "public", "html", "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "main", "public", "html", "signup.html"));
});

app.get("/mvs", authenticate, (req, res) => {
  res.redirect("/mvs_page");
});

app.get("/mvs_page", authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "main", "public", "html", "mvs.html"));
});

app.get("/favorites", authenticate, (req, res) => {
  res.redirect("/favorites_page");
});

app.get("/favorites_page", authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "main", "public", "html", "favorites.html"));
});


// Define the API endpoint for getting movies
app.get('/api/movies', async (req, res) => {
  const searchTerm = req.query.searchTerm;
  const selectedGenre = req.query.selectedGenre;

  try {
    const movies = await loadMovies(searchTerm, selectedGenre);
    res.json(movies);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch movies' });
  }
});

app.get('/api/actors', async (req, res) => {
  const searchTerm = req.query.searchTerm;

  try {
    const actors = await searchActor(searchTerm);
    res.json(actors);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch actors' });
  }
});

app.get('/api/movie-details', async (req, res) => {
  const movieId = req.query.movieId;

  try {
    const movieDetails = await getMovieDetails(movieId);
    res.json(movieDetails);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch movie details' });
  }
});

async function searchActor(query) {
  const SEARCH_ACTOR_URL = 'https://api.themoviedb.org/3/search/person';
  const url = `${SEARCH_ACTOR_URL}?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;

  const res = await fetch(url);
  const data = await res.json();
  return data.results;
}



async function loadMovies(searchTerm, selectedGenre) {
  const BASE_URL = 'https://api.themoviedb.org/3';
  const API_KEY = '3b9911169259873b40c7c8420d4a37ce';

  let url;

  if (searchTerm) {
    url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchTerm)}`;
  } else if (selectedGenre) {
    url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${encodeURIComponent(selectedGenre)}`;
  }

  const res = await fetch(url);
  const data = await res.json();
  return data.results;
}

async function getMovieDetails(movieId) {
  const detailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`;
  const creditsUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${API_KEY}`;

  const detailsResult = await fetch(detailsUrl);
  const detailsData = await detailsResult.json();

  const creditsResult = await fetch(creditsUrl);
  const creditsData = await creditsResult.json();
  const cast = creditsData.cast.slice(0, 5).map(actor => ({ name: actor.name, character: actor.character }));

  const movieDetails = {
    title: detailsData.title,
        release_date: detailsData.release_date.slice(0, 4),
        vote_average: detailsData.vote_average,
        runtime: detailsData.runtime,
        genres: detailsData.genres,
        director: getDirector(creditsData.crew),
        cast: cast,
        overview: detailsData.overview,
        original_language: detailsData.original_language,
        production_companies: detailsData.production_companies,
        poster_path: `https://image.tmdb.org/t/p/w500${detailsData.poster_path}`
      };

      return movieDetails;
    }


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
