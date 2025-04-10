document.getElementById("sendButton").addEventListener("click", async () => {
    const ingredientsInput = document.getElementById("ingredients");
    const ingredients = ingredientsInput.value.trim(); // Trim whitespace
    const messagesDiv = document.getElementById("messages");

    // Validate input
    if (!ingredients) {
        alert("Please enter some ingredients before sending.");
        return;
    }

    // Show user message
    const userMessage = document.createElement("div");
    userMessage.className = "message user-message";
    userMessage.textContent = ingredients;
    messagesDiv.appendChild(userMessage);


    // Clear input field
    ingredientsInput.value = "";

    // Send to backend
    try {
        const res = await fetch("http://localhost:5000/api/recipe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ingredients })
          });
      
          const data = await res.json();
          
          // Show assistant message
          const assistantMessage = document.createElement("div");
          assistantMessage.className = "message assistant-message";
      
          if (data.error) {
            assistantMessage.textContent = data.error;
          } else {
            assistantMessage.innerHTML = `
            <strong>${data.name}</strong> (${data.mealType?.[0] || "Meal"})<br>
            Cuisine: ${data.cuisineType?.[0] || "Unknown"}<br>
            Calories: ${Math.round(data.calories)}<br><br>
            <strong>Ingredients:</strong>
            <ul>${data.ingredients.map(item => `<li>${item}</li>`).join("")}</ul>
            <a href="${data.url}" target="_blank" >View Full Recipe on ${data.source}</a><br>
            <img src="${data.image}" alt="Recipe image" style="max-width: 400px; margin-top: 10px;">
            `;
          }
          
          messagesDiv.appendChild(assistantMessage);

        } catch (error) {
          console.error("Error fetching recipe:", error);

          // Show error message
          const errorMessage = document.createElement("div");
          errorMessage.className = "message assistant-message";
          errorMessage.textContent = "Error fetching recipe. Please try again later.";
          messagesDiv.appendChild(errorMessage);
        }
    });