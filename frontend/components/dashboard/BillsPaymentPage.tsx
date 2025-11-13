'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useProfile, useInteractionMode, useUIComplexity } from '../../hooks/useProfile';
import { useVoice } from '../../hooks/useVoice';
import { useAdaptiveUI, useAdaptiveClasses } from '../../hooks/useAdaptiveUI';
import { ZivaAssistant } from '../ziva/ZivaAssistant';
import { 
  ArrowLeft, 
  Receipt, 
  Zap, 
  Wifi, 
  Tv, 
  Phone,
  CheckCircle, 
  Clock,
  AlertCircle,
  CreditCard,
  Calendar,
  History
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface BillProvider {
  id: string;
  name: string;
  type: 'electricity' | 'data' | 'cable' | 'airtime';
  icon: any;
  color: string;
}

interface SavedBill {
  id: string;
  providerId: string;
  accountNumber: string;
  nickname: string;
  amount?: number;
  frequency?: 'weekly' | 'monthly' | 'quarterly';
}

interface PaymentData {
  provider: string;
  accountNumber: string;
  amount: string;
  paymentMethod: string;
  saveForLater: boolean;
  nickname?: string;
}

const billProviders: BillProvider[] = [
  { id: 'eko_disco', name: 'Eko Electricity', type: 'electricity', icon: Zap, color: 'text-yellow-600' },
  { id: 'ibadan_disco', name: 'Ibadan Electricity', type: 'electricity', icon: Zap, color: 'text-yellow-600' },
  { id: 'mtn', name: 'MTN', type: 'data', icon: Wifi, color: 'text-yellow-500' },
  { id: 'airtel', name: 'Airtel', type: 'data', icon: Wifi, color: 'text-red-500' },
  { id: 'glo', name: 'Glo', type: 'data', icon: Wifi, color: 'text-green-500' },
  { id: 'dstv', name: 'DSTV', type: 'cable', icon: Tv, color: 'text-blue-600' },
  { id: 'gotv', name: 'GOTV', type: 'cable', icon: Tv, color: 'text-purple-600' },
  { id: 'startimes', name: 'Startimes', type: 'cable', icon: Tv, color: 'text-orange-600' },
];

const mockSavedBills: SavedBill[] = [
  { id: '1', providerId: 'eko_disco', accountNumber: '1234567890', nickname: 'Home Electricity', amount: 5000, frequency: 'monthly' },
  { id: '2', providerId: 'mtn', accountNumber: '08091234567', nickname: 'My MTN Line', amount: 2000, frequency: 'weekly' },
  { id: '3', providerId: 'dstv', accountNumber: '1122334455', nickname: 'Family DSTV', amount: 8500, frequency: 'monthly' },
];

export function BillsPaymentPage() {
  const [currentStep, setCurrentStep] = useState<'select' | 'details' | 'confirm' | 'result'>('select');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [paymentData, setPaymentData] = useState<PaymentData>({
    provider: '',
    accountNumber: '',
    amount: '',
    paymentMethod: '',
    saveForLater: false,
    nickname: ''
  });
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('providers');

  const router = useRouter();
  const profile = useProfile();
  const interactionMode = useInteractionMode();
  const uiComplexity = useUIComplexity();
  const { speak } = useVoice();
  const adaptiveUI = useAdaptiveUI();
  const adaptiveClasses = useAdaptiveClasses();

  useEffect(() => {
    const message = uiComplexity === 'simplified' 
      ? "Welcome to bill payments. Choose a saved bill or select a new provider to pay."
      : "Welcome to bill payments. You can pay electricity, data, cable TV, or airtime bills. Choose from saved bills or add a new one.";
    setTimeout(() => speak(message), 1000);
  }, [speak, uiComplexity]);

  const validatePayment = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!paymentData.provider) newErrors.provider = 'Please select a provider';
    if (!paymentData.accountNumber) newErrors.accountNumber = 'Account number is required';
    if (!paymentData.amount) newErrors.amount = 'Amount is required';
    if (!paymentData.paymentMethod) newErrors.paymentMethod = 'Please select payment method';

    const amount = parseFloat(paymentData.amount);
    if (isNaN(amount) || amount <= 0) newErrors.amount = 'Enter a valid amount';
    if (amount > 100000) newErrors.amount = 'Maximum payment limit exceeded';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const processPayment = async () => {
    if (!validatePayment()) return;

    setIsProcessing(true);
    speak("Processing your bill payment. Please wait...");

    try {
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: paymentData.provider,
          accountNumber: paymentData.accountNumber,
          amount: paymentData.amount,
          saveForLater: paymentData.saveForLater,
          nickname: paymentData.nickname
        })
      });

      const result = await response.json();
      setPaymentResult(result);

      if (result.success) {
        const provider = billProviders.find(p => p.id === paymentData.provider);
        speak(`Bill payment successful! ₦${paymentData.amount} paid to ${provider?.name}.`);
        setCurrentStep('result');
      } else {
        speak("Payment failed. Please try again or contact support.");
        setCurrentStep('result');
      }
    } catch (error) {
      speak("Network error. Please check your connection and try again.");
      setPaymentResult({ success: false, error: 'Network error' });
      setCurrentStep('result');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectProvider = (providerId: string) => {
    setSelectedProvider(providerId);
    setPaymentData({...paymentData, provider: providerId});
    setCurrentStep('details');
    
    const provider = billProviders.find(p => p.id === providerId);
    speak(`Selected ${provider?.name}. Please enter your account details.`);
  };

  const selectSavedBill = (savedBill: SavedBill) => {
    const provider = billProviders.find(p => p.id === savedBill.providerId);
    setPaymentData({
      provider: savedBill.providerId,
      accountNumber: savedBill.accountNumber,
      amount: savedBill.amount?.toString() || '',
      paymentMethod: '',
      saveForLater: false,
      nickname: savedBill.nickname
    });
    setCurrentStep('details');
    speak(`Selected ${savedBill.nickname} for ${provider?.name}.`);
  };

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const renderProviderSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Receipt className="w-12 h-12 text-primary-red mx-auto mb-4" />
        <h2 className={cn(adaptiveClasses.heading, "text-2xl text-text mb-4")}>
          Pay Bills
        </h2>
        <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
          {uiComplexity === 'simplified' 
            ? "Choose what to pay for"
            : "Pay your electricity, data, cable TV, and airtime bills quickly and securely"
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="saved">Saved Bills</TabsTrigger>
          <TabsTrigger value="providers">All Providers</TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="space-y-4">
          {mockSavedBills.length > 0 ? (
            <div className="space-y-3">
              {mockSavedBills.map((bill) => {
                const provider = billProviders.find(p => p.id === bill.providerId);
                return (
                  <Card 
                    key={bill.id}
                    className={cn(
                      adaptiveClasses.card,
                      "cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                    )}
                    onClick={() => selectSavedBill(bill)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectSavedBill(bill);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {provider && <provider.icon className={cn("w-8 h-8", provider.color)} />}
                        <div>
                          <h3 className={cn(adaptiveClasses.text, "font-medium text-text")}>
                            {bill.nickname}
                          </h3>
                          <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
                            {provider?.name} • {bill.accountNumber}
                          </p>
                          {bill.amount && (
                            <p className={cn(adaptiveClasses.text, "text-sm text-primary-red")}>
                              {formatCurrency(bill.amount)} • {bill.frequency}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">
                        Quick Pay
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className={cn(adaptiveClasses.card, "text-center py-8")}>
              <Receipt className="w-12 h-12 text-muted-gray mx-auto mb-4" />
              <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
                No saved bills yet. Add one after making your first payment.
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {billProviders.map((provider) => (
              <Card 
                key={provider.id}
                className={cn(
                  adaptiveClasses.card,
                  "cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                )}
                onClick={() => selectProvider(provider.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectProvider(provider.id);
                  }
                }}
              >
                <div className="text-center">
                  <provider.icon className={cn("w-12 h-12 mx-auto mb-3", provider.color)} />
                  <h3 className={cn(adaptiveClasses.text, "font-medium text-text mb-1")}>
                    {provider.name}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {provider.type}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {interactionMode === 'voice' && (
        <Card className="p-4 bg-primary-red/5 border-primary-red">
          <p className={cn(adaptiveClasses.text, "text-sm text-primary-red")}>
            💡 Voice Tip: Say "Pay my electricity bill" or "Pay DSTV" to get started quickly
          </p>
        </Card>
      )}
    </div>
  );

  const renderPaymentDetails = () => {
    const provider = billProviders.find(p => p.id === paymentData.provider);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          {provider && <provider.icon className={cn("w-8 h-8", provider.color)} />}
          <div>
            <h2 className={cn(adaptiveClasses.heading, "text-xl text-text")}>
              {provider?.name}
            </h2>
            <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
              Enter your payment details
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="accountNumber" className={cn(adaptiveClasses.text, "font-medium")}>
              {provider?.type === 'airtime' ? 'Phone Number' : 'Account/Meter Number'} *
            </Label>
            <Input
              id="accountNumber"
              placeholder={provider?.type === 'airtime' ? '08012345678' : 'Enter account number'}
              value={paymentData.accountNumber}
              onChange={(e) => setPaymentData({...paymentData, accountNumber: e.target.value})}
              className={cn(adaptiveClasses.input, errors.accountNumber && "border-danger")}
            />
            {errors.accountNumber && (
              <p className="text-sm text-danger mt-1">{errors.accountNumber}</p>
            )}
          </div>

          <div>
            <Label htmlFor="amount" className={cn(adaptiveClasses.text, "font-medium")}>
              Amount *
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={paymentData.amount}
              onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
              className={cn(adaptiveClasses.input, errors.amount && "border-danger")}
            />
            {errors.amount && (
              <p className="text-sm text-danger mt-1">{errors.amount}</p>
            )}
          </div>

          <div>
            <Label className={cn(adaptiveClasses.text, "font-medium")}>
              Payment Method *
            </Label>
            <Select 
              value={paymentData.paymentMethod}
              onValueChange={(value) => setPaymentData({...paymentData, paymentMethod: value})}
            >
              <SelectTrigger className={cn(adaptiveClasses.input)}>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savings">Savings Account (₦254,800.50)</SelectItem>
                <SelectItem value="current">Current Account (₦125,600.30)</SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <p className="text-sm text-danger mt-1">{errors.paymentMethod}</p>
            )}
          </div>

          {uiComplexity !== 'simplified' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="saveForLater"
                  checked={paymentData.saveForLater}
                  onChange={(e) => setPaymentData({...paymentData, saveForLater: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="saveForLater" className={cn(adaptiveClasses.text, "text-sm")}>
                  Save this bill for quick payments
                </Label>
              </div>

              {paymentData.saveForLater && (
                <Input
                  placeholder="Give this bill a nickname (e.g., 'Home Electricity')"
                  value={paymentData.nickname}
                  onChange={(e) => setPaymentData({...paymentData, nickname: e.target.value})}
                  className={adaptiveClasses.input}
                />
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentStep('select')}
            className={cn(adaptiveClasses.button, "flex-1")}
          >
            Back
          </Button>
          <Button
            onClick={() => setCurrentStep('confirm')}
            disabled={!validatePayment()}
            className={cn(
              adaptiveClasses.button,
              "flex-1 bg-primary-red text-white hover:bg-primary-red/90"
            )}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  };

  const renderConfirmation = () => {
    const provider = billProviders.find(p => p.id === paymentData.provider);
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <CreditCard className="w-12 h-12 text-primary-red mx-auto mb-4" />
          <h2 className={cn(adaptiveClasses.heading, "text-xl text-text")}>
            Confirm Payment
          </h2>
          <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
            Review your bill payment details
          </p>
        </div>

        <Card className={cn(adaptiveClasses.card, "bg-bg-white")}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={cn(adaptiveClasses.text, "text-muted-gray")}>Provider</span>
              <div className="flex items-center gap-2">
                {provider && <provider.icon className={cn("w-4 h-4", provider.color)} />}
                <span className={cn(adaptiveClasses.text, "font-medium")}>{provider?.name}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className={cn(adaptiveClasses.text, "text-muted-gray")}>Account</span>
              <span className={cn(adaptiveClasses.text, "font-medium")}>{paymentData.accountNumber}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className={cn(adaptiveClasses.text, "text-muted-gray")}>Amount</span>
              <span className={cn(adaptiveClasses.text, "text-2xl font-bold text-primary-red")}>
                {formatCurrency(parseFloat(paymentData.amount))}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className={cn(adaptiveClasses.text, "text-muted-gray")}>Payment Method</span>
              <span className={cn(adaptiveClasses.text, "font-medium")}>
                {paymentData.paymentMethod === 'savings' ? 'Savings Account' : 'Current Account'}
              </span>
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentStep('details')}
            disabled={isProcessing}
            className={cn(adaptiveClasses.button, "flex-1")}
          >
            Back
          </Button>
          <Button
            onClick={processPayment}
            disabled={isProcessing}
            className={cn(
              adaptiveClasses.button,
              "flex-1 bg-primary-red text-white hover:bg-primary-red/90"
            )}
          >
            {isProcessing ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Receipt className="w-4 h-4 mr-2" />
                Pay Now
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  const renderResult = () => (
    <div className="space-y-6 text-center">
      {paymentResult?.success ? (
        <>
          <CheckCircle className="w-16 h-16 text-success mx-auto" />
          <h2 className={cn(adaptiveClasses.heading, "text-2xl text-success")}>
            Payment Successful!
          </h2>
          <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
            Your bill has been paid successfully
          </p>
          {paymentResult.reference && (
            <Card className={cn(adaptiveClasses.card, "bg-success/5")}>
              <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray mb-1")}>
                Reference Number
              </p>
              <p className={cn(adaptiveClasses.text, "font-mono font-medium")}>
                {paymentResult.reference}
              </p>
            </Card>
          )}
        </>
      ) : (
        <>
          <AlertCircle className="w-16 h-16 text-danger mx-auto" />
          <h2 className={cn(adaptiveClasses.heading, "text-2xl text-danger")}>
            Payment Failed
          </h2>
          <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
            {paymentResult?.message || "Please try again or contact support"}
          </p>
        </>
      )}

      <div className="flex gap-4 justify-center">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard')}
          className={adaptiveClasses.button}
        >
          Back to Dashboard
        </Button>
        
        {!paymentResult?.success && (
          <Button
            onClick={() => {
              setCurrentStep('select');
              setPaymentResult(null);
              setPaymentData({
                provider: '',
                accountNumber: '',
                amount: '',
                paymentMethod: '',
                saveForLater: false,
                nickname: ''
              });
            }}
            className={cn(adaptiveClasses.button, "bg-primary-red text-white hover:bg-primary-red/90")}
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'select': return renderProviderSelection();
      case 'details': return renderPaymentDetails();
      case 'confirm': return renderConfirmation();
      case 'result': return renderResult();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-bg-white">
      {/* Header */}
      <header className="bg-white border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
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
              Bill Payments
            </h1>
            <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
              Pay your bills quickly and securely
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        <Card className={cn(adaptiveClasses.card, "min-h-[500px]")}>
          {renderCurrentStep()}
        </Card>
      </div>

      {/* Ziva Assistant */}
      {/* <ZivaAssistant /> */}
    </div>
  );
}