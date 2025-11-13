'use client';

import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useVoice } from '../../hooks/useVoice';
import { useAdaptiveClasses } from '../../hooks/useAdaptiveUI';
import { ChevronRight, ChevronLeft, Brain, Clock, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface QuizQuestion {
  id: string;
  question: string;
  description: string;
  options: {
    id: string;
    text: string;
    weight: number; // 1-5 scale, higher means more cognitive support needed
  }[];
}

interface QuizResponse {
  questionId: string;
  optionId: string;
  weight: number;
  responseTime: number;
  hesitationCount: number;
}

interface NeurodivergentQuizProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (score: number, responses: QuizResponse[], recommendations: string[]) => void;
  language: string;
}

const questions: QuizQuestion[] = [
  {
    id: 'information_processing',
    question: 'When learning something new, what works best for you?',
    description: 'This helps us understand how you prefer to process information',
    options: [
      { id: 'step_by_step', text: 'Step-by-step instructions with simple language', weight: 4 },
      { id: 'visual_examples', text: 'Pictures and examples to show me how', weight: 3 },
      { id: 'try_myself', text: 'Let me try it myself and figure it out', weight: 1 },
      { id: 'detailed_explanation', text: 'Detailed explanation with all the options', weight: 2 }
    ]
  },
  {
    id: 'attention_focus',
    question: 'When using apps or websites, what usually happens?',
    description: 'This helps us design screens that work better for your attention style',
    options: [
      { id: 'easily_distracted', text: 'I get distracted by too many things on screen', weight: 5 },
      { id: 'need_reminders', text: 'I sometimes forget what I was doing', weight: 4 },
      { id: 'focus_well', text: 'I can focus fine if the design is clear', weight: 2 },
      { id: 'handle_complexity', text: 'I can handle complex screens with lots of options', weight: 1 }
    ]
  },
  {
    id: 'decision_making',
    question: 'When making choices (like picking from a menu), you prefer:',
    description: 'This helps us show you the right number of options at once',
    options: [
      { id: 'few_options', text: 'Just a few clear choices (2-3 options)', weight: 5 },
      { id: 'some_options', text: 'Some options (4-6 options)', weight: 3 },
      { id: 'many_options', text: 'Many options  (7+ options)', weight: 1 },
      { id: 'categories', text: 'Lots of options in groups', weight: 2 }
    ]
  }
];

const translations = {
  en: {
    title: 'Quick Style Quiz',
    subtitle: 'This helps us show the simplest, clearest layouts for you. Takes 30 seconds.',
    progress_label: 'Question {current} of {total}',
    continue: 'Continue',
    back: 'Back',
    finish: 'Finish Quiz',
    analyzing: 'Analyzing your responses...',
    complete_title: 'Quiz Complete!',
    complete_message: 'We\'ve personalized your interface based on your preferences.'
  },
  pcm: {
    title: 'Small Quiz',
    subtitle: 'This one go help us show you the best way wey go easy for you. E go take 30 seconds.',
    progress_label: 'Question {current} of {total}',
    continue: 'Continue',
    back: 'Back',
    finish: 'Finish Quiz',
    analyzing: 'We dey check your answers...',
    complete_title: 'Quiz Don Finish!',
    complete_message: 'We don adjust your app based on how you like am.'
  }
};

