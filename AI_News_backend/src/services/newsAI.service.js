const axios = require("axios");
const settingsModel = require("../models/settingsModel");

async function callAI(messages) {
  const settings = await settingsModel.findOne({ key: "model_config" }).lean();

  // 1. Find the provider based on the NEW activeTextProvider field AND category 'text'
  const provider = settings.aiProviders.find(p => p.name === settings.activeTextProvider && p.category === 'text');
  if (!provider) throw new Error(`Active Text Provider '${settings.activeTextProvider}' not found in pool for category 'text'`);

  const { baseUrl, apiKey, textModel, authHeader, payloadStructure, metadata } = provider;

  // 2. DYNAMIC URL RESOLVER (Metadata Aware)
  let cleanBaseUrl = baseUrl.replace(/\/$/, "");

  // Handle Cloudflare {accountId} replacement if it exists in the metadata Map
  if (metadata && (metadata.accountId || metadata.get?.('accountId'))) {
    const accId = metadata.accountId || metadata.get('accountId');
    cleanBaseUrl = cleanBaseUrl.replace("{accountId}", accId);
  }

  // 3. PROTOCOL ROUTING
  let url = `${cleanBaseUrl}/chat/completions`;
  let body = {};

  // Initial headers setup (will be overridden/refined later)
  let headers = {
    "Content-Type": "application/json"
  };

  if (payloadStructure === "anthropic") {
    url = `${cleanBaseUrl}/messages`;
    headers["anthropic-version"] = "2023-06-01";
    body = {
      model: textModel,
      max_tokens: 4096,
      messages: messages.filter(m => m.role !== "system"),
      system: messages.find(m => m.role === "system")?.content || ""
    };
  } else if (payloadStructure === "custom") {
    // If you use Cloudflare Workers AI Text models, they use a different URL structure
    url = `${cleanBaseUrl}/${textModel}`;
    body = { messages };
  } else if (payloadStructure === "google") {
    // Native Google Gemini REST API
    url = `${cleanBaseUrl}/models/${textModel}:generateContent`;
    // Use header auth (x-goog-api-key) which is already in headers object due to logic above
    // delete headers[authHeader]; // Don't delete it!

    const systemElem = messages.find(m => m.role === "system");
    const userElem = messages.find(m => m.role === "user");

    // Construct prompt with system instruction if supported or concatenated
    // Gemini 1.5 supports system_instruction
    body = {
      contents: [{
        role: "user",
        parts: [{ text: userElem ? userElem.content : "" }]
      }],
      ...(systemElem && {
        system_instruction: {
          parts: [{ text: systemElem.content }]
        }
      }),
      generationConfig: {
        temperature: 0.7,
        ...(messages.some(m => m.content.toLowerCase().includes("json")) && {
          response_mime_type: "application/json"
        })
      }
    };

  } else {
    // OpenAI / OpenRouter / Groq Standard
    body = {
      model: textModel,
      messages,
      temperature: 0.7,
      ...(messages.some(m => m.content.toLowerCase().includes("json")) && {
        response_format: { type: "json_object" }
      })
    };
  }

  // console.log(`[AI DEBUG] Active Text Provider: ${settings.activeTextProvider}`);
  // console.log(`[AI DEBUG] Selected Provider: ${provider ? provider.name : 'None'} | Category: ${provider ? provider.category : 'N/A'}`);
  // console.log(`[AI DEBUG] Auth Header: ${authHeader}`);
  // console.log(`[AI DEBUG] API Key (First 10 chars): ${apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING'}`);

  // FIX: Robust Header Handling (Auto-correct "Bearer" to "Authorization")
  const finalAuthHeader = (authHeader === 'Bearer' || !authHeader) ? 'Authorization' : authHeader;

  // Update headers with authentication
  headers = {
    ...headers,
    [finalAuthHeader]: (finalAuthHeader === "Authorization" && !apiKey.startsWith('Bearer')) ? `Bearer ${apiKey}` : apiKey
  };

  try {
    // console.log(`[AI SERVICE] Calling URL: ${url}`); // DEBUG LOG
    const response = await axios.post(url, body, { headers });

    // 4. RESPONSE EXTRACTION
    let content = "";
    if (payloadStructure === "anthropic") {
      content = response.data.content[0].text;
    } else if (payloadStructure === "google") {
      content = response.data.candidates[0].content.parts[0].text;
    } else if (response.data.choices) {
      content = response.data.choices[0].message.content;
    } else if (response.data.result) {
      // Common for Cloudflare/Custom response structures
      content = response.data.result.response || response.data.result;
    }

    return { content, modelUsed: `${provider.name}/${textModel}` };
  } catch (error) {
    console.error("AI Error:", error.response?.data || error.message);
    throw new Error(`AI Synthesis Failed: ${error.message}`);
  }
}

exports.processNewsWithAI = async (content) => {
  if (!content || content.trim().length === 0) throw new Error("No content provided");

  const settings = await settingsModel.findOne({ key: "model_config" }).lean();
  const customPrompt = settings?.globalPrompt || "";

  const systemPrompt = `
    You are a Senior Investigative Journalist and Editor.
    Your task is to transform raw news into a comprehensive, long-form feature article.
    
    ${customPrompt}

    OUTPUT REQUIREMENTS:
    1. "title": Create a new, click-worthy, SEO-optimized headline that is different from the original.
    2. "rewrittenContent": Must be at least 800-1000 words. 
       - Structure with multiple markdown subheadings (##, ###).
       - Include bullet points for readability.
       - Provide historical context and future implications.
    3. "summary": A compelling 4-5 line executive summary for meta descriptions.
    4. "seoKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"] (Exactly 5 strings).

    STRICT FORMATTING: 
  - Output ONLY valid JSON.
  - Do NOT use markdown code blocks.
  - If you use double quotes inside the content, you MUST use their Unicode escape sequence (\u0022) or simply use single quotes (') to avoid breaking the JSON structure.

    JSON STRUCTURE:
    {
      "title": "string",
      "rewrittenContent": "string",
      "summary": "string",
      "seoKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
    }
`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Raw News Data: ${content}` }
  ];

  const { content: raw, modelUsed } = await callAI(messages);

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI failed to return a JSON object");
  const cleanJson = jsonMatch[0];
  const parsed = JSON.parse(cleanJson);

  return {
    title: parsed.title,
    rewrittenContent: parsed.rewrittenContent,
    summary: parsed.summary,
    seoKeywords: parsed.seoKeywords,
    modelUsed: modelUsed,
  };
};