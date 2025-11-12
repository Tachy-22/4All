import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { language, disabilities, microInteractions, cognitiveScore } = body;

    // Mock profile detection logic - matches exact backend logic
    let uiComplexity: 'simplified' | 'moderate' | 'detailed' = 'moderate';
    let fontSize = 16;
    let contrast: 'normal' | 'high' = 'normal';
    let confirmMode: 'pin' | 'voice' | 'biometric' = 'pin';
    let largeTargets = false;

    // Cognitive-based adaptations (exact backend logic)
    if (disabilities?.includes('cognitive') || cognitiveScore < 4) {
      uiComplexity = 'simplified';
      fontSize = 18;
    } else if (cognitiveScore > 7) {
      uiComplexity = 'detailed';
      fontSize = 14;
    }

    // Visual impairment adaptations
    if (disabilities?.includes('visual')) {
      fontSize = Math.max(fontSize, 20);
      contrast = 'high';
      largeTargets = true;
    }

    // Motor impairment adaptations
    if (disabilities?.includes('motor')) {
      confirmMode = 'voice';
      largeTargets = true;
    }

    // Hearing impairment adaptations
    if (disabilities?.includes('hearing')) {
      if (confirmMode === 'voice') confirmMode = 'pin';
    }

    const response = {
      profileId: `p_${Date.now()}`,
      language,
      interactionMode: microInteractions?.preferVoice ? 'voice' : 'text',
      disabilities: disabilities || [],
      cognitiveScore,
      uiComplexity,
      accessibilityPreferences: {
        fontSize,
        contrast,
        ttsSpeed: 1.0,
        largeTargets,
        captions: disabilities?.includes('hearing') || false,
        font: 'inter'
      },
      confirmMode,
      isOnboardingComplete: false,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process profile detection' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Mock getting existing profile - matches backend structure
  return NextResponse.json({
    profileId: 'p_demo_123',
    name: 'Demo User',
    phone: '+2348012345678',
    language: 'en',
    interactionMode: 'voice',
    disabilities: ['visual'],
    cognitiveScore: 4,
    uiComplexity: 'simplified',
    accessibilityPreferences: {
      fontSize: 18,
      contrast: 'high',
      ttsSpeed: 1.0,
      largeTargets: true,
      captions: false,
      font: 'inter'
    },
    confirmMode: 'voice',
    isOnboardingComplete: true,
  });
}