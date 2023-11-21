document.addEventListener('DOMContentLoaded', () => {

  const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/html/login.html';
}

async function fetchWithAuth(url, options) {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Unauthorized");
  }

  options = options || {};
  options.headers = options.headers || {};
  options.headers["Authorization"] = `Bearer ${token}`;

  return fetch(url, options);
} 

  restoreMovieListState();

  console.log('domcontentloaded')
    const movieSearchBox = document.querySelector('#movie-search-box');
    const searchList = document.querySelector('#search-list');
    const resultGrid = document.querySelector('#result-grid');
    const favoritesBtn = document.querySelector('#favorite-btn');
    const favoriteSection = document.querySelector('.favorite-section');
    const IMG_PATH = "https://image.tmdb.org/t/p/w500/";

    var selectedGenre = []

    if (movieSearchBox) {
      movieSearchBox.addEventListener('input', findMovies);
    }

    const API_KEY = "3b9911169259873b40c7c8420d4a37ce";
    const BASE_URL = 'https://api.themoviedb.org/3';
    const API_URL = `${BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`;
    const SEARCH_ACTOR_URL = `${BASE_URL}/search/person`;
    const cache = {
      actors: {},
      movies: {},
    };
    const genres = [
        {
          "id": 28,
          "name": "Action"
        },
        {
          "id": 12,
          "name": "Adventure"
        },
        {
          "id": 16,
          "name": "Animation"
        },
        {
          "id": 35,
          "name": "Comedy"
        },
        {
          "id": 80,
          "name": "Crime"
        },
        {
          "id": 99,
          "name": "Documentary"
        },
        {
          "id": 18,
          "name": "Drama"
        },
        {
          "id": 10751,
          "name": "Family"
        },
        {
          "id": 14,
          "name": "Fantasy"
        },
        {
          "id": 36,
          "name": "History"
        },
        {
          "id": 27,
          "name": "Horror"
        },
        {
          "id": 10402,
          "name": "Music"
        },
        {
          "id": 9648,
          "name": "Mystery"
        },
        {
          "id": 10749,
          "name": "Romance"
        },
        {
          "id": 878,
          "name": "Science Fiction"
        },
        {
          "id": 10770,
          "name": "TV Movie"
        },
        {
          "id": 53,
          "name": "Thriller"
        },
        {
          "id": 10752,
          "name": "War"
        },
        {
          "id": 37,
          "name": "Western"
        }
      ]
    
      const tagsEl = document.getElementById('tags');

      
      if (tagsEl) {
        setGenre();
      }
      function setGenre() {
        tagsEl.innerHTML= '';
        genres.forEach(genre => {
          const t = document.createElement('div');
          t.classList.add('tag');
          t.id=genre.id;
          t.innerText = genre.name;
          t.addEventListener('click', () => {
            if(selectedGenre.length == 0){
              selectedGenre.push(genre.id);
            } else {
              if(selectedGenre.includes(genre.id)){
                selectedGenre.forEach((id, idx) => {
                  if(id == genre.id){
                    selectedGenre.splice(idx, 1);
                  }
                });
              } else {
                selectedGenre.push(genre.id);
              }
            }
            console.log(selectedGenre);
            
            highlightSelection();
            toggleGenerateMoviesButton(true);
          });
          tagsEl.append(t);
        });
      }
      
    
      function highlightSelection() {
        const tags = document.querySelectorAll('.tag');
        tags.forEach(tag => {
          // Toggle the 'highlight' class based on the selected genres
          if (selectedGenre.includes(parseInt(tag.id))) {
            tag.classList.add('highlight');
          } else {
            tag.classList.remove('highlight');
          }
        });
      
        toggleGenerateMoviesButton(true);
      }
      
      
      function getselectedGenre() {
        // Removed redeclaration of selectedGenre array
        const tagsEl = document.getElementById('tags');
        const selectedTags = tagsEl.querySelectorAll('.tag.highlight'); // Changed from .tag.selected to .tag.highlight
      
        selectedTags.forEach(tag => {
          if (!selectedGenre.includes(tag.id)) {
            selectedGenre.push(tag.id);
          }
        });
      
        return selectedGenre;
      }

      async function fetchMovies(searchTerm, selectedGenre) {
        let url = `/api/movies?`;
      
        if (searchTerm) {
          url += `searchTerm=${encodeURIComponent(searchTerm)}`;
        } else if (selectedGenre) {
          url += `selectedGenre=${encodeURIComponent(selectedGenre.join(','))}`;
        }
      
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data.length > 0) {
            displayMovieList(data);
          } else {
            movieList.innerHTML = '<p>No movies found</p>';
          }
        } catch (error) {
          console.error('Error fetching movies:', error);
        }
      }
      
     
    function findMovies(event) {
  const searchTerm = event.target.value.trim();
  if (searchTerm.length > 0 || selectedGenre.length > 0) {
    searchList.classList.remove('hide-search-list');
    const genresParam = selectedGenre.join(",");
    fetchMovies(searchTerm, genresParam);
  } else {
    searchList.classList.add('hide-search-list');
  }
}

    function displayMovieList(movies){
      resultGrid.innerHTML = '';
        searchList.innerHTML = "";
        for(let idx = 0; idx < movies.length; idx++){
            let movieListItem = document.createElement('div');
            movieListItem.dataset.id = movies[idx].id;
            movieListItem.classList.add('search-list-item');

            let moviePoster = "";
            if (movies[idx].poster_path !== null) {
                moviePoster = `${IMG_PATH}${movies[idx].poster_path}`;
            } else {
                moviePoster = "image_not_found.png";
            }
            

            movieListItem.innerHTML = `
            <div class = "search-item-thumbnail">
                <img src = "${moviePoster}">
            </div>
            <div class = "search-item-info">
                <h3>${movies[idx].title}</h3>
                <p>${movies[idx].release_date.slice(0, 4)}</p>
            </div>
            `;
            searchList.appendChild(movieListItem);
        }
        loadMovieDetails();
    }
    

   // Get the details container element
