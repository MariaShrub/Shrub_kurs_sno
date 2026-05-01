"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, RefreshCw, Trophy } from "lucide-react";
import { clues, generateGrid, crosswordSize } from "./crosswordData";

export default function CrosswordGame({ onBack }: { onBack: () => void }) {
  const [grid, setGrid] = useState<(string | null)[][]>([]);
  const [numbers, setNumbers] = useState<{ [key: string]: number }>({});
  const [userGrid, setUserGrid] = useState<(string | null)[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [solvedWords, setSolvedWords] = useState<Set<string>>(new Set());
  const [showVictory, setShowVictory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (selectedCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedCell]);

  const initGame = () => {
    const { grid: newGrid, numbers: newNumbers } = generateGrid();
    setGrid(newGrid);
    setNumbers(newNumbers);
    setUserGrid(Array(10).fill(null).map(() => Array(10).fill(null)));
    setSolvedWords(new Set());
    setSelectedCell(null);
    setShowVictory(false);
  };

  const checkAndMarkWord = (row: number, col: number, direction: "across" | "down"): void => {
    let wordClue: any = null;
    
    if (direction === "across") {
      wordClue = clues.find(c => 
        c.direction === "across" && c.row === row && c.col <= col && c.col + c.length - 1 >= col
      );
    } else {
      wordClue = clues.find(c => 
        c.direction === "down" && c.col === col && c.row <= row && c.row + c.length - 1 >= row
      );
    }
    
    if (!wordClue) return;
    
    let isComplete = true;
    for (let i = 0; i < wordClue.answer.length; i++) {
      const r = wordClue.direction === "across" ? wordClue.row : wordClue.row + i;
      const c = wordClue.direction === "across" ? wordClue.col + i : wordClue.col;
      const userLetter = userGrid[r]?.[c];
      if (!userLetter || userLetter !== wordClue.answer[i]) {
        isComplete = false;
        break;
      }
    }
    
    const wordKey = `${wordClue.number}-${wordClue.direction}`;
    
    if (isComplete && !solvedWords.has(wordKey)) {
      setSolvedWords(prev => new Set(prev).add(wordKey));
    }
  };

  const checkAllWords = (newUserGrid: (string | null)[][]) => {
    const newSolved = new Set(solvedWords);
    
    for (const clue of clues) {
      const wordKey = `${clue.number}-${clue.direction}`;
      if (!newSolved.has(wordKey)) {
        let isComplete = true;
        for (let i = 0; i < clue.answer.length; i++) {
          const r = clue.direction === "across" ? clue.row : clue.row + i;
          const c = clue.direction === "across" ? clue.col + i : clue.col;
          const userLetter = newUserGrid[r]?.[c];
          if (!userLetter || userLetter !== clue.answer[i]) {
            isComplete = false;
            break;
          }
        }
        if (isComplete) {
          newSolved.add(wordKey);
        }
      }
    }
    
    setSolvedWords(newSolved);
    
    if (newSolved.size === clues.length && !showVictory) {
      setShowVictory(true);
    }
  };

  const handleLetterInput = (letter: string) => {
    if (!selectedCell || showVictory) return;
    
    const { row, col } = selectedCell;
    const cellValue = grid[row]?.[col];
    if (!cellValue) return;
    
    const newGrid = [...userGrid.map(r => [...r])];
    newGrid[row][col] = letter;
    setUserGrid(newGrid);
    
    checkAndMarkWord(row, col, "across");
    checkAndMarkWord(row, col, "down");
    checkAllWords(newGrid);
    
    const acrossClue = clues.find(c => 
      c.direction === "across" && c.row === row && c.col <= col && c.col + c.length - 1 >= col
    );
    
    if (acrossClue) {
      const nextCol = col + 1;
      if (nextCol <= acrossClue.col + acrossClue.length - 1 && grid[row]?.[nextCol]) {
        setSelectedCell({ row, col: nextCol });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    
    if (e.key === "Backspace") {
      const newGrid = [...userGrid.map(r => [...r])];
      newGrid[row][col] = null;
      setUserGrid(newGrid);
      checkAllWords(newGrid);
      e.preventDefault();
    } else if (/^[А-Яа-я]$/.test(e.key)) {
      handleLetterInput(e.key.toUpperCase());
      e.preventDefault();
    } else if (e.key === "ArrowUp" && row > 0) {
      e.preventDefault();
      setSelectedCell({ row: row - 1, col });
    } else if (e.key === "ArrowDown" && row < 9) {
      e.preventDefault();
      setSelectedCell({ row: row + 1, col });
    } else if (e.key === "ArrowLeft" && col > 0) {
      e.preventDefault();
      setSelectedCell({ row, col: col - 1 });
    } else if (e.key === "ArrowRight" && col < 9) {
      e.preventDefault();
      setSelectedCell({ row, col: col + 1 });
    }
  };

  const getCellColor = (row: number, col: number): string => {
    const cellValue = grid[row]?.[col];
    if (!cellValue) return "bg-gray-200 dark:bg-gray-700";
    
    const acrossClue = clues.find(c => 
      c.direction === "across" && c.row === row && c.col <= col && c.col + c.length - 1 >= col
    );
    if (acrossClue && solvedWords.has(`${acrossClue.number}-across`)) {
      return "bg-green-200 dark:bg-green-800/50 text-green-800 dark:text-green-200";
    }
    
    const downClue = clues.find(c => 
      c.direction === "down" && c.col === col && c.row <= row && c.row + c.length - 1 >= row
    );
    if (downClue && solvedWords.has(`${downClue.number}-down`)) {
      return "bg-green-200 dark:bg-green-800/50 text-green-800 dark:text-green-200";
    }
    
    return "bg-white dark:bg-gray-800";
  };

  const solvedCount = solvedWords.size;
  const totalWords = clues.length;
  const acrossClues = clues.filter(c => c.direction === "across");
  const downClues = clues.filter(c => c.direction === "down");

  return (
    <div className="flex flex-col h-full" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Невидимый input для захвата клавиатуры */}
      <input
        ref={inputRef}
        type="text"
        className="fixed opacity-0 pointer-events-none"
        style={{ position: 'fixed', top: -100, left: -100 }}
        onKeyDown={handleKeyDown}
      />

      {/* Шапка */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">
            <ArrowLeft size={20} />
          </button>
          <h4 className="font-semibold">📝 Сканворд</h4>
        </div>
        <button onClick={initGame} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition" title="Новая игра">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Счётчик */}
      <div className="mb-3 text-center flex-shrink-0">
        <span className="text-sm font-medium px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
          🎯 Разгадано слов: {solvedCount} / {totalWords}
        </span>
      </div>

      {/* Игровое поле */}
      <div className="flex justify-center mb-4 overflow-x-auto flex-shrink-0">
        <div 
          className="grid bg-gray-300 dark:bg-gray-600 p-2 rounded-lg"
          style={{ 
            display: "grid", 
            gridTemplateColumns: `repeat(${crosswordSize}, minmax(44px, 50px))`,
            gap: "1px"
          }}
        >
          {Array(crosswordSize).fill(null).map((_, row) => 
            Array(crosswordSize).fill(null).map((_, col) => {
              const isActive = grid[row]?.[col] !== null && grid[row]?.[col] !== undefined;
              const isSelected = selectedCell?.row === row && selectedCell?.col === col;
              const number = numbers[`${row},${col}`];
              const displayLetter = userGrid[row]?.[col] || "";
              const bgColor = getCellColor(row, col);
              
              return (
                <div
                  key={`${row}-${col}`}
                  onClick={() => {
                    if (isActive) {
                      setSelectedCell({ row, col });
                      inputRef.current?.focus();
                    }
                  }}
                  className={`
                    relative flex items-center justify-center
                    w-full aspect-square font-bold text-lg uppercase
                    ${bgColor} ${isActive ? "cursor-pointer hover:brightness-95" : ""}
                    ${isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""}
                    transition-all duration-150
                  `}
                  style={{ userSelect: "none" }}
                >
                  {number !== undefined && number !== null && number > 0 && (
                    <span className="absolute top-0 left-0.5 text-[8px] font-bold text-gray-500">
                      {number}
                    </span>
                  )}
                  {displayLetter}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ВОПРОСЫ под полем */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mt-2 flex-shrink-0">
        <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          📋 Вопросы к сканворду:
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {/* По горизонтали */}
          <div>
            <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-1">
              → По горизонтали:
            </div>
            <div className="space-y-1">
              {acrossClues.map(clue => {
                const isSolved = solvedWords.has(`${clue.number}-across`);
                return (
                  <div
                    key={`${clue.number}-across`}
                    className={`text-xs p-1.5 rounded cursor-pointer ${
                      isSolved 
                        ? "text-green-600 dark:text-green-400 line-through bg-green-50 dark:bg-green-900/20" 
                        : "hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => {
                      setSelectedCell({ row: clue.row, col: clue.col });
                      inputRef.current?.focus();
                    }}
                  >
                    <span className="font-bold">{clue.number}.</span> {clue.text}
                    {isSolved && <span className="ml-1 text-green-500">✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* По вертикали */}
          <div>
            <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-1">
              ↓ По вертикали:
            </div>
            <div className="space-y-1">
              {downClues.map(clue => {
                const isSolved = solvedWords.has(`${clue.number}-down`);
                return (
                  <div
                    key={`${clue.number}-down`}
                    className={`text-xs p-1.5 rounded cursor-pointer ${
                      isSolved 
                        ? "text-green-600 dark:text-green-400 line-through bg-green-50 dark:bg-green-900/20" 
                        : "hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => {
                      setSelectedCell({ row: clue.row, col: clue.col });
                      inputRef.current?.focus();
                    }}
                  >
                    <span className="font-bold">{clue.number}.</span> {clue.text}
                    {isSolved && <span className="ml-1 text-green-500">✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Подсказка по управлению */}
      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-center text-[10px] text-gray-400 flex-shrink-0">
        ⌨️ Вводи буквы | ⬅️➡️⬆️⬇️ Стрелки | 🖱️ Клик по клетке или вопросу
      </div>

      {/* Победа */}
      {showVictory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center max-w-sm mx-4">
            <Trophy size={48} className="mx-auto text-yellow-500 mb-3" />
            <h3 className="text-xl font-bold mb-2">🎉 Поздравляем!</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Ты полностью разгадал сканворд! Отличная работа! Молодец!
            </p>
            <button
              onClick={initGame}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition"
            >
              Играть снова
            </button>
          </div>
        </div>
      )}
    </div>
  );
}