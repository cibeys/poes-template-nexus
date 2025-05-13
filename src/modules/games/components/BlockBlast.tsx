
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Constants
const GRID_SIZE = 10;
const CELL_SIZE = 40;
const COLORS = ["#ff5252", "#4caf50", "#2196f3", "#ffeb3b", "#9c27b0"];
const MIN_MATCH = 3;

type Block = {
  color: string;
  checked?: boolean;
  removing?: boolean;
  falling?: boolean;
};

export default function BlockBlast() {
  const [grid, setGrid] = useState<Block[][]>([]);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [movesLeft, setMovesLeft] = useState<number>(20);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const animationRequestRef = useRef<number>();
  const [animating, setAnimating] = useState<boolean>(false);
  
  // Initialize the game
  useEffect(() => {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('blockBlastHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    
    // Initialize empty grid
    initializeGrid();
    
    return () => {
      if (animationRequestRef.current) {
        cancelAnimationFrame(animationRequestRef.current);
      }
    };
  }, []);
  
  // Draw the game whenever the grid changes
  useEffect(() => {
    drawGame();
  }, [grid]);
  
  // Initialize the grid with random colored blocks
  const initializeGrid = () => {
    const newGrid: Block[][] = [];
    
    for (let y = 0; y < GRID_SIZE; y++) {
      const row: Block[] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        row.push({
          color: COLORS[Math.floor(Math.random() * COLORS.length)]
        });
      }
      newGrid.push(row);
    }
    
    setGrid(newGrid);
    setScore(0);
    setMovesLeft(20);
    setGameOver(false);
    setGameStarted(false);
  };
  
  // Start the game
  const startGame = () => {
    setGameStarted(true);
  };
  
  // Handle click on a block
  const handleBlockClick = (x: number, y: number) => {
    if (!gameStarted || gameOver || animating) return;
    
    // Create a deep copy of the grid
    const newGrid = JSON.parse(JSON.stringify(grid));
    
    // Ensure the grid is valid before proceeding
    if (!newGrid || !Array.isArray(newGrid) || newGrid.length === 0) {
      console.error("Invalid grid state");
      return;
    }
    
    // Reset any previous checks
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (newGrid[row] && newGrid[row][col]) {
          newGrid[row][col].checked = false;
        }
      }
    }
    
    // Check if coordinates are valid
    if (!newGrid[y] || !newGrid[y][x]) {
      console.error("Invalid coordinates:", x, y);
      return;
    }
    
    // Check for connected blocks of the same color
    const clickedColor = grid[y][x].color;
    const connectedBlocks = findConnectedBlocks(newGrid, x, y, clickedColor);
    
    // If enough connected blocks, remove them
    if (connectedBlocks.length >= MIN_MATCH) {
      setAnimating(true);
      
      // Mark blocks for removing animation
      connectedBlocks.forEach(([bx, by]) => {
        if (newGrid[by] && newGrid[by][bx]) {
          newGrid[by][bx].removing = true;
        }
      });
      
      setGrid(newGrid);
      
      // After animation, actually remove blocks and update score
      setTimeout(() => {
        removeBlocks(connectedBlocks);
        
        // Add to score based on how many blocks removed
        const pointsGained = connectedBlocks.length * connectedBlocks.length * 10;
        setScore(prevScore => prevScore + pointsGained);
        
        // Show toast for big matches
        if (connectedBlocks.length >= 5) {
          toast({
            title: "Great match!",
            description: `+${pointsGained} points`,
          });
        }
        
        // Decrement moves left
        setMovesLeft(prevMoves => {
          const newMoves = prevMoves - 1;
          
          // Check for game over
          if (newMoves <= 0) {
            handleGameOver();
          }
          
          return newMoves;
        });
      }, 300);
    }
  };
  
  // Find all connected blocks of the same color
  const findConnectedBlocks = (grid: Block[][], x: number, y: number, color: string): [number, number][] => {
    if (
      !grid || 
      y < 0 || 
      y >= GRID_SIZE || 
      x < 0 || 
      x >= GRID_SIZE || 
      !grid[y] || 
      !grid[y][x] ||
      grid[y][x].checked || 
      grid[y][x].color !== color
    ) {
      return [];
    }
    
    // Mark as checked
    grid[y][x].checked = true;
    
    // This block is part of the connected group
    let connectedBlocks: [number, number][] = [[x, y]];
    
    // Check adjacent blocks recursively
    connectedBlocks = [
      ...connectedBlocks,
      ...findConnectedBlocks(grid, x + 1, y, color), // Right
      ...findConnectedBlocks(grid, x - 1, y, color), // Left
      ...findConnectedBlocks(grid, x, y + 1, color), // Down
      ...findConnectedBlocks(grid, x, y - 1, color)  // Up
    ];
    
    return connectedBlocks;
  };
  
  // Remove blocks and collapse the grid
  const removeBlocks = (blocksToRemove: [number, number][]) => {
    if (!grid || grid.length === 0) return;
    
    const newGrid = JSON.parse(JSON.stringify(grid));
    
    // First pass: remove the blocks (set to null)
    blocksToRemove.forEach(([x, y]) => {
      if (newGrid[y] && newGrid[y][x] !== undefined) {
        newGrid[y][x] = null;
      }
    });
    
    // Second pass: for each column, move blocks down to fill gaps
    for (let x = 0; x < GRID_SIZE; x++) {
      const column: (Block | null)[] = [];
      
      // Extract the column
      for (let y = 0; y < GRID_SIZE; y++) {
        if (newGrid[y]) {
          column.push(newGrid[y][x]);
        } else {
          column.push(null);
        }
      }
      
      // Filter out null values
      const compactedColumn = column.filter(block => block !== null);
      
      // Add new blocks at the top
      while (compactedColumn.length < GRID_SIZE) {
        compactedColumn.unshift({
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          falling: true
        });
      }
      
      // Put the column back
      for (let y = 0; y < GRID_SIZE; y++) {
        if (newGrid[y]) {
          newGrid[y][x] = compactedColumn[y];
        }
      }
    }
    
    setGrid(newGrid);
    
    // After animation, clear falling state
    setTimeout(() => {
      if (!newGrid || newGrid.length === 0) return;
      
      const finalGrid = JSON.parse(JSON.stringify(newGrid));
      
      for (let y = 0; y < GRID_SIZE; y++) {
        if (!finalGrid[y]) continue;
        
        for (let x = 0; x < GRID_SIZE; x++) {
          if (finalGrid[y][x]?.falling) {
            finalGrid[y][x].falling = false;
          }
          if (finalGrid[y][x]?.removing) {
            finalGrid[y][x].removing = false;
          }
        }
      }
      
      setGrid(finalGrid);
      setAnimating(false);
      
      // Check if there are any valid moves left
      checkForValidMoves(finalGrid);
    }, 300);
  };
  
  // Check if there are any valid moves left
  const checkForValidMoves = (currentGrid: Block[][]) => {
    if (!currentGrid || currentGrid.length === 0) return;
    
    for (let y = 0; y < GRID_SIZE; y++) {
      if (!currentGrid[y]) continue;
      
      for (let x = 0; x < GRID_SIZE; x++) {
        if (!currentGrid[y][x]) continue;
        
        const color = currentGrid[y][x].color;
        const testGrid = JSON.parse(JSON.stringify(currentGrid));
        
        // Reset any previous checks
        for (let row = 0; row < GRID_SIZE; row++) {
          if (!testGrid[row]) continue;
          
          for (let col = 0; col < GRID_SIZE; col++) {
            if (testGrid[row][col]) {
              testGrid[row][col].checked = false;
            }
          }
        }
        
        const connectedBlocks = findConnectedBlocks(testGrid, x, y, color);
        if (connectedBlocks.length >= MIN_MATCH) {
          return; // Found at least one valid move
        }
      }
    }
    
    // If no valid moves found, end game or shuffle
    if (movesLeft > 0) {
      toast({
        title: "No moves left",
        description: "Shuffling the grid...",
      });
      shuffleGrid();
    } else {
      handleGameOver();
    }
  };
  
  // Shuffle the grid when no moves are left
  const shuffleGrid = () => {
    const newGrid: Block[][] = [];
    
    for (let y = 0; y < GRID_SIZE; y++) {
      const row: Block[] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        row.push({
          color: COLORS[Math.floor(Math.random() * COLORS.length)]
        });
      }
      newGrid.push(row);
    }
    
    setGrid(newGrid);
  };
  
  // Handle game over
  const handleGameOver = () => {
    setGameOver(true);
    
    // Update high score if needed
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('blockBlastHighScore', score.toString());
      toast({
        title: "New high score!",
        description: `You set a new high score of ${score}!`,
      });
    }
  };
  
  // Draw the game
  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);
    
    // Draw background grid
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);
    
    // Draw blocks
    if (grid && grid.length > 0) {
      for (let y = 0; y < Math.min(GRID_SIZE, grid.length); y++) {
        if (!grid[y]) continue;
        
        for (let x = 0; x < GRID_SIZE; x++) {
          const block = grid[y][x];
          if (!block) continue;
          
          const blockSize = block.removing ? CELL_SIZE * 0.5 : CELL_SIZE * 0.9;
          const offset = (CELL_SIZE - blockSize) / 2;
          
          ctx.fillStyle = block.color;
          
          // Apply glow effect for falling blocks
          if (block.falling) {
            ctx.shadowColor = block.color;
            ctx.shadowBlur = 10;
          } else {
            ctx.shadowBlur = 0;
          }
          
          // Apply scale out animation for removing blocks
          ctx.fillRect(
            x * CELL_SIZE + offset,
            y * CELL_SIZE + offset,
            blockSize,
            blockSize
          );
          
          ctx.shadowBlur = 0;
        }
      }
    }
    
    // Draw grid lines
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    
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
    
    // Game over overlay
    if (gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      
      ctx.font = "bold 24px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(
        "Game Over",
        (GRID_SIZE * CELL_SIZE) / 2,
        (GRID_SIZE * CELL_SIZE) / 2 - 20
      );
      
      ctx.font = "16px Arial";
      ctx.fillText(
        `Score: ${score}`,
        (GRID_SIZE * CELL_SIZE) / 2,
        (GRID_SIZE * CELL_SIZE) / 2 + 10
      );
    }
    
    // Start screen overlay
    if (!gameStarted && !gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      
      ctx.font = "bold 24px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(
        "Block Blast",
        (GRID_SIZE * CELL_SIZE) / 2,
        (GRID_SIZE * CELL_SIZE) / 2 - 20
      );
      
      ctx.font = "16px Arial";
      ctx.fillText(
        "Click to Start",
        (GRID_SIZE * CELL_SIZE) / 2,
        (GRID_SIZE * CELL_SIZE) / 2 + 10
      );
    }
  };
  
  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // If game hasn't started yet, start it
    if (!gameStarted && !gameOver) {
      startGame();
      return;
    }
    
    // If game is over, ignore clicks
    if (gameOver) return;
    
    // Calculate which cell was clicked
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    
    // Check if click is within grid bounds
    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      handleBlockClick(x, y);
    }
  };

  return (
    <Card className="w-full max-w-[500px] mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Block Blast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="flex justify-between w-full mb-4">
            <div className="text-lg">Score: {score}</div>
            <div className="text-lg">High Score: {highScore}</div>
            <div className="text-lg">Moves: {movesLeft}</div>
          </div>
          
          <div className="border border-gray-300 rounded mb-4">
            <canvas
              ref={canvasRef}
              width={GRID_SIZE * CELL_SIZE}
              height={GRID_SIZE * CELL_SIZE}
              onClick={handleCanvasClick}
              className={`cursor-pointer ${animating ? 'opacity-80' : ''}`}
            />
          </div>
          
          <Button
            onClick={() => {
              initializeGrid();
              if (gameOver) {
                setGameStarted(false);
              }
            }}
            className="w-full"
          >
            {gameOver ? "Play Again" : "Reset Game"}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-center text-gray-500 block">
        <p>Match 3 or more adjacent blocks of the same color to remove them.</p>
        <p className="mt-1">The more blocks you remove at once, the more points you get!</p>
      </CardFooter>
    </Card>
  );
}
