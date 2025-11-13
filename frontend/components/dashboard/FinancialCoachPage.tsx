'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { useProfile, useInteractionMode, useUIComplexity } from '../../hooks/useProfile';
import { useVoice } from '../../hooks/useVoice';
import { useAdaptiveUI, useAdaptiveClasses } from '../../hooks/useAdaptiveUI';
import { ZivaAssistant } from '../ziva/ZivaAssistant';
import { 
  ArrowLeft,
  TrendingUp,
  Target,
  Lightbulb,
  Send,
  PiggyBank,
  CreditCard,
  Shield,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  Star,
  BookOpen,
  MessageCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface CoachMessage {
  id: string;
  type: 'user' | 'coach';
  content: string;
  timestamp: Date;
  category?: 'advice' | 'goal' | 'insight' | 'action';
}

interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: 'savings' | 'investment' | 'debt' | 'emergency';
  status: 'active' | 'completed' | 'paused';
}

interface CoachInsight {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'spending' | 'savings' | 'investment' | 'debt';
  actionable: boolean;
}

const mockGoals: FinancialGoal[] = [
  {
    id: '1',
    title: 'Emergency Fund',
    targetAmount: 500000,
    currentAmount: 180000,
    deadline: '2024-06-30',
    category: 'emergency',
    status: 'active'
  },
  {
    id: '2',
    title: 'New Car Down Payment',
    targetAmount: 300000,
    currentAmount: 85000,
    deadline: '2024-08-15',
    category: 'savings',
    status: 'active'
  },
  {
    id: '3',
    title: 'Investment Portfolio',
    targetAmount: 1000000,
    currentAmount: 250000,
    deadline: '2025-12-31',
    category: 'investment',
    status: 'active'
  }
];

const mockInsights: CoachInsight[] = [
  {
    id: '1',
    title: 'Reduce Dining Out Expenses',
    description: 'You spent ₦45,000 on dining out last month. Consider cooking at home 2 more days per week to save ₦18,000 monthly.',
    impact: 'high',
    category: 'spending',
    actionable: true
  },
  {
    id: '2',
    title: 'Optimize Savings Rate',
    description: 'Your current savings rate is 12%. Increasing to 15% would help you reach your emergency fund goal 2 months earlier.',
    impact: 'medium',
    category: 'savings',
    actionable: true
  },
  {
    id: '3',
    title: 'Investment Opportunity',
    description: 'Based on your risk profile, consider diversifying with government bonds for steady 8-12% returns.',
    impact: 'medium',
    category: 'investment',
    actionable: true
  }
];

