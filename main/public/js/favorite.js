const IMG_PATH = "https://image.tmdb.org/t/p/w500/";

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


// Add this function to display favorite movies
async function displayFavorites() {
  const favoriteGrid = document.getElementById("favorite-grid");
  favoriteGrid.innerHTML = "";

  try {
    const response = await fetchWithAuth("/api/user/favorites");

    if (response.status === 401) {
      // If the user is not authenticated, redirect them to the login page
      window.location.href = "/html/login.html";
      return;
    }

    const favorites = await response.json();

    for (const movie of favorites) {
      // Fetch additional movie details to get the poster_path
      const detailsResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${movie.id}?api_key=3b9911169259873b40c7c8420d4a37ce`
      );
      const details = await detailsResponse.json();

      // Merge the movie details with the existing movie object
      Object.assign(movie, details);

      const movieEl = createMovieElement(movie);
      const favoriteIcon = movieEl.querySelector(".favorite-icon");

      // Update the favorite icon class and event listener
      favoriteIcon.classList.remove("fa-heart");
      favoriteIcon.classList.add("fa-heart-broken");
      favoriteIcon.removeEventListener("click", () => addToFavorites(movie));
      favoriteIcon.addEventListener("click", () => removeFromFavorites(movie));

      // Append movie element to the favorite grid
      favoriteGrid.appendChild(movieEl);
    }
  } catch (error) {
    console.error("Error fetching favorites:", error);
  }
}





function displayFavoritesPage() {
  if (document.querySelector(".favorite-section")) {
    displayFavorites();
  }
}


function createMovieElement(movie) {
  const movieEl = document.createElement("div");
  movieEl.classList.add("movie");

  // Create movie image element
  const movieImg = document.createElement("img");
  if (movie.poster_path) {
    movieImg.src = IMG_PATH + movie.poster_path;
  } else {
    movieImg.src = "image_not_found.png"; // Use a fallback image when the poster is not available
  }
  movieImg.alt = movie.title;

  // Create an anchor element and add movie image to it
  const movieAnchor = document.createElement("a");
  // Use movie.movieId if it's available, otherwise use movie.id
  const movieId = movie.movieId || movie.id;
  movieAnchor.href = `details.html?movieId=${movieId}`;
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
  favoriteIcon.addEventListener("click", () => addToFavorites(movie));

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

  // Add event listener to favorite icon
  favoriteIcon.addEventListener("click", handleFavoriteIconClick);

  return movieEl;
}

async function addToFavorites(movie) {
  const movieEl = createMovieElement(movie);
  const favoriteIcon = movieEl.querySelector(".favorite-icon");
  favoriteIcon.classList.remove("fa-heart");
  favoriteIcon.classList.add("fa-heart-broken");
  favoriteIcon.removeEventListener("click", () => addToFavorites(movie));
  favoriteIcon.addEventListener("click", () => removeFromFavorites(movie));

  try {
    await fetchWithAuth("/api/user/favorites/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      // Include genres and actors when calling the API endpoint
      body: JSON.stringify({
        movieId: movie.id, // <-- use movie.id instead of movie.movieId
        movieTitle: movie.title,
        genres: movie.genres,
        actors: movie.cast,
        poster_path: movie.poster_path, // <-- add this line to save the poster_path
      }),
    });
  } catch (error) {
    console.error("Error adding favorite:", error);
  }

  const favoriteGrid = document.getElementById("favorite-grid");
  favoriteGrid.appendChild(movieEl);
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

const favoriteBtn = document.getElementById("favorite-btn");
if (favoriteBtn) {
  favoriteBtn.addEventListener("click", displayFavoritesPage);
}
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".favorite-section")) {
    displayFavoritesPage();
  }
});
