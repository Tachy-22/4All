'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { useVoice } from '../../hooks/useVoice';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import Image from 'next/image';

export function BankSignin() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { speak } = useVoice();

  // useEffect(() => {
  //   setTimeout(() => {
  //     speak('Congratulations! Your Zenith Bank account setup is complete. You can now explore 4All Banking for enhanced accessibility features.');
  //   }, 1000);
  // }, [speak]);

  const handleContinueTo4All = () => {
    setIsLoading(true);
    speak('Taking you to 4All Banking for accessible banking features.');

    setTimeout(() => {
      router.push('/landing');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-bg-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Bank Logo/Title */}
        <div>
          <h1 className="text-2xl font-bold text-text mb-2">Zenith Bank</h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <CheckCircle className="w-6 h-6 text-success" />
            <h2 className="text-lg font-medium text-text">Account Setup Complete</h2>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white border border-border rounded-lg p-6 space-y-4">
          <div className="text-sm text-muted-gray">
            <p>Account: <span className="font-mono text-text">2051234567</span></p>
            <p>Balance: <span className="font-semibold text-success">₦0.00</span></p>
          </div>
        </div>

        {/* 4All Invitation */}
        <div className="space-y-4">
          <div className="flex justify-center mb-6 max-h-[8rem]">
            <Image
              src="/logo.png"
              alt="4All Banking Logo"
              width={1000}
              height={1000}
              className="rounded-xl w-[15rem] h-full object-contain"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text mb-2">Try 4All Banking</h3>
            <p className="text-sm text-muted-gray">
              Enhanced accessibility and voice banking features
            </p>
          </div>

          <Button
            onClick={handleContinueTo4All}
            disabled={isLoading}
            className={cn(
              "w-full bg-primary-red hover:bg-primary-red/90 text-white font-medium py-3",
              "flex items-center justify-center gap-2",
              isLoading && "opacity-70 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Continue to 4All
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}