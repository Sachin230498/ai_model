const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
const cors = require("cors"); // Import CORS package

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all origins

// Serve index.html from the root directory
app.get("/", (req, res) => {
  res.sendFile("here is nothing use netlify link");
});

app.post("/generate-notes", async (req, res) => {
  const { subject, gradeLevel, topic } = req.body;

  if (!subject || !gradeLevel || !topic) {
    return res
      .status(400)
      .json({ error: "Subject, grade level, and topic are required." });
  }

  const prompt = `Generate detailed notes on ${topic} for ${gradeLevel} ${subject} students.`;

  try {
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
    });

    // 🔍 Log the full API response
    console.log("Full API Response:", JSON.stringify(result, null, 2));

    // Extract the generated text
    const generatedNotes =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "No notes generated.";

    res.json({ notes: generatedNotes });
  } catch (error) {
    console.error("Error generating notes:", error);
    res.status(500).json({ error: "Failed to generate notes." });
  }
});

app.get("/list-models", async (req, res) => {
  try {
    const models = await genAI.getAvailableModels();
    res.json({ models });
  } catch (error) {
    console.error("Error listing models:", error);
    res.status(500).json({ error: "Failed to list models." });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
