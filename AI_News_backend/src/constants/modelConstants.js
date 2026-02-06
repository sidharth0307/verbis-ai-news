const AI_PROVIDERS = {
  GROQ: 'groq',
  OPENROUTER: 'openrouter',
  GOOGLE: 'google'
};

const TEXT_MODELS = {
  groq: [
    { label: "Llama 3.3 70B (High Quality)", value: "llama-3.3-70b-versatile" },
    { label: "Llama 3.1 8B (Fast)", value: "llama-3.1-8b-instant" }
  ],
  openrouter: [
    { label: "Gemini 2.0 Flash (Free)", value: "google/gemini-2.0-flash-001:free" },
    { label: "GPT-4o Mini", value: "openai/gpt-4o-mini" },
    { label: "Claude 3.5 Sonnet", value: "anthropic/claude-3.5-sonnet" },
    { label: "DeepSeek V3", value: "deepseek/deepseek-chat" }
  ],
  google: [
    { label: "Gemini 2.0 Flash (Fastest)", value: "gemini-2.0-flash" },
    { label: "Gemini 1.5 Pro (Smartest)", value: "gemini-1.5-pro" }
  ]
};

 const IMAGE_PROVIDERS = {
  CLOUDFLARE: 'cloudflare',
  OPENROUTER: 'openrouter',
  GOOGLE: 'google'
};

 const IMAGE_MODELS = {
  [IMAGE_PROVIDERS.CLOUDFLARE]: [
    { label: "SDXL Lightning (Fast/Free)", value: "@cf/bytedance/stable-diffusion-xl-lightning" },
    { label: "Flux.1 Schnell", value: "@cf/black-forest-labs/flux-1-schnell" }
  ],
  [IMAGE_PROVIDERS.OPENROUTER]: [
    { label: "OpenAI DALL-E 3", value: "openai/dall-e-3" },
    { label: "Stable Diffusion 3.5", value: "stabilityai/stable-diffusion-3.5-heavy" }
  ],
  [IMAGE_PROVIDERS.GOOGLE]: [
    { label: "Imagen 3 (High Fidelity)", value: "imagen-3" },
    { label: "Imagen 3 Fast", value: "imagen-3-fast" }
  ]
};

module.exports = { AI_PROVIDERS, TEXT_MODELS, IMAGE_PROVIDERS, IMAGE_MODELS };