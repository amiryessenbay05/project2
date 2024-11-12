const apiKey = "f1760c74251b421fbeed0891eb289629";

// Function to search for recipes based on user input
async function searchRecipes() {
    // Get the search query from the input field
    const searchQuery = document.getElementById("query").value;

    try {
        // Fetch recipes from the API using the search query
        const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=${searchQuery}`);
        const data = await response.json();

        const recipeList = document.getElementById("results");
        recipeList.innerHTML = ""; // Clear any previous results

        if (data.results.length === 0) {
            recipeList.innerHTML = "No recipes found";
        } else {
            data.results.forEach(recipe => {
                const recipeItem = document.createElement("div");
                recipeItem.className = "recipe-item";
                
                const recipeTitle = document.createElement("h3");
                recipeTitle.textContent = recipe.title;
                
                const recipeImage = document.createElement("img");
                recipeImage.src = recipe.image;
                recipeImage.alt = recipe.title;
                
                const recipeLink = document.createElement("a");
                recipeLink.href = "#";
                recipeLink.textContent = "View Recipe";
                recipeLink.onclick = async function () {
                    await showRecipeDetails(recipe.id); 
                };
                
                const favoriteButton = document.createElement("button");
                favoriteButton.textContent = "Add to Favorites";
                favoriteButton.onclick = () => toggleFavorite(recipe.title);
                
                // Append the elements to the recipe item
                recipeItem.appendChild(recipeImage);
                recipeItem.appendChild(recipeTitle);
                recipeItem.appendChild(recipeLink);
                recipeItem.appendChild(favoriteButton);

                recipeList.appendChild(recipeItem);
            });
        }
    } catch (error) {
        console.error("Error fetching recipes:", error);
    }
}

// Function to fetch and display detailed information about a recipe
async function showRecipeDetails(recipeId) {
    const recipeDetailsDiv = document.getElementById("recipe-details");
    const recipeContentDiv = document.getElementById("recipe-content");

    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}&includeNutrition=true`);
        const recipeData = await response.json();

    
        const ingredients = recipeData.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`).join('');
        const instructions = recipeData.analyzedInstructions[0]?.steps
            .map(step => `<li>${step.number}. ${step.step}</li>`).join('') || "No instructions available";
        const nutrition = recipeData.nutrition.nutrients.map(nutrient => 
            `<li>${nutrient.name}: ${nutrient.amount} ${nutrient.unit}</li>`).join('');

        // Display recipe content
        recipeContentDiv.innerHTML = `
            <h2>${recipeData.title}</h2>
            <img src="${recipeData.image}" alt="${recipeData.title}">
            <p><strong>Ready in:</strong> ${recipeData.readyInMinutes || "N/A"} minutes</p>
            <p><strong>Description:</strong> ${recipeData.summary || "No description available"}</p>
            <h3>Ingredients</h3>
            <ul>${ingredients}</ul>
            <h3>Instructions</h3>
            <ul>${instructions}</ul>
            <h3>Nutrition Information</h3>
            <ul>${nutrition}</ul>
        `;
        
        recipeDetailsDiv.style.display = "flex";
    } catch (error) {
        // Log any errors if the fetch request fails
        console.error("Error fetching recipe details:", error);
    }
}

// close the recipe details section
function closeRecipeDetails() {
    const recipeDetailsDiv = document.getElementById("recipe-details");
    recipeDetailsDiv.style.display = "none";
}

// autocomplete suggestions while typing in the search field
async function showSuggestions() {
    const query = document.getElementById("query").value;

    // Only show suggestions if the query length is greater than 1
    if (query.length < 2) {
        document.getElementById("suggestions").innerHTML = "";
        return;
    }

    try {
        // Fetch autocomplete suggestions from the API
        const response = await fetch(`https://api.spoonacular.com/recipes/autocomplete?apiKey=${apiKey}&query=${query}&number=5`);
        const suggestions = await response.json();

        const suggestionsDiv = document.getElementById("suggestions");
        suggestionsDiv.innerHTML = ""; // Clear previous suggestions

        // Display the suggestions as clickable items
        suggestions.forEach(suggestion => {
            const suggestionDiv = document.createElement("div");
            suggestionDiv.textContent = suggestion.title;
            suggestionDiv.onclick = () => selectSuggestion(suggestion.title);
            suggestionsDiv.appendChild(suggestionDiv);
        });
    } catch (error) {
        // Log any errors if the fetch request fails
        console.error("Error fetching suggestions:", error);
    }
}


function selectSuggestion(suggestion) {
    document.getElementById("query").value = suggestion; 
    document.getElementById("suggestions").innerHTML = ""; 
    searchRecipes(); 
}


document.addEventListener("click", function(event) {
    const suggestionsDiv = document.getElementById("suggestions");
    const queryInput = document.getElementById("query");

    if (!queryInput.contains(event.target) && !suggestionsDiv.contains(event.target)) {
        suggestionsDiv.innerHTML = ""; // Clear suggestions if clicking outside
    }
});

// Function to toggle a recipe as a favorite (add/remove)
function toggleFavorite(recipeTitle) {
    if (!recipeTitle) {
        alert("No recipe selected");
        return; // Exit if no recipe is selected
    }
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.includes(recipeTitle)) {
        favorites = favorites.filter(fav => fav !== recipeTitle);
        alert("Recipe removed from favorites");
    } else {
        favorites.push(recipeTitle);
        alert("Recipe added to favorites");
    }

    // Save the updated favorites list to localStorage
    localStorage.setItem("favorites", JSON.stringify(favorites));

    // Update the favorites display
    displayFavorites();
}

function displayFavorites() {
    const favoritesList = document.getElementById("favorites-list");
    favoritesList.innerHTML = ""; // Clear current favorites list

    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    // Display each favorite recipe with a remove button
    favorites.forEach(recipeTitle => {
        const recipeItem = document.createElement("li");
        recipeItem.textContent = recipeTitle;

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.onclick = () => removeFavorite(recipeTitle);

        recipeItem.appendChild(removeButton);
        favoritesList.appendChild(recipeItem);
    });
}

// Function to remove a recipe from the favorites list
function removeFavorite(recipeTitle) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites = favorites.filter(fav => fav !== recipeTitle); 

    
    localStorage.setItem("favorites", JSON.stringify(favorites));


    displayFavorites();
}


document.addEventListener("DOMContentLoaded", function() {
    displayFavorites();
});
