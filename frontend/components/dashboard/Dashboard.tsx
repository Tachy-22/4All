'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useProfile, useLanguage, useInteractionMode } from '../../hooks/useProfile';
import { useVoice } from '../../hooks/useVoice';
import { useAdaptiveUI, useAdaptiveClasses } from '../../hooks/useAdaptiveUI';
import { ZivaAssistant } from '../ziva/ZivaAssistant';
import { 
  Wallet, 
  Send, 
  Receipt, 
  TrendingUp, 
  Building, 
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Mock data for demo
const mockData = {
  balance: 254800.50,
  accountNumber: '**** **** 4521',
  recentTransactions: [
    { id: 1, type: 'credit', amount: 15000, description: 'Salary Credit', date: '2024-01-10', status: 'completed' },
    { id: 2, type: 'debit', amount: 3500, description: 'Grocery Shopping', date: '2024-01-09', status: 'completed' },
    { id: 3, type: 'debit', amount: 12000, description: 'Rent Payment', date: '2024-01-08', status: 'pending' },
    { id: 4, type: 'credit', amount: 8500, description: 'Transfer from Ada', date: '2024-01-07', status: 'completed' }
  ],
  quickActions: [
    { id: 'transfer', icon: Send, title: 'Transfer', href: '/dashboard/transfer' },
    { id: 'bills', icon: Receipt, title: 'Pay Bills', href: '/dashboard/bills' },
    { id: 'sme', icon: Building, title: 'SME Tools', href: '/dashboard/sme' },
    { id: 'coach', icon: TrendingUp, title: 'Financial Coach', href: '/dashboard/coach' }
  ]
};

export function Dashboard() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [greeting, setGreeting] = useState('');
  
  const router = useRouter();
  const profile = useProfile();
  const language = useLanguage();
  const interactionMode = useInteractionMode();
  const { speak } = useVoice();
  const adaptiveUI = useAdaptiveUI();
  const adaptiveClasses = useAdaptiveClasses();

  // Generate greeting based on time and language
  useEffect(() => {
    const hour = new Date().getHours();
    let timeGreeting = '';
    
    if (hour < 12) timeGreeting = 'morning';
    else if (hour < 17) timeGreeting = 'afternoon';
    else timeGreeting = 'evening';

    const greetings: Record<string, Record<string, string>> = {
      en: {
        morning: 'Good morning',
        afternoon: 'Good afternoon',
        evening: 'Good evening'
      },
      pcm: {
        morning: 'Good morning',
        afternoon: 'Good afternoon', 
        evening: 'Good evening'
      }
    };

    const greetingText = greetings[language]?.[timeGreeting] || greetings.en[timeGreeting];
    const fullGreeting = `${greetingText}${profile?.name ? `, ${profile.name}` : ''}!`;
    
    setGreeting(fullGreeting);
    
    // Speak greeting if voice mode
    if (interactionMode === 'voice') {
      setTimeout(() => {
        speak(`${fullGreeting} Welcome to your 4All dashboard. Your current balance is ₦${mockData.balance.toLocaleString()}.`);
      }, 1000);
    }
  }, [language, profile?.name, interactionMode, speak]);

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'pending') return <Clock className="w-4 h-4 text-warning" />;
    if (status === 'failed') return <AlertCircle className="w-4 h-4 text-danger" />;
    return <CheckCircle className="w-4 h-4 text-success" />;
  };

  const getTransactionColor = (type: string) => {
    return type === 'credit' ? 'text-success' : 'text-text';
  };

  return (
    <div className="min-h-screen bg-bg-white">
      {/* Header */}
      <header className="bg-white border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className={cn(adaptiveClasses.heading, "text-primary-red")}>
              4All Banking
            </h1>
            <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
              {greeting}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="border-muted-gray text-muted-gray"
              onClick={() => {
                speak("Opening settings");
                router.push('/dashboard/settings');
              }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            
            {/* Accessibility controls toggle */}
            {adaptiveUI.showHelp && (
              <Badge variant="outline" className="text-xs">
                Assistance: ON
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Account Balance Card */}
        <Card className={cn(adaptiveClasses.card, "bg-primary-red text-white")}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/80 text-sm mb-1">Available Balance</p>
              <div className="flex items-center gap-3">
                <span className={cn("text-3xl font-bold", adaptiveUI.layoutDensity === 'simplified' && "text-4xl")}>
                  {balanceVisible ? formatCurrency(mockData.balance) : '****'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setBalanceVisible(!balanceVisible);
                    speak(balanceVisible ? 'Balance hidden' : 'Balance shown');
                  }}
                  className="text-white hover:bg-white/20"
                  aria-label={balanceVisible ? 'Hide balance' : 'Show balance'}
                >
                  {balanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-white/80 text-sm">Account: {mockData.accountNumber}</p>
            </div>
            
            <Button
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-white/20"
              aria-label="Refresh balance"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Quick Actions */}
        <div>
          <h2 className={cn(adaptiveClasses.heading, "text-text mb-4")}>
            Quick Actions
          </h2>
          <div className={cn(
            "grid gap-4",
            adaptiveUI.layoutDensity === 'simplified' ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 md:grid-cols-4"
          )}>
            {mockData.quickActions.map((action) => (
              <Card 
                key={action.id}
                className={cn(
                  adaptiveClasses.card,
                  "hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
                )}
                onClick={() => {
                  speak(`Opening ${action.title}`);
                  router.push(action.href);
                }}
                role="button"
                tabIndex={0}
                aria-label={`Open ${action.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    speak(`Opening ${action.title}`);
                    router.push(action.href);
                  }
                }}
              >
                <div className="text-center">
                  <action.icon className={cn(
                    "mx-auto mb-3 text-primary-red",
                    adaptiveUI.layoutDensity === 'simplified' ? "w-12 h-12" : "w-8 h-8"
                  )} />
                  <h3 className={cn(adaptiveClasses.text, "font-medium text-text")}>
                    {action.title}
                  </h3>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className={cn(adaptiveClasses.heading, "text-text")}>
              Recent Transactions
            </h2>
            <Button 
              variant="outline" 
              size="sm"
              className="text-primary-red border-primary-red hover:bg-primary-red/10"
              onClick={() => {
                speak("Opening transaction history");
                router.push('/dashboard/transactions');
              }}
            >
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {mockData.recentTransactions.map((transaction) => (
              <Card key={transaction.id} className={cn(adaptiveClasses.card, "bg-white")}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type, transaction.status)}
                    <div>
                      <p className={cn(adaptiveClasses.text, "font-medium text-text")}>
                        {transaction.description}
                      </p>
                      <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
                        {transaction.date} • {transaction.status}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={cn(
                      adaptiveClasses.text,
                      "font-medium",
                      getTransactionColor(transaction.type)
                    )}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <Badge 
                      variant={transaction.status === 'completed' ? 'default' : 'outline'}
                      className={cn(
                        "text-xs",
                        transaction.status === 'completed' && "bg-success text-white",
                        transaction.status === 'pending' && "bg-warning text-white",
                        transaction.status === 'failed' && "bg-danger text-white"
                      )}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Adaptive Help Section */}
        {adaptiveUI.showHelp && (
          <Card className={cn(adaptiveClasses.card, "bg-highlight-blue/5 border-highlight-blue")}>
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-highlight-blue mt-1" />
              <div>
                <h3 className={cn(adaptiveClasses.text, "font-medium text-highlight-blue mb-1")}>
                  Getting Started
                </h3>
                <p className={cn(adaptiveClasses.text, "text-sm text-text")}>
                  {interactionMode === 'voice' 
                    ? "Try saying: 'Check my balance', 'Send money to Ada', or 'Pay my bills'" 
                    : "Use the quick actions above or ask Ziva for help with any banking task"
                  }
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Ziva Assistant */}
      <ZivaAssistant />
    </div>
  );
}