export function NeurodivergentQuiz({
  isOpen,
  onClose,
  onComplete,
  language = 'en'
}: NeurodivergentQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [hesitationCount, setHesitationCount] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const { speak, startListening, stopListening, transcript, clearTranscript, isListening } = useVoice();
  const adaptiveClasses = useAdaptiveClasses();
  const t = translations[language as keyof typeof translations] || translations.en;

  // Voice command processing
  useEffect(() => {
    if (transcript && transcript.trim()) {
      const command = transcript.toLowerCase();
      console.log('Quiz voice command:', command);

      const currentQ = questions[currentQuestion];
      if (!currentQ) return;

      // Option selection commands - map voice commands to options
      if (command.includes('step by step') || command.includes('simple') || command.includes('instructions')) {
        const option = currentQ.options.find(opt => opt.id === 'step_by_step');
        if (option) {
          handleOptionSelect(option.id);
          clearTranscript();
          return;
        }
      }

      if (command.includes('pictures') || command.includes('examples') || command.includes('visual') || command.includes('show me')) {
        const option = currentQ.options.find(opt => opt.id === 'visual_examples');
        if (option) {
          handleOptionSelect(option.id);
          clearTranscript();
          return;
        }
      }

      if (command.includes('try myself') || command.includes('figure it out') || command.includes('explore')) {
        const option = currentQ.options.find(opt => opt.id === 'try_myself');
        if (option) {
          handleOptionSelect(option.id);
          clearTranscript();
          return;
        }
      }

      if (command.includes('detailed') || command.includes('all options') || command.includes('explanation')) {
        const option = currentQ.options.find(opt => opt.id === 'detailed_explanation');
        if (option) {
          handleOptionSelect(option.id);
          clearTranscript();
          return;
        }
      }

      // Generic option selection by number
      if (command.includes('option 1') || command.includes('first') || command.includes('one')) {
        handleOptionSelect(currentQ.options[0].id);
        clearTranscript();
        return;
      }
      if (command.includes('option 2') || command.includes('second') || command.includes('two')) {
        if (currentQ.options[1]) {
          handleOptionSelect(currentQ.options[1].id);
          clearTranscript();
          return;
        }
      }
      if (command.includes('option 3') || command.includes('third') || command.includes('three')) {
        if (currentQ.options[2]) {
          handleOptionSelect(currentQ.options[2].id);
          clearTranscript();
          return;
        }
      }
      if (command.includes('option 4') || command.includes('fourth') || command.includes('four')) {
        if (currentQ.options[3]) {
          handleOptionSelect(currentQ.options[3].id);
          clearTranscript();
          return;
        }
      }

      // Navigation commands
      if (command.includes('continue') || command.includes('next') || command.includes('proceed')) {
        if (selectedOption) {
          handleNext();
          clearTranscript();
          return;
        }
      }

      if (command.includes('back') || command.includes('previous')) {
        if (currentQuestion > 0) {
          handleBack();
          clearTranscript();
          return;
        }
      }

      // Help command
      if (command.includes('help') || command.includes('what can i say')) {
        speak('You can say: Option 1, Option 2, Option 3, or Option 4 to select an answer. Or describe what you prefer like "step by step" or "pictures". Say Continue when ready, or Back to go back.');
        clearTranscript();
        return;
      }

      // If command not understood
      speak('I didn\'t understand. Try saying Option 1, 2, 3, or 4, or describe your preference. Say Help for more options.');
      clearTranscript();
    }
  }, [transcript, currentQuestion, selectedOption]);

  // Auto-announce question when it loads
  useEffect(() => {
    if (isOpen && currentQuestion < questions.length) {
      setQuestionStartTime(Date.now());
      setHesitationCount(0);
      setSelectedOption(null);

      // Read the question aloud and start listening
      const question = questions[currentQuestion];
      const optionsText = question.options
        .map((option, index) => `Option ${index + 1}: ${option.text}`)
        .join('. ');

      speak(`Question ${currentQuestion + 1} of ${questions.length}. ${question.question} ${question.description} Your options are: ${optionsText}. You can say the option number or describe your preference.`);
      setTimeout(() => {
        startListening();
      }, 5000); // Increased delay since we're reading more content
    }

    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, [currentQuestion, isOpen, speak, startListening, stopListening, isListening]);

  // Track hesitation (when user hovers over options without selecting)
  const handleOptionHover = () => {
    setHesitationCount(prev => prev + 1);
  };

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    const option = questions[currentQuestion].options.find(opt => opt.id === optionId);
    if (option) {
      speak(`${option.text}. Say continue to move to next question.`);
      // Automatically proceed to next question after a brief delay
      // setTimeout(() => {
      //   handleNext();
      //   clearTranscript();
      //   return;
      // }, 2000);
    }
  };

  const handleNext = () => {
    if (!selectedOption) return;

    const responseTime = Date.now() - questionStartTime;
    const option = questions[currentQuestion].options.find(opt => opt.id === selectedOption);

    if (option) {
      const response: QuizResponse = {
        questionId: questions[currentQuestion].id,
        optionId: selectedOption,
        weight: option.weight,
        responseTime,
        hesitationCount
      };

      setResponses(prev => [...prev, response]);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Quiz complete - analyze responses
      handleQuizComplete();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      // Remove the last response
      setResponses(prev => prev.slice(0, -1));
    }
  };

  const handleQuizComplete = async () => {
    setIsAnalyzing(true);
    speak('Analyzing your responses to personalize your experience...');

    // Calculate cognitive score and generate recommendations
    const finalResponses = [...responses];
    if (selectedOption) {
      const option = questions[currentQuestion].options.find(opt => opt.id === selectedOption);
      if (option) {
        finalResponses.push({
          questionId: questions[currentQuestion].id,
          optionId: selectedOption,
          weight: option.weight,
          responseTime: Date.now() - questionStartTime,
          hesitationCount
        });
      }
    }

    try {
      // Use Gemini AI for advanced scoring
      const analysisResponse = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'cognitive_assessment',
          prompt: 'Analyze the user responses for cognitive support needs',
          context: {
            responses: finalResponses,
            questions: questions,
            totalResponseTime: finalResponses.reduce((sum, r) => sum + r.responseTime, 0),
            totalHesitations: finalResponses.reduce((sum, r) => sum + r.hesitationCount, 0)
          }
        })
      });

      const aiResult = await analysisResponse.json();
      let score, recommendations;

      if (aiResult.success && aiResult.data.cognitiveScore) {
        score = aiResult.data.cognitiveScore;
        recommendations = aiResult.data.recommendations || [];
      } else {
        // Fallback scoring algorithm
        score = calculateLocalScore(finalResponses);
        recommendations = generateLocalRecommendations(score);
      }

      setShowCompletion(true);
      speak('Analysis complete! Your interface has been personalized. Wait a minute, setting up your dashboard !');

      setTimeout(() => {
        onComplete(score, finalResponses, recommendations);
      }, 2000);

    } catch (error) {
      console.error('Quiz analysis error:', error);

      // Fallback to local scoring
      const score = calculateLocalScore(finalResponses);
      const recommendations = generateLocalRecommendations(score);

      setShowCompletion(true);
      speak('Your preferences have been saved.');

      setTimeout(() => {
        onComplete(score, finalResponses, recommendations);
      }, 2000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Fallback scoring algorithm
  const calculateLocalScore = (responses: QuizResponse[]): number => {
    let totalWeight = 0;
    let maxPossibleWeight = 0;

    responses.forEach(response => {
      totalWeight += response.weight;
      maxPossibleWeight += 5; // Max weight per question

      // Factor in response time (longer = more support needed)
      if (response.responseTime > 10000) totalWeight += 0.5; // 10+ seconds
      if (response.responseTime > 20000) totalWeight += 0.5; // 20+ seconds

      // Factor in hesitation (more hesitation = more support needed)
      if (response.hesitationCount > 2) totalWeight += 0.5;
      if (response.hesitationCount > 5) totalWeight += 0.5;
    });

    // Convert to 1-10 scale (inverted - higher number = more support)
    const rawScore = (totalWeight / maxPossibleWeight) * 10;
    return Math.max(1, Math.min(10, Math.round(rawScore)));
  };

  // Generate local recommendations based on score
  const generateLocalRecommendations = (score: number): string[] => {
    if (score >= 7) {
      return [
        'Use simplified interface with fewer options',
        'Show clear step-by-step instructions',
        'Use larger text and buttons',
        'Minimize distractions and visual clutter',
        'Provide voice guidance for complex tasks'
      ];
    } else if (score >= 4) {
      return [
        'Use balanced interface with moderate complexity',
        'Provide helpful hints and guidance',
        'Organize options in clear categories',
        'Offer both voice and text options'
      ];
    } else {
      return [
        'Can handle detailed interfaces',
        'Show comprehensive options and controls',
        'Provide advanced features',
        'Minimal guidance needed'
      ];
    }
  };

  if (!isOpen) return null;

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50  w-screen">
      <Card className="w-screen max-w-screen bg-white">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="h-8 w-8 text-primary" />
              <h2 className={cn(adaptiveClasses.heading, "text-2xl font-semibold text-text")}>
                {t.title}
              </h2>
            </div>
            <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
              {t.subtitle}
            </p>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className={cn(adaptiveClasses.text, "text-muted-gray")}>
                  {t.progress_label
                    .replace('{current}', (currentQuestion + 1).toString())
                    .replace('{total}', questions.length.toString())}
                </span>
                <Clock className="h-4 w-4 text-muted-gray" />
              </div>
              <Progress value={progress} className="w-full h-2" />
            </div>
          </div>

          {isAnalyzing ? (
            /* Analysis State */
            <div className="text-center space-y-4 py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className={cn(adaptiveClasses.text, "text-text")}>
                {t.analyzing}
              </p>
            </div>
          ) : showCompletion ? (
            /* Completion State */
            <div className="text-center space-y-4 py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className={cn(adaptiveClasses.heading, "text-xl font-semibold text-text")}>
                {t.complete_title}
              </h3>
              <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
                {t.complete_message}
              </p>
            </div>
          ) : (
            /* Quiz Questions */
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className={cn(adaptiveClasses.text, "text-lg font-medium text-text")}>
                  {question.question}
                </h3>
                <p className={cn(adaptiveClasses.text, "text-muted-gray text-sm")}>
                  {question.description}
                </p>

                {/* Voice Control Status */}
                {transcript && isListening && (
                  <p className={cn(adaptiveClasses.text, "text-sm text-blue-600 mt-1")} aria-live="assertive">
                    <span className="sr-only">Voice input detected:</span>You said: "{transcript}"
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {question.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    onMouseEnter={handleOptionHover}
                    className={cn(
                      "w-full p- text-sm rounded-lg border-2 text-left transition-all",
                      adaptiveClasses.button,
                      selectedOption === option.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                        selectedOption === option.id
                          ? 'border-primary bg-primary'
                          : 'border-gray-300'
                      )}>
                        {selectedOption === option.id && (
                          <div className="w-3 h-3 rounded-full bg-white" />
                        )}
                      </div>
                      <span className={cn(adaptiveClasses.text, "text-text")}>
                        {option.text}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Voice Help */}
          {!isAnalyzing && !showCompletion && (
            <div className="text-center border-t pt-4">
              <p className={cn(adaptiveClasses.text, "text-xs text-muted-gray")}>
                💡 Voice commands: "Option 1-4", describe your preference, "Continue", "Back" | Say "Help" for assistance
              </p>
            </div>
          )}

          {/* Footer */}
          {!isAnalyzing && !showCompletion && (
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={currentQuestion > 0 ? handleBack : onClose}
                className={adaptiveClasses.button}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t.back}
              </Button>

              <Button
                onClick={handleNext}
                disabled={!selectedOption}
                className={cn(adaptiveClasses.button, "flex-1")}
              >
                {currentQuestion === questions.length - 1 ? t.finish : t.continue}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}