"use client";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Zap, RefreshCw } from "lucide-react";

const questions = [
  { text: "Формула воды — H₂O?", correct: true },
  { text: "Земля вращается вокруг Солнца?", correct: true },
  { text: "Скорость света — 300 000 км/с?", correct: true },
  { text: "Железо притягивается магнитом?", correct: true },
  { text: "Кислород необходим для дыхания?", correct: true },
  { text: "Вода кипит при 100°C?", correct: true },
  { text: "ДНК расшифровывается как дезоксирибонуклеиновая кислота?", correct: true },
  { text: "Венера — самая горячая планета Солнечной системы?", correct: true },
  { text: "Сердце перекачивает кровь по организму?", correct: true },
  { text: "Атом — это мельчайшая частица вещества?", correct: true },
  { text: "Тигры — это млекопитающие?", correct: true },
  { text: "Вода замерзает при 0°C?", correct: true },
  { text: "Молния — это электрический разряд?", correct: true },
  { text: "Радуга состоит из 7 цветов?", correct: true },
  { text: "Солнце — звезда?", correct: true },
  { text: "Айсберги состоят из пресной воды?", correct: true },
  { text: "Свет быстрее звука?", correct: true },
  { text: "Комары — переносчики болезней?", correct: true },
  { text: "Алмаз — самый твёрдый минерал?", correct: true },
  { text: "Кислоты имеют кислый вкус?", correct: true },
  { text: "Марс называют красной планетой?", correct: true },
  { text: "У осьминога три сердца?", correct: true },
  { text: "Бананы — это ягоды?", correct: true },
  { text: "Глаза хамелеона могут двигаться независимо?", correct: true },
  { text: "Арбуз — это ягода?", correct: true },
  { text: "Венера вращается в противоположную сторону?", correct: true },
  { text: "У пчёл есть королева?", correct: true },
  { text: "Улитки могут спать 3 года?", correct: true },
  { text: "Язык хамелеона длиннее его тела?", correct: true },
  { text: "Крокодилы умеют плакать?", correct: true },
  { text: "Зубы акулы постоянно обновляются?", correct: true },
  { text: "Кошки не чувствуют сладкий вкус?", correct: true },
  { text: "Слон — единственное животное, которое не умеет прыгать?", correct: true },
  { text: "У человека 46 хромосом?", correct: true },
  { text: "В ядре атома есть протоны и нейтроны?", correct: true },
  { text: "Зелёный цвет растений связан с хлорофиллом?", correct: true },
  { text: "Гроза сначала видна, потом слышна?", correct: true },
  { text: "Воздух имеет массу?", correct: true },
  { text: "HTML — это язык программирования?", correct: false },
  { text: "CSS позволяет создавать анимацию без JavaScript?", correct: false },
  { text: "Python — это язык программирования для дизайна?", correct: false },
  { text: "Бинарный код состоит из цифр от 0 до 9?", correct: false },
  { text: "JavaScript и Java — это одно и то же?", correct: false },
  { text: "Операционная система — это процессор?", correct: false },
  { text: "Компьютерная мышь была изобретена компанией Apple?", correct: false },
  { text: "Google — это браузер?", correct: false },
  { text: "Электронная почта требует обязательного интернета для отправки?", correct: false },
  { text: "1 байт равен 10 битам?", correct: false },
  { text: "Windows — это язык программирования?", correct: false },
  { text: "SQL используется для создания игровой механики видеоигр?", correct: false },
  { text: "Linux — это антивирус?", correct: false },
  { text: "Останавливает ли точка останова выполнение программы в отладчике?", correct: true  },
  { text: "Является ли NULL в SQL равным другому NULL?", correct: false  },
  { text: "Эйнштейн изобрёл радио?", correct: false },
  { text: "Луна — это планета?", correct: false },
  { text: "Стул — это животное?", correct: false },
  { text: "Бетон — это металл?", correct: false },
  { text: "Пауки — это насекомые?", correct: false },
  { text: "Плутон всё ещё считается планетой?", correct: false },
  { text: "Человек использует 100% своего мозга?", correct: false },
  { text: "Кит — это рыба?", correct: false },
  { text: "Земля — самая большая планета?", correct: false },
  { text: "Медузы — это рыбы?", correct: false },
  { text: "Выдыхаемый воздух состоит только из углекислого газа?", correct: false },
  { text: "Земля имеет форму идеального шара?", correct: false },
  { text: "Гравитация есть только на Земле?", correct: false },
  { text: "Летучие мыши — это птицы?", correct: false },
  { text: "Страусы умеют летать?", correct: false },
  { text: "Пингвины живут в Арктике?", correct: false },
  { text: "У жирафа самое большое сердце?", correct: false },
  { text: "Озоновая дыра находится над Австралией?", correct: false },
  { text: "Земля вращается быстрее, чем звук?", correct: false },
  { text: "Молекула — это то же самое, что атом?", correct: false }
];

