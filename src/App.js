import { useState, useEffect } from "react";
import "./App.css";

const dailyWikiArticles = [
  "JavaScript", "React_(JavaScript_library)", "Python_(programming_language)", 
  "Node.js", "Web_development", "HTML", "CSS", "Git", "Machine_learning",
  "Artificial_intelligence", "Quantum_computing", "Blockchain", "Cloud_computing", 
  "Cybersecurity", "Data_science", "Internet_of_things", "Computer_science"
];

function WordGuessGame() {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [wordFrequency, setWordFrequency] = useState({});
  const [correctWords, setCorrectWords] = useState([]);
  const [previousGuesses, setPreviousGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [dictionaryWords, setDictionaryWords] = useState(new Set());
  const [articleTitle, setArticleTitle] = useState("");
  const [articleIntro, setArticleIntro] = useState("");
  const [showIntro, setShowIntro] = useState(false);

  const getTodaysArticle = () => {
    const today = new Date();
    const dayOfYear = today.getDate();
    const articleIndex = dayOfYear % dailyWikiArticles.length;
    return dailyWikiArticles[articleIndex];
  };

  useEffect(() => {
    async function fetchDictionary() {
      try {
        const response = await fetch("/words_dictionary.json");
        const dictionary = await response.json();
        setDictionaryWords(new Set(Object.keys(dictionary)));
      } catch (error) {
        console.error("Error loading dictionary:", error);
      }
    }

    async function fetchWikipediaData() {
      const article = getTodaysArticle();
      setArticleTitle(article);
      try {
        const response = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=true&format=json&origin=*&titles=${article}`
        );
        const data = await response.json();
        const page = Object.values(data.query.pages)[0];
        const text = page.extract;
        setArticleIntro(text.split(". ")[0] + ".");

        const frequency = {};
        const words = text
          .toLowerCase()
          .replace(/[^\w\s]/g, "")
          .split(/\s+/);

        words.forEach((word) => {
          if (word) {
            frequency[word] = (frequency[word] || 0) + 1;
          }
        });

        setWordFrequency(frequency);

        const singleOccurrenceWords = Object.keys(frequency).filter(
          (word) => frequency[word] === 1 && dictionaryWords.has(word)
        );

        setCorrectWords(singleOccurrenceWords);
      } catch (error) {
        console.error("Error fetching Wikipedia data:", error);
      }
    }

    fetchDictionary();
    fetchWikipediaData();
  }, [dictionaryWords]);

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (gameOver) return;

    const word = input.toLowerCase().replace(/[^\w\s]/g, "").trim();
    const count = wordFrequency[word] || 0;

    if (count > 0) {
      setPreviousGuesses([...previousGuesses, { word, count }]);

      if (correctWords.includes(word)) {
        setMessage(`✅ You found a correct word! "${word}" appears only once.`);
        setGameOver(true);
      } else {
        setMessage(`🟡 "${word}" appears ${count} time(s). Keep going!`);
      }
    } else {
      const examples = correctWords.slice(0, 3).join(", ");
      setMessage(
        `❌ Bust! "${word}" does not appear in the text. Game over. Some correct answers could be: ${examples}`
      );
      setGameOver(true);
    }

    setInput("");
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Word Guessing Game</h1>
        <p>Today's Wikipedia Article: {articleTitle}</p>
        <div className="intro-container">
          <button 
            onMouseEnter={() => setShowIntro(true)} 
            onMouseLeave={() => setShowIntro(false)} 
            className="info-button"
          >
            Article Intro
          </button>
          {showIntro && <div className="article-intro-popup">{articleIntro}</div>}
        </div>
        <p>Find words that appear only once in the article!</p>
        
        <form onSubmit={handleSubmit} className="form-container">
          <input
            type="text"
            value={input}
            onChange={handleChange}
            className="input-field"
            placeholder="Type your guess..."
            disabled={gameOver}
          />
          <button type="submit" className="submit-button" disabled={gameOver}>
            Submit
          </button>
        </form>

        {message && <p className="message-text">{message}</p>}

        <h2>Previous Guesses:</h2>
        <ul>
          {previousGuesses.map((guess, index) => (
            <li key={index}>
              {guess.word}: {guess.count} time(s)
            </li>
          ))}
        </ul>

        {gameOver && <p className="game-over-text">Game Over! Refresh to play again.</p>}
      </header>
    </div>
  );
}

export default WordGuessGame;
