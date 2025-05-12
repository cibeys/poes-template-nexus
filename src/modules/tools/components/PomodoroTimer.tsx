
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Clock, Play, Pause, RotateCcw, Coffee, Briefcase, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TimerMode = 'work' | 'break';

export default function PomodoroTimer() {
  // Timer settings
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  
  // References
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { toast } = useToast();

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/193/193-preview.mp3');
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    const totalSeconds = mode === 'work' ? workDuration * 60 : breakDuration * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  // Play notification sound
  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => console.error("Audio play failed:", error));
    }
  };
  
  // Handle timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            // Timer completed
            clearInterval(timerRef.current as NodeJS.Timeout);
            
            // Play sound
            playSound();
            
            // Show notification
            const nextMode = mode === 'work' ? 'break' : 'work';
            toast({
              title: `${mode.charAt(0).toUpperCase() + mode.slice(1)} time finished!`,
              description: `Time for ${nextMode === 'work' ? 'work' : 'a break'}!`,
            });
            
            // Switch modes
            setMode(nextMode);
            
            // Update cycles if work mode completed
            if (mode === 'work') {
              setCycles(prev => prev + 1);
            }
            
            // Reset timer for next mode
            return nextMode === 'work' ? workDuration * 60 : breakDuration * 60;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, mode, workDuration, breakDuration, toast]);

  // Reset timer when settings change
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(mode === 'work' ? workDuration * 60 : breakDuration * 60);
    }
  }, [mode, workDuration, breakDuration, isRunning]);

  // Toggle timer
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  // Reset the timer
  const resetTimer = () => {
    setIsRunning(false);
    setMode('work');
    setTimeLeft(workDuration * 60);
  };

  // Calculate stroke dash for circular progress
  const circumference = 2 * Math.PI * 120; // circle radius is 120
  const strokeDashoffset = circumference - (getProgressPercentage() / 100) * circumference;

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Clock className="text-primary" />
          Pomodoro Timer
        </h1>
        <p className="text-muted-foreground">
          Stay focused with timed work sessions and breaks
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/20 to-accent/20 dark:from-primary/10 dark:to-accent/10">
          <CardTitle className="text-center text-xl">
            {mode === 'work' ? 'Work Session' : 'Break Time'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-6 flex flex-col items-center">
          {/* Timer Circle */}
          <div className="relative w-64 h-64 mb-6">
            {/* Background Circle */}
            <svg className="w-full h-full" viewBox="0 0 256 256">
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                strokeWidth="8"
                className="stroke-muted"
              />
              {/* Progress Circle */}
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 128 128)"
                className={`transition-all duration-500 ${
                  mode === 'work' ? 'stroke-primary' : 'stroke-green-500'
                }`}
              />
            </svg>
            
            {/* Time Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${mode}-${isRunning}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <div className="text-5xl font-bold mb-2">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-lg font-medium">
                    {mode === 'work' ? (
                      <>
                        <Briefcase className="h-5 w-5 text-primary" />
                        Work Mode
                      </>
                    ) : (
                      <>
                        <Coffee className="h-5 w-5 text-green-500" />
                        Break Time
                      </>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          
          {/* Timer Controls */}
          <div className="flex justify-center gap-3 mb-6 w-full">
            <Button 
              onClick={toggleTimer} 
              variant="default"
              className={isRunning ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
              size="lg"
            >
              {isRunning ? (
                <><Pause className="mr-2 h-4 w-4" /> Pause</>
              ) : (
                <><Play className="mr-2 h-4 w-4" /> Start</>
              )}
            </Button>
            
            <Button 
              onClick={resetTimer} 
              variant="outline"
              size="lg"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
          
          {/* Settings */}
          <div className="w-full space-y-6 mt-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">
                  Work Duration: {workDuration} min
                </label>
                <span className="text-xs text-muted-foreground">
                  <Briefcase className="inline h-3 w-3 mr-1" />
                  Work
                </span>
              </div>
              <Slider
                value={[workDuration]}
                min={5}
                max={60}
                step={5}
                onValueChange={values => setWorkDuration(values[0])}
                disabled={isRunning}
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">
                  Break Duration: {breakDuration} min
                </label>
                <span className="text-xs text-muted-foreground">
                  <Coffee className="inline h-3 w-3 mr-1" />
                  Break
                </span>
              </div>
              <Slider
                value={[breakDuration]}
                min={1}
                max={30}
                step={1}
                onValueChange={values => setBreakDuration(values[0])}
                disabled={isRunning}
              />
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-6 w-full flex justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Mode: </span>
              <span className="font-medium">
                {mode === 'work' ? 'Work' : 'Break'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Completed Cycles: </span>
              <span className="font-medium">{cycles}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tips */}
      <div className="mt-6 text-sm text-muted-foreground">
        <h3 className="font-medium text-base mb-2">Pomodoro Technique Tips:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Focus intensely during work sessions</li>
          <li>Take a complete break during break time</li>
          <li>After 4 work sessions, take a longer break (15-30 minutes)</li>
          <li>Use breaks to stretch, hydrate, or rest your eyes</li>
        </ul>
      </div>
    </div>
  );
}
