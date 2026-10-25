import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { destination } = req.query;
  if (!destination) {
    return res.status(400).json({ error: "Destination query parameter is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: "Google Gemini API Key is missing on the server. Please configure GEMINI_API_KEY in Vercel environment variables." 
    });
  }

  // System instructions to enforce rigid formatting and high-quality cultural content
  const systemInstruction = `
    You are an expert cultural historian, storyteller, and local guide. Your task is to generate rich, immersive, and highly specific cultural, artisan, and culinary discovery data for the requested destination.
    
    You must output a single, raw, valid JSON object matching the exact structure below. Do not wrap the JSON in markdown code blocks, do not include backticks, do not add introductory or concluding text. Return only the JSON content.
    
    The JSON structure MUST conform precisely to:
    {
      "name": "The clean formatted name of the city/destination (e.g., 'Paris, France')",
      "location": "The region, state, or department (e.g., 'Île-de-France, France')",
      "coordinates": "Approximate GPS coordinates (e.g., '48.8566° N, 2.3522° E')",
      "tagline": "A premium, inspiring tagline summarizing the destination's cultural essence.",
      "rating": "4.8",
      "reviews": "150 reviews",
      "difficulty": "EASY", 
      "distance": "5.4 km",
      "duration": "1 Day",
      "altitude": "115 ft",
      "season": "Year-round",
      "cost": "Free/Varies",
      "costSuffix": "average entry",
      "image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80",
      "highlights": [
        "First specific cultural highlight description",
        "Second specific cultural highlight description",
        "Third specific cultural highlight description"
      ],
      "categories": {
        "History & Lore": {
          "title": "🏛️ Name of a specific, non-obvious historical site or local legend (e.g., 'The Whispers of Sainte-Chapelle')",
          "story": "A rich, detailed 2-3 paragraph history, folklore story, or municipal legend related to this place. Avoid generic tourist brochure facts; write something deep and authentic.",
          "witness": "What to look for or experience at the site (e.g., 'The Rose Window sunset alignment')",
          "directions": "Specific instructions on how to reach this spot locally.",
          "audioTitle": "A descriptive audio scene title (e.g., 'Stained Glass Reflections')",
          "audioScript": "An immersive, sensory-rich storytelling vignette script written in the first person. Include sound indicators in brackets, e.g., '[distant bells echoing]'. This text will be spoken out loud by the narrator.",
          "baseCost": 0,
          "costLabel": "Free entry / typical fee info",
          "accessibilityDetails": {
            "Standard": "Standard access paths description.",
            "Low-Walking": "Low-walking, resting benches information.",
            "Wheelchair/Stroller Accessible": "Step-free ramp entry details."
          }
        },
        "Culinary Roots": {
          "title": "🥢 Specific culinary tradition, local dish, or back-alley artisan master (e.g., 'The Sourdough Starter of Rue des Martyrs')",
          "story": "Deep history of this culinary craft, its connection to the geography, and why it is a living art form.",
          "witness": "What to taste or observe.",
          "directions": "Specific instructions to find the stall or master chef.",
          "audioTitle": "Sensory soundscape title.",
          "audioScript": "Sensory-rich first person storytelling vignette about baking or tasting. Include brackets sound cues.",
          "baseCost": 8,
          "costLabel": "$8 - $12 per loaf",
          "accessibilityDetails": {
            "Standard": "Details.",
            "Low-Walking": "Details.",
            "Wheelchair/Stroller Accessible": "Details."
          }
        }
      }
    }
    
    Ensure all text values are highly specific to \${destination}, naming authentic local landmarks, artisans, streets, and soundscapes. Do not output placeholders.
  `;

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    let model;
    try {
      model = ai.getGenerativeModel({ 
        model: "gemini-3.5-flash-lite",
        systemInstruction: systemInstruction 
      });
    } catch (e) {
      model = ai.getGenerativeModel({ 
        model: "gemini-3.5-flash",
        systemInstruction: systemInstruction 
      });
    }

    const prompt = `Generate cultural discovery data for: "${destination}"`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const cleanJsonText = responseText
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
      
    const parsedData = JSON.parse(cleanJsonText);
    parsedData.success = true;
    return res.status(200).json(parsedData);

  } catch (error) {
    console.error("Gemini API server execution error:", error);
    return res.status(500).json({ error: `GenAI Generation Failed: ${error.message}` });
  }
}