export default function SprintGame({ onBack }: { onBack: () => void }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [highScore, setHighScore] = useState(0);
  const [currentQuestions, setCurrentQuestions] = useState([...questions]);

  // Перемешивание вопросов
  const shuffleQuestions = () => {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setCurrentQuestions(shuffled);
  };

  const startGame = () => {
    shuffleQuestions();
    setScore(0);
    setTimeLeft(60);
    setCurrentQuestion(0);
    setGameActive(true);
    setGameOver(false);
    setMessage("");
  };

  const endGame = useCallback(() => {
    setGameActive(false);
    setGameOver(true);
    if (score > highScore) {
      setHighScore(score);
    }
    setMessage(`Игра окончена! Твой счёт: ${score} баллов. ${score >= 40 ? "Гений! 🎉" : score >= 25 ? "Неплохо! 💪" : "Попробуй ещё раз!"}`);
  }, [score, highScore]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameActive) {
      endGame();
    }
    return () => clearInterval(timer);
  }, [gameActive, timeLeft, endGame]);

  const handleAnswer = (answer: boolean) => {
    if (!gameActive) return;

    const isCorrect = answer === currentQuestions[currentQuestion].correct;
    if (isCorrect) {
      setScore(score + 1);
      setTimeLeft((prev) => prev + 2);
    }

    if (currentQuestion + 1 < currentQuestions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      endGame();
    }
  };

  const resetAndShuffle = () => {
    shuffleQuestions();
    setCurrentQuestion(0);
    startGame();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Шапка */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">
            <ArrowLeft size={20} />
          </button>
          <h4 className="font-semibold">⚡ Научный спринт</h4>
        </div>
        {(gameActive || gameOver) && (
          <button onClick={resetAndShuffle} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition" title="Новая игра">
            <RefreshCw size={18} />
          </button>
        )}
      </div>

      {!gameActive && !gameOver && (
        <div className="text-center p-6 space-y-4">
          <Zap size={48} className="mx-auto text-primary" />
          <p className="font-bold text-lg">Научный спринт</p>
          <p>За 60 секунд ответь на максимум вопросов!</p>
          <p className="text-sm text-gray-500">📊 Всего вопросов: {questions.length}</p>
          <p className="text-sm text-gray-500">✅ Каждый правильный ответ даёт +2 секунды</p>
          <p className="text-sm text-gray-500">💻 Вопросы по физике, биологии, астрономии и программированию</p>
          {highScore > 0 && (
            <p className="text-sm font-bold text-primary">🏆 Рекорд: {highScore} очков</p>
          )}
          <button onClick={startGame} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition">
            Начать игру
          </button>
        </div>
      )}

      {gameActive && (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="text-2xl font-bold text-primary">{score}</div>
            <div className="text-xl font-mono">⏱️ {timeLeft}с</div>
            <div className="text-sm text-gray-500">Вопрос {currentQuestion + 1}/{questions.length}</div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center mb-4">
            <p className="text-lg font-medium">{currentQuestions[currentQuestion]?.text}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleAnswer(true)}
              className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              ✅ Да
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              ❌ Нет
            </button>
          </div>
        </>
      )}

      {gameOver && (
        <div className="text-center p-6 space-y-4">
          <p className="text-lg">{message}</p>
          {score === questions.length && (
            <p className="text-green-600 font-bold">🎉 Идеально! Ты ответил на все вопросы! 🎉</p>
          )}
          <button onClick={resetAndShuffle} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition">
            Играть снова
          </button>
        </div>
      )}
    </div>
  );
}