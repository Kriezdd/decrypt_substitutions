import React, {useState, useEffect} from "react";
import {
  ENCRYPTED_TEXT,
  russianBigrams,
  russianFrequencies,
  russianFrequenciesMap,
  russianTrigrams
} from "./trash/constants.js";
import {findFrequentSequences} from "./trash/utils.js";
import './App.css';

// Частоты букв в русском языке (от самой частой к менее частой)
// const russianFrequencies = "ОЕАИНТСРВЛКМДПУЯЫЬГЗБЧЙХЖШЦЩЭЮФЪ".split("");

const App = () => {
  const [encryptedMessage, setEncryptedMessage] = useState(ENCRYPTED_TEXT);
  const [substitutions, setSubstitutions] = useState({});
  const [frequencyAnalysis, setFrequencyAnalysis] = useState([]);
  const [decodedMessage, setDecodedMessage] = useState("");
  const [bigrams, setBigrams] = useState([]);
  const [trigrams, setTrigrams] = useState([]);

  // --- (SWAP FEATURE) ---
  const [swapFirst, setSwapFirst] = useState("");
  const [swapSecond, setSwapSecond] = useState("");

  // --- (TRIGRAM REPLACE) ---
  const [trigramToReplace, setTrigramToReplace] = useState("");
  const [replaceWithTrigram, setReplaceWithTrigram] = useState("");
  // --- (BIGRAM REPLACE) ---
  const [bigramToReplace, setBigramToReplace] = useState("");
  const [replaceWithBigram, setReplaceWithBigram] = useState("");

  // lock chars
  const [lockedChars, setLockedChars] = useState([]);

  // Анализ частот символов
  const analyzeFrequencies = () => {
    const counts = {};
    for (const char of encryptedMessage.toUpperCase()) {
      if (/^[А-ЯЁ]$/.test(char)) {
        counts[char] = (counts[char] || 0) + 1;
      }
    }

    // Сортируем по убыванию частоты
    const sortedCounts = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([char]) => char);

    // Составляем начальные substitutions на основе частот
    let initialSubstitutions = {};
    sortedCounts.forEach((char, index) => {
      initialSubstitutions[char] = russianFrequencies[index] || "";
    });

    // Анализ биграмм/триграмм для шифрованного текста
    const bigramsCount = findFrequentSequences(encryptedMessage, 2);
    const trigramsCount = findFrequentSequences(encryptedMessage, 3);

    setSubstitutions(initialSubstitutions);
    setFrequencyAnalysis(sortedCounts);
    setBigrams(bigramsCount);
    setTrigrams(trigramsCount);
  };

  // Пересчитываем decodedMessage при изменении encryptedMessage или substitutions
  useEffect(() => {
    console.table(substitutions)
    // «Расшифровываем» текст на основе substitutions
    const decoded = encryptedMessage
      .toUpperCase()
      .split("")
      .map((char) => substitutions[char] || char)
      .join("");

    setDecodedMessage(decoded);

    // Можно также смотреть биграммы/триграммы уже в «расшифрованном» виде
    const bigramsCount = findFrequentSequences(decoded, 2);
    const trigramsCount = findFrequentSequences(decoded, 3);
    setBigrams(bigramsCount);
    setTrigrams(trigramsCount);

  }, [encryptedMessage, substitutions]);

  // Ручная правка substitutions
  const handleSubstitutionChange = (cipherChar, plainChar) => {
    setSubstitutions((prev) => ({...prev, [cipherChar]: plainChar}));
  };

  // --- (SWAP FEATURE) ---
  // Меняем местами расшифровки двух букв шифра
  const handleSwap = () => {
    if (!swapFirst || !swapSecond) return;
    const key1 = Object.keys(substitutions).find(key => substitutions[key] === swapFirst);
    const key2 = Object.keys(substitutions).find(key => substitutions[key] === swapSecond);
    console.log('подмена')
    console.log(swapFirst, swapSecond)
    console.log(key1, key2)

    if (lockedChars.includes(substitutions[key1])) {
      alert(`Вы заблокировали подмену "${swapFirst}"!`);
      return;
    }
    if (lockedChars.includes(substitutions[key2])) {
      alert(`Вы заблокировали подмену "${swapSecond}"!`);
      return;
    }

    swapChars(key1, key2);
  };

  const swapChars = (first, second) => {
    setSubstitutions((prev) => {
      const newSubstitutions = {...prev};
      const temp = newSubstitutions[first];
      newSubstitutions[first] = newSubstitutions[second];
      newSubstitutions[second] = temp;
      return newSubstitutions;
    });
  }

  // --- (TRIGRAM REPLACE) ---
  // Заменяем все вхождения триграммы "trigramToReplace" на "replaceWithTrigram" в encryptedMessage
  const handleSequenceReplace = (mode) => {
    const sequenceToReplace = mode === "trigram" ? trigramToReplace : bigramToReplace;
    const replaceWithSequence = mode === "trigram" ? replaceWithTrigram : replaceWithBigram;

    if (!sequenceToReplace || !replaceWithSequence) return;

    let newSubstitutions = {...substitutions};

    console.log('--------------------------')
    console.log('меняем ', sequenceToReplace, 'на ', replaceWithSequence)

    const processedLetters = {}

    for (let i = 0; i < sequenceToReplace.length; i++) {
      if (sequenceToReplace[i] === replaceWithSequence[i]) continue;
      if (processedLetters[sequenceToReplace[i]] === true) continue;
      processedLetters[sequenceToReplace[i]] = true;

      const key1 = Object.keys(newSubstitutions).find(key => substitutions[key] === sequenceToReplace[i]);
      const key2 = Object.keys(newSubstitutions).find(key => substitutions[key] === replaceWithSequence[i]);
      console.log('--------------------------')
      console.log('было')
      console.log('ключ ', key1, 'значение ', newSubstitutions[key1], 'ключ ', key2, 'значение ', newSubstitutions[key2])
      if (lockedChars.includes(key1)) {
        alert(`Вы заблокировали подмену буквы "${substitutions[key1]}"!`);
        return;
      }
      if (lockedChars.includes(key2)) {
        alert(`Вы заблокировали подмену буквы "${substitutions[key2]}"!`);
        return;
      }

      const tempSubstitutions = {...newSubstitutions};
      const temp = newSubstitutions[key1];
      newSubstitutions[key1] = tempSubstitutions[key2];
      newSubstitutions[key2] = temp;
      console.log('стало')
      console.log('ключ ', key1, 'значение ', newSubstitutions[key1], 'ключ ', key2, 'значение ', newSubstitutions[key2])
    }

    setSubstitutions(newSubstitutions);
  };

  const handleLockChars = (chars) => {
    if (chars.length > 1) {
      const isLocked = isFrequencyLocked(chars);
      let newLockedChars = [...lockedChars];
      for (let i = 0; i < chars.length; i++) {
        const key = Object.keys(substitutions).find(key => substitutions[key] === chars[i]);

        if (newLockedChars.includes(key) && isLocked) {
          newLockedChars = newLockedChars.filter((c) => c !== key);
        } else {
          newLockedChars = [...newLockedChars, key];
        }
      }
      setLockedChars(newLockedChars);
    } else {
      if (lockedChars.includes(chars)) {
        setLockedChars(lockedChars.filter((c) => c !== chars));
      } else {
        setLockedChars([...lockedChars, chars]);
      }
    }
  }

  const isFrequencyLocked = (frequency) => {
    if (!frequency) return false;
    if (!lockedChars.length) return false;
    for (let i = 0; i < frequency.length; i++) {
      const key = Object.keys(substitutions).find(key => substitutions[key] === frequency[i]);
      if (!lockedChars.includes(key)) return false;
    }
    return true;
  }

  return (<div style={{width: "100%"}}>
    <div style={{margin: "20px"}}>
      <h1>Расшифровка сообщения</h1>

      {/* Ввод зашифрованного сообщения */}
      <div style={{width: "100%"}}>
        <label htmlFor="encryptedMessage">Зашифрованное сообщение:</label>
        <textarea
          id="encryptedMessage"
          rows="4"
          cols="50"
          value={encryptedMessage}
          onChange={(e) => setEncryptedMessage(e.target.value)}
          placeholder="Введите зашифрованный текст"
          style={{width: "100%", marginTop: "10px"}}
        />
      </div>

      {/* Кнопка запуска анализа частот */}
      <div style={{marginTop: "20px"}}>
        <button onClick={analyzeFrequencies}>Выполнить начальную подстановку</button>
      </div>

      <div
        style={{
          display: "flex", gap: "20px", maxHeight: "600px",
        }}
      >
        {frequencyAnalysis.length > 0 && (
          <>
            {/* Таблица частот и подстановок */}
            {frequencyAnalysis.length > 0 && (<div className='scrollable'>
              <h2>Таблица ключей</h2>
              <table
                border="1"
                style={{width: "fit-content", textAlign: "center"}}
              >
                <thead>
                <tr>
                  <th>Шифр</th>
                  <th>Частота</th>
                  <th>Ключ</th>
                  <th>x</th>
                </tr>
                </thead>
                <tbody>
                {frequencyAnalysis.map((cipherChar, index) => (<tr key={index}>
                  <td className="char_accent cell_big">{cipherChar}</td>
                  <td className="char_accent cell_big">
                    {encryptedMessage.split(cipherChar).length - 1}
                  </td>
                  <td className="cell_big">
                    <input
                      className="char_accent"
                      style={{maxWidth: "40px", height: "20px", textAlign: "center"}}
                      type="text"
                      maxLength={1}
                      value={substitutions[cipherChar] || ""}
                      onChange={(e) => handleSubstitutionChange(cipherChar, e.target.value.toUpperCase())}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={lockedChars.includes(cipherChar)}
                      onChange={() => handleLockChars(cipherChar)}
                    />
                  </td>
                </tr>))}
                </tbody>
              </table>
            </div>)}
            {/* Частотный анализ биграмм */}
            {bigrams.length > 0 && (<div className='scrollable'>
              <h2>Биграммы</h2>
              <table
                border="1"
                style={{width: "fit-content", textAlign: "center"}}
              >
                <thead>
                <tr>
                  <th>Биграмма</th>
                  <th>Частота</th>
                  <th>x</th>
                </tr>
                </thead>
                <tbody>
                {bigrams.map(([bigram, count], index) => (<tr key={index}>
                  <td>{bigram}</td>
                  <td>{count}</td>
                  <td><input type="checkbox" checked={isFrequencyLocked(bigram)}
                             onChange={() => handleLockChars(bigram)}/></td>
                </tr>))}
                </tbody>
              </table>
            </div>)}
            {/* Частотный анализ триграмм */}
            {trigrams.length > 0 && (<div className='scrollable'>
              <h2>Триграммы</h2>
              <table
                border="1"
                style={{width: "fit-content", textAlign: "center"}}
              >
                <thead>
                <tr>
                  <th>Триграмма</th>
                  <th>Частота</th>
                  <th>x</th>
                </tr>
                </thead>
                <tbody>
                {trigrams.map(([trigram, count], index) => (<tr key={index}>
                  <td>{trigram}</td>
                  <td>{count}</td>
                  <td><input type="checkbox" checked={isFrequencyLocked(trigram)}
                             onChange={() => handleLockChars(trigram)}/></td>
                </tr>))}
                </tbody>
              </table>
            </div>)}
            <div style={{display: "flex", flexDirection: "column", maxWidth: "100%"}}>
              {/* NEW (SWAP FEATURE) --- Перестановка двух букв шифра */}
              {frequencyAnalysis.length > 0 && (<div className='input_container'>
                <p className='input_title'>Перестановка букв (Swap)</p>
                <p>Выберите две буквы шифра, чтобы поменять их расшифровки местами.</p>
                <div className='input_mini-container'>
                  <div className='input_swappable'>
                    <div>
                      <label>Буква 1: </label>
                      <input
                        className="input_small"
                        type="text"
                        maxLength={1}
                        value={swapFirst}
                        onChange={(e) => setSwapFirst(e.target.value.toUpperCase())}
                      />
                    </div>
                    <div>
                      <label>Буква 2: </label>
                      <input
                        className="input_small"
                        type="text"
                        maxLength={1}
                        value={swapSecond}
                        onChange={(e) => setSwapSecond(e.target.value.toUpperCase())}
                      />
                    </div>
                  </div>
                  <button onClick={handleSwap}>Swap</button>
                </div>
              </div>)}
              {/* NEW (BIGRAM REPLACE) --- Глобальная замена триграмм */}
              {bigrams.length > 0 && (<div className='input_container'>
                <p className='input_title'>Замена биграмм</p>
                <p>Выберите биграмму и введите, на что заменить. Затем нажмите «Заменить все».</p>
                <div className='input_mini-container'>
                  <div className='input_swappable'>
                    <div>
                      <label>Старая биграмма: </label>
                      <select
                        className="input_small"
                        value={bigramToReplace}
                        onChange={(e) => setBigramToReplace(e.target.value)}
                      >
                        <option value="">...</option>
                        {bigrams.map(([bi]) => (<option key={bi} value={bi}>
                          {bi}
                        </option>))}
                      </select>
                    </div>
                    <div>
                      <label>Новая биграмма: </label>
                      <input
                        className="input_small"
                        type="text"
                        maxLength={2}
                        value={replaceWithBigram}
                        onChange={(e) => setReplaceWithBigram(e.target.value.toUpperCase())}
                      />
                    </div>
                  </div>
                  <button onClick={() => {
                    handleSequenceReplace('bigram')
                  }}>Заменить все
                  </button>
                </div>
              </div>)}
              {/* NEW (TRIGRAM REPLACE) --- Глобальная замена триграмм */}
              {trigrams.length > 0 && (<div className='input_container'>
                <p className='input_title'>Замена триграмм</p>
                <p>Выберите триграмму и введите, на что заменить. Затем нажмите «Заменить все».</p>
                <div className='input_mini-container'>
                  <div className='input_swappable'>
                    <div>
                      <label>Старая триграмма: </label>
                      <select
                        className="input_small"
                        value={trigramToReplace}
                        onChange={(e) => setTrigramToReplace(e.target.value)}
                      >
                        <option value="">...</option>
                        {trigrams.map(([tri]) => (<option key={tri} value={tri}>
                          {tri}
                        </option>))}
                      </select>
                    </div>
                    <div>
                      <label>Новая триграмма: </label>
                      <input
                        className="input_small"
                        type="text"
                        maxLength={3}
                        value={replaceWithTrigram}
                        onChange={(e) => setReplaceWithTrigram(e.target.value.toUpperCase())}
                      />
                    </div>
                  </div>
                  <button onClick={() => {
                    handleSequenceReplace('trigram')
                  }}>Заменить все
                  </button>
                </div>
              </div>)}
            </div>
          </>
        )}

        <div className='helpful_block'>
          <p className='input_title'>Информация по русскому алфавиту</p>
          <div className='helpful_content-block'>
            <div className='helpful_container scrollable'>
              <h3>Частые буквы</h3>
              <table border="1" style={{width: "fit-content", textAlign: "center"}}>
                <thead>
                <tr>
                  <th>Буква</th>
                  <th>Частота</th>
                </tr>
                </thead>
                <tbody>
                {Object.keys(russianFrequenciesMap).map((letter, index) => (
                  <tr key={index}>
                    <td className='char_accent'>{letter}</td>
                    <td>{russianFrequenciesMap[letter]}</td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
            <div className='helpful_container scrollable'>
              <h3>Ч. Биграммы</h3>
              <table border="1" style={{width: "fit-content", textAlign: "center"}}>
                <thead>
                <tr>
                  <th>Биграмма</th>
                </tr>
                </thead>
                <tbody>
                {russianBigrams.map((bi, index) => (
                  <tr key={index}>
                    <td className='char_accent'>{bi}</td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
            <div className='helpful_container scrollable'>
              <h3>Ч. Триграммы</h3>
              <table border="1" style={{width: "fit-content", textAlign: "center"}}>
                <thead>
                <tr>
                  <th>Триграмма</th>
                </tr>
                </thead>
                <tbody>
                {russianTrigrams.map((tri, index) => (
                  <tr key={index}>
                    <td className='char_accent'>{tri}</td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* Расшифрованное сообщение */}
    <div style={{
      background: "#1f1f1f", position: 'sticky', bottom: 0, left: 0, width: '100%', minHeight: '180px',
    }}>
      <div style={{margin: '0 20px'}}>
        <h2>Расшифрованное сообщение</h2>
        <p className='output_text'>
          {decodedMessage || "Результат появится здесь..."}
        </p>
      </div>
    </div>
  </div>);
};

export default App;
