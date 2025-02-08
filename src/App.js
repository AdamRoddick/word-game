import { useState } from "react";
import "./App.css";

function WordGuessGame() {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const correctWord = "test";

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.toLowerCase() === correctWord) {
      setMessage("Correct! You guessed the right word!");
    } else {
      setMessage("Wrong guess! Try again.");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Word Guessing Game</h1>
        <form onSubmit={handleSubmit} className="form-container">
          <input
            type="text"
            value={input}
            onChange={handleChange}
            className="input-field"
            placeholder="Type your guess..."
          />
          <button type="submit" className="submit-button">Submit</button>
        </form>
        {message && <p className="message-text">{message}</p>}
      </header>
    </div>
  );
}

export default WordGuessGame;
