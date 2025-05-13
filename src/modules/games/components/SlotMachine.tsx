
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

const SYMBOLS = [
  { name: "🍒", value: 10 },   // Cherry
  { name: "🍋", value: 20 },   // Lemon
  { name: "🍊", value: 30 },   // Orange
  { name: "🍇", value: 40 },   // Grapes
  { name: "🍉", value: 50 },   // Watermelon
  { name: "🔔", value: 80 },   // Bell
  { name: "💎", value: 100 },  // Diamond
  { name: "7️⃣", value: 200 },  // Seven
];

const NUM_REELS = 3;
const SPIN_DURATION = 2000;
const REEL_DELAY = 400;

export default function SlotMachine() {
  const [credits, setCredits] = useState(1000);
  const [bet, setBet] = useState(10);
  const [reels, setReels] = useState<string[]>(Array(NUM_REELS).fill(SYMBOLS[0].name));
  const [spinning, setSpinning] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const autoSpinRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved credits from localStorage
    const savedCredits = localStorage.getItem('slotMachineCredits');
    if (savedCredits) {
      setCredits(parseInt(savedCredits));
    }

    return () => {
      if (autoSpinRef.current) {
        clearTimeout(autoSpinRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Save credits to localStorage when they change
    localStorage.setItem('slotMachineCredits', credits.toString());
  }, [credits]);

  // Handle auto-spin functionality
  useEffect(() => {
    if (autoSpin && !spinning && credits >= bet) {
      autoSpinRef.current = setTimeout(() => {
        handleSpin();
      }, 1000);
    }

    return () => {
      if (autoSpinRef.current) {
        clearTimeout(autoSpinRef.current);
      }
    };
  }, [autoSpin, spinning, credits, bet]);

  const handleBetChange = (newBet: number) => {
    if (!spinning) {
      setBet(newBet);
    }
  };

  const handleSpin = () => {
    if (credits < bet) {
      toast({
        title: "Not enough credits",
        description: "Please add more credits or lower your bet",
        variant: "destructive"
      });
      setAutoSpin(false);
      return;
    }

    setCredits(prev => prev - bet);
    setSpinning(true);
    setShowWin(false);
    setWinAmount(0);

    // Spin each reel with a delay
    const finalReels: string[] = [];
    
    for (let i = 0; i < NUM_REELS; i++) {
      const spinTimeout = setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
        const symbol = SYMBOLS[randomIndex].name;
        
        finalReels[i] = symbol;
        
        setReels(prevReels => {
          const newReels = [...prevReels];
          newReels[i] = symbol;
          return newReels;
        });
        
        // After the last reel stops, check for wins
        if (i === NUM_REELS - 1) {
          setTimeout(() => {
            checkWin(finalReels);
            setSpinning(false);
          }, 500); // Small delay after all reels stop
        }
      }, SPIN_DURATION + (i * REEL_DELAY));
    }
  };

  const checkWin = (finalReels: string[]) => {
    // Check for matches
    const uniqueSymbols = new Set(finalReels);
    
    if (uniqueSymbols.size === 1) {
      // All symbols match (3 of a kind)
      const symbol = finalReels[0];
      const matchedSymbol = SYMBOLS.find(s => s.name === symbol);
      if (matchedSymbol) {
        const win = bet * matchedSymbol.value / 10;
        setCredits(prev => prev + win);
        setWinAmount(win);
        setShowWin(true);
        
        if (win >= bet * 5) {
          // Big win
          triggerConfetti();
          toast({
            title: "BIG WIN!",
            description: `You won ${win} credits!`,
          });
        } else {
          toast({
            title: "Winner!",
            description: `You won ${win} credits!`,
          });
        }
      }
    } else if (uniqueSymbols.size === 2) {
      // 2 of a kind (partial win)
      const counts: Record<string, number> = {};
      finalReels.forEach(symbol => {
        counts[symbol] = (counts[symbol] || 0) + 1;
      });
      
      const pairs = Object.entries(counts).find(([_, count]) => count === 2);
      
      if (pairs) {
        const symbol = pairs[0];
        const matchedSymbol = SYMBOLS.find(s => s.name === symbol);
        if (matchedSymbol) {
          const win = Math.floor(bet * matchedSymbol.value / 40);
          setCredits(prev => prev + win);
          setWinAmount(win);
          setShowWin(true);
          
          toast({
            title: "Small Win",
            description: `You won ${win} credits with a pair!`,
          });
        }
      }
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const addCredits = () => {
    setCredits(prev => prev + 1000);
    toast({
      title: "Credits added",
      description: "1000 credits have been added to your account",
    });
  };

  const toggleAutoSpin = () => {
    setAutoSpin(prev => !prev);
  };

  return (
    <Card className="w-full max-w-[500px] mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Slot Machine</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="flex justify-between w-full mb-4">
            <div className="text-lg">Credits: {credits}</div>
            <div className="text-lg">Bet: {bet}</div>
          </div>
          
          {/* Slot machine display */}
          <div className="bg-zinc-900 p-6 rounded-lg border-4 border-amber-500 shadow-inner mb-6 w-full">
            <div className="flex justify-around gap-2">
              {reels.map((symbol, index) => (
                <div 
                  key={index}
                  className={`
                    text-6xl flex items-center justify-center 
                    bg-white rounded-md aspect-square w-20 h-20
                    ${spinning ? 'animate-pulse' : ''}
                  `}
                  style={{
                    animationDelay: `${index * REEL_DELAY / 1000}s`,
                  }}
                >
                  {symbol}
                </div>
              ))}
            </div>
            
            {showWin && (
              <div className="text-center text-yellow-400 font-bold text-xl mt-4 animate-pulse">
                + {winAmount} credits
              </div>
            )}
          </div>
          
          {/* Bet controls */}
          <div className="grid grid-cols-3 gap-2 w-full mb-4">
            <Button 
              variant="outline" 
              onClick={() => handleBetChange(Math.max(10, bet - 10))}
              disabled={spinning || bet <= 10}
            >
              -10
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleBetChange(Math.max(1, bet - 1))}
              disabled={spinning || bet <= 1}
            >
              -1
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleBetChange(1)}
              disabled={spinning}
            >
              Min
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleBetChange(bet + 1)}
              disabled={spinning || bet >= Math.min(credits, 100)}
            >
              +1
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleBetChange(bet + 10)}
              disabled={spinning || bet >= Math.min(credits, 100) - 10}
            >
              +10
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleBetChange(Math.min(credits, 100))}
              disabled={spinning}
            >
              Max
            </Button>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3 w-full">
            <Button 
              onClick={handleSpin} 
              disabled={spinning || credits < bet} 
              className="flex-1"
              variant="default"
              size="lg"
            >
              {spinning ? "Spinning..." : "Spin"}
            </Button>
            <Button 
              onClick={toggleAutoSpin} 
              disabled={spinning || credits < bet}
              variant={autoSpin ? "destructive" : "outline"}
              className="w-24"
            >
              {autoSpin ? "Stop" : "Auto"}
            </Button>
          </div>
          
          <Button 
            onClick={addCredits} 
            variant="outline" 
            className="w-full mt-4"
          >
            Add 1000 Credits
          </Button>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-center text-gray-500 block">
        <p>
          Match 3 symbols to win big! Match 2 for a smaller prize.
        </p>
        <p className="mt-1">
          Payouts: 7️⃣ (200x) 💎 (100x) 🔔 (80x) 🍉 (50x) 🍇 (40x) 🍊 (30x) 🍋 (20x) 🍒 (10x)
        </p>
      </CardFooter>
    </Card>
  );
}
