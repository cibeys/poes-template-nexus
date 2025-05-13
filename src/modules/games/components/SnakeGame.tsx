
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Cell = {
  x: number;
  y: number;
};

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 }
];
const INITIAL_DIRECTION = 'RIGHT';
const GAME_SPEED = 100; // in ms

export default function SnakeGame() {
  const [snake, setSnake] = useState<Cell[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Cell>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [paused, setPaused] = useState<boolean>(true);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Initialize the game and set up event listeners
  useEffect(() => {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    
    // Set up keyboard controls
    const handleKeydown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        case ' ': // Space bar to pause/resume
          setPaused(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeydown);
    
    // Draw initial game state
    drawGame();

    return () => {
      window.removeEventListener('keydown', handleKeydown);
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [direction]);

  // Game loop
  useEffect(() => {
    if (gameOver || paused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    gameLoopRef.current = setInterval(() => {
      moveSnake();
    }, GAME_SPEED);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [snake, food, direction, gameOver, paused]);

  // Place food at a random position not occupied by the snake
  const placeFood = () => {
    let newFood: Cell;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    setFood(newFood);
  };

  // Move the snake in the current direction
  const moveSnake = () => {
    const head = { ...snake[0] };
    
    // Calculate new head position
    switch (direction) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
    }
    
    // Check for collision with walls
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      handleGameOver();
      return;
    }
    
    // Check for collision with self
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      handleGameOver();
      return;
    }
    
    // Create new snake array with new head
    const newSnake = [head, ...snake];
    
    // Check for food collision
    if (head.x === food.x && head.y === food.y) {
      // Snake grows, don't remove tail
      setScore(prev => prev + 10);
      placeFood();
    } else {
      // Remove tail
      newSnake.pop();
    }
    
    setSnake(newSnake);
    drawGame();
  };

  // Handle game over
  const handleGameOver = () => {
    setGameOver(true);
    
    // Update high score if needed
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snakeHighScore', score.toString());
      toast({
        title: "New high score!",
        description: `You set a new high score of ${score}!`,
      });
    }
  };

  // Reset the game
  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    placeFood();
    setPaused(true);
    drawGame();
  };

  // Toggle pause state
  const togglePause = () => {
    setPaused(prev => !prev);
  };

  // Draw the game on canvas
  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);

    // Draw snake
    ctx.fillStyle = '#4CAF50';
    snake.forEach((segment, index) => {
      // Head is a different color
      if (index === 0) {
        ctx.fillStyle = '#388E3C';
      } else {
        ctx.fillStyle = '#4CAF50';
      }
      
      ctx.fillRect(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
      
      // Add eyes to the head
      if (index === 0) {
        ctx.fillStyle = 'white';
        
        const eyeSize = CELL_SIZE / 5;
        const eyeOffset = CELL_SIZE / 3;
        
        // Position eyes based on direction
        let eyeX1 = segment.x * CELL_SIZE + eyeOffset;
        let eyeY1 = segment.y * CELL_SIZE + eyeOffset;
        let eyeX2 = segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
        let eyeY2 = segment.y * CELL_SIZE + eyeOffset;
        
        ctx.fillRect(eyeX1, eyeY1, eyeSize, eyeSize);
        ctx.fillRect(eyeX2, eyeY2, eyeSize, eyeSize);
      }
    });

    // Draw food
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2,
      0,
      2 * Math.PI
    );
    ctx.fill();

    // Draw grid (optional)
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= GRID_SIZE; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
      
      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw game over text
    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText(
        'Game Over',
        (GRID_SIZE * CELL_SIZE) / 2,
        (GRID_SIZE * CELL_SIZE) / 2 - 20
      );
      
      ctx.font = '16px Arial';
      ctx.fillText(
        `Score: ${score}`,
        (GRID_SIZE * CELL_SIZE) / 2,
        (GRID_SIZE * CELL_SIZE) / 2 + 10
      );
      
      ctx.fillText(
        'Press SPACE to reset',
        (GRID_SIZE * CELL_SIZE) / 2,
        (GRID_SIZE * CELL_SIZE) / 2 + 40
      );
    }
    
    // Draw pause overlay
    if (paused && !gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText(
        'Paused',
        (GRID_SIZE * CELL_SIZE) / 2,
        (GRID_SIZE * CELL_SIZE) / 2
      );
      
      ctx.font = '16px Arial';
      ctx.fillText(
        'Press SPACE to play',
        (GRID_SIZE * CELL_SIZE) / 2,
        (GRID_SIZE * CELL_SIZE) / 2 + 30
      );
    }
  };

  // Mobile controls
  const handleControlClick = (newDirection: Direction) => {
    if (
      (newDirection === 'UP' && direction !== 'DOWN') ||
      (newDirection === 'DOWN' && direction !== 'UP') ||
      (newDirection === 'LEFT' && direction !== 'RIGHT') ||
      (newDirection === 'RIGHT' && direction !== 'LEFT')
    ) {
      setDirection(newDirection);
    }
  };

  return (
    <Card className="w-full max-w-[600px] mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Snake Game</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="flex justify-between w-full mb-4">
            <div className="text-lg">Score: {score}</div>
            <div className="text-lg">High Score: {highScore}</div>
          </div>
          
          <div className="border border-gray-300 rounded">
            <canvas
              ref={canvasRef}
              width={GRID_SIZE * CELL_SIZE}
              height={GRID_SIZE * CELL_SIZE}
              className="bg-slate-50 dark:bg-slate-900"
            />
          </div>
          
          <div className="mt-4">
            {gameOver ? (
              <Button onClick={resetGame} className="w-full">
                Play Again
              </Button>
            ) : (
              <Button onClick={togglePause} className="w-full">
                {paused ? "Start Game" : "Pause"}
              </Button>
            )}
          </div>
          
          {/* Mobile controls */}
          <div className="mt-6 grid grid-cols-3 gap-2 w-36">
            <div className="col-start-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleControlClick('UP')}
                className="w-12 h-12"
              >
                ↑
              </Button>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleControlClick('LEFT')}
              className="w-12 h-12"
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleControlClick('DOWN')}
              className="w-12 h-12"
            >
              ↓
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleControlClick('RIGHT')}
              className="w-12 h-12"
            >
              →
            </Button>
          </div>
          
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            <p className="text-center">Use arrow keys to control, space to pause/resume.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
