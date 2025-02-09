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
  const [articleTitle, setArticleTitle] = useState(""); // Store the title of today's article

  // Generate today's Wikipedia article based on the current date
  const getTodaysArticle = () => {
    const today = new Date();
    const dayOfYear = today.getDate(); // Get the day of the year (1-31)
    const articleIndex = dayOfYear % dailyWikiArticles.length; // Cycle through the articles
    return dailyWikiArticles[articleIndex];
  };

  useEffect(() => {
    async function fetchDictionary() {
      try {
        const response = await fetch("/words_dictionary.json"); // Load your JSON file from the public folder
        const dictionary = await response.json();
        setDictionaryWords(new Set(Object.keys(dictionary))); // Convert dictionary keys to a set
      } catch (error) {
        console.error("Error loading dictionary:", error);
      }
    }

    async function fetchWikipediaData() {
      const article = getTodaysArticle(); // Get the article for today
      setArticleTitle(article); // Set the article title for display
      try {
        // Fetch full Wikipedia article content for today's article
        const response = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=true&format=json&origin=*&titles=${article}`
        );
        const data = await response.json();

        // Extract page content dynamically
        const page = Object.values(data.query.pages)[0];
        const text = page.extract;

        // Process text to count word frequencies
        const frequency = {};
        const words = text
          .toLowerCase()
          .replace(/[^\w\s]/g, "") // Remove punctuation
          .split(/\s+/); // Split by whitespace

        words.forEach((word) => {
          if (word) {
            frequency[word] = (frequency[word] || 0) + 1;
          }
        });

        setWordFrequency(frequency);

        // Find all words that appear only once and are valid dictionary words
        const singleOccurrenceWords = Object.keys(frequency).filter(
          (word) => frequency[word] === 1 && dictionaryWords.has(word)
        );

        setCorrectWords(singleOccurrenceWords);
      } catch (error) {
        console.error("Error fetching Wikipedia data:", error);
      }
    }

    fetchDictionary(); // Load the dictionary
    fetchWikipediaData(); // Fetch the Wikipedia data for today
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

      // Check if the word appears exactly once (correct answer)
      if (correctWords.includes(word)) {
        setMessage(`✅ You found a correct word! "${word}" appears only once.`);
        setGameOver(true); // Winning condition
      } else {
        setMessage(`🟡 "${word}" appears ${count} time(s). Keep going!`);
      }
    } else {
      // If the word doesn't appear, reveal 3 correct examples
      const examples = correctWords.slice(0, 3).join(", ");
      setMessage(
        `❌ Bust! "${word}" does not appear in the text. Game over. Some correct answers could be: ${examples}`
      );
      setGameOver(true); // Losing condition
    }

    setInput(""); // Clear input after submission
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Word Guessing Game</h1>
        <p>Today's Challenge: {articleTitle}</p>
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
