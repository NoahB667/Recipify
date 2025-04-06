document.getElementById("sendButton").addEventListener("click", async () => {
    const ingredients = document.getElementById("ingredients").value;
    const messagesDiv = document.getElementById("messages");

    // Show user message
    const userMessage = document.createElement("div");
    userMessage.className = "message user-message";
    userMessage.textContent = ingredients;
    messagesDiv.appendChild(userMessage);

    // Send to backend
    try {
        const res = await fetch("http://localhost:5000/api/recipe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ingredients })
          });
      
          const data = await res.json();
      
          const assistantMessage = document.createElement("div");
          assistantMessage.className = "message assistant-message";
      
          if (data.error) {
            assistantMessage.textContent = data.error;
          } else {
            assistantMessage.innerHTML = `
            <strong>${data.name}</strong> (${data.mealType?.[0] || "Meal"})<br>
            Cuisine: ${data.cuisineType?.[0] || "Unknown"}<br>
            Calories: ${Math.round(data.calories)}<br>
            <strong>Ingredients:</strong><br>
            <ul>${data.ingredients.map(item => `<li>${item}</li>`).join("")}</ul>
            <a href="${data.url}" target="_blank">View Full Recipe on ${data.source}</a><br>
            <img src="${data.image}" alt="Recipe image" style="max-width: 150px; margin-top: 10px;">
            `;
          }
      
          messagesDiv.appendChild(assistantMessage);
        } catch (error) {
          console.error(error);
        }});