const detailsContainer = document.querySelector('#details-container');

async function loadMovieDetails() {
  const searchListMovies = searchList.querySelectorAll('.search-list-item');
  searchListMovies.forEach(movie => {
    movie.addEventListener('click', async () => {
      const newUrl = `details.html?movieId=${movie.dataset.id}`;
      window.location.assign(newUrl);
      searchList.classList.add('hide-search-list');
      movieSearchBox.value = "";

      try {
        const movieDetails = await fetchMovieDetails(movie.dataset.id);

        displayMovieDetails(movieDetails);
      } catch (error) {
        console.error('Error fetching movie details:', error);
      }
    });
  });
}
      
   function getDirector(crew) {
        const director = crew.find(member => member.job === "Director");
        if(director) {
          return director.name;
        } else {
          return "N/A";
        }
    }

  function createMovieElement(movie) {
    const movieEl = document.createElement("div");
    movieEl.classList.add("movie");
  
    // Create movie image element
    const movieImg = document.createElement("img");
    movieImg.src = IMG_PATH + movie.poster_path;
    movieImg.alt = movie.title;
  
    // Create an anchor element and add movie image to it
  const movieAnchor = document.createElement("a");
  movieAnchor.href = `details.html?movieId=${movie.id}`;
  movieAnchor.appendChild(movieImg);

  // Add movie anchor to the movie element
  movieEl.appendChild(movieAnchor);

  // Create movie info element
    const movieInfo = document.createElement("div");
    movieInfo.classList.add("movie-info");
  
    // Create movie title element
    const movieTitle = document.createElement("h3");
    movieTitle.classList.add("movie-title");
    movieTitle.innerText = movie.title;
  
   // Add movie title to movie anchor element
  movieAnchor.appendChild(movieTitle);

  // Create favorite icon element
    const favoriteIcon = document.createElement("i");
    favoriteIcon.classList.add("favorite-icon", "fas", "fa-heart");
  
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    // Set movie ID as an attribute on the movie element
  movieEl.setAttribute("id", `movie-${movie.id}`);

  // Add movie object to movie element's dataset
  movieEl.dataset.movie = JSON.stringify(movie);
  
    // Add event listener to favorite icon
favoriteIcon.addEventListener("click", handleFavoriteIconClick);

// Add favorite icon to movie element
movieEl.appendChild(favoriteIcon);

// Create movie rating element
const movieRating = document.createElement("span");
movieRating.classList.add("movie-rating");
movieRating.innerText = movie.vote_average;

// Add movie rating to movie info element
movieInfo.appendChild(movieRating);

// Add movie rating to movie anchor element
movieAnchor.appendChild(movieRating);


    return movieEl;
  }
  

