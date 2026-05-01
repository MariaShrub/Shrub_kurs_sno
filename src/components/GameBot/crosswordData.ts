export interface Clue {
    number: number;
    text: string;
    answer: string;
    row: number;
    col: number;
    direction: "across" | "down";
    length: number;
  }
  
  export const crosswordSize = 10;
  
  // Слова с пересечениями (как настоящий сканворд)
  export const clues: Clue[] = [
    // По горизонтали (→)
    {
      number: 1,
      text: "Документ об окончании учебного заведения",
      answer: "ДИПЛОМ",
      row: 1,
      col: 1,
      direction: "across",
      length: 6
    },
    {
      number: 3,
      text: "Наука о строении Земли, её составе и истории развития",
      answer: "ГЕОЛОГИЯ",
      row: 3,
      col: 1,
      direction: "across",
      length: 8
    },
    {
      number: 5,
      text: "Равнодушие, безразличие ко всему",
      answer: "АПАТИЯ",
      row: 5,
      col: 1,
      direction: "across",
      length: 6
    },
    {
      number: 7,
      text: "Форма проверки знаний и навыков учащихся, не экзамен",
      answer: "ЗАЧЕТ",
      row: 7,
      col: 1,
      direction: "across",
      length: 5
    },
    {
      number: 8,
      text: "Ближайшая к Земле звезда",
      answer: "СОЛНЦЕ",
      row: 9,
      col: 1,
      direction: "across",
      length: 6
    },
    // По вертикали (↓) - пересекаются с горизонтальными
    {
      number: 2,
      text: "Волшебство, колдовство",
      answer: "МАГИЯ",
      row: 1,
      col: 6,
      direction: "down",
      length: 5
    },
    {
      number: 4,
      text: "Снаряд в виде металлического или каменного шара",
      answer: "ЯДРО",
      row: 3,
      col: 8,
      direction: "down",
      length: 4
    },
    {
      number: 6,
      text: "Участник судебного процесса, подающий иск",
      answer: "ИСТЕЦ",
      row: 5,
      col: 5,
      direction: "down",
      length: 8
    },

  ];
  
  // Генерация поля из слов
  export function generateGrid(): { grid: (string | null)[][]; numbers: { [key: string]: number } } {
    // Создаём пустое поле 10x10
    const grid: (string | null)[][] = Array(10).fill(null).map(() => Array(10).fill(null));
    const numbers: { [key: string]: number } = {};
    
    for (const clue of clues) {
      const { row, col, direction, answer, number } = clue;
      
      // Сохраняем номер в начальной клетке
      const key = `${row},${col}`;
      if (!numbers[key]) {
        numbers[key] = number;
      }
      
      // Размещаем буквы слова на поле
      for (let i = 0; i < answer.length; i++) {
        const r = direction === "across" ? row : row + i;
        const c = direction === "across" ? col + i : col;
        if (r >= 0 && r < 10 && c >= 0 && c < 10) {
          if (grid[r][c] === null) {
            grid[r][c] = answer[i];
          }
        }
      }
    }
    
    return { grid, numbers };
  }
  
  // Получить вопрос по номеру и направлению
  export function getClueByNumber(number: number, direction?: "across" | "down"): Clue | undefined {
    if (direction) {
      return clues.find(c => c.number === number && c.direction === direction);
    }
    return clues.find(c => c.number === number);
  }