'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { useProfileStore } from '../../hooks/useProfile';
import { useVoice } from '../../hooks/useVoice';
import { useAdaptiveClasses } from '../../hooks/useAdaptiveUI';
import { Brain, CheckCircle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CognitiveMicroTestProps {
  onNext: () => void;
  onBack: () => void;
}

interface TestTask {
  id: string;
  title: string;
  description: string;
  options: { id: string; text: string; score: number }[];
  completed: boolean;
  selectedOption?: string;
}

export function CognitiveMicroTest({ onNext, onBack }: CognitiveMicroTestProps) {
  const [currentTask, setCurrentTask] = useState(0);
  const [tasks, setTasks] = useState<TestTask[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [taskTimes, setTaskTimes] = useState<number[]>([]);
  
  const { speak } = useVoice();
  const adaptiveClasses = useAdaptiveClasses();
  const { updateProfile } = useProfileStore();

  useEffect(() => {
    const testTasks: TestTask[] = [
      {
        id: 'information_preference',
        title: 'Information Display',
        description: 'How do you prefer to see banking information?',
        options: [
          { id: 'detailed', text: 'Show me all details and options', score: 3 },
          { id: 'balanced', text: 'Show important info with option to see more', score: 2 },
          { id: 'simple', text: 'Show only the essentials, keep it simple', score: 1 }
        ],
        completed: false
      },
      {
        id: 'task_completion',
        title: 'Task Guidance',
        description: 'When completing banking tasks, you prefer:',
        options: [
          { id: 'independent', text: 'Minimal guidance, I figure things out myself', score: 3 },
          { id: 'moderate', text: 'Some guidance and helpful hints along the way', score: 2 },
          { id: 'guided', text: 'Step-by-step instructions for each action', score: 1 }
        ],
        completed: false
      }
    ];

    setTasks(testTasks);
    setStartTime(Date.now());
    
    const message = "Now let's set up your interface preferences. This quick assessment helps us customize the app just for you.";
    setTimeout(() => speak(message), 500);
  }, [speak]);

  const handleOptionSelect = (optionId: string) => {
    const taskTime = Date.now() - startTime;
    setTaskTimes(prev => [...prev, taskTime]);
    
    const newTasks = [...tasks];
    newTasks[currentTask] = {
      ...newTasks[currentTask],
      selectedOption: optionId,
      completed: true
    };
    setTasks(newTasks);

    const selectedOption = newTasks[currentTask].options.find(opt => opt.id === optionId);
    if (selectedOption) {
      speak(`Selected: ${selectedOption.text}`);
    }

    // Move to next task or complete
    setTimeout(() => {
      if (currentTask < tasks.length - 1) {
        setCurrentTask(currentTask + 1);
        setStartTime(Date.now());
        speak(newTasks[currentTask + 1].description);
      } else {
        calculateResults(newTasks, [...taskTimes, taskTime]);
      }
    }, 1000);
  };

  const calculateResults = (completedTasks: TestTask[], times: number[]) => {
    let totalScore = 0;
    let responseCount = 0;

    completedTasks.forEach(task => {
      if (task.selectedOption) {
        const option = task.options.find(opt => opt.id === task.selectedOption);
        if (option) {
          totalScore += option.score;
          responseCount++;
        }
      }
    });

    const averageScore = responseCount > 0 ? totalScore / responseCount : 2;
    const averageTime = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 5000;

    // Determine UI complexity based on scores and response time
    let uiComplexity: 'simplified' | 'moderate' | 'detailed';
    
    if (averageScore <= 1.5 || averageTime > 10000) {
      uiComplexity = 'simplified';
    } else if (averageScore >= 2.5 && averageTime < 3000) {
      uiComplexity = 'detailed';
    } else {
      uiComplexity = 'moderate';
    }

    updateProfile({ 
      cognitiveScore: Math.round(averageScore * 10) / 10,
      uiComplexity 
    });

    const resultMessage = uiComplexity === 'simplified' 
      ? "Perfect! We'll use a clean, simple interface for you."
      : uiComplexity === 'detailed'
      ? "Great! We'll show you detailed information and advanced options."
      : "Excellent! We'll use a balanced interface with helpful guidance.";
    
    speak(resultMessage);
    onNext();
  };

  const progress = ((currentTask + 1) / tasks.length) * 100;
  const currentTaskData = tasks[currentTask];

  if (!currentTaskData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <Brain className="w-12 h-12 text-primary-red mx-auto mb-4" />
        <h2 className={cn(adaptiveClasses.heading, "text-2xl text-text mb-4")}>
          Interface Preferences
        </h2>
        <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
          Help us understand how you prefer to interact with your banking app
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className={cn(adaptiveClasses.text, "text-muted-gray")}>
            Question {currentTask + 1} of {tasks.length}
          </span>
          <span className={cn(adaptiveClasses.text, "text-muted-gray")}>
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Current Task */}
      <Card className={cn(adaptiveClasses.card, "bg-bg-white")}>
        <div className="text-center mb-6">
          <h3 className={cn(adaptiveClasses.text, "text-xl font-semibold text-text mb-3")}>
            {currentTaskData.title}
          </h3>
          <p className={cn(adaptiveClasses.text, "text-muted-gray")}>
            {currentTaskData.description}
          </p>
        </div>

        <div className="space-y-3">
          {currentTaskData.options.map((option) => (
            <Button
              key={option.id}
              variant="outline"
              className={cn(
                "w-full h-auto p-4 text-left justify-start",
                adaptiveClasses.button,
                "border-2 hover:border-primary-red hover:bg-primary-red/5"
              )}
              onClick={() => handleOptionSelect(option.id)}
              aria-label={`Select option: ${option.text}`}
            >
              <div>
                <p className={cn(adaptiveClasses.text, "font-medium text-text")}>
                  {option.text}
                </p>
              </div>
            </Button>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className={cn(adaptiveClasses.text, "text-xs text-muted-gray")}>
            Choose the option that best describes your preference
          </p>
        </div>
      </Card>

      {/* Completed Tasks Summary */}
      {currentTask > 0 && (
        <div className="flex justify-center gap-2">
          {tasks.slice(0, currentTask).map((task, index) => (
            <div key={task.id} className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className={cn(adaptiveClasses.text, "text-xs text-success")}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className={cn(adaptiveClasses.button, "border-muted-gray text-muted-gray")}
        >
          Back
        </Button>

        <div className="flex items-center gap-2 text-muted-gray">
          <Clock className="w-4 h-4" />
          <span className={cn(adaptiveClasses.text, "text-sm")}>
            Take your time
          </span>
        </div>
      </div>
    </div>
  );
}