// Get the input element and attach an event listener for input
const actorInput = document.getElementById('actor-input');
if (actorInput) {
  actorInput.addEventListener('input', onActorInput);
}

let initialMovies = [];
// Callback function for input event on actorInput

async function onActorInput(event) {
  const query = event.target.value.trim();
  const generateMoviesBtn = document.getElementById("generate-movies-btn");
  if (query.length > 0) {

    try {
      const actors = await fetchActors(query);
      const actorNames = actors.map(actor => actor.name);
      showAutocompleteResults(actorNames, event);
      toggleGenerateMoviesButton(true);
    } catch (error) {
      console.error(error);
    }

  } else {
    hideAutocompleteResults();
    toggleGenerateMoviesButton(false);
  }
}

async function fetchActors(query) {
  const API_KEY = "3b9911169259873b40c7c8420d4a37ce";
  const SEARCH_ACTOR_URL = "https://api.themoviedb.org/3/search/person";
  const url = `${SEARCH_ACTOR_URL}?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;

  const res = await fetch(url);
  const data = await res.json();
  return data.results;
}

// Show autocomplete results for actor names
function showAutocompleteResults(actorNames, event) {
  const actorInput = document.getElementById('actor-input');
  const userInput = (event && event.target.value) ? event.target.value.toLowerCase() : '';

  if (userInput === '') {
    hideAutocompleteResults();
    return;
  }

  const matchingActors = [];

  // Find matching actors
  for (let actor of actorNames) {
    if (actor.toLowerCase().startsWith(userInput)) {
      matchingActors.push(actor);
    }
  }

  // Display matching actors
  const autocompleteList = document.querySelector('#autocomplete-list');
  const suggestions = autocompleteList.querySelector('.suggestions');
  suggestions.innerHTML = '';
  matchingActors.forEach(name => {
    const listItem = document.createElement('li');
    listItem.textContent = name;
    listItem.addEventListener('click', () => {
      actorInput.value = name;
      hideAutocompleteResults();
    });
    suggestions.appendChild(listItem);
  });
  if (matchingActors.length > 0) {
    suggestions.style.display = 'block';
  } else {
    suggestions.style.display = 'none';
  }
}

// Hide autocomplete results
function hideAutocompleteResults() {
  const autocompleteList = document.getElementById('autocomplete-list');
  const suggestions = autocompleteList.querySelector('.suggestions');
  if (suggestions) {
    suggestions.innerHTML = '';
  }
}

function generateMovies() {
  const actorInput = document.getElementById("actor-input");
  const actorName = actorInput.value.trim();
  const selectedGenres = getselectedGenre();
  displayMoviesByGenre(selectedGenres, actorName);
}

function toggleGenerateMoviesButton(show) {
  const generateMoviesBtn = document.getElementById("generate-movies-btn");
  const actorInput = document.getElementById("actor-input");
  const actorName = actorInput.value.trim();
  const selectedGenres = getselectedGenre();

  if (show && (actorName.length > 0 || selectedGenres.length > 0)) {
    generateMoviesBtn.style.display = "block";
    generateMoviesBtn.removeEventListener("click", generateMovies);
    generateMoviesBtn.addEventListener("click", generateMovies);
  } else {
    generateMoviesBtn.style.display = "none";
    generateMoviesBtn.removeEventListener("click", generateMovies);
  }
}

// Display movies by genre and actor
async function displayMoviesByGenre(genres, actorName = null, timestamp = null, attempt = 1) {
  const maxAttempts = 7;
  const page = Math.floor(Math.random() * 20) + 1;
  let apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&with_genres=${encodeURI(genres.join(','))}&page=${page}&include_adult=false`;

  if (actorName) {
    const actorSearchUrl = `https://api.themoviedb.org/3/search/person?api_key=${API_KEY}&query=${encodeURI(actorName)}`;
    try {
      const actorResponse = await fetch(actorSearchUrl);
      const actorData = await actorResponse.json();
      const actor = actorData.results[0];

      if (actor) {
        apiUrl += `&with_cast=${actor.id}`;
      } else {
        console.error("Actor not found");
        return;
      }
    } catch (error) {
      console.error("Error fetching actor:", error);
      return;
    }
  }

  if (timestamp) {
    apiUrl += `&release_date.lte=${timestamp}`;
  }

  try {
    const movieResponse = await fetch(apiUrl);
    const movieData = await movieResponse.json();
    let movies = movieData.results;

    // Filter out movies that were already shown
    movies = movies.filter(movie => !initialMovies.includes(movie.id));

    if (movies.length === 0 && attempt < maxAttempts) {
      // Retry fetching movies with a new random page
      return displayMoviesByGenre(genres, actorName, timestamp, attempt + 1);
    }

    if (movies.length === 0) {
      // No movies found after maxAttempts
      console.log("No movies found");
      return;
    }

    let movieContainer = document.createElement('div');

    // Loop through movies and add to movie container
    movies.forEach(movie => {
      const movieEl = createMovieElement(movie);
      movieContainer.appendChild(movieEl);
    });

    // Log movie names to console
    console.log(movies.map(movie => movie.title));

    // Remove previous movie container from page
    const previousMovieContainer = document.getElementById('movie-container');
    if (previousMovieContainer) {
      previousMovieContainer.remove();
    }

    // Add new movie container to page
    const movieDisplay = document.getElementById('movie-display');
    movieContainer.setAttribute('id', 'movie-container');
    movieDisplay.appendChild(movieContainer);
    
    // Save the current movie list state
    saveMovieListState();

    // Update initialMovies with the new set of movies
    initialMovies = initialMovies.concat(movies.map(movie => movie.id));

  } catch (error) {
    console.error("Error fetching movies:", error);
  }
}

