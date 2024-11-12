const apiKey = "bfa7290946e594d88656d31b3500a6de";
const URL = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=" + apiKey + "&page=1";
const imgURL = "https://image.tmdb.org/t/p/w1280";
const searchURL = "https://api.themoviedb.org/3/search/movie?&api_key=" + apiKey + "&query=";

const form = document.getElementById("search-form");
const query = document.getElementById("query");
const root = document.getElementById("root");
const favoritesList = document.createElement("div"); // Favorites container
favoritesList.className = "favorites";
document.querySelector(".search-block").appendChild(favoritesList);

let movies = [];
let page = 1;
let inSearchPage = false;
let favorites = []; // Array to hold favorite movies

// Fetch data from a given URL
async function fetchData(URL) {
    try {
        const data = await fetch(URL).then(res => res.json());
        return data;
    } catch (error) {
        console.log(error.message); // Error handling for failed fetch
        return null;
    }
}

// Fetch and display movie results
const fetchAndShowResults = async (URL) => {
    const data = await fetchData(URL);
    data && showResults(data.results); // Show results if data is not null
}

// Get a specific page of movies (pagination)
const getSpecificPage = (page) => {
    const URL = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${apiKey}&page=${page}`;
    fetchAndShowResults(URL);
}

// Create a movie card with title, image, and "Add to Favorites" button
const movieCard = (movie) => `
    <div class="col">
        <div class="card" onclick="showMovieDetails(${movie.id})">
            <img src="${movie.poster_path}" alt="${movie.original_title}" width="100%" />
            <div class="card-content">
                <h4>${movie.original_title}</h4>
                <button class="btn" onclick="addToFavorites('${movie.original_title}', event)">Add to Favorites</button>
            </div>
        </div>
    </div>`;

// Show the results of a search or discovery
const showResults = (items) => {
    let content = !inSearchPage ? root.innerHTML : "";
    if (items && items.length > 0) {
        items.forEach(item => {
            item.poster_path = item.poster_path ? imgURL + item.poster_path : "https://via.placeholder.com/150";
            content += movieCard(item);
        });
    } else {
        content += "<p>No results found</p>";
    }
    root.innerHTML = content;
}

// Add a movie to favorites, with a limit of 4 movies
function addToFavorites(movieTitle, event) {
    event.stopPropagation(); 
    if (favorites.length >= 4) {
        alert("You can only add up to 4 favorite movies.");
        return;
    }
    if (!favorites.includes(movieTitle)) {
        favorites.push(movieTitle); // Add movie to favorites
        updateFavoritesList();
    } else {
        alert("This movie is already in your favorites.");
    }
}

// Update the favorites list display
function updateFavoritesList() {
    favoritesList.innerHTML = "<h3>Favorites</h3>";
    favorites.forEach((title, index) => {
        favoritesList.innerHTML += `
            <p>${title} <button onclick="removeFromFavorites(${index})">Remove</button></p>
        `;
    });
}

// Remove a movie from favorites
function removeFromFavorites(index) {
    favorites.splice(index, 1); // Remove movie from array
    updateFavoritesList();
}

// Show detailed information of a selected movie in a modal
async function showMovieDetails(movieId) {
    const detailsURL = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`;
    const creditsURL = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`;
    const movieDetails = await fetchData(detailsURL);
    const movieCredits = await fetchData(creditsURL);
    
    if (!movieDetails || !movieCredits) return; 

    const { original_title, overview, vote_average, poster_path } = movieDetails;
    const actors = movieCredits.cast.slice(0, 5).map(actor => actor.name).join(", ");
    const movieDetailsHTML = `
        <div class="movie-details-modal">
            <div class="modal-content">
                <span class="close-btn" onclick="closeModal()">&times;</span>
                <img src="${poster_path ? imgURL + poster_path : 'https://via.placeholder.com/150'}" alt="${original_title}" />
                <h2>${original_title}</h2>
                <p><strong>Rating:</strong> ${vote_average}</p>
                <p><strong>Actors:</strong> ${actors}</p>
                <p><strong>Description:</strong> ${overview}</p>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', movieDetailsHTML);
}

// Close the movie details modal
function closeModal() {
    const modal = document.querySelector(".movie-details-modal");
    if (modal) {
        modal.remove(); // Remove modal from DOM
    }
}

// Search movies based on user input
form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent form submission
    inSearchPage = true;
    const searchTerm = query.value;
    searchTerm && fetchAndShowResults(searchURL + searchTerm); // Fetch results based on search term
    query.value = ""; 
});

// Infinite scrolling for loading more movies as user scrolls down
window.addEventListener("scroll", () => {
    let el = document.documentElement;
    if (!inSearchPage && el.scrollTop + el.clientHeight == el.scrollHeight) {
        getSpecificPage(++page); // Fetch next page of movies
    }
});

// Initialize the app by loading the first page of popular movies
function init() {
    inSearchPage = false;
    fetchAndShowResults(URL);
    updateFavoritesList();
}

init();





