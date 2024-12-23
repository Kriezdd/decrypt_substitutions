import {
  findFrequentSequences,
  generateKey,
  applyKey,
  getLetterFrequencies, refineKeyUsingTrigrams
} from "./utils.js";
import {ENCRYPTED_TEXT, russianFrequencies, russianFrequenciesMap, RUSSIAN_TRIGRAMS} from "./constants.js";

// Шаг 1: Подсчёт частот
const encryptedFreq = getLetterFrequencies(ENCRYPTED_TEXT);
const encryptedFreqMap = new Map(encryptedFreq);
console.log(encryptedFreqMap)

// Шаг 2: Сравнение с частотами русского языка
const russianFreqSorted = Object.entries(russianFrequenciesMap).sort((a, b) => b[1] - a[1]);
const russianFreqSortedMap = new Map(russianFreqSorted);
let key = generateKey(encryptedFreqMap, russianFreqSortedMap);

// Шаг 3: Анализ триграмм
// const encryptedTrigrams = findFrequentSequences(ENCRYPTED_TEXT, 3);

// Шаг 4: Уточнение ключа
// key = refineKeyUsingTrigrams(encryptedTrigrams, RUSSIAN_TRIGRAMS, key);

// Шаг 3: Расшифровка текста
const decryptedText = applyKey(ENCRYPTED_TEXT, key);

// console.log("Триграммы в шифре:");
// console.table(encryptedTrigrams);
console.log("Обновлённый ключ:");
console.log(key);
console.log("Расшифрованный текст:");
console.log(decryptedText);