function displayMovies() {
  const selectedGenres = selectedGenre;
  const selectedActor = document.getElementById('actor-input').value.trim();
  
  displayMoviesByGenre(selectedGenres, selectedActor);
}
      
window.addEventListener('click', (event) => {
    if(event.target.className != "form-control"){
        searchList.classList.add('hide-search-list');
    }
});

document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".favorite-section")) {
    displayFavoritesPage();
  }
});

function generateMoviesHandler() {
  const selectedActor = document.getElementById("actor-input").value.trim();
  const selectedGenre = getSelectedGenre();
  displayMovies(selectedActor, selectedGenre);
}

async function addToFavorites(movie) {
  // Add movieData to the server-side
  try {
    await fetchWithAuth("/api/user/favorites/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(movie)
    });
  } catch (error) {
    console.error("Error adding favorite:", error);
  }
  
  const movieId = movie.id;
  const movieEl = document.getElementById(`movie-${movieId}`);
  const favoriteIcon = movieEl.querySelector('.favorite-icon');
  const movieData = {
    id: movieId,
    title: movieEl.querySelector('.movie-title').innerText,
    imgSrc: movieEl.querySelector('img').src,
    actors: movie.actors,
    genres: movie.genres
  };
  
  let favorites = localStorage.getItem("favorites");

  if (favorites) {
    favorites = JSON.parse(favorites);
  } else {
    favorites = [];
  }

  if (!favorites.some(favorite => favorite.id === movieData.id)) {
    favorites.push(movieData);
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }

  // Change the icon class
  favoriteIcon.classList.remove('fa-heart');
  favoriteIcon.classList.add('fa-heart-broken');

  // Update the event listener
  favoriteIcon.removeEventListener('click', () => addToFavorites(movie));
  favoriteIcon.addEventListener('click', () => removeFromFavorites(movie));

  sessionStorage.setItem(`favorite-${movie.id}`, JSON.stringify(movie));
  
  // Change the icon class
  favoriteIcon.classList.remove('fa-heart');
  favoriteIcon.classList.add('fa-heart-broken');
}

async function removeFromFavorites(movie) {
  const movieEl = document.getElementById(`movie-${movie.id}`);
  const favoriteIcon = movieEl.querySelector(".favorite-icon");
  favoriteIcon.classList.remove("fa-heart-broken");
  favoriteIcon.classList.add("fa-heart");
  favoriteIcon.removeEventListener("click", () => removeFromFavorites(movie));
  favoriteIcon.addEventListener("click", () => addToFavorites(movie));

  try {
    await fetchWithAuth("/api/user/favorites/remove", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(movie)
    });
  } catch (error) {
    console.error("Error removing favorite:", error);
  }
  const favoriteGrid = document.getElementById("favorite-grid");
  favoriteGrid.removeChild(movieEl);
}


