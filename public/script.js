document.getElementById("sendButton").addEventListener("click", async () => {
    const ingredientsInput = document.getElementById("ingredients");
    const recipeCountInput = document.getElementById("recipeCount");
    const ingredients = ingredientsInput.value.trim(); // Trim whitespace
    const recipeCount = recipeCountInput.value; // Get recipe count value
    const messagesDiv = document.getElementById("messages");

    // Validate input
    if (!ingredients) {
        alert("Please enter some ingredients before sending.");
        return;
    }

    // Show user message
    const userMessage = document.createElement("div");
    userMessage.className = "message user-message";
    userMessage.textContent = `Ingredients: ${ingredients}, Number of Recipes: ${recipeCount}`;
    messagesDiv.appendChild(userMessage);

    // Scroll to the bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Clear input field
    ingredientsInput.value = "";

    // Show loading message
    const loadingMessage = document.createElement("div");
    loadingMessage.className = "message assistant-message";
    loadingMessage.textContent = "Fetching recipe suggestions...";
    messagesDiv.appendChild(loadingMessage);

    // Send to backend to get recipe suggestions
    try {
        const res = await fetch("http://localhost:5000/api/recipe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ingredients, recipeCount })
          });
      
          const data = await res.json();
          
          // Show recipe suggestions
          const assistantMessage = document.createElement("div");
          assistantMessage.className = "message assistant-message";
          assistantMessage.innerHTML = `
              <strong>Here are ${recipeCount} recipe suggestions:</strong><br>
              <ul>
                ${data.recipes.map((recipe, index) =>
                  `<li><button class="recipe-choice" data-recipe="${recipe}">${index + 1}. ${recipe}</button></li>`).join("")}
              </ul>
            `;
          messagesDiv.appendChild(assistantMessage);

          // Add event listeners to recipe choice buttons
          document.querySelectorAll(".recipe-choice").forEach((button) => {
            button.addEventListener("click", async (e) => {
                const recipeName = e.target.getAttribute("data-recipe");

                // Show loading message for recipe details
                const loadingDetailsMessage = document.createElement("div");
                loadingDetailsMessage.className = "message assistant-message";
                loadingDetailsMessage.textContent = `Fetching recipe details for "${recipeName}"...`;
                messagesDiv.appendChild(loadingDetailsMessage);

                // Fetch recipe details
                try {
                  const detailsRes = await fetch("http://localhost:5000/api/recipe/details", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ recipeName })
                  });

                  const detailsData = await detailsRes.json();

                  if (detailsData.error) {
                    throw new Error(detailsData.error);
                  } 
                
                  // Show recipe details
                  const recipeDetailsMessage = document.createElement("div");
                  recipeDetailsMessage.className = "message assistant-message";
                  recipeDetailsMessage.innerHTML = `
                    <strong>Recipe Details for ${recipeName}:</strong><br>
                    Cuisine: ${detailsData.cuisineType?.[0] || "Unknown"}<br>
                    Calories: ${Math.round(detailsData.calories)}<br><br>
                    <strong>Ingredients:</strong>
                    <ul>${detailsData.ingredients.map((item) => `<li>${item}</li>`).join("")}</ul>
                    <a href="${detailsData.url}" target="_blank">View Full Recipe on ${detailsData.source}</a><br>
                    <img src="${detailsData.image}" alt="Recipe image" style="max-width: 200px; margin-top: 10px;">
                  `;
                  messagesDiv.appendChild(recipeDetailsMessage);
                } catch (error) {
                  console.error("Error fetching recipe details:", error);

                  // Show error message for recipe details
                  const errorMessage = document.createElement("div");
                  errorMessage.className = "message assistant-message";
                  errorMessage.textContent = "Error fetching recipe details. Please try again later.";
                  messagesDiv.appendChild(errorMessage);
                }
              });
            });
            // Scroll to the bottom
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        } catch (error) {
          console.error("Error fetching recipe suggestions:", error);

          // Show error message for recipe suggestions
          const errorMessage = document.createElement("div");
          errorMessage.className = "message assistant-message";
          errorMessage.textContent = "Error fetching recipe suggestions. Please try again later.";
          messagesDiv.appendChild(errorMessage);

          // Scroll to the bottom
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    });