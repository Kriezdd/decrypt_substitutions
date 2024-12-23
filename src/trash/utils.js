// Функция подсчёта частот букв
export function getLetterFrequencies(text) {
  const frequencies = {};
  const totalLetters = text.length;

  for (const char of text) {
    if (/^[А-ЯЁ]$/.test(char)) {
      frequencies[char] = (frequencies[char] || 0) + 1;
    }
  }

  // Преобразуем в относительные частоты
  for (const key in frequencies) {
    frequencies[key] = frequencies[key] / totalLetters;
  }

  return Object.entries(frequencies).sort((a, b) => b[1] - a[1]);
}

// Генерация ключа на основе частот
export function generateKey(encryptedFreq, russianFreq) {
  const key = {};
  const encryptedSorted = Array.from(encryptedFreq.keys());
  const russianSorted = Array.from(russianFreq.keys());

  console.log(encryptedSorted, russianSorted)
  // Сопоставляем наиболее частые символы
  for (let i = 0; i < encryptedSorted.length; i++) {
    key[encryptedSorted[i]] = russianSorted[i] || "";
  }

  return key;
}

// Функция для замены символов по ключу
export function applyKey(text, key) {
  return text
    .split("")
    .map((char) => (key[char] ? key[char] : char))
    .join("");
}

// Функция для подсчёта частоты повторяющихся сочетаний букв
export function findFrequentSequences(text, sequenceLength = 2) {
  const sequences = {};

  // Проходим по тексту, извлекая последовательности заданной длины
  for (let i = 0; i <= text.length - sequenceLength; i++) {
    const sequence = text.slice(i, i + sequenceLength);
    if (/^[А-ЯЁ]+$/.test(sequence)) { // Учитываем только русские буквы
      sequences[sequence] = (sequences[sequence] || 0) + 1;
    }
  }

  // Преобразуем объект в массив и сортируем по убыванию частоты
  const sortedSequences = Object.entries(sequences)
    .sort((a, b) => b[1] - a[1])
    .filter(([, count]) => count > 1); // Убираем сочетания, которые встречаются 2 раза или меньше

  return sortedSequences;
}

export function refineKeyUsingTrigrams(encryptedTrigrams, russianTrigrams, key) {
  const refinedKey = { ...key }; // Начинаем с копии текущего ключа
  const usedChars = new Set(Object.values(refinedKey).filter((v) => v)); // Уже использованные символы

  encryptedTrigrams.forEach(([encryptedTrigram], index) => {
    const targetTrigram = russianTrigrams[index];
    if (targetTrigram) {
      for (let i = 0; i < encryptedTrigram.length; i++) {
        const encryptedChar = encryptedTrigram[i];
        const targetChar = targetTrigram[i];

        // Если символ уже сопоставлен, проверяем конфликт
        if (refinedKey[encryptedChar]) {
          if (refinedKey[encryptedChar] !== targetChar) {
            console.warn(
              `Конфликт: символ ${encryptedChar} уже сопоставлен с ${refinedKey[encryptedChar]}, пропускаем подстановку для ${targetChar}.`
            );
          }
          continue; // Если конфликт — пропускаем замену
        }

        // Проверяем, что targetChar ещё не используется
        if (!usedChars.has(targetChar)) {
          refinedKey[encryptedChar] = targetChar; // Устанавливаем соответствие
          usedChars.add(targetChar); // Отмечаем targetChar как использованный
        } else {
          console.warn(
            `Символ ${targetChar} уже используется, пропускаем замену для ${encryptedChar}.`
          );
        }
      }
    }
  });

  return refinedKey;
}

