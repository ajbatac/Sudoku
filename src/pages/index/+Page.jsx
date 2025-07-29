import { useState, useEffect, useCallback } from "react";
import "../../layouts/tailwind.css";

export function Page() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [grid, setGrid] = useState(
    Array(9)
      .fill()
      .map(() => Array(9).fill(0)),
  );
  const [initialGrid, setInitialGrid] = useState(
    Array(9)
      .fill()
      .map(() => Array(9).fill(0)),
  );
  const [selectedCell, setSelectedCell] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [blinkCell, setBlinkCell] = useState(null); // { row, col, type: 'correct' | 'mistake' }
  const [blinkGrid, setBlinkGrid] = useState(false);

  // Save game state to localStorage
  const saveGameState = useCallback((gameState) => {
    try {
      localStorage.setItem("sudoku-game-state", JSON.stringify(gameState));
    } catch (error) {
      console.error("Failed to save game state:", error);
    }
  }, []);

  // Load game state from localStorage
  const loadGameState = useCallback(() => {
    try {
      const saved = localStorage.getItem("sudoku-game-state");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Failed to load game state:", error);
    }
    return null;
  }, []);

  // Clear saved game state
  const clearSavedState = useCallback(() => {
    try {
      localStorage.removeItem("sudoku-game-state");
    } catch (error) {
      console.error("Failed to clear game state:", error);
    }
  }, []);

  // Load saved game on component mount
  useEffect(() => {
    const savedState = loadGameState();
    if (savedState) {
      // Restore all game state
      setCurrentLevel(savedState.currentLevel || 1);
      setGrid(
        savedState.grid ||
          Array(9)
            .fill()
            .map(() => Array(9).fill(0)),
      );
      setInitialGrid(
        savedState.initialGrid ||
          Array(9)
            .fill()
            .map(() => Array(9).fill(0)),
      );
      setSelectedCell(savedState.selectedCell || null);
      setIsComplete(savedState.isComplete || false);
      setMistakes(savedState.mistakes || 0);
      setGameStarted(savedState.gameStarted || false);
      setTimer(savedState.timer || 0);
      setIsTimerRunning(savedState.isTimerRunning || false);

      // If game was in progress, skip countdown
      if (savedState.gameStarted && !savedState.isComplete) {
        setCountdown(0);
      } else {
        setCountdown(3);
      }
    }
  }, [loadGameState]);

  // Save game state whenever important state changes
  useEffect(() => {
    if (gameStarted || isComplete) {
      const gameState = {
        currentLevel,
        grid,
        initialGrid,
        selectedCell,
        isComplete,
        mistakes,
        gameStarted,
        timer,
        isTimerRunning: isTimerRunning && !isComplete,
        lastSaved: Date.now(),
      };
      saveGameState(gameState);
    }
  }, [
    currentLevel,
    grid,
    initialGrid,
    selectedCell,
    isComplete,
    mistakes,
    gameStarted,
    timer,
    isTimerRunning,
    saveGameState,
  ]);

  // Generate a proper sudoku puzzle with progressive difficulty
  const generatePuzzle = useCallback((level) => {
    // Base complete sudoku solutions
    const baseSolutions = [
      [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9],
      ],
      [
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 7, 8, 9, 1, 2, 3],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [2, 3, 1, 5, 6, 4, 8, 9, 7],
        [5, 6, 4, 8, 9, 7, 2, 3, 1],
        [8, 9, 7, 2, 3, 1, 5, 6, 4],
        [3, 1, 2, 6, 4, 5, 9, 7, 8],
        [6, 4, 5, 9, 7, 8, 3, 1, 2],
        [9, 7, 8, 3, 1, 2, 6, 4, 5],
      ],
    ];

    // Select base solution and create variations
    const baseIndex = level % baseSolutions.length;
    const solution = baseSolutions[baseIndex].map((row) => [...row]);

    // Apply transformations based on level for variety
    if (level > 10) {
      // Swap rows within blocks
      const blockStart = Math.floor((level / 10) % 3) * 3;
      [solution[blockStart], solution[blockStart + 1]] = [
        solution[blockStart + 1],
        solution[blockStart],
      ];
    }

    if (level > 20) {
      // Swap columns within blocks
      const blockStart = Math.floor((level / 20) % 3) * 3;
      for (let row = 0; row < 9; row++) {
        [solution[row][blockStart], solution[row][blockStart + 1]] = [
          solution[row][blockStart + 1],
          solution[row][blockStart],
        ];
      }
    }

    // Calculate difficulty: more cells removed for higher levels
    let cellsToRemove;
    if (level <= 10) {
      cellsToRemove = 35 + level; // Very easy: 36-45 cells removed
    } else if (level <= 30) {
      cellsToRemove = 45 + Math.floor((level - 10) / 2); // Easy: 45-55 cells removed
    } else if (level <= 60) {
      cellsToRemove = 55 + Math.floor((level - 30) / 3); // Medium: 55-65 cells removed
    } else if (level <= 85) {
      cellsToRemove = 65 + Math.floor((level - 60) / 5); // Hard: 65-70 cells removed
    } else {
      cellsToRemove = 70 + Math.floor((level - 85) / 3); // Expert: 70-75 cells removed
    }

    // Create puzzle by removing cells
    const puzzle = solution.map((row) => [...row]);
    const cellsToRemoveList = [];

    // Generate list of all cell positions
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        cellsToRemoveList.push([row, col]);
      }
    }

    // Shuffle and remove cells
    for (let i = cellsToRemoveList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cellsToRemoveList[i], cellsToRemoveList[j]] = [
        cellsToRemoveList[j],
        cellsToRemoveList[i],
      ];
    }

    for (
      let i = 0;
      i < Math.min(cellsToRemove, cellsToRemoveList.length);
      i++
    ) {
      const [row, col] = cellsToRemoveList[i];
      puzzle[row][col] = 0;
    }

    return puzzle;
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning && gameStarted && !isComplete) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, gameStarted, isComplete]);

  // Keyboard input effect
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!selectedCell || !gameStarted || isComplete) return;

      const key = event.key;

      // Handle number keys 1-9
      if (key >= "1" && key <= "9") {
        event.preventDefault();
        handleNumberInput(parseInt(key));
      }
      // Handle delete/backspace/0 for clearing
      else if (key === "Delete" || key === "Backspace" || key === "0") {
        event.preventDefault();
        handleNumberInput(0);
      }
      // Handle escape to deselect
      else if (key === "Escape") {
        event.preventDefault();
        setSelectedCell(null);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [selectedCell, gameStarted, isComplete]);

  // Countdown effect
  useEffect(() => {
    if (!gameStarted && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!gameStarted && countdown === 0) {
      setGameStarted(true);
      setIsTimerRunning(true);
    }
  }, [countdown, gameStarted]);

  // Celebration effect
  useEffect(() => {
    if (isComplete) {
      setShowCelebration(true);
      setIsTimerRunning(false);
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isComplete]);

  // Initialize puzzle
  useEffect(() => {
    const puzzle = generatePuzzle(currentLevel);
    setGrid(puzzle);
    setInitialGrid(puzzle.map((row) => [...row]));
    setIsComplete(false);
    setMistakes(0);
    setSelectedCell(null);
    setGameStarted(false);
    setCountdown(3);
    setTimer(0);
    setIsTimerRunning(false);
    setShowCelebration(false);
  }, [currentLevel, generatePuzzle]);

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Get difficulty label
  const getDifficultyLabel = (level) => {
    if (level <= 10) return "Beginner";
    if (level <= 30) return "Easy";
    if (level <= 60) return "Medium";
    if (level <= 85) return "Hard";
    return "Expert";
  };

  // Check if number is valid in position
  const isValidMove = (grid, row, col, num) => {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (x !== col && grid[row][x] === num) return false;
    }

    // Check column
    for (let x = 0; x < 9; x++) {
      if (x !== row && grid[x][col] === num) return false;
    }

    // Check 3x3 box
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const currentRow = startRow + i;
        const currentCol = startCol + j;
        if (
          currentRow !== row &&
          currentCol !== col &&
          grid[currentRow][currentCol] === num
        ) {
          return false;
        }
      }
    }

    return true;
  };

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (initialGrid[row][col] === 0) {
      setSelectedCell({ row, col });
    }
  };

  // Handle number input
  const handleNumberInput = (num) => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    const newGrid = [...grid];

    if (num === 0) {
      newGrid[row][col] = 0;
      setGrid(newGrid);
    } else if (isValidMove(newGrid, row, col, num)) {
      newGrid[row][col] = num;
      setGrid(newGrid);

      // Trigger green blink for correct move
      setBlinkCell({ row, col, type: "correct" });
      setTimeout(() => setBlinkCell(null), 500);

      // Check if puzzle is complete
      const isGridComplete = newGrid.every((row) =>
        row.every((cell) => cell !== 0),
      );
      if (isGridComplete) {
        setIsComplete(true);
        // Trigger grid blink for completion
        setBlinkGrid(true);
        setTimeout(() => setBlinkGrid(false), 500);
      }
    } else {
      setMistakes((prev) => prev + 1);

      // Trigger yellow blink for mistake
      setBlinkCell({ row, col, type: "mistake" });
      setTimeout(() => setBlinkCell(null), 500);
      return;
    }
  };

  // Handle level change
  const handleLevelChange = (level) => {
    setCurrentLevel(level);
    setShowLevelSelect(false);
    setShowMenu(false);
    // Clear saved state when changing levels
    clearSavedState();
  };

  // Handle new game
  const handleNewGame = () => {
    const puzzle = generatePuzzle(currentLevel);
    setGrid(puzzle);
    setInitialGrid(puzzle.map((row) => [...row]));
    setIsComplete(false);
    setMistakes(0);
    setSelectedCell(null);
    setGameStarted(false);
    setCountdown(3);
    setTimer(0);
    setIsTimerRunning(false);
    setShowCelebration(false);
    setShowMenu(false);
    // Clear saved state when starting new game
    clearSavedState();
  };

  // Countdown overlay
  if (!gameStarted && countdown > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-inter">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">
            Level {currentLevel}
          </h1>
          <div className="text-8xl font-bold text-blue-600 mb-4 animate-pulse">
            {countdown}
          </div>
          <p className="text-xl text-gray-600">
            {getDifficultyLabel(currentLevel)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 font-inter relative overflow-hidden">
      {/* Celebration Animations */}
      {showCelebration && (
        <>
          {/* Fireworks at top */}
          <div className="fixed top-0 left-0 right-0 h-32 pointer-events-none z-50">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-ping"
                style={{
                  left: `${20 + i * 12}%`,
                  top: `${10 + (i % 2) * 15}px`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: "1s",
                }}
              >
                <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                <div className="absolute top-0 left-0 w-4 h-4 bg-red-400 rounded-full animate-pulse"></div>
                <div className="absolute top-0 left-0 w-4 h-4 bg-blue-400 rounded-full animate-bounce"></div>
              </div>
            ))}
          </div>

          {/* Confetti at bottom */}
          <div className="fixed bottom-0 left-0 right-0 h-32 pointer-events-none z-50">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  bottom: `${Math.random() * 100}px`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    [
                      "bg-red-400",
                      "bg-blue-400",
                      "bg-green-400",
                      "bg-yellow-400",
                      "bg-purple-400",
                      "bg-pink-400",
                    ][Math.floor(Math.random() * 6)]
                  }`}
                ></div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Sudoku</h1>

          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="bg-white hover:bg-gray-50 p-3 rounded-xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] transition-all duration-200 active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className="w-full h-0.5 bg-gray-600 rounded"></div>
                <div className="w-full h-0.5 bg-gray-600 rounded"></div>
                <div className="w-full h-0.5 bg-gray-600 rounded"></div>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-[16px_16px_32px_#d1d5db,-16px_-16px_32px_#ffffff] p-4 min-w-48 z-40">
                <button
                  onClick={() => {
                    setShowInstructions(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 mb-2"
                >
                  How to Play
                </button>
                <button
                  onClick={() => setShowLevelSelect(true)}
                  className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 mb-2"
                >
                  Select Level
                </button>
                <button
                  onClick={handleNewGame}
                  className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 mb-2"
                >
                  New Game
                </button>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="text-sm text-gray-500 p-3">
                    <div>Level: {currentLevel}</div>
                    <div>Difficulty: {getDifficultyLabel(currentLevel)}</div>
                    <div>Time: {formatTime(timer)}</div>
                    <div>Mistakes: {mistakes}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Side - Sudoku Game */}
          <div className="flex-1">
            {/* Game Stats */}
            <div className="bg-white rounded-2xl p-4 mb-6 shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff]">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Level {currentLevel} - {getDifficultyLabel(currentLevel)}
                </div>
                <div className="text-lg font-bold text-gray-800">
                  {formatTime(timer)}
                </div>
                <div className="text-sm text-gray-600">
                  Mistakes: {mistakes}
                </div>
              </div>
            </div>

            {/* Sudoku Grid */}
            <div
              className={`bg-gray-800 rounded-3xl p-4 mb-6 shadow-[16px_16px_32px_#d1d5db,-16px_-16px_32px_#ffffff] transition-all duration-500 ${blinkGrid ? "ring-4 ring-green-400 shadow-[0_0_20px_rgba(34,197,94,0.5)]" : ""}`}
            >
              <div className="grid grid-cols-9 gap-2 bg-gray-900 p-4 rounded-2xl">
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const isSelected =
                      selectedCell?.row === rowIndex &&
                      selectedCell?.col === colIndex;
                    const isInitial = initialGrid[rowIndex][colIndex] !== 0;
                    const isBoxBorder =
                      (rowIndex % 3 === 2 && rowIndex !== 8) ||
                      (colIndex % 3 === 2 && colIndex !== 8);
                    const isBlinking =
                      blinkCell?.row === rowIndex &&
                      blinkCell?.col === colIndex;
                    const blinkType = isBlinking ? blinkCell.type : null;

                    return (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        className={`
                          aspect-square flex items-center justify-center text-lg font-bold rounded-lg transition-all duration-200
                          ${
                            isSelected
                              ? "bg-blue-500 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3)] text-white"
                              : isBlinking && blinkType === "correct"
                                ? "bg-green-400 shadow-[0_0_15px_rgba(34,197,94,0.6)] text-white animate-pulse"
                                : isBlinking && blinkType === "mistake"
                                  ? "bg-yellow-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] text-gray-800 animate-pulse"
                                  : "bg-white hover:bg-gray-50 shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.1)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]"
                          }
                          ${isInitial ? "text-gray-800 font-black" : isBlinking ? "" : "text-blue-600"}
                          ${isBoxBorder ? "border-r-4 border-b-4 border-gray-600" : ""}
                        `}
                        disabled={isInitial}
                      >
                        {cell !== 0 ? cell : ""}
                      </button>
                    );
                  }),
                )}
              </div>
            </div>

            {/* Number Input */}
            <div className="bg-white rounded-3xl p-6 shadow-[16px_16px_32px_#d1d5db,-16px_-16px_32px_#ffffff]">
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumberInput(num)}
                    className="aspect-square flex items-center justify-center text-xl font-bold bg-gray-100 hover:bg-gray-200 rounded-xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] transition-all duration-200 active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] disabled:opacity-50"
                    disabled={!selectedCell}
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => handleNumberInput(0)}
                  className="aspect-square flex items-center justify-center text-sm font-bold bg-red-100 hover:bg-red-200 rounded-xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] transition-all duration-200 active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] text-red-600 disabled:opacity-50"
                  disabled={!selectedCell}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Menu Panel */}
          <div className="w-full lg:w-80">
            <div className="bg-white rounded-3xl p-6 shadow-[16px_16px_32px_#d1d5db,-16px_-16px_32px_#ffffff] sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Game Info
              </h2>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]">
                  <div className="text-sm text-gray-600 mb-1">
                    Current Level
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {currentLevel}
                  </div>
                  <div className="text-sm text-gray-500">
                    {getDifficultyLabel(currentLevel)}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]">
                  <div className="text-sm text-gray-600 mb-1">Time</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatTime(timer)}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]">
                  <div className="text-sm text-gray-600 mb-1">Mistakes</div>
                  <div className="text-2xl font-bold text-red-600">
                    {mistakes}
                  </div>
                </div>

                <button
                  onClick={() => setShowLevelSelect(true)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] transition-all duration-200 active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] font-medium"
                >
                  Change Level
                </button>

                <button
                  onClick={handleNewGame}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] transition-all duration-200 active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] font-medium"
                >
                  New Game
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Level Selection Modal */}
        {showLevelSelect && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-96 overflow-y-auto shadow-[16px_16px_32px_#d1d5db,-16px_-16px_32px_#ffffff]">
              <h2 className="text-xl font-bold text-center mb-4">
                Select Level
              </h2>
              <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: 100 }, (_, i) => i + 1).map((level) => (
                  <button
                    key={level}
                    onClick={() => handleLevelChange(level)}
                    className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      level === currentLevel
                        ? "bg-blue-500 text-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)]"
                        : "bg-gray-100 hover:bg-gray-200 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowLevelSelect(false)}
                className="w-full mt-4 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] transition-all duration-200 active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Completion Message */}
        {isComplete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-green-100 rounded-3xl p-8 text-center shadow-[16px_16px_32px_#d1d5db,-16px_-16px_32px_#ffffff] max-w-md">
              <h2 className="text-3xl font-bold text-green-800 mb-4">
                🎉 Congratulations! 🎉
              </h2>
              <p className="text-green-600 mb-2 text-lg">
                Level {currentLevel} completed!
              </p>
              <p className="text-green-600 mb-6">
                Time: {formatTime(timer)} | Mistakes: {mistakes}
              </p>
              <div className="flex gap-3 justify-center">
                {currentLevel < 100 && (
                  <button
                    onClick={() => setCurrentLevel((prev) => prev + 1)}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] transition-all duration-200 active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] font-medium"
                  >
                    Next Level
                  </button>
                )}
                <button
                  onClick={handleNewGame}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] transition-all duration-200 active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] font-medium"
                >
                  Play Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions Modal */}
        {showInstructions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[16px_16px_32px_#d1d5db,-16px_-16px_32px_#ffffff]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  How to Play Sudoku
                </h2>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-200"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6 text-gray-700">
                {/* Basic Rules */}
                <div>
                  <h3 className="text-lg font-bold text-blue-600 mb-3">
                    🎯 Basic Rules
                  </h3>
                  <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                    <p>• Fill the 9×9 grid with numbers 1-9</p>
                    <p>
                      • Each <strong>row</strong> must contain all numbers 1-9
                      (no repeats)
                    </p>
                    <p>
                      • Each <strong>column</strong> must contain all numbers
                      1-9 (no repeats)
                    </p>
                    <p>
                      • Each <strong>3×3 box</strong> must contain all numbers
                      1-9 (no repeats)
                    </p>
                  </div>
                </div>

                {/* How to Play */}
                <div>
                  <h3 className="text-lg font-bold text-green-600 mb-3">
                    🎮 How to Play
                  </h3>
                  <div className="bg-green-50 rounded-xl p-4 space-y-2">
                    <p>
                      <strong>1. Select a Cell:</strong> Click on any empty cell
                      (white squares)
                    </p>
                    <p>
                      <strong>2. Enter a Number:</strong> Click a number button
                      (1-9) or press number keys on your keyboard
                    </p>
                    <p>
                      <strong>3. Clear a Cell:</strong> Click the "Clear" button
                      or press Delete/Backspace/0
                    </p>
                    <p>
                      <strong>4. Deselect Cell:</strong> Press Escape to
                      deselect the current cell
                    </p>
                    <p>
                      <strong>5. Fixed Numbers:</strong> Dark numbers cannot be
                      changed (puzzle clues)
                    </p>
                  </div>
                </div>

                {/* Strategy Tips */}
                <div>
                  <h3 className="text-lg font-bold text-purple-600 mb-3">
                    💡 Strategy Tips
                  </h3>
                  <div className="bg-purple-50 rounded-xl p-4 space-y-2">
                    <p>
                      <strong>Start Easy:</strong> Look for cells with only one
                      possible number
                    </p>
                    <p>
                      <strong>Process of Elimination:</strong> Check what
                      numbers are already used in the row, column, and 3×3 box
                    </p>
                    <p>
                      <strong>Focus on Constraints:</strong> Work on rows,
                      columns, or boxes that are nearly complete
                    </p>
                    <p>
                      <strong>Take Your Time:</strong> Think before placing
                      numbers to avoid mistakes
                    </p>
                  </div>
                </div>

                {/* Game Features */}
                <div>
                  <h3 className="text-lg font-bold text-orange-600 mb-3">
                    ⚡ Game Features
                  </h3>
                  <div className="bg-orange-50 rounded-xl p-4 space-y-2">
                    <p>
                      <strong>100 Levels:</strong> Progressive difficulty from
                      Beginner to Expert
                    </p>
                    <p>
                      <strong>Timer:</strong> Track how long it takes to solve
                      each puzzle
                    </p>
                    <p>
                      <strong>Mistake Counter:</strong> Keep track of invalid
                      moves
                    </p>
                    <p>
                      <strong>Celebration:</strong> Fireworks and confetti when
                      you complete a level!
                    </p>
                  </div>
                </div>

                {/* Difficulty Levels */}
                <div>
                  <h3 className="text-lg font-bold text-red-600 mb-3">
                    📊 Difficulty Levels
                  </h3>
                  <div className="bg-red-50 rounded-xl p-4 space-y-2">
                    <p>
                      <strong>Beginner (1-10):</strong> Lots of clues, perfect
                      for learning
                    </p>
                    <p>
                      <strong>Easy (11-30):</strong> Moderate challenge with
                      good clue distribution
                    </p>
                    <p>
                      <strong>Medium (31-60):</strong> Requires logical thinking
                      and strategy
                    </p>
                    <p>
                      <strong>Hard (61-85):</strong> Advanced techniques needed
                    </p>
                    <p>
                      <strong>Expert (86-100):</strong> Maximum challenge for
                      sudoku masters
                    </p>
                  </div>
                </div>

                {/* Visual Guide */}
                <div>
                  <h3 className="text-lg font-bold text-gray-600 mb-3">
                    👀 Visual Guide
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <p>
                      <strong>Dark Numbers:</strong> Original puzzle clues
                      (cannot be changed)
                    </p>
                    <p>
                      <strong>Blue Numbers:</strong> Your answers (can be
                      changed)
                    </p>
                    <p>
                      <strong>Blue Highlight:</strong> Currently selected cell
                    </p>
                    <p>
                      <strong>Dark Grid Lines:</strong> Separate the 3×3 boxes
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowInstructions(false)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] transition-all duration-200 active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] font-medium"
                >
                  Got It! Let's Play
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
