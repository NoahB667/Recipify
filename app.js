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
  apiKey: process.env["GITHUB_TOKEN"]
});

app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

app.post("/api/recipe", async (req, res) => {
  const ingredients = req.body.ingredients;

  try {
    // Ask GPT for 3 recipe ideas
    const gptResponse = await client.chat.completions.create({
      messages: [
        { role: "user", content: `Suggest 3 recipes using ${ingredients}. Just list the names.` }
      ],
      model: "gpt-4o",
      temperature: 1
    });

    // Parse GPT output
    const recipes = gptResponse.choices[0].message.content
      .split("\n")
      .map(line => line.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);
    
    const selectedRecipe = recipes[0];

    // Search Edamam
    const edamamResponse = await axios.get("https://api.edamam.com/api/recipes/v2", {
      params: {
        type: "public",
        q: selectedRecipe,
        app_id: process.env.EDAMAM_APP_ID,
        app_key: process.env.EDAMAM_APP_KEY
      }
    });

    const hit = edamamResponse.data.hits[0];
    if (!hit) {
      return res.json({ error: "No matching recipe found." });
    }

    const recipe = hit.recipe;
    res.json({
      name: recipe.label,
      calories: recipe.calories,
      image: recipe.image,
      url: recipe.url,
      ingredients: recipe.ingredientLines,
      source: recipe.source,
      cuisineType: recipe.cuisineType,
      mealType: recipe.mealType
    });

  } catch (err) {
    console.error(err);
    res.json({ error: "Something went wrong." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});