// Add this function to display favorite movies
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No token found");
  }

  options.headers = {
    ...options.headers,
    "Authorization": `Bearer ${token}`,
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error("Request failed: " + response.statusText);
  }

  return response.json();
}

async function displayFavorites() {
  try {
    const favorites = await fetchWithAuth("/api/user/favorites");
    const favoriteGrid = document.getElementById("favorite-grid");

    favoriteGrid.innerHTML = "";
    favorites.forEach((movie) => {
      const movieEl = createMovieElement(movie);
      const favoriteIcon = movieEl.querySelector(".favorite-icon");

      // Update the favorite icon class and event listener
      favoriteIcon.classList.remove("fa-heart");
      favoriteIcon.classList.add("fa-heart-broken");
      favoriteIcon.removeEventListener("click", () => addToFavorites(movie));
      favoriteIcon.addEventListener("click", () => removeFromFavorites(movie));

      // Append movie element to the favorite grid
      favoriteGrid.appendChild(movieEl);
    });

    // Add event listeners for remove buttons
    document.querySelectorAll(".remove-favorite-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const movie = favorites.find((fav) => fav.id === parseInt(btn.dataset.movieId, 10));
        removeFromFavorites(movie);
        displayFavorites();
      });
    });
  } catch (error) {
    if (error.message.includes("Unauthorized")) {
      console.error("Unauthorized access. Redirecting to login page.");
      // Redirect the user to the login page
      window.location.href = "/login.html";
    } else {
      console.error("Error fetching favorites:", error);
    }
  }
}

function displayFavoritesPage() {
  if (document.querySelector(".favorite-section")) {
    displayFavorites();
  }
}

// Add an event listener for the favorite button
const favoriteBtn = document.getElementById("favorite-btn");
if (favoriteBtn) {
  favoriteBtn.addEventListener("click", () => {
    const favoriteSection = document.querySelector(".favorite-section");
    favoriteSection.style.display = "block";
    displayFavorites();
  });
}

function saveMovieListState() {
  const movieContainer = document.getElementById('movie-container');
  sessionStorage.setItem('movieListHTML', movieContainer.innerHTML);
}

function restoreMovieListState() {
  const movieListHTML = sessionStorage.getItem('movieListHTML');
  const movieDisplay = document.getElementById('movie-display');

  // Check if the movie-display element exists
  if (!movieDisplay) {
    return; // Do nothing if the movie-display element doesn't exist
  }

  if (movieListHTML) {
    let movieContainer = document.getElementById('movie-container');
    
    // Create the movie-container element if it doesn't exist
    if (!movieContainer) {
      movieContainer = document.createElement('div');
      movieContainer.setAttribute('id', 'movie-container');
      movieDisplay.appendChild(movieContainer);
    }

    movieContainer.innerHTML = movieListHTML;
  }
}



function updateFavoriteButtons() {
  document.querySelectorAll(".favorite-icon").forEach((favoriteIcon) => {
    const movieEl = favoriteIcon.parentElement;
    const movieId = parseInt(movieEl.getAttribute("id").split("-")[1], 10);

    if (sessionStorage.getItem(`favorite-${movieId}`)) {
      // If the movie is in the sessionStorage, show it as a favorite
      favoriteIcon.classList.remove("fa-heart");
      favoriteIcon.classList.add("fa-heart-broken");
    } else {
      // If the movie is not in the sessionStorage, show it as not a favorite
      favoriteIcon.classList.remove("fa-heart-broken");
      favoriteIcon.classList.add("fa-heart");
    }
  });
}

updateFavoriteButtons();

function handleFavoriteIconClick(event) {
  const movieEl = event.currentTarget.parentElement;
  const movie = JSON.parse(movieEl.dataset.movie);
  const favoriteIcon = movieEl.querySelector(".favorite-icon");

  if (favoriteIcon.classList.contains("fa-heart")) {
    addToFavorites(movie);
  } else {
    removeFromFavorites(movie);
  }
}

window.addEventListener("popstate", () => {
  // Call restoreMovieListState to restore the movie list from sessionStorage
  restoreMovieListState();

  // Reattach favorite event listeners
  reattachFavoriteListeners();

  // Synchronize favorite buttons with the current favorites in sessionStorage
  synchronizeFavoriteButtons();
});




});
