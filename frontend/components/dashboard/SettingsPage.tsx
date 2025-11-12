'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { useProfile, useProfileStore, useLanguage, useInteractionMode } from '../../hooks/useProfile';
import { useVoice } from '../../hooks/useVoice';
import { useAdaptiveUI, useAdaptiveClasses } from '../../hooks/useAdaptiveUI';
import { 
  ArrowLeft, 
  Settings,
  User,
  Shield,
  Bell,
  Accessibility,
  Globe,
  Mic,
  Save
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  
  const router = useRouter();
  const profile = useProfile();
  const { updateProfile } = useProfileStore();
  const language = useLanguage();
  const interactionMode = useInteractionMode();
  const { speak } = useVoice();
  const adaptiveUI = useAdaptiveUI();
  const adaptiveClasses = useAdaptiveClasses();

  useEffect(() => {
    const welcomeMessage = "Welcome to your 4All settings. Here you can customize your banking experience.";
    setTimeout(() => speak(welcomeMessage), 1000);
  }, [speak]);

  const settingsSections = [
    { id: 'profile', title: 'Profile', icon: User },
    { id: 'accessibility', title: 'Accessibility', icon: Accessibility },
    { id: 'language', title: 'Language & Voice', icon: Globe },
    { id: 'security', title: 'Security', icon: Shield },
    { id: 'notifications', title: 'Notifications', icon: Bell }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'pcm', name: 'Pidgin English' },
    { code: 'yo', name: 'Yoruba' },
    { code: 'ig', name: 'Igbo' },
    { code: 'ha', name: 'Hausa' }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    speak("Saving your settings...");
    
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    speak("Settings saved successfully!");
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="name" className={cn(adaptiveClasses.text, "font-medium")}>
          Full Name
        </Label>
        <Input
          id="name"
          value={profile?.name || ''}
          onChange={(e) => updateProfile({ name: e.target.value })}
          className={adaptiveClasses.input}
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <Label htmlFor="phone" className={cn(adaptiveClasses.text, "font-medium")}>
          Phone Number
        </Label>
        <Input
          id="phone"
          value={profile?.phone || ''}
          onChange={(e) => updateProfile({ phone: e.target.value })}
          className={adaptiveClasses.input}
          placeholder="Enter your phone number"
        />
      </div>
    </div>
  );

  const renderAccessibilitySettings = () => (
    <div className="space-y-6">
      <div>
        <Label className={cn(adaptiveClasses.text, "font-medium mb-4 block")}>
          Disabilities & Support Needs
        </Label>
        <div className="space-y-3">
          {['visual', 'hearing', 'motor', 'cognitive', 'speech'].map((disability) => (
            <div key={disability} className="flex items-center justify-between">
              <span className={cn(adaptiveClasses.text, "capitalize")}>
                {disability} impairment support
              </span>
              <Switch
                checked={profile?.disabilities?.includes(disability as any) || false}
                onCheckedChange={(checked) => {
                  const current = profile?.disabilities || [];
                  const updated = checked 
                    ? [...current, disability as any]
                    : current.filter(d => d !== disability);
                  updateProfile({ disabilities: updated });
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className={cn(adaptiveClasses.text, "font-medium")}>
          Font Size
        </Label>
        <Select
          value={profile?.accessibilityPreferences?.fontSize?.toString() || '16'}
          onValueChange={(value) => updateProfile({
            accessibilityPreferences: {
              ...profile?.accessibilityPreferences,
              fontSize: parseInt(value)
            }
          })}
        >
          <SelectTrigger className={adaptiveClasses.input}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="14">Small (14px)</SelectItem>
            <SelectItem value="16">Medium (16px)</SelectItem>
            <SelectItem value="18">Large (18px)</SelectItem>
            <SelectItem value="20">Extra Large (20px)</SelectItem>
            <SelectItem value="24">Huge (24px)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className={cn(adaptiveClasses.text, "font-medium")}>
          UI Complexity
        </Label>
        <Select
          value={profile?.uiComplexity || 'moderate'}
          onValueChange={(value) => updateProfile({ 
            uiComplexity: value as 'simplified' | 'moderate' | 'detailed' 
          })}
        >
          <SelectTrigger className={adaptiveClasses.input}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="simplified">Simplified</SelectItem>
            <SelectItem value="moderate">Moderate</SelectItem>
            <SelectItem value="detailed">Detailed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderLanguageSettings = () => (
    <div className="space-y-6">
      <div>
        <Label className={cn(adaptiveClasses.text, "font-medium")}>
          Language
        </Label>
        <Select
          value={language}
          onValueChange={(value) => updateProfile({ 
            language: value as 'en' | 'pcm' | 'yo' | 'ig' | 'ha' 
          })}
        >
          <SelectTrigger className={adaptiveClasses.input}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className={cn(adaptiveClasses.text, "font-medium")}>
          Interaction Mode
        </Label>
        <Select
          value={interactionMode}
          onValueChange={(value) => updateProfile({ 
            interactionMode: value as 'voice' | 'text' 
          })}
        >
          <SelectTrigger className={adaptiveClasses.input}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="voice">Voice First</SelectItem>
            <SelectItem value="text">Text Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className={cn(adaptiveClasses.text, "font-medium")}>
            Voice Speed
          </span>
          <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
            Adjust speech synthesis speed
          </p>
        </div>
        <Select
          value={profile?.accessibilityPreferences?.ttsSpeed?.toString() || '1'}
          onValueChange={(value) => updateProfile({
            accessibilityPreferences: {
              ...profile?.accessibilityPreferences,
              ttsSpeed: parseFloat(value)
            }
          })}
        >
          <SelectTrigger className={cn(adaptiveClasses.input, "w-32")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.5">Slow</SelectItem>
            <SelectItem value="1">Normal</SelectItem>
            <SelectItem value="1.5">Fast</SelectItem>
            <SelectItem value="2">Very Fast</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <Label className={cn(adaptiveClasses.text, "font-medium")}>
          Confirmation Mode
        </Label>
        <Select
          value={profile?.confirmMode || 'pin'}
          onValueChange={(value) => updateProfile({ 
            confirmMode: value as 'pin' | 'voice' | 'biometric' 
          })}
        >
          <SelectTrigger className={adaptiveClasses.input}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pin">PIN</SelectItem>
            <SelectItem value="voice">Voice</SelectItem>
            <SelectItem value="biometric">Biometric</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="p-4 bg-warning/10 border-warning">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-warning mt-1" />
          <div>
            <h3 className={cn(adaptiveClasses.text, "font-medium text-warning mb-1")}>
              Security Notice
            </h3>
            <p className={cn(adaptiveClasses.text, "text-sm text-text")}>
              Your account is protected with bank-grade encryption. Never share your PIN or login details.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className={cn(adaptiveClasses.text, "font-medium")}>
            Transaction Notifications
          </span>
          <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
            Get notified about account activity
          </p>
        </div>
        <Switch defaultChecked />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className={cn(adaptiveClasses.text, "font-medium")}>
            Voice Announcements
          </span>
          <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
            Hear confirmations and alerts
          </p>
        </div>
        <Switch defaultChecked />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className={cn(adaptiveClasses.text, "font-medium")}>
            Security Alerts
          </span>
          <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
            Important security notifications
          </p>
        </div>
        <Switch defaultChecked />
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSettings();
      case 'accessibility':
        return renderAccessibilitySettings();
      case 'language':
        return renderLanguageSettings();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div className="min-h-screen bg-bg-white">
      {/* Header */}
      <div className="bg-white border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="border-muted-gray text-muted-gray"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-primary-red" />
            <div>
              <h1 className={cn(adaptiveClasses.heading, "text-2xl text-text")}>
                Settings
              </h1>
              <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
                Customize your 4All experience
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <Card className="lg:col-span-1 h-fit">
            <div className="p-4">
              <h2 className={cn(adaptiveClasses.text, "font-medium mb-4")}>
                Categories
              </h2>
              <nav className="space-y-2">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      speak(`Opening ${section.title} settings`);
                    }}
                    className={cn(
                      adaptiveClasses.button,
                      "w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors",
                      activeSection === section.id
                        ? "bg-primary-red/10 text-primary-red border border-primary-red"
                        : "hover:bg-muted-gray/10 text-text"
                    )}
                  >
                    <section.icon className="w-4 h-4" />
                    {section.title}
                    {activeSection === section.id && (
                      <Badge className="ml-auto bg-primary-red text-white text-xs">
                        Active
                      </Badge>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </Card>

          {/* Settings Content */}
          <Card className="lg:col-span-3">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={cn(adaptiveClasses.heading, "text-xl text-text")}>
                  {settingsSections.find(s => s.id === activeSection)?.title} Settings
                </h2>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={cn(
                    adaptiveClasses.button,
                    "bg-primary-red text-white hover:bg-primary-red/90"
                  )}
                >
                  {isSaving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>

              {renderCurrentSection()}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}