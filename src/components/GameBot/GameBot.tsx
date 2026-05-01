"use client";
import { useState } from "react";
import { X, MessageCircle, Gamepad2 } from "lucide-react";
import CitiesGame from "./CitiesGame";
import CrosswordGame from "./CrosswordGame";
import SprintGame from "./SprintGame";

type GameType = "cities" | "crossword" | "sprint" | null;

export default function GameBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameType>(null);
  const [showMenu, setShowMenu] = useState(true);

  const handleSelectGame = (game: GameType) => {
    setSelectedGame(game);
    setShowMenu(false);
  };

  const handleBackToMenu = () => {
    setSelectedGame(null);
    setShowMenu(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setSelectedGame(null);
      setShowMenu(true);
    }, 300);
  };

  return (
    <>
      {/* Кнопка чат-бота */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-secondary transition-all z-50"
        >
          <Gamepad2 size={28} />
        </button>
      )}

      {/* Окно чат-бота */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Шапка */}
          <div className="bg-primary text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Gamepad2 size={20} />
              <h3 className="font-semibold">Игровой бот СНО</h3>
            </div>
            <button onClick={handleClose} className="hover:opacity-80">
              <X size={20} />
            </button>
          </div>

          {/* Тело чата */}
          <div className="h-[500px] flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto">
              {showMenu && selectedGame === null && (
                <Menu onSelectGame={handleSelectGame} />
              )}

              {selectedGame === "cities" && (
                <CitiesGame onBack={handleBackToMenu} />
              )}
              {selectedGame === "crossword" && (
                <CrosswordGame onBack={handleBackToMenu} />
              )}
              {selectedGame === "sprint" && (
                <SprintGame onBack={handleBackToMenu} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Меню выбора игры
function Menu({ onSelectGame }: { onSelectGame: (game: GameType) => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          🤖 Привет! Я игровой бот СНО. Выбери игру:
        </p>
      </div>

      <button
        onClick={() => onSelectGame("cities")}
        className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-all"
      >
        <div className="font-semibold text-lg">🏙️ Игра в города</div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Называй города по очереди. Игра продолжается, пока не закончатся варианты.
        </p>
      </button>

      <button
        onClick={() => onSelectGame("crossword")}
        className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-all"
      >
        <div className="font-semibold text-lg">📝 Сканворд </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Разгадай небольшой кроссворд на научные темы.
        </p>
      </button>

      <button
        onClick={() => onSelectGame("sprint")}
        className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-all"
      >
        <div className="font-semibold text-lg">⚡ Научный спринт</div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Отвечай на вопросы быстро. Каждый правильный ответ даёт +2 секунды.
        </p>
      </button>
    </div>
  );
}