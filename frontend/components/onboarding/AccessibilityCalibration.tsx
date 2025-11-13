'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { useProfileStore, useDisabilities, useAccessibilityPreferences } from '../../hooks/useProfile';
import { useVoice } from '../../hooks/useVoice';
import { useAdaptiveClasses } from '../../hooks/useAdaptiveUI';
import { Settings, Eye, Volume2, Hand, Type } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AccessibilityCalibrationProps {
  onNext: () => void;
  onBack: () => void;
}

export function AccessibilityCalibration({ onNext, onBack }: AccessibilityCalibrationProps) {
  const [fontSize, setFontSize] = useState(16);
  const [contrast, setContrast] = useState<'normal' | 'high'>('normal');
  const [ttsSpeed, setTtsSpeed] = useState(1);
  const [largeTargets, setLargeTargets] = useState(false);
  const [captions, setCaptions] = useState(false);
  const [font, setFont] = useState<'inter' | 'atkinson'>('inter');
  const [hasChanges, setHasChanges] = useState(false);

  const disabilities = useDisabilities();
  const currentPrefs = useAccessibilityPreferences();
  const { speak } = useVoice();
  const adaptiveClasses = useAdaptiveClasses();
  const { setAccessibilityPreferences } = useProfileStore();

  useEffect(() => {
    // Initialize with current preferences
    setFontSize(currentPrefs.fontSize);
    setContrast(currentPrefs.contrast);
    setTtsSpeed(currentPrefs.ttsSpeed);
    setLargeTargets(currentPrefs.largeTargets);
    setCaptions(currentPrefs.captions);
    setFont(currentPrefs.font);

    const message = disabilities.length > 0
      ? "Let's fine-tune your accessibility settings based on your needs."
      : "You can customize accessibility features here, or skip this step if you prefer the defaults.";

    setTimeout(() => speak(message), 500);
  }, [disabilities, currentPrefs, speak]);

  const handleSave = () => {
    const preferences = {
      fontSize,
      contrast,
      ttsSpeed,
      largeTargets,
      captions,
      font,
    };

    setAccessibilityPreferences(preferences);
    speak("Accessibility preferences saved. Moving to the next step.");
    onNext();
  };

  const testTTS = () => {
    speak("This is how your text-to-speech will sound with your current settings.", {
      rate: ttsSpeed
    });
  };

  const sampleText = "This is sample text to preview your font and size settings.";

  // Show different options based on selected disabilities
  const showVisualOptions = disabilities.includes('visual');
  const showHearingOptions = disabilities.includes('hearing');
  const showMotorOptions = disabilities.includes('motor');

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <Settings className="w-12 h-12 text-primary-red mx-auto mb-4" />
        <h2 className={cn(adaptiveClasses.heading, "text-2xl text-text mb-4")}>
          Accessibility Settings
        </h2>
        <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
          Customize your experience to work perfectly for you
        </p>
      </div>

      <div className="space-y-6">
        {/* Text and Display Settings */}
        {(showVisualOptions || disabilities.length === 0) && (
          <Card className={cn(adaptiveClasses.card, "bg-bg-white")}>
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-primary-red" />
              <h3 className={cn(adaptiveClasses.text, "font-semibold text-text")}>
                Text & Display
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label className={cn(adaptiveClasses.text, "font-medium mb-2 block")}>
                  Font Size: {fontSize}px
                </Label>
                <Slider
                  value={[fontSize]}
                  onValueChange={(value) => {
                    setFontSize(value[0]);
                    setHasChanges(true);
                  }}
                  min={14}
                  max={24}
                  step={2}
                  className="w-full"
                  aria-label="Font size"
                />
                <div
                  style={{ fontSize: `${fontSize}px` }}
                  className="mt-2 p-2 border rounded text-text"
                >
                  {sampleText}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className={cn(adaptiveClasses.text, "font-medium")}>
                  High Contrast Mode
                </Label>
                <Switch
                  checked={contrast === 'high'}
                  onCheckedChange={(checked) => {
                    setContrast(checked ? 'high' : 'normal');
                    setHasChanges(true);
                  }}
                  aria-label="Toggle high contrast mode"
                />
              </div>

              <div>
                <Label className={cn(adaptiveClasses.text, "font-medium mb-2 block")}>
                  Font Family
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={font === 'inter' ? 'default' : 'outline'}
                    onClick={() => {
                      setFont('inter');
                      setHasChanges(true);
                    }}
                    className={cn(
                      "h-auto p-3",
                      font === 'inter' && "bg-primary-red text-white"
                    )}
                  >
                    <div style={{ fontFamily: 'Inter' }}>
                      Inter (Default)
                    </div>
                  </Button>
                  <Button
                    variant={font === 'atkinson' ? 'default' : 'outline'}
                    onClick={() => {
                      setFont('atkinson');
                      setHasChanges(true);
                    }}
                    className={cn(
                      "h-auto p-3",
                      font === 'atkinson' && "bg-primary-red text-white"
                    )}
                  >
                    <div style={{ fontFamily: 'Atkinson Hyperlegible, sans-serif' }}>
                      Atkinson (Accessible)
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Audio Settings */}
        {(showHearingOptions || disabilities.length === 0) && (
          <Card className={cn(adaptiveClasses.card, "bg-bg-white")}>
            <div className="flex items-center gap-2 mb-4">
              <Volume2 className="w-5 h-5 text-primary-red" />
              <h3 className={cn(adaptiveClasses.text, "font-semibold text-text")}>
                Audio & Speech
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label className={cn(adaptiveClasses.text, "font-medium mb-2 block")}>
                  Speech Speed: {ttsSpeed}x
                </Label>
                <Slider
                  value={[ttsSpeed]}
                  onValueChange={(value) => {
                    setTtsSpeed(value[0]);
                    setHasChanges(true);
                  }}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-full"
                  aria-label="Text-to-speech speed"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testTTS}
                  className="mt-2"
                >
                  Test Speech
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className={cn(adaptiveClasses.text, "font-medium")}>
                    Always Show Captions
                  </Label>
                  <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
                    Display text for all voice interactions
                  </p>
                </div>
                <Switch
                  checked={captions}
                  onCheckedChange={(checked) => {
                    setCaptions(checked);
                    setHasChanges(true);
                  }}
                  aria-label="Toggle captions"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Motor and Touch Settings */}
        {(showMotorOptions || disabilities.length === 0) && (
          <Card className={cn(adaptiveClasses.card, "bg-bg-white")}>
            <div className="flex items-center gap-2 mb-4">
              <Hand className="w-5 h-5 text-primary-red" />
              <h3 className={cn(adaptiveClasses.text, "font-semibold text-text")}>
                Touch & Navigation
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className={cn(adaptiveClasses.text, "font-medium")}>
                    Large Touch Targets
                  </Label>
                  <p className={cn(adaptiveClasses.text, "text-sm text-muted-gray")}>
                    Make buttons and controls larger and easier to tap
                  </p>
                </div>
                <Switch
                  checked={largeTargets}
                  onCheckedChange={(checked) => {
                    setLargeTargets(checked);
                    setHasChanges(true);
                  }}
                  aria-label="Toggle large touch targets"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Preview Card */}
        <Card
          className={cn(
            adaptiveClasses.card,
            contrast === 'high' ? "bg-white text-white border-white" : "bg-bg-white"
          )}
        >
          <div className="flex items-center gap-2 mb-4">
            <Type className="w-5 h-5 text-primary-red" />
            <h3 className={cn(adaptiveClasses.text, "font-semibold")}>
              Preview
            </h3>
          </div>

          <div
            style={{
              fontSize: `${fontSize}px`,
              fontFamily: font === 'atkinson' ? 'Atkinson Hyperlegible, sans-serif' : 'Inter, sans-serif'
            }}
            className={cn(
              "p-4 rounded border",
              contrast === 'high' ? "bg-white text-black" : "bg-white"
            )}
          >
            <p className="mb-2 font-semibold">4All Banking</p>
            <p className="mb-2">Your account balance is ₦254,800.50</p>
            <Button
              className={cn(
                largeTargets ? "h-12 px-6" : "h-9 px-3",
                "bg-primary-red text-white"
              )}
              disabled
            >
              Send Money
            </Button>
          </div>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className={cn(adaptiveClasses.button, "border-muted-gray text-muted-gray")}
        >
          Back
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onNext}
            className={cn(adaptiveClasses.button)}
          >
            Skip
          </Button>

          <Button
            onClick={handleSave}
            className={cn(
              adaptiveClasses.button,
              "bg-primary-red text-white hover:bg-primary-red/90"
            )}
          >
            Save & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}