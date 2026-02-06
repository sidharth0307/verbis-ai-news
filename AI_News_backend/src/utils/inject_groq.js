const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Settings = require('../models/settingsModel');

async function injectGroq() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const groqKey = process.env.GROQ_API_KEY;
        if (!groqKey) {
            console.error("GROQ_API_KEY not found in .env");
            return;
        }
        console.log("Found Groq Key in .env:", groqKey.substring(0, 10) + "...");

        const settings = await Settings.findOne({ key: "model_config" });
        if (!settings) {
            console.log("Settings not found, cannot inject.");
            return;
        }

        // Construct valid Groq provider
        const groqProvider = {
            name: "Groq",
            baseUrl: "https://api.groq.com/openai/v1",
            apiKey: groqKey,
            payloadStructure: "openai",
            textModel: "llama-3.3-70b-versatile",
            availableTextModels: [
                "llama-3.3-70b-versatile",
                "llama-3.1-8b-instant",
                "mixtral-8x7b-32768"
            ],
            fallbackTextModel: "llama-3.1-8b-instant",
            authHeader: "Authorization",
            authPrefix: "Bearer",
            category: "text"
        };

        // Remove any existing Groq providers to avoid duplicates (and my Gemini injection if desired, but I'll keep Gemini as option)
        settings.aiProviders = settings.aiProviders.filter(p => !p.name.includes("Groq"));

        // Add new provider
        settings.aiProviders.push(groqProvider);

        // Set Active
        settings.activeTextProvider = "Groq";

        await settings.save();
        console.log("SUCCESS: Injected Groq provider and set as active.");
        console.log("Active Provider:", settings.activeTextProvider);
        console.log("Key Used:", groqKey.substring(0, 10) + "...");

    } catch (err) {
        console.error("Injection Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

injectGroq();
