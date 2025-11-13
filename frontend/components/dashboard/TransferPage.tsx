'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { useProfile, useInteractionMode } from '../../hooks/useProfile';
import { useVoice } from '../../hooks/useVoice';
import { useAdaptiveUI, useAdaptiveClasses } from '../../hooks/useAdaptiveUI';
import { ZivaAssistant } from '../ziva/ZivaAssistant';
import {
  ArrowLeft,
  Send,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Mic,
  VolumeX
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface TransferData {
  amount: string;
  recipient: string;
  recipientAccount: string;
  fromAccount: string;
  narration: string;
}

interface TransferStep {
  id: string;
  title: string;
  completed: boolean;
}

export function TransferPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [transferData, setTransferData] = useState<TransferData>({
    amount: '',
    recipient: '',
    recipientAccount: '',
    fromAccount: 'savings', // 👈 default account
    narration: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [transferResult, setTransferResult] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();
  const profile = useProfile();
  const interactionMode = useInteractionMode();
  const { speak, isListening, startListening, stopListening, transcript, clearTranscript } = useVoice();
  const adaptiveUI = useAdaptiveUI();
  const adaptiveClasses = useAdaptiveClasses();

  const steps: TransferStep[] = [
    { id: 'details', title: 'Transfer Details', completed: false },
    { id: 'confirm', title: 'Confirm', completed: false },
    { id: 'complete', title: 'Transfer Complete', completed: false }
  ];

  useEffect(() => {
    const welcomeMessage =
      "Welcome to money transfer. Let's help you send money quickly and securely. You can use voice commands or fill out the form.";

    // Speak greeting first
    const greetAndListen = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800)); // slight delay for UX
      speak(welcomeMessage);

      // After greeting, auto-start listening if interactionMode is voice
      if (interactionMode === 'voice') {
        setTimeout(() => {
          speak("Your savings account is selected by default.");
          startListening();
          speak("I'm listening for your transfer command...");
        }, 5000);
      }

    };

    greetAndListen();
  }, [speak, startListening, interactionMode]);


  // Process voice commands
  useEffect(() => {
    if (transcript && transcript.trim()) {
      const command = transcript.toLowerCase();

      // Command: "Send [amount] naira to [name]"
      const sendMatch = command.match(/send\s+(\d+)\s+naira\s+to\s+(\w+)/i);
      if (sendMatch) {
        const [, amount, recipientName] = sendMatch;
        const foundRecipient = mockRecipients.find(r =>
          r.name.toLowerCase().includes(recipientName.toLowerCase())
        );

        if (foundRecipient) {
          setTransferData(prev => ({
            ...prev,
            amount: amount,
            recipient: foundRecipient.name,
            recipientAccount: foundRecipient.accountNumber
          }));
          speak(`Got it! Sending ${amount} naira to ${foundRecipient.name}, account ending in ${foundRecipient.accountNumber.slice(-4)}.`);
        } else {
          setTransferData(prev => ({
            ...prev,
            amount: amount
          }));
          speak(`Setting amount to ${amount} naira. Please select the recipient from the dropdown.`);
        }
        clearTranscript();
        return;
      }

      // Command: "Set narration to [text]"
      const narrationMatch = command.match(/set\s+narration\s+to\s+(.+)/i);
      if (narrationMatch) {
        const [, narration] = narrationMatch;
        setTransferData(prev => ({
          ...prev,
          narration: narration
        }));
        speak(`Narration set to: ${narration}`);
        clearTranscript();
        return;
      }

      // Command: "Use savings account" or "Use current account"
      if (command.includes('use savings account') || command.includes('savings')) {
        setTransferData(prev => ({ ...prev, fromAccount: 'savings' }));
        speak('Using your savings account for this transfer.');
        clearTranscript();
        return;
      }

      if (command.includes('use current account') || command.includes('current')) {
        setTransferData(prev => ({ ...prev, fromAccount: 'current' }));
        speak('Using your current account for this transfer.');
        clearTranscript();
        return;
      }

      // Command: Account number (10 digits)
      const accountMatch = command.match(/(\d{10})/);
      if (accountMatch && !transferData.recipientAccount) {
        const [, account] = accountMatch;
        setTransferData(prev => ({ ...prev, recipientAccount: account }));
        speak(`Recipient account set to ${account}`);
        clearTranscript();
        return;
      }

      // Confirmation phase voice commands
      if (adaptiveUI.confirmMode === 'voice') {
        const command = transcript.toLowerCase().trim();

        if (command.includes('confirm')) {
          speak('Transfer confirmed. Processing now...');
          clearTranscript();
          processTransfer();
          return;
        }

        if (command.includes('cancel')) {
          speak('Transfer cancelled. Returning to edit mode.');
          clearTranscript();
          handleBack();
          return;
        }
      }

      // Navigation: Go back to homepage or dashboard
      if (transcript && transcript.trim()) {
        const command = transcript.toLowerCase().trim();

        if (
          command.includes('go home') ||
          command.includes('back to home') ||
          command.includes('return home') ||
          command.includes('go to dashboard') ||
          command.includes('back to dashboard') ||
          command.includes('home page') ||
          command.includes('dashboard')
        ) {
          speak('Taking you back to your dashboard.');
          clearTranscript();
          router.push('/dashboard');
          return;
        }
      }


      // If no command matched, provide help
      speak("I didn't understand that command. Try saying 'Send 5000 naira to Ada' or 'Set narration to rent payment'.");
      clearTranscript();
    }
  }, [transcript, transferData.recipientAccount, speak, clearTranscript]);

  const mockAccounts = [
    { id: 'savings', name: 'Savings Account', balance: 254800.50 },
    { id: 'current', name: 'Current Account', balance: 125600.30 }
  ];

  const mockRecipients = [
    { id: '1', name: 'Ada Okafor', accountNumber: '2051234567', bank: '4All Bank' },
    { id: '2', name: 'Chidi Eze', accountNumber: '2051234568', bank: '4All Bank' },
    { id: '3', name: 'Kemi Adebayo', accountNumber: '2051234569', bank: '4All Bank' },
    { id: '4', name: 'Tunde Ogunkoya', accountNumber: '2051234570', bank: 'Access Bank' },
    { id: '5', name: 'Ngozi Okwu', accountNumber: '2051234571', bank: 'GTBank' }
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!transferData.amount) newErrors.amount = 'Amount is required';
      if (!transferData.recipient) newErrors.recipient = 'Recipient name is required';
      if (!transferData.fromAccount) newErrors.fromAccount = 'Source account is required';

      const amount = parseFloat(transferData.amount);
      if (isNaN(amount) || amount <= 0) newErrors.amount = 'Enter a valid amount';
      if (amount > 1000000) newErrors.amount = 'Transfer limit exceeded';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        const nextStepTitle = steps[currentStep + 1].title;
        speak(`Moving to ${nextStepTitle}`);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      const prevStepTitle = steps[currentStep - 1].title;
      speak(`Back to ${prevStepTitle}`);
    }
  };

  const processTransfer = async () => {
    setIsProcessing(true);
    speak("Processing your transfer. Please wait...");

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'transfer',
          amount: parseFloat(transferData.amount),
          recipient: transferData.recipient,
          recipientAccount: transferData.recipientAccount,
          account: transferData.fromAccount,
          description: transferData.narration || `Transfer to ${transferData.recipient}`,
          narration: transferData.narration || `Transfer to ${transferData.recipient}`
        })
      });

      const result = await response.json();
      setTransferResult(result);

      if (result.success) {
        speak(`Transfer successful! ₦${transferData.amount} has been sent to ${transferData.recipient}.`);
        setCurrentStep(2);
      } else {
        speak("Transfer failed. Please try again or contact support.");
      }
    } catch (error) {
      speak("Network error. Please check your connection and try again.");
      setTransferResult({ success: false, error: 'Network error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (adaptiveUI.confirmMode === 'voice') {
      speak("Please say 'CONFIRM' to complete this transfer, or 'CANCEL' to go back.");
      startListening();
    } else {
      processTransfer();
    }
  };

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const renderTransferForm = () => (
    <div className="space-y-6">
      <div>
        <h2 className={cn(adaptiveClasses.heading, "text-2xl text-text mb-4")}>
          Send Money
        </h2>
        <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
          {interactionMode === 'voice'
            ? "Fill out the form below or use voice commands like 'Send ₦5000 to Ada'"
            : "Enter the transfer details below"
          }
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="amount" className={cn(adaptiveClasses.text, "font-medium")}>
            Amount *
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={transferData.amount}
            onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
            className={cn(adaptiveClasses.input, errors.amount && "border-danger")}
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount ? "amount-error" : undefined}
          />
          {errors.amount && (
            <p id="amount-error" className="text-sm text-danger mt-1" role="alert">
              {errors.amount}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="fromAccount" className={cn(adaptiveClasses.text, "font-medium")}>
            From Account *
          </Label>
          <Select
            value={transferData.fromAccount}
            onValueChange={(value) => setTransferData({ ...transferData, fromAccount: value })}
          >
            <SelectTrigger className={cn(adaptiveClasses.input, errors.fromAccount && "border-danger")}>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {mockAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} - {formatCurrency(account.balance)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.fromAccount && (
            <p className="text-sm text-danger mt-1" role="alert">
              {errors.fromAccount}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="recipient" className={cn(adaptiveClasses.text, "font-medium")}>
            Choose Recipient *
          </Label>
          <Select
            value={mockRecipients.find(r => r.name === transferData.recipient)?.id || ""}
            onValueChange={(value) => {
              const selectedRecipient = mockRecipients.find(r => r.id === value);
              if (selectedRecipient) {
                setTransferData({
                  ...transferData,
                  recipient: selectedRecipient.name,
                  recipientAccount: selectedRecipient.accountNumber
                });
                speak(`Selected ${selectedRecipient.name}, account ending in ${selectedRecipient.accountNumber.slice(-4)}`);
              }
            }}
          >
            <SelectTrigger className={cn(adaptiveClasses.input, errors.recipient && "border-danger")}>
              <SelectValue placeholder="Select a recipient" />
            </SelectTrigger>
            <SelectContent>
              {mockRecipients.map((recipient) => (
                <SelectItem key={recipient.id} value={recipient.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{recipient.name}</span>
                    <span className="text-sm text-muted-gray">{recipient.accountNumber} • {recipient.bank}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.recipient && (
            <p className="text-sm text-danger mt-1" role="alert">
              {errors.recipient}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="narration" className={cn(adaptiveClasses.text, "font-medium")}>
            Narration (Optional)
          </Label>
          <Input
            id="narration"
            placeholder="What is this transfer for?"
            value={transferData.narration}
            onChange={(e) => setTransferData({ ...transferData, narration: e.target.value })}
            className={adaptiveClasses.input}
          />
        </div>
      </div>

      {interactionMode === 'voice' && (
        <Card className="p-4 bg-primary-red/5 border-primary-red">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-primary-red" />
              <div>
                <p className={cn(adaptiveClasses.text, "text-primary-red font-medium")}>
                  Voice Commands
                </p>
                <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
                  Try: "Send 5000 naira to Ada", "Set narration to rent payment"
                </p>
              </div>
            </div>
            <Button
              variant={isListening ? "destructive" : "outline"}
              size="sm"
              onClick={() => {
                if (isListening) {
                  stopListening();
                  speak("Voice input stopped.");
                } else {
                  startListening();
                  speak("I'm listening for your transfer command...");
                }
              }}
              className={cn(
                "border-primary-red",
                isListening
                  ? "bg-primary-red text-white animate-pulse"
                  : "text-primary-red hover:bg-primary-red/10"
              )}
            >
              {isListening ? <VolumeX className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isListening ? " Stop" : " Listen"}
            </Button>
          </div>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className={cn(
            adaptiveClasses.button,
            "border-muted-gray text-muted-gray hover:bg-muted-gray/10"
          )}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex gap-4">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className={cn(
                adaptiveClasses.button,
                "border-primary-red text-primary-red hover:bg-primary-red/10"
              )}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          )}

          <Button
            onClick={handleNext}
            className={cn(
              adaptiveClasses.button,
              "bg-primary-red text-white hover:bg-primary-red/90"
            )}
            disabled={isProcessing}
          >
            {currentStep === steps.length - 1 ? (
              <>
                Complete Transfer
                <CheckCircle className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next: {steps[currentStep + 1]?.title}
                <Send className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="w-12 h-12 text-primary-red mx-auto mb-4" />
        <h2 className={cn(adaptiveClasses.heading, "text-2xl text-text mb-2")}>
          Confirm Transfer
        </h2>
        <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
          Please review your transfer details carefully
        </p>
      </div>

      <Card className={cn(adaptiveClasses.card, "bg-bg-white")}>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className={cn(adaptiveClasses.text, "text-muted-gray")}>Amount</span>
            <span className={cn(adaptiveClasses.text, "text-2xl font-bold text-text")}>
              {formatCurrency(parseFloat(transferData.amount))}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className={cn(adaptiveClasses.text, "text-muted-gray")}>To</span>
            <div className="text-right">
              <p className={cn(adaptiveClasses.text, "font-medium text-text")}>
                {transferData.recipient}
              </p>
              <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
                {transferData.recipientAccount}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className={cn(adaptiveClasses.text, "text-muted-gray")}>From</span>
            <span className={cn(adaptiveClasses.text, "font-medium text-text")}>
              {mockAccounts.find(acc => acc.id === transferData.fromAccount)?.name}
            </span>
          </div>

          {transferData.narration && (
            <div className="flex justify-between items-center">
              <span className={cn(adaptiveClasses.text, "text-muted-gray")}>Narration</span>
              <span className={cn(adaptiveClasses.text, "font-medium text-text")}>
                {transferData.narration}
              </span>
            </div>
          )}
        </div>
      </Card>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={handleBack}
          className={cn(adaptiveClasses.button, "flex-1")}
          disabled={isProcessing}
        >
          Back to Edit
        </Button>

        <Button
          onClick={handleConfirm}
          disabled={isProcessing}
          className={cn(adaptiveClasses.button, "flex-1 bg-primary-red text-white hover:bg-primary-red/90")}
        >
          {isProcessing ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {adaptiveUI.confirmMode === 'voice' ? 'Confirm with Voice' : 'Send Money'}
            </>
          )}
        </Button>
      </div>

      {isListening && adaptiveUI.confirmMode === 'voice' && (
        <Card className="p-4 bg-primary-red/5 border-primary-red">
          <div className="flex items-center justify-center gap-3">
            <Mic className="w-5 h-5 text-primary-red animate-pulse" />
            <span className={cn(adaptiveClasses.text, "text-primary-red")}>
              Listening... Say "CONFIRM" or "CANCEL"
            </span>
          </div>
        </Card>
      )}
    </div>
  );

  const renderResult = () => (
    <div className="space-y-6 text-center">
      {transferResult?.success ? (
        <>
          <CheckCircle className="w-16 h-16 text-success mx-auto" />
          <h2 className={cn(adaptiveClasses.heading, "text-2xl text-success")}>
            Transfer Successful!
          </h2>
          <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
            Your money has been sent successfully
          </p>
        </>
      ) : (
        <>
          <AlertCircle className="w-16 h-16 text-danger mx-auto" />
          <h2 className={cn(adaptiveClasses.heading, "text-2xl text-danger")}>
            Transfer Failed
          </h2>
          <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
            {transferResult?.message || "Please try again or contact support"}
          </p>
        </>
      )}

      <div className="flex gap-4 justify-center">
        {/* <Button
          variant="outline"
          onClick={() => router.push('/dashboard')}
          className={adaptiveClasses.button}
        >
          Back to Dashboard
        </Button> */}

        {!transferResult?.success && (
          <Button
            onClick={() => {
              setCurrentStep(0);
              setTransferResult(null);
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
      case 0: return renderTransferForm();
      case 1: return renderConfirmation();
      case 2: return renderResult();
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
              Money Transfer
            </h1>
            <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
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
      <ZivaAssistant />
    </div>
  );
}