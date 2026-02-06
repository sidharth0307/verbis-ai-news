require('dotenv').config();
const mongoose = require('mongoose');
const Settings = require('../models/settingsModel');

async function switchToGemini() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const settings = await Settings.findOne({ key: "model_config" });
        if (!settings) {
            console.log("No settings found! Creating default...");
            // Handle creation if needed, but unlikely
        } else {
            const geminiKey = process.env.GEMINI_API_KEY;
            if (!geminiKey) {
                console.error("GEMINI_API_KEY not found in .env");
                process.exit(1);
            }

            // Check if Gemini already exists
            const existing = settings.aiProviders.find(p => p.name === "Gemini");
            if (existing) {
                console.log("Gemini provider exists. Updating key...");
                existing.apiKey = geminiKey;
                // Ensure settings are correct
                existing.baseUrl = "https://generativelanguage.googleapis.com/v1beta/openai";
                existing.textModel = "gemini-1.5-flash";
                existing.payloadStructure = "openai";
            } else {
                console.log("Adding Gemini provider...");
                settings.aiProviders.push({
                    name: "Gemini",
                    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
                    apiKey: geminiKey,
                    payloadStructure: "openai",
                    textModel: "gemini-1.5-flash",
                    imageModel: "dall-e-3", // placeholder
                    authHeader: "Authorization"
                });
            }

            console.log("Switching Active Text Provider to Gemini...");
            settings.activeTextProvider = "Gemini";

            await settings.save();
            console.log("Settings updated successfully!");
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err);
    }
}

switchToGemini();
