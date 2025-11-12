'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { useProfileStore } from '../../hooks/useProfile';
import { useVoice } from '../../hooks/useVoice';
import { useAdaptiveClasses } from '../../hooks/useAdaptiveUI';
import { UserPlus, Shield, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RegistrationFormProps {
  onComplete: () => void;
  onBack: () => void;
}

export function RegistrationForm({ onComplete, onBack }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    agreePrivacy: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { speak } = useVoice();
  const adaptiveClasses = useAdaptiveClasses();
  const { updateProfile } = useProfileStore();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+234|0)[789]\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Nigerian phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }

    if (!formData.agreePrivacy) {
      newErrors.agreePrivacy = 'You must agree to the privacy policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      speak("Please fix the errors in the form before continuing.");
      return;
    }

    setIsLoading(true);
    speak("Creating your account...");

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update profile with registration data
      updateProfile({
        name: formData.fullName,
        phone: formData.phone,
        userId: `user_${Date.now()}`,
      });

      speak("Account created successfully! Welcome to 4All Banking.");
      onComplete();
    } catch (error) {
      speak("There was an error creating your account. Please try again.");
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as Nigerian phone number
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    if (digits.length <= 11) return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <UserPlus className="w-12 h-12 text-primary-red mx-auto mb-4" />
        <h2 className={cn(adaptiveClasses.heading, "text-2xl text-text mb-4")}>
          Create Your Account
        </h2>
        <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
          Almost done! Just a few details to get you started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <Label htmlFor="fullName" className={cn(adaptiveClasses.text, "font-medium")}>
            Full Name *
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            className={cn(adaptiveClasses.input, errors.fullName && "border-danger")}
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
          />
          {errors.fullName && (
            <p id="fullName-error" className="text-sm text-danger mt-1" role="alert">
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <Label htmlFor="phone" className={cn(adaptiveClasses.text, "font-medium")}>
            Phone Number *
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="0809 123 4567"
            value={formData.phone}
            onChange={(e) => {
              const formatted = formatPhoneNumber(e.target.value);
              setFormData({...formData, phone: formatted});
            }}
            className={cn(adaptiveClasses.input, errors.phone && "border-danger")}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />
          {errors.phone && (
            <p id="phone-error" className="text-sm text-danger mt-1" role="alert">
              {errors.phone}
            </p>
          )}
          <p className={cn(adaptiveClasses.text, "text-xs text-muted-gray mt-1")}>
            This will be used for account verification and security
          </p>
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="password" className={cn(adaptiveClasses.text, "font-medium")}>
            Password *
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className={cn(adaptiveClasses.input, errors.password && "border-danger", "pr-10")}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-gray" />
              ) : (
                <Eye className="h-4 w-4 text-muted-gray" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p id="password-error" className="text-sm text-danger mt-1" role="alert">
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <Label htmlFor="confirmPassword" className={cn(adaptiveClasses.text, "font-medium")}>
            Confirm Password *
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            className={cn(adaptiveClasses.input, errors.confirmPassword && "border-danger")}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
          />
          {errors.confirmPassword && (
            <p id="confirmPassword-error" className="text-sm text-danger mt-1" role="alert">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Terms and Privacy */}
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Checkbox
              id="agreeTerms"
              checked={formData.agreeTerms}
              onCheckedChange={(checked) => setFormData({...formData, agreeTerms: !!checked})}
              className={errors.agreeTerms ? "border-danger" : ""}
              aria-describedby={errors.agreeTerms ? "agreeTerms-error" : undefined}
            />
            <Label 
              htmlFor="agreeTerms" 
              className={cn(adaptiveClasses.text, "text-sm leading-relaxed cursor-pointer")}
            >
              I agree to the{' '}
              <a href="#" className="text-primary-red hover:underline">
                Terms and Conditions
              </a>
            </Label>
          </div>
          {errors.agreeTerms && (
            <p id="agreeTerms-error" className="text-sm text-danger ml-6" role="alert">
              {errors.agreeTerms}
            </p>
          )}

          <div className="flex items-start gap-2">
            <Checkbox
              id="agreePrivacy"
              checked={formData.agreePrivacy}
              onCheckedChange={(checked) => setFormData({...formData, agreePrivacy: !!checked})}
              className={errors.agreePrivacy ? "border-danger" : ""}
              aria-describedby={errors.agreePrivacy ? "agreePrivacy-error" : undefined}
            />
            <Label 
              htmlFor="agreePrivacy" 
              className={cn(adaptiveClasses.text, "text-sm leading-relaxed cursor-pointer")}
            >
              I agree to the{' '}
              <a href="#" className="text-primary-red hover:underline">
                Privacy Policy
              </a>{' '}
              and consent to data processing for accessibility features
            </Label>
          </div>
          {errors.agreePrivacy && (
            <p id="agreePrivacy-error" className="text-sm text-danger ml-6" role="alert">
              {errors.agreePrivacy}
            </p>
          )}
        </div>

        {/* Security Notice */}
        <Card className="p-4 bg-highlight-blue/5 border-highlight-blue">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-highlight-blue mt-0.5" />
            <div>
              <h4 className={cn(adaptiveClasses.text, "font-medium text-highlight-blue mb-1")}>
                Your Security Matters
              </h4>
              <p className={cn(adaptiveClasses.text, "text-sm text-text")}>
                Your accessibility preferences are stored securely and used only to enhance your banking experience. 
                We never share this information with third parties.
              </p>
            </div>
          </div>
        </Card>

        {/* Submit Error */}
        {errors.submit && (
          <div className="text-center">
            <p className="text-sm text-danger" role="alert">
              {errors.submit}
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className={cn(adaptiveClasses.button, "border-muted-gray text-muted-gray")}
          >
            Back
          </Button>

          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              adaptiveClasses.button,
              "bg-primary-red text-white hover:bg-primary-red/90"
            )}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </div>
      </form>
    </div>
  );
}