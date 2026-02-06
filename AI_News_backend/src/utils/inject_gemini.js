const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Settings = require('../models/settingsModel');

async function injectGemini() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const geminiKey = process.env.GEMINI_API_KEY;
        if (!geminiKey) {
            console.error("GEMINI_API_KEY not found in .env");
            return;
        }
        console.log("Found Gemini Key in .env:", geminiKey.substring(0, 10) + "...");

        const settings = await Settings.findOne({ key: "model_config" });
        if (!settings) {
            console.log("Settings not found, cannot inject.");
            return;
        }

        // Construct valid Google/Gemini provider
        const googleProvider = {
            name: "Google AI Studio",
            baseUrl: "https://generativelanguage.googleapis.com/v1beta",
            apiKey: geminiKey,
            payloadStructure: "google", // matches my newsAI.service.js update
            textModel: "gemini-1.5-flash",
            availableTextModels: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"],
            fallbackTextModel: "gemini-1.5-flash",
            authHeader: "x-goog-api-key",
            authPrefix: "",
            category: "text"
        };

        // Remove any existing Google providers to avoid duplicates
        settings.aiProviders = settings.aiProviders.filter(p => !p.name.includes("Google") && !p.name.includes("Gemini"));

        // Add new provider
        settings.aiProviders.push(googleProvider);

        // Set Active
        settings.activeTextProvider = "Google AI Studio";

        await settings.save();
        console.log("SUCCESS: Injected Google AI Studio provider and set as active.");
        console.log("Active Provider:", settings.activeTextProvider);

    } catch (err) {
        console.error("Injection Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

injectGemini();