export function FinancialCoachPage() {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const profile = useProfile();
  const interactionMode = useInteractionMode();
  const uiComplexity = useUIComplexity();
  const { speak } = useVoice();
  const adaptiveUI = useAdaptiveUI();
  const adaptiveClasses = useAdaptiveClasses();

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: CoachMessage = {
      id: '1',
      type: 'coach',
      content: uiComplexity === 'simplified' 
        ? "Hi! I'm your money coach. I help you save and spend better. What would you like to know?"
        : "Hello! I'm your AI Financial Coach. I analyze your spending patterns, help you set and achieve financial goals, and provide personalized money advice. How can I help you today?",
      timestamp: new Date(),
      category: 'advice'
    };

    setMessages([welcomeMessage]);
    setTimeout(() => speak(welcomeMessage.content), 1000);
  }, [speak, uiComplexity]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const getGoalProgress = (goal: FinancialGoal) => {
    return Math.round((goal.currentAmount / goal.targetAmount) * 100);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-danger';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-gray';
    }
  };

  const generateCoachResponse = async (userMessage: string): Promise<CoachMessage> => {
    try {
      // Get user profile for context
      const userProfile = profile ? {
        language: profile.language,
        interactionMode: profile.interactionMode,
        disabilities: profile.disabilities,
        cognitiveScore: profile.cognitiveScore,
        uiComplexity: profile.uiComplexity,
        accessibilityPreferences: profile.accessibilityPreferences
      } : null;

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'financial_coaching',
          prompt: userMessage,
          context: {
            userProfile,
            previousMessages: messages.slice(-5), // Last 5 messages for context
            mockData: {
              currentBalance: 254800.50,
              monthlyIncome: 254800,
              recentSpending: {
                groceries: 35000,
                dining: 25000,
                transport: 15000,
                utilities: 20000
              }
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Determine category based on content
      let category: CoachMessage['category'] = 'advice';
      const content = result.success ? result.data : result.fallback;
      const lowercaseContent = content.toLowerCase();
      
      if (lowercaseContent.includes('goal') || lowercaseContent.includes('target') || lowercaseContent.includes('save')) {
        category = 'goal';
      } else if (lowercaseContent.includes('insight') || lowercaseContent.includes('tip') || lowercaseContent.includes('strategy')) {
        category = 'insight';
      } else if (lowercaseContent.includes('action') || lowercaseContent.includes('step') || lowercaseContent.includes('plan')) {
        category = 'action';
      }

      return {
        id: Date.now().toString(),
        type: 'coach',
        content,
        timestamp: new Date(),
        category
      };
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback response
      const fallback = uiComplexity === 'simplified'
        ? "I can help with saving, spending, goals, and investing. What interests you most?"
        : "I'm here to help with all your financial questions! I can assist with budgeting, saving strategies, investment advice, debt management, and goal setting. What specific area would you like to explore?";
      
      return {
        id: Date.now().toString(),
        type: 'coach',
        content: fallback,
        timestamp: new Date(),
        category: 'advice'
      };
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: CoachMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Generate AI response
    setTimeout(async () => {
      try {
        const coachResponse = await generateCoachResponse(inputMessage);
        setMessages(prev => [...prev, coachResponse]);
        
        if (interactionMode === 'voice') {
          speak(coachResponse.content);
        }
      } catch (error) {
        console.error('Error generating coach response:', error);
      } finally {
        setIsTyping(false);
      }
    }, 1500);
  };

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
    setTimeout(() => handleSendMessage(), 100);
  };

  const renderChat = () => (
    <div className="space-y-6">
      <Card className={adaptiveClasses.card}>
        <ScrollArea className="h-96 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div className={cn(
                  'max-w-[80%] rounded-lg p-3',
                  adaptiveClasses.text,
                  message.type === 'user'
                    ? 'bg-primary-red text-white'
                    : 'bg-highlight-blue/10 text-text border'
                )}>
                  {message.type === 'coach' && (
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-highlight-blue" />
                      <span className="text-sm font-medium text-highlight-blue">
                        Financial Coach
                      </span>
                      {message.category && (
                        <Badge variant="outline" className="text-xs">
                          {message.category}
                        </Badge>
                      )}
                    </div>
                  )}
                  <p>{message.content}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-highlight-blue/10 rounded-lg p-3 border">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-highlight-blue rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-highlight-blue rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-highlight-blue rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        {[
          'How should I save money?',
          'Help me budget better',
          'Investment advice for beginners',
          'Set a savings goal'
        ].map((action, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction(action)}
            className={cn(adaptiveClasses.button, "text-xs h-auto p-2")}
          >
            {action}
          </Button>
        ))}
      </div>

      {/* Message Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Ask me anything about money..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
          className={cn(adaptiveClasses.input, "flex-1")}
          disabled={isTyping}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isTyping}
          className={cn(
            adaptiveClasses.button,
            "bg-primary-red text-white hover:bg-primary-red/90"
          )}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {interactionMode === 'voice' && (
        <Card className="p-4 bg-primary-red/5 border-primary-red">
          <p className={cn(adaptiveClasses.text, "text-sm text-primary-red")}>
            💡 Voice Tip: You can ask "How should I save for a car?" or "Help me invest ₦50,000"
          </p>
        </Card>
      )}
    </div>
  );

  const renderGoals = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className={cn(adaptiveClasses.text, "text-xl font-semibold text-text")}>
            Financial Goals
          </h3>
          <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
            Track your progress towards financial milestones
          </p>
        </div>
        <Button
          className={cn(
            adaptiveClasses.button,
            "bg-primary-red text-white hover:bg-primary-red/90"
          )}
        >
          <Target className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockGoals.map((goal) => {
          const progress = getGoalProgress(goal);
          const remaining = goal.targetAmount - goal.currentAmount;
          
          return (
            <Card
              key={goal.id}
              className={cn(
                adaptiveClasses.card,
                "cursor-pointer hover:shadow-lg transition-all duration-200",
                selectedGoal?.id === goal.id && "ring-2 ring-primary-red"
              )}
              onClick={() => setSelectedGoal(goal)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className={cn(adaptiveClasses.text, "font-medium text-text")}>
                    {goal.title}
                  </h4>
                  <Badge
                    className={cn(
                      "text-xs",
                      goal.category === 'emergency' && "bg-danger text-white",
                      goal.category === 'savings' && "bg-primary-red text-white",
                      goal.category === 'investment' && "bg-highlight-blue text-white"
                    )}
                  >
                    {goal.category}
                  </Badge>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{formatCurrency(goal.currentAmount)}</span>
                    <span>{formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="w-full bg-muted-gray/20 rounded-full h-2">
                    <div
                      className="bg-primary-red h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1 text-muted-gray">
                    <span>{progress}% complete</span>
                    <span>Due: {goal.deadline}</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
                    {formatCurrency(remaining)} remaining
                  </p>
                  {progress >= 100 ? (
                    <div className="flex items-center gap-1 text-success">
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-xs">Goal achieved!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-warning">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">In progress</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Goal Planning Assistant */}
      {uiComplexity !== 'simplified' && (
        <Card className={adaptiveClasses.card}>
          <h4 className={cn(adaptiveClasses.text, "font-semibold text-text mb-4")}>
            Smart Goal Planning
          </h4>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <PiggyBank className="w-8 h-8 text-primary-red mx-auto mb-2" />
              <h5 className={cn(adaptiveClasses.text, "font-medium text-text")}>Emergency Fund</h5>
              <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
                3-6 months of expenses (₦450,000 - ₦900,000)
              </p>
            </div>
            <div className="text-center">
              <DollarSign className="w-8 h-8 text-highlight-blue mx-auto mb-2" />
              <h5 className={cn(adaptiveClasses.text, "font-medium text-text")}>Investment</h5>
              <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
                Start with 10% of income (₦25,480 monthly)
              </p>
            </div>
            <div className="text-center">
              <Shield className="w-8 h-8 text-success mx-auto mb-2" />
              <h5 className={cn(adaptiveClasses.text, "font-medium text-text")}>Insurance</h5>
              <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
                Life & health coverage for financial security
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-6">
      <div>
        <h3 className={cn(adaptiveClasses.text, "text-xl font-semibold text-text")}>
          Financial Insights
        </h3>
        <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
          Personalized recommendations based on your spending patterns
        </p>
      </div>

      <div className="space-y-4">
        {mockInsights.map((insight) => (
          <Card key={insight.id} className={adaptiveClasses.card}>
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-2 rounded-lg",
                insight.impact === 'high' && "bg-danger/10",
                insight.impact === 'medium' && "bg-warning/10",
                insight.impact === 'low' && "bg-success/10"
              )}>
                <Lightbulb className={cn("w-5 h-5", getImpactColor(insight.impact))} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className={cn(adaptiveClasses.text, "font-medium text-text")}>
                    {insight.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn("text-xs", getImpactColor(insight.impact))}
                    >
                      {insight.impact} impact
                    </Badge>
                    {insight.actionable && (
                      <Badge className="text-xs bg-primary-red text-white">
                        Actionable
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray mb-3")}>
                  {insight.description}
                </p>
                
                {insight.actionable && (
                  <Button
                    size="sm"
                    className="bg-primary-red text-white hover:bg-primary-red/90"
                  >
                    Take Action
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Monthly Summary */}
      <Card className={adaptiveClasses.card}>
        <h4 className={cn(adaptiveClasses.text, "font-semibold text-text mb-4")}>
          This Month's Performance
        </h4>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-4 h-4 text-warning" />
              <span className={cn(adaptiveClasses.text, "text-2xl font-bold text-text")}>
                7.5
              </span>
              <span className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
                /10
              </span>
            </div>
            <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
              Financial Health Score
            </p>
          </div>
          
          <div className="text-center">
            <p className={cn(adaptiveClasses.text, "text-2xl font-bold text-success")}>
              18%
            </p>
            <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
              Savings Rate
            </p>
          </div>
          
          <div className="text-center">
            <p className={cn(adaptiveClasses.text, "text-2xl font-bold text-highlight-blue")}>
              ₦45,800
            </p>
            <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
              Money Saved
            </p>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-white">
      {/* Header */}
      <header className="bg-white border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-gray hover:text-text"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div>
            <h1 className={cn(adaptiveClasses.heading, "text-primary-red")}>
              Financial Coach
            </h1>
            <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
              Your personal AI-powered financial advisor
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={cn(
            "grid w-full",
            uiComplexity === 'simplified' ? 'grid-cols-2' : 'grid-cols-3'
          )}>
            <TabsTrigger value="chat">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="goals">
              <Target className="w-4 h-4 mr-2" />
              Goals
            </TabsTrigger>
            {uiComplexity !== 'simplified' && (
              <TabsTrigger value="insights">
                <Lightbulb className="w-4 h-4 mr-2" />
                Insights
              </TabsTrigger>
            )}
          </TabsList>

          <div className="mt-6">
            <TabsContent value="chat">{renderChat()}</TabsContent>
            <TabsContent value="goals">{renderGoals()}</TabsContent>
            {uiComplexity !== 'simplified' && (
              <TabsContent value="insights">{renderInsights()}</TabsContent>
            )}
          </div>
        </Tabs>
      </div>

      {/* Ziva Assistant */}
      <ZivaAssistant />
    </div>
  );
}