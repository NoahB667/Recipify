import OpenAI from "openai";
import "dotenv/config";
import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// GPT-4o API Setup
const client = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env["GITHUB_TOKEN"],
});

app.post("/api/recipe", async (req, res) => {
  const ingredients = req.body.ingredients;

  // Validate ingredients input
  if (!ingredients || typeof ingredients !== "string" || ingredients.trim() === "") {
    return res.status(400).json({ error: "Invalid ingredients input. Please provide a comma-separated list of ingredients." });
  }

  try {
    // Suggest recipe names using GPT-4o
    const recipeNames = await suggestRecipeNames(ingredients);

    if (!recipeNames || recipeNames.length === 0) {
      return res.status(404).json({ error: "No recipe suggestions found for the given ingredients." });
    }

    // Get recipe details from Edamam API
    const recipe = await getRecipeDetails(recipeNames[0]);

    if (!recipe) {
      return res.status(404).json({ error: "No recipe details found for the suggested recipe." });
    }

    // Respond with recipe details
    res.json({
      name: recipe.label,
      calories: recipe.calories,
      image: recipe.image,
      url: recipe.url,
      ingredients: recipe.ingredientLines,
      source: recipe.source,
      cuisineType: recipe.cuisineType,
      mealType: recipe.mealType,
    });
    
  } catch (err) {
    console.error("Error processing recipe request:", err);
    res.status(500).json({ error: "Something went wrong while processing your request." });
  }
});

const suggestRecipeNames = async (ingredients) => {
  try {
    // Ask GPT-4o for 3 recipe ideas
    const gptResponse = await client.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Suggest 3 recipes using ${ingredients}. Just list the names.`,
        },
      ],
      model: "gpt-4o",
      temperature: 1,
    });

    // Parse GPT output
    const recipes = gptResponse.choices[0].message.content
      .split("\n")
      .map((line) => line.replace(/^\d+\.\s*/, "").trim());

    // Return recipes
    return recipes;
  } catch (err) {
    throw new Error("Could not suggest recipes:" + err);
  }
};

const getRecipeDetails = async (recipeName) => {
  try {
      // Search Edamam
    const edamamResponse = await axios.get(
      "https://api.edamam.com/api/recipes/v2",
      {
        params: {
          type: "public",
          q: recipeName,
          app_id: process.env.EDAMAM_APP_ID,
          app_key: process.env.EDAMAM_APP_KEY,
        },
      }
    );

    const hit = edamamResponse.data.hits[0];
    if (!hit) {
      return res.json({ error: "No matching recipe found." });
    }

    return hit.recipe;
 
  } catch (err) {
    throw new Error("Could not retrieve recipe details:" + err);
  }
}

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
