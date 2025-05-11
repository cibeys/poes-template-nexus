
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCcw } from 'lucide-react';

const paragraphs = [
  "The quick brown fox jumps over the lazy dog. This classic pangram contains every letter of the alphabet, making it a perfect sentence for typing practice.",
  "Technology continues to evolve at an unprecedented pace, transforming how we live, work, and communicate with one another across the globe.",
  "Learning to type quickly and accurately is an essential skill in today's digital world. Regular practice can significantly improve your typing speed and efficiency.",
  "The beautiful sunset cast a warm glow over the calm ocean. Waves gently lapped against the shore as seagulls soared overhead in the amber sky.",
  "Creating a consistent typing practice routine is key to improving your speed and accuracy. Just a few minutes daily can lead to significant improvements over time."
];

export default function TypingSpeedTest() {
  const [currentParagraph, setCurrentParagraph] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timer, setTimer] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * paragraphs.length);
    setCurrentParagraph(paragraphs[randomIndex]);
  }, []);

  useEffect(() => {
    if (isActive && timer > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      calculateResult();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (!startTime && value.length > 0) {
      setStartTime(Date.now());
      setIsActive(true);
    }
    
    setUserInput(value);

    // Calculate live accuracy
    let mistakeCount = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== currentParagraph[i]) {
        mistakeCount++;
      }
    }
    
    setMistakes(mistakeCount);
    
    // Check if user has completed the paragraph
    if (value === currentParagraph) {
      calculateResult();
      setIsFinished(true);
      setIsActive(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  const startTest = () => {
    const randomIndex = Math.floor(Math.random() * paragraphs.length);
    setCurrentParagraph(paragraphs[randomIndex]);
    setUserInput('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setTimer(60);
    setIsActive(false);
    setIsFinished(false);
    setMistakes(0);
    if (inputRef.current) inputRef.current.focus();
  };

  const calculateResult = () => {
    if (startTime) {
      const endTime = Date.now();
      const timeInMinutes = (endTime - startTime) / 60000;
      
      // Count words (divide by 5 characters for standard WPM calculation)
      const wordCount = userInput.length / 5;
      
      // Calculate WPM
      const calculatedWpm = Math.round(wordCount / timeInMinutes);
      setWpm(calculatedWpm);
      
      // Calculate accuracy
      const totalCharacters = userInput.length;
      const calculatedAccuracy = Math.max(0, Math.round(((totalCharacters - mistakes) / totalCharacters) * 100));
      setAccuracy(calculatedAccuracy);
      
      // Set other statistics
      setWordCount(userInput.trim().split(/\s+/).length);
      setCharCount(userInput.length);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <Card className="shadow-xl border-t-4 border-t-primary">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>Typing Speed Test</span>
            <Button variant="ghost" size="sm" asChild>
              <a href="/tools">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tools
              </a>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isFinished ? (
            <>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Time left: {timer}s</span>
                <span className="text-sm font-medium">WPM: {wpm}</span>
                <span className="text-sm font-medium">Accuracy: {accuracy}%</span>
              </div>
              
              <Progress value={timer} max={60} className="h-2 bg-gray-200 dark:bg-gray-700" />
              
              <motion.div 
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-lg leading-relaxed mb-4"
                animate={{ scale: [1, 1.01, 1] }}
                transition={{ duration: 0.3 }}
              >
                {currentParagraph.split('').map((char, index) => {
                  let charClass = '';
                  
                  if (index < userInput.length) {
                    charClass = userInput[index] === char 
                      ? 'text-green-500 dark:text-green-400' 
                      : 'text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
                  }
                  
                  return (
                    <span key={index} className={charClass}>
                      {char}
                    </span>
                  );
                })}
              </motion.div>
              
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                className="w-full p-4 border rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Start typing here..."
                disabled={isFinished}
                autoFocus
              />
            </>
          ) : (
            <div className="text-center py-8 space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-5xl font-bold text-primary"
              >
                {wpm} WPM
              </motion.div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold">{accuracy}%</div>
                  <div className="text-sm text-gray-500">Accuracy</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold">{wordCount}</div>
                  <div className="text-sm text-gray-500">Words</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold">{charCount}</div>
                  <div className="text-sm text-gray-500">Characters</div>
                </div>
              </div>
              
              <Button onClick={startTest} className="animate-bounce">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <span className="text-xs text-gray-500">
            {!isFinished ? "Type the text above as quickly and accurately as you can" : "Great job! Try again to improve your speed"}
          </span>
          {!isFinished && !isActive && (
            <Button onClick={startTest} variant="outline" size="sm">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
