import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, type, context } = body;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let systemPrompt = "";
    
    switch (type) {
      case 'cognitive_assessment':
        systemPrompt = `You are an AI assistant for 4All Banking, analyzing user responses to determine cognitive support needs.
        
        Analyze the following user responses and provide a cognitive score from 1-10 where:
        - 1-3: High cognitive support needed (simplified UI, fewer options, clear instructions)
        - 4-6: Moderate support (balanced interface, some guidance)
        - 7-10: Minimal support needed (can handle complex interfaces)
        
        Consider factors like response time, complexity of answers, hesitation patterns, and clarity.
        
        Return a JSON response with:
        {
          "cognitiveScore": number,
          "reasoning": "brief explanation",
          "recommendations": ["specific UI adaptations needed"]
        }`;
        break;
        
      case 'profile_generation':
        systemPrompt = `You are an AI assistant for 4All Banking, creating personalized banking profiles.
        
        Based on the user's disability information, cognitive assessment, and preferences, generate optimal accessibility settings.
        
        Consider:
        - Visual impairments: larger fonts, high contrast, screen reader support
        - Motor impairments: larger touch targets, voice navigation, reduced fine motor requirements
        - Cognitive impairments: simplified interface, clear language, reduced choices
        - Hearing impairments: visual alerts, captions, reduced audio dependency
        
        Return JSON with specific accessibility recommendations.`;
        break;
        
      case 'financial_coaching':
        systemPrompt = `You are Ziva, the friendly AI financial coach for 4All Banking.
        
        Provide personalized financial advice in simple, encouraging language.
        Consider the user's profile and accessibility needs when formatting your response.
        
        Use ELI5 (Explain Like I'm 5) approach for complex financial concepts.`;
        break;
        
      case 'ziva_conversation':
        systemPrompt = `You are Ziva, the AI assistant for 4All Banking.
        
        You help users with banking tasks using voice or text. Be friendly, clear, and accessible.
        
        Adapt your communication style based on the user's profile:
        - For cognitive support users: Use simple language, short sentences, confirm understanding
        - For visual impairments: Describe actions clearly, confirm what's happening
        - For hearing impairments: Use clear text, avoid audio-only information
        
        You can help with: transfers, bill payments, account balance, transaction history, financial advice.`;
        break;
        
      default:
        systemPrompt = "You are a helpful AI assistant for 4All Banking.";
    }

    const fullPrompt = `${systemPrompt}\n\nUser Context: ${JSON.stringify(context)}\n\nUser Input: ${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse as JSON for structured responses, fallback to text
    let responseData;
    try {
      responseData = JSON.parse(text);
    } catch {
      responseData = { response: text };
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      type: type
    });

  } catch (error: any) {
    console.error('Gemini API error:', error);
    
    // Fallback responses for different types
    let fallbackResponse;
    switch (body.type) {
      case 'cognitive_assessment':
        fallbackResponse = {
          cognitiveScore: 5,
          reasoning: "Unable to process assessment, using moderate support level",
          recommendations: ["Use balanced interface", "Provide clear instructions"]
        };
        break;
      case 'profile_generation':
        fallbackResponse = {
          profileOptimizations: {
            fontSize: "medium",
            contrast: "standard",
            voiceNavigation: true,
            touchTargetSize: "medium"
          },
          reasoning: "Using standard accessibility settings due to service unavailability"
        };
        break;
      default:
        fallbackResponse = { response: "I'm currently unavailable. Please try again later." };
    }

    return NextResponse.json({
      success: false,
      error: 'AI service temporarily unavailable',
      fallback: fallbackResponse
    }, { status: 200 }); // Return 200 with fallback instead of error
  }
}