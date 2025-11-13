import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('WARNING: GEMINI_API_KEY not set. AI features will use fallback logic.');
      this.genAI = null;
      this.model = null;
    } else {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  }

  /**
   * Generate adaptive profile settings using Gemini AI
   * @param {Object} userData - User onboarding data
   * @returns {Promise<Object>} - Adaptive profile recommendations
   */
  async generateAdaptiveProfile(userData) {
    const { language, disabilities, cognitiveScore, interactionMode, microInteractions } = userData;

    // If Gemini is not available, use fallback logic
    if (!this.model) {
      return this.fallbackProfileGeneration(userData);
    }

    try {
      const prompt = `You are an accessibility expert AI for an inclusive banking application.

User Profile Data:
- Language: ${language}
- Disabilities: ${disabilities?.join(', ') || 'none'}
- Cognitive Score: ${cognitiveScore}/10 (1=low, 10=high)
- Preferred Interaction: ${interactionMode}
- Micro-interactions: ${JSON.stringify(microInteractions || {})}

Based on this profile, recommend optimal accessibility settings. Respond ONLY with a JSON object (no markdown, no explanation) with these exact fields:
{
  "uiComplexity": "simplified" | "moderate" | "detailed",
  "fontSize": 14-24,
  "contrast": "normal" | "high",
  "largeTargets": true | false,
  "confirmMode": "pin" | "voice" | "biometric",
  "ttsSpeed": 0.5-2.0,
  "captions": true | false,
  "reasoning": "brief explanation"
}

Guidelines:
- Visual impairment: fontSize >= 20, high contrast, large targets
- Motor impairment: voice confirm, large targets
- Cognitive impairment or score < 4: simplified UI, fontSize >= 18
- Hearing impairment: captions true, avoid voice confirm
- High cognitive score (>7): detailed UI, smaller fontSize (14-16)`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const aiRecommendations = JSON.parse(jsonMatch[0]);
        
        // Merge AI recommendations with base profile
        return {
          uiComplexity: aiRecommendations.uiComplexity || 'moderate',
          fontSize: Math.max(14, Math.min(24, aiRecommendations.fontSize || 16)),
          contrast: aiRecommendations.contrast || 'normal',
          largeTargets: aiRecommendations.largeTargets || false,
          confirmMode: aiRecommendations.confirmMode || 'pin',
          ttsSpeed: aiRecommendations.ttsSpeed || 1.0,
          captions: aiRecommendations.captions || disabilities?.includes('hearing') || false,
          aiReasoning: aiRecommendations.reasoning
        };
      }
      
      // If parsing fails, use fallback
      return this.fallbackProfileGeneration(userData);
      
    } catch (error) {
      console.error('Gemini AI error:', error.message);
      // Fallback to rule-based logic
      return this.fallbackProfileGeneration(userData);
    }
  }

  /**
   * Fallback profile generation using rule-based logic
   * This matches the exact logic from backend-requirements.md
   */
  fallbackProfileGeneration(userData) {
    const { disabilities = [], cognitiveScore = 5 } = userData;
    
    let uiComplexity = 'moderate';
    let fontSize = 16;
    let contrast = 'normal';
    let confirmMode = 'pin';
    let largeTargets = false;
    
    // Cognitive-based adaptations
    if (disabilities.includes('cognitive') || cognitiveScore < 4) {
      uiComplexity = 'simplified';
      fontSize = 18;
    } else if (cognitiveScore > 7) {
      uiComplexity = 'detailed';
      fontSize = 14;
    }
    
    // Visual impairment adaptations
    if (disabilities.includes('visual')) {
      fontSize = Math.max(fontSize, 20);
      contrast = 'high';
      largeTargets = true;
    }
    
    // Motor impairment adaptations  
    if (disabilities.includes('motor')) {
      confirmMode = 'voice';
      largeTargets = true;
    }
    
    // Hearing impairment adaptations
    if (disabilities.includes('hearing')) {
      if (confirmMode === 'voice') confirmMode = 'pin';
    }
    
    return {
      uiComplexity,
      fontSize,
      contrast,
      largeTargets,
      confirmMode,
      ttsSpeed: 1.0,
      captions: disabilities.includes('hearing'),
      aiReasoning: 'Generated using rule-based fallback logic'
    };
  }
}

// Export singleton instance
const geminiService = new GeminiService();
export default geminiService;

