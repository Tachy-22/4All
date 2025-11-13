import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  let body: any;
  let type: string = 'unknown';
  
  try {
    body = await request.json();
    const { prompt, context } = body;
    type = body.type || 'unknown';

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
        const userProfile = context?.userProfile;
        const userData = context?.mockData;
        const previousMessages = context?.previousMessages || [];
        
        systemPrompt = `You are Ziva, the friendly AI financial coach for 4All Banking in Nigeria.
        
        USER PROFILE:
        ${userProfile ? `
        - Language: ${userProfile.language}
        - Interaction Mode: ${userProfile.interactionMode}
        - UI Complexity: ${userProfile.uiComplexity}
        - Cognitive Score: ${userProfile.cognitiveScore}/10
        - Disabilities: ${userProfile.disabilities?.join(', ') || 'None'}
        - Accessibility Preferences: ${JSON.stringify(userProfile.accessibilityPreferences)}
        ` : 'Profile not available'}
        
        FINANCIAL CONTEXT:
        ${userData ? `
        - Current Balance: ₦${userData.currentBalance?.toLocaleString()}
        - Monthly Income: ₦${userData.monthlyIncome?.toLocaleString()}
        - Recent Spending: ${Object.entries(userData.recentSpending || {}).map(([category, amount]) => `${category}: ₦${(amount as number).toLocaleString()}`).join(', ')}
        ` : 'Financial data not available'}
        
        CONVERSATION CONTEXT:
        ${previousMessages.length > 0 ? `Recent conversation: ${previousMessages.map((m: any) => `${m.type}: ${m.content}`).join(' | ')}` : 'This is a new conversation'}
        
        INSTRUCTIONS:
        - Provide personalized, practical financial advice specific to Nigeria
        - Use Nigerian Naira (₦) in all financial examples
        - Consider Nigerian financial context (banking, investments, economy)
        - Adapt your communication style based on user's cognitive score and accessibility needs:
          * Cognitive score 1-3: Very simple language, short sentences, step-by-step instructions
          * Cognitive score 4-6: Clear explanations with some detail
          * Cognitive score 7-10: Comprehensive advice with multiple options
        - For users with disabilities, adjust format accordingly
        - Be encouraging, practical, and specific
        - Use real numbers from their financial data when giving advice
        - Keep responses under 150 words unless detailed explanation is needed
        - End with a helpful follow-up question or actionable next step`;
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
    switch (type) {
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
      case 'financial_coaching':
        fallbackResponse = "I'm currently unavailable, but here's some general advice: Focus on budgeting with the 50/30/20 rule - 50% for needs, 30% for wants, and 20% for savings. Start an emergency fund if you haven't already. Please try again later for personalized advice.";
        break;
      default:
        fallbackResponse = "I'm currently unavailable. Please try again later.";
    }

    return NextResponse.json({
      success: false,
      error: 'AI service temporarily unavailable',
      fallback: fallbackResponse
    }, { status: 200 }); // Return 200 with fallback instead of error
  }
}