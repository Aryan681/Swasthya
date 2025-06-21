import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
import { getCache, setCache } from '../utils/cacheUtils.js';

// Check required env vars
if (!process.env.CF_ACCOUNT_ID || !process.env.CF_API_KEY) {
  throw new Error('Cloudflare API credentials missing in .env');
}
if (!process.env.HF_TOKEN) {
  throw new Error('Hugging Face API token missing in .env');
}

// Translation services configuration
const HUGGINGFACE_TRANSLATION_URL = 'https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M';
const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';
const NLLB_SRC_LANG = 'hat_Latn'; // Haitian Creole
const NLLB_TGT_LANG = 'eng_Latn'; // English

const AI_CONFIG = {
  CLOUDFLARE: {
    URL: `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/@cf/mistral/mistral-7b-instruct-v0.1`,
    TIMEOUT: 20000,
    HEADERS: {
      Authorization: `Bearer ${process.env.CF_API_KEY}`,
      'Content-Type': 'application/json'
    }
  }
};

// Helper to extract JSON from malformed responses
const extractJSON = (str) => {
  try {
    return JSON.parse(str);
  } catch {
    try {
      const match = str.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (match) return JSON.parse(match[1]);
      const jsonStart = str.indexOf('{');
      const jsonEnd = str.lastIndexOf('}') + 1;
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        return JSON.parse(str.slice(jsonStart, jsonEnd));
      }
    } catch (e) {
      throw new Error(`Failed to extract JSON: ${str.substring(0, 100)}...`);
    }
  }
  throw new Error('No valid JSON found in response');
};

// MyMemory translation function
async function translateWithMyMemory(text) {
  try {
    const response = await axios.get(MYMEMORY_API_URL, {
      params: {
        q: text,
        langpair: 'ht|en',
        de: process.env.MYMEMORY_EMAIL || 'your-email@example.com' // Required for free tier
      },
      timeout: 5000
    });
    
    if (response.data?.responseData?.translatedText) {
      return response.data.responseData.translatedText;
    }
    throw new Error('No translation found');
  } catch (error) {
    console.error('MyMemory translation failed:', error.message);
    throw error;
  }
}



export const handleTriage = async (req, res) => {
  try {
    // Handle both direct calls and batch processing
    const requestData = req.body.batch ? req.body.batch[0] : req.body;
    
    const { symptoms, language = 'en' } = requestData;
    
    if (!symptoms?.trim()) {
      return res.status(400).json({
        error: 'Symptoms required',
        details: 'Please provide symptoms as a non-empty string'
      });
    }

    if (!['ht', 'en'].includes(language)) {
      return res.status(400).json({
        error: 'Invalid language',
        details: 'Supported languages: en, ht'
      });
    }

    const cacheKey = `triage:${language}:${symptoms.trim().toLowerCase()}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ ...cached, fromCache: true });
    }

    // Rest of your existing processing logic...
    let inputCreole = null;
    let inputEnglish = symptoms;
    let translationService = 'None';

    if (language === 'ht') {
      // Existing translation logic...
    }

    // Build AI prompt
    const messages = [
      {
        role: 'system',
        content: `You are a medical triage assistant. Return ONLY valid JSON with: { "condition": "suspected diagnosis", "urgency": "Low|Medium|High", "action": "concrete steps" }`
      },
      { role: 'user', content: `Symptoms: ${inputEnglish}` }
    ];

    // Call Cloudflare AI
    const response = await axios.post(
      AI_CONFIG.CLOUDFLARE.URL,
      { messages, max_tokens: 300 },
      {
        headers: AI_CONFIG.CLOUDFLARE.HEADERS,
        timeout: AI_CONFIG.CLOUDFLARE.TIMEOUT
      }
    );
    
    // Process response
    let triageData;
    let warning;
    try {
      triageData = extractJSON(response.data.result.response);
      if (!triageData.condition || !triageData.urgency || !triageData.action) {
        throw new Error('Invalid triage format');
      }
    } catch (jsonErr) {
      console.warn('AI response parsing failed:', jsonErr.message);
      triageData = {
        condition: 'Unknown (AI parsing failed)',
        urgency: 'Medium',
        action: 'Please consult a healthcare provider'
      };
      warning = 'AI response parsing failed - this is a fallback result';
    }

    const responseObj = {
      success: true,
      inputCreole,
      inputEnglish,
      triageResult: triageData,
      translationService,
      warning
    };

    await setCache(cacheKey, responseObj, 3600); // 1 hour TTL
    res.json({ ...responseObj, fromCache: false });

  } catch (error) {
    console.error('Triage error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Triage processing failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Helper functions remain the same...