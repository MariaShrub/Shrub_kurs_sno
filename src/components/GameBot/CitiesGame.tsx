"use client";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Lightbulb, RefreshCw, Flag } from "lucide-react";
import { citiesDatabase, cityHints } from "./citiesDatabase";

export default function CitiesGame({ onBack }: { onBack: () => void }) {
  const [usedCities, setUsedCities] = useState<string[]>([]);
  const [currentCity, setCurrentCity] = useState<string>("");
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<{ sender: "bot" | "user"; text: string }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<"user" | "bot" | null>(null);
  const [botThinking, setBotThinking] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addMessage = (sender: "bot" | "user", text: string) => {
    setMessages(prev => [...prev, { sender, text }]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getLastLetter = (city: string): string => {
    const normalized = city.toLowerCase();
    const lastChar = normalized.slice(-1);
    if (["ь", "ъ", "ы", "й"].includes(lastChar)) {
      const prevChar = normalized.slice(-2, -1);
      return prevChar || lastChar;
    }
    return lastChar;
  };

  const isValidCity = (city: string): boolean => {
    return citiesDatabase.includes(city.toLowerCase());
  };

  const findAvailableCities = (letter: string): string[] => {
    return citiesDatabase.filter(city =>
      city.startsWith(letter) &&
      !usedCities.includes(city) &&
      city !== currentCity.toLowerCase()
    );
  };

  const getHint = (city: string): string => {
    return cityHints[city.toLowerCase()] || "Интересный город!";
  };

  // Ход бота
  const botMove = async (lastLetter: string) => {
    setBotThinking(true);
    addMessage("bot", "Бот думает... 🤔");
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const availableCities = findAvailableCities(lastLetter);
    
    if (availableCities.length > 0) {
      const botCity = availableCities[Math.floor(Math.random() * availableCities.length)];
      setUsedCities(prev => [...prev, botCity]);
      setCurrentCity(botCity);
      addMessage("bot", `${botCity.toUpperCase()} ${getHint(botCity) ? `📌 ${getHint(botCity)}` : ""}`);
    } else {
      addMessage("bot", `Я не могу найти город на букву "${lastLetter.toUpperCase()}"... 😔`);
      addMessage("bot", "Поздравляю! Ты победил! 🎉");
      setGameOver(true);
      setWinner("user");
    }
    setBotThinking(false);
  };

  // Ход игрока
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gameOver || botThinking) return;

    const city = userInput.trim().toLowerCase();
    if (!city) {
      addMessage("user", "❌ Введите название города!");
      setUserInput("");
      return;
    }

    const lastLetter = getLastLetter(currentCity);
    const firstLetter = city[0];
    
    if (firstLetter !== lastLetter) {
      addMessage("user", `❌ Город должен начинаться на букву "${lastLetter.toUpperCase()}"!`);
      setUserInput("");
      return;
    }

    if (!isValidCity(city)) {
      addMessage("user", `❌ Город "${city}" не найден в моей базе. Попробуй другой!`);
      setUserInput("");
      return;
    }

    if (usedCities.includes(city)) {
      addMessage("user", `❌ Город "${city}" уже был!`);
      setUserInput("");
      return;
    }

    addMessage("user", `${city.toUpperCase()}`);
    const newUsed = [...usedCities, city];
    setUsedCities(newUsed);
    setCurrentCity(city);
    setUserInput("");
    setHintUsed(false);
    setShowHint("");

    const nextLetter = getLastLetter(city);
    await botMove(nextLetter);
  };

  // Подсказка для игрока
  const showHintForPlayer = () => {
    if (hintUsed || gameOver || botThinking) return;
    
    const lastLetter = getLastLetter(currentCity);
    const availableCities = findAvailableCities(lastLetter);
    
    if (availableCities.length > 0) {
      const exampleCity = availableCities[0];
      setShowHint(`💡 Попробуй назвать город на букву "${lastLetter.toUpperCase()}". Например: ${exampleCity.toUpperCase()} (${getHint(exampleCity)})`);
      setHintUsed(true);
    } else {
      setShowHint(`💡 На букву "${lastLetter.toUpperCase()}" нет городов в базе. Возможно, бот не сможет ответить!`);
      setHintUsed(true);
    }
  };

  // Сдаться
  const surrender = () => {
    if (gameOver || botThinking) return;
    
    addMessage("user", "😔 Я сдаюсь...");
    addMessage("bot", "Бот победил! В следующий раз обязательно получится! 💪");
    setGameOver(true);
    setWinner("bot");
  };

  // Начало игры
  const startGame = () => {
    const citiesToShuffle = [...citiesDatabase];
    for (let i = citiesToShuffle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [citiesToShuffle[i], citiesToShuffle[j]] = [citiesToShuffle[j], citiesToShuffle[i]];
    }
    
    const firstCity = citiesToShuffle.find(city => !city.includes("-")) || "омск";
    
    setUsedCities([firstCity]);
    setCurrentCity(firstCity);
    setMessages([
      { sender: "bot", text: "🎲 Привет! Поиграем в города?" },
      { sender: "bot", text: `Я называю первый город — ${firstCity.toUpperCase()}` },
      { sender: "bot", text: `📌 ${getHint(firstCity)}` },
      { sender: "bot", text: `Теперь твой ход! Город должен начинаться на букву "${getLastLetter(firstCity).toUpperCase()}"` }
    ]);
    setGameOver(false);
    setWinner(null);
    setHintUsed(false);
    setShowHint("");
    setUserInput("");
  };

  const resetGame = () => {
    startGame();
  };

  useEffect(() => {
    startGame();
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Шапка */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">
            <ArrowLeft size={20} />
          </button>
          <h4 className="font-semibold">🏙️ Игра в города</h4>
        </div>
        <div className="flex gap-1">
          <button
            onClick={resetGame}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
            title="Начать заново"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Поле с сообщениями */}
      <div className="flex-1 min-h-[300px] max-h-[350px] overflow-y-auto mb-3 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                msg.sender === "user"
                  ? "bg-primary text-white rounded-br-none"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        
        {botThinking && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg rounded-bl-none">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Подсказка */}
      {showHint && (
        <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-xs text-yellow-800 dark:text-yellow-300">
          {showHint}
        </div>
      )}

      {/* Кнопки: Подсказка и Сдаюсь */}
      {!gameOver && !botThinking && (
        <div className="flex gap-2 mb-3">
          <button
            onClick={showHintForPlayer}
            disabled={hintUsed}
            className={`flex-1 flex items-center justify-center gap-1 text-xs px-3 py-1.5 rounded-lg transition ${
              hintUsed
                ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200"
            }`}
          >
            <Lightbulb size={14} />
            {hintUsed ? "Подсказка использована" : "Подсказка"}
          </button>
          
          <button
            onClick={surrender}
            className="flex-1 flex items-center justify-center gap-1 text-xs px-3 py-1.5 rounded-lg transition bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200"
          >
            <Flag size={14} />
            Сдаюсь
          </button>
        </div>
      )}

      {/* Форма ввода */}
      {!gameOver ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={`Город на букву "${getLastLetter(currentCity).toUpperCase()}"...`}
            className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={botThinking}
            autoFocus
          />
          <button
            type="submit"
            disabled={botThinking}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary disabled:opacity-50 transition"
          >
            <Send size={18} />
          </button>
        </form>
      ) : (
        <div className="text-center space-y-3">
          <div className={`text-lg font-bold ${winner === "user" ? "text-green-600" : "text-red-600"}`}>
            {winner === "user" ? "🏆 Победа! Ты лучший!" : "😔 Вы проиграли. Попробуйте ещё раз!"}
          </div>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition"
          >
            Играть снова
          </button>
        </div>
      )}

      {/* Статистика */}
      <div className="mt-3 text-xs text-gray-400 text-center">
        Использовано городов: {usedCities.length} | В базе: {citiesDatabase.length} городов
      </div>
    </div>
  );
}