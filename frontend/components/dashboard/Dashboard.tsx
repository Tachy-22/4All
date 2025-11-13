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
  const { speak, transcript, startListening, stopListening, clearTranscript } = useVoice();
  const adaptiveUI = useAdaptiveUI();
  const adaptiveClasses = useAdaptiveClasses();

  // --- Generate greeting & start listening ---
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
    const fullGreeting = `${greetingText}${profile?.name ? `, ${profile.name}` : ' Jeffrey'}!`;
    setGreeting(fullGreeting);

    if (interactionMode === 'voice') {
      setTimeout(() => {
        speak(`${fullGreeting} Welcome to your 4All dashboard. Your current balance is ₦${mockData.balance.toLocaleString()}. What would you like to do today ? You can make a transfer, speak to the financial coach, or pay a bill!`);
      }, 500);

      // Start listening after greeting is done (rough delay)
      setTimeout(() => {
        startListening();
      }, 5000);
    }
  }, [language, profile?.name, interactionMode, speak, startListening]);

  // --- Voice commands ---
  useEffect(() => {
    if (!transcript || !interactionMode || interactionMode !== 'voice') return;
    const command = transcript.toLowerCase().trim();

    // Navigation commands
    if (command.includes('go home') || command.includes('return home') || command.includes('back to dashboard')) {
      speak('Taking you back to the dashboard.');
      clearTranscript();
      router.push('/dashboard');
      return;
    }

    if (command.includes('open settings') || command.includes('settings')) {
      speak('Opening settings.');
      clearTranscript();
      router.push('/dashboard/settings');
      return;
    }

    if (command.includes('transfer')) {
      speak('Opening transfers.');
      clearTranscript();
      router.push('/dashboard/transfer');
      return;
    }

    if (command.includes('bills') || command.includes('pay bills')) {
      speak('Opening bill payments.');
      clearTranscript();
      router.push('/dashboard/bills');
      return;
    }

    if (command.includes('sme') || command.includes('business tools')) {
      speak('Opening SME tools.');
      clearTranscript();
      router.push('/dashboard/sme');
      return;
    }

    if (command.includes('coach') || command.includes('financial coach')) {
      speak('Opening financial coach.');
      clearTranscript();
      router.push('/dashboard/coach');
      return;
    }

    if (command.includes('transaction') || command.includes('recent')) {
      speak('Opening your recent transactions.');
      clearTranscript();
      router.push('/dashboard/transactions');
      return;
    }

    // Balance visibility
    if (command.includes('hide balance')) {
      setBalanceVisible(false);
      speak('Balance hidden.');
      clearTranscript();
      return;
    }

    if (command.includes('show balance')) {
      setBalanceVisible(true);
      speak(`Your current balance is ₦${mockData.balance.toLocaleString()}.`);
      clearTranscript();
      return;
    }

  }, [transcript, interactionMode, router, speak, clearTranscript]);

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'pending') return <Clock className="w-4 h-4 text-warning" />;
    if (status === 'failed') return <AlertCircle className="w-4 h-4 text-danger" />;
    return <CheckCircle className="w-4 h-4 text-success" />;
  };
  const getTransactionColor = (type: string) => type === 'credit' ? 'text-success' : 'text-text';

  return (
    <div className="min-h-screen bg-bg-white">
      {/* Header */}
      <header className={cn(
        "bg-white border-b border-border p-4",
        adaptiveUI.layoutDensity === 'simplified' && "p-6",
        adaptiveUI.contrastMode === 'high' && "border-b-2"
      )}>
        <div className={cn(
          "max-w-7xl mx-auto flex justify-between items-center",
          adaptiveUI.layoutDensity === 'simplified' && "flex-col items-start space-y-4"
        )}>
          <div className={cn(adaptiveUI.layoutDensity === 'simplified' && "w-full")}>
            <h1 className={cn(
              adaptiveClasses.heading, 
              "text-primary-red",
              adaptiveUI.layoutDensity === 'simplified' && "text-3xl"
            )}>
              4All Banking
            </h1>
            <p className={cn(
              adaptiveClasses.text, 
              "text-muted-gray",
              adaptiveUI.layoutDensity === 'simplified' && "text-lg mt-1"
            )}>
              {greeting}
            </p>
          </div>

          <div className={cn(
            "flex items-center gap-4",
            adaptiveUI.layoutDensity === 'simplified' && "w-full flex-col space-y-3"
          )}>
            <Button
              variant="outline"
              size={adaptiveUI.layoutDensity === 'simplified' ? "lg" : "sm"}
              className={cn(
                "border-muted-gray text-muted-gray",
                adaptiveClasses.button,
                adaptiveUI.contrastMode === 'high' && "border-2",
                adaptiveUI.layoutDensity === 'simplified' && "w-full justify-center"
              )}
              onClick={() => {
                speak("Opening settings");
                router.push('/dashboard/settings');
              }}
            >
              <Settings className={cn(
                "mr-2",
                adaptiveUI.layoutDensity === 'simplified' ? "w-6 h-6" : "w-4 h-4"
              )} />
              Settings
            </Button>

            {adaptiveUI.showHelp && (
              <Badge 
                variant="outline" 
                className={cn(
                  adaptiveUI.layoutDensity === 'simplified' ? "text-sm px-3 py-1" : "text-xs",
                  adaptiveUI.contrastMode === 'high' && "border-2",
                  adaptiveUI.layoutDensity === 'simplified' && "w-full justify-center"
                )}
              >
                Assistance: ON
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className={cn(
        "max-w-7xl mx-auto p-4",
        adaptiveClasses.container,
        adaptiveUI.layoutDensity === 'simplified' && "p-6"
      )}>
        {/* Account Balance Card */}
        <Card className={cn(
          adaptiveClasses.card, 
          "bg-primary-red text-white",
          adaptiveUI.layoutDensity === 'simplified' && "p-8",
          adaptiveUI.contrastMode === 'high' && "border-4 border-white"
        )}>
          <div className={cn(
            "flex justify-between items-start",
            adaptiveUI.layoutDensity === 'simplified' && "flex-col space-y-4"
          )}>
            <div className={cn("flex-1", adaptiveUI.layoutDensity === 'simplified' && "w-full")}>
              <p className={cn(
                "text-white/80 mb-1",
                adaptiveClasses.text,
                adaptiveUI.layoutDensity === 'simplified' && "text-xl mb-2"
              )}>
                Available Balance
              </p>
              <div className={cn(
                "flex items-center gap-3",
                adaptiveUI.layoutDensity === 'simplified' && "flex-col items-start gap-4"
              )}>
                <span className={cn(
                  "font-bold",
                  adaptiveUI.layoutDensity === 'simplified' ? "text-5xl" : "text-3xl",
                  adaptiveClasses.heading
                )}>
                  {balanceVisible ? formatCurrency(mockData.balance) : '****'}
                </span>
                <Button
                  variant="ghost"
                  size={adaptiveUI.layoutDensity === 'simplified' ? "lg" : "sm"}
                  onClick={() => {
                    setBalanceVisible(!balanceVisible);
                    speak(balanceVisible ? 'Balance hidden' : 'Balance shown');
                  }}
                  className={cn(
                    "text-white hover:bg-white/20",
                    adaptiveClasses.button,
                    adaptiveUI.layoutDensity === 'simplified' && "min-w-[120px] h-14"
                  )}
                >
                  {balanceVisible ? (
                    <>
                      <EyeOff className={cn("w-4 h-4", adaptiveUI.layoutDensity === 'simplified' && "w-6 h-6 mr-2")} />
                      {adaptiveUI.layoutDensity === 'simplified' && "Hide"}
                    </>
                  ) : (
                    <>
                      <Eye className={cn("w-4 h-4", adaptiveUI.layoutDensity === 'simplified' && "w-6 h-6 mr-2")} />
                      {adaptiveUI.layoutDensity === 'simplified' && "Show"}
                    </>
                  )}
                </Button>
              </div>
              <p className={cn(
                "text-white/80",
                adaptiveClasses.text,
                adaptiveUI.layoutDensity === 'simplified' && "text-lg mt-2"
              )}>
                Account: {mockData.accountNumber}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size={adaptiveUI.layoutDensity === 'simplified' ? "lg" : "sm"} 
              className={cn(
                "text-white hover:bg-white/20",
                adaptiveClasses.button,
                adaptiveUI.layoutDensity === 'simplified' && "min-w-[120px] h-14"
              )}
            >
              <RefreshCw className={cn("w-4 h-4", adaptiveUI.layoutDensity === 'simplified' && "w-6 h-6 mr-2")} />
              {adaptiveUI.layoutDensity === 'simplified' && "Refresh"}
            </Button>
          </div>
        </Card>

        {/* Quick Actions */}
        <div>
          <h2 className={cn(adaptiveClasses.heading, "text-text mb-4")}>Quick Actions</h2>
          <div className={cn("grid gap-4", adaptiveUI.layoutDensity === 'simplified' ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 md:grid-cols-4")}>
            {mockData.quickActions.map((action) => (
              <Card
                key={action.id}
                className={cn(adaptiveClasses.card, "hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 bg-transparent border-0 shadow-none")}
                onClick={() => {
                  speak(`Opening ${action.title}`);
                  router.push(action.href);
                }}
                role="button"
                tabIndex={0}
              >
                <div className="text-center">
                  <action.icon className={cn("mx-auto mb-3 text-primary-red", adaptiveUI.layoutDensity === 'simplified' ? "w-12 h-12" : "w-8 h-8")} />
                  <h3 className={cn(adaptiveClasses.text, "font-medium text-text")}>{action.title}</h3>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className={cn(
            "flex justify-between items-center mb-4",
            adaptiveUI.layoutDensity === 'simplified' && "flex-col items-start space-y-3"
          )}>
            <h2 className={cn(adaptiveClasses.heading, "text-text")}>Recent Transactions</h2>
            <Button
              variant="outline"
              size={adaptiveUI.layoutDensity === 'simplified' ? "lg" : "sm"}
              className={cn(
                "text-primary-red border-primary-red hover:bg-primary-red/10",
                adaptiveClasses.button,
                adaptiveUI.contrastMode === 'high' && "border-2",
                adaptiveUI.layoutDensity === 'simplified' && "w-full justify-center"
              )}
              onClick={() => {
                speak("Opening transaction history");
                router.push('/dashboard/transactions');
              }}
            >
              View All
              {adaptiveUI.layoutDensity === 'simplified' && " Transactions"}
            </Button>
          </div>

          <div className={cn(
            adaptiveClasses.container,
            adaptiveUI.contentDensity === 'low' && "space-y-4",
            adaptiveUI.contentDensity === 'high' && "space-y-2"
          )}>
            {mockData.recentTransactions
              .slice(0, adaptiveUI.layoutDensity === 'simplified' ? 2 : 4)
              .map((transaction) => (
              <Card key={transaction.id} className={cn(
                adaptiveClasses.card, 
                "bg-white",
                adaptiveUI.contrastMode === 'high' && "border-2 border-text/20",
                adaptiveUI.layoutDensity === 'simplified' && "p-6"
              )}>
                <div className={cn(
                  "flex items-center justify-between",
                  adaptiveUI.layoutDensity === 'simplified' && "flex-col items-start space-y-4"
                )}>
                  <div className={cn(
                    "flex items-center gap-3",
                    adaptiveUI.layoutDensity === 'simplified' && "w-full"
                  )}>
                    {getTransactionIcon(transaction.type, transaction.status)}
                    <div className={cn("flex-1", adaptiveUI.layoutDensity === 'simplified' && "ml-2")}>
                      <p className={cn(
                        adaptiveClasses.text, 
                        "font-medium text-text",
                        adaptiveUI.layoutDensity === 'simplified' && "text-lg"
                      )}>
                        {transaction.description}
                      </p>
                      <p className={cn(
                        adaptiveClasses.text, 
                        "text-muted-gray",
                        adaptiveUI.layoutDensity === 'simplified' ? "text-base mt-1" : "text-sm"
                      )}>
                        {transaction.date} • {transaction.status}
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "text-right",
                    adaptiveUI.layoutDensity === 'simplified' && "w-full flex justify-between items-center"
                  )}>
                    <p className={cn(
                      adaptiveClasses.text, 
                      "font-medium", 
                      getTransactionColor(transaction.type),
                      adaptiveUI.layoutDensity === 'simplified' && "text-xl"
                    )}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <Badge
                      variant={transaction.status === 'completed' ? 'default' : 'outline'}
                      className={cn(
                        adaptiveUI.layoutDensity === 'simplified' ? "text-sm px-3 py-1" : "text-xs",
                        transaction.status === 'completed' && "bg-success text-white",
                        transaction.status === 'pending' && "bg-warning text-white",
                        transaction.status === 'failed' && "bg-danger text-white",
                        adaptiveUI.contrastMode === 'high' && "border-2"
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

        {adaptiveUI.showHelp && (
          <Card className={cn(
            adaptiveClasses.card, 
            "bg-highlight-blue/5 border-highlight-blue",
            adaptiveUI.contrastMode === 'high' && "border-2",
            adaptiveUI.layoutDensity === 'simplified' && "p-6"
          )}>
            <div className={cn(
              "flex items-start gap-3",
              adaptiveUI.layoutDensity === 'simplified' && "flex-col space-y-3"
            )}>
              <TrendingUp className={cn(
                "text-highlight-blue mt-1",
                adaptiveUI.layoutDensity === 'simplified' ? "w-8 h-8" : "w-5 h-5"
              )} />
              <div>
                <h3 className={cn(
                  adaptiveClasses.text, 
                  "font-medium text-highlight-blue mb-1",
                  adaptiveUI.layoutDensity === 'simplified' && "text-xl"
                )}>
                  Getting Started
                </h3>
                <p className={cn(
                  adaptiveClasses.text, 
                  "text-text",
                  adaptiveUI.layoutDensity === 'simplified' ? "text-base" : "text-sm"
                )}>
                  Try saying: "Check my balance", "Send money to Ada", or "Pay my bills"
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <ZivaAssistant />
    </div>
  );
}
