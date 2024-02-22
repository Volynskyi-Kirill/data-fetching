import { useState } from "react";
import "./App.css";
import {
  defaultInputValue,
  minInputValue,
  maxInputValue,
  URL,
} from "./constants";

function App() {
  const [inputValue, setInputValue] = useState(defaultInputValue);
  const [requests, setRequests] = useState([]);
  const [errorMessage, setErrorMessage] = useState(defaultInputValue);
  const [isStarted, setIsStarted] = useState(false);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);
    if (value < minInputValue || value > maxInputValue) {
      setErrorMessage(
        `Error: Please enter a valid concurrency limit (${minInputValue} - ${maxInputValue}).`
      );
      return;
    }
    setErrorMessage(defaultInputValue);
  };

  const handleSubmitForm = async (event) => {
    event.preventDefault();
    setIsStarted(true);

    const totalRequests = 1000;
    const requestPromises = [];
    let concurrencyLimit = Number(inputValue);
    let doneRequest = 0;

    while (doneRequest < totalRequests) {
      for (let i = doneRequest + 1; i <= doneRequest + concurrencyLimit; i++) {
        requestPromises.push(fetch(`${URL}api/${i}`));
      }
      const startTime = Date.now();

      const promiseToResolve = requestPromises.slice(
        doneRequest,
        doneRequest + concurrencyLimit
      );
      const result = await Promise.all(promiseToResolve);
      const resultJSON = await Promise.all(result.map((r) => r.json()));

      const elapsedTime = Date.now() - startTime;
      const remainingTime = 1000 - elapsedTime;

      setRequests((prevRequests) => [...prevRequests, ...resultJSON]);
      doneRequest += Number(inputValue);

      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }

    setIsStarted(false);
  };

  const isButtonDisabled = isStarted || errorMessage;

  return (
    <>
      <form className="app-form" onSubmit={handleSubmitForm}>
        <input
          type="number"
          required
          min={minInputValue}
          max={maxInputValue}
          value={inputValue}
          onChange={handleInputChange}
          className="input-field"
        />
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button
          disabled={isButtonDisabled}
          className="start-button"
          type="submit"
        >
          {isStarted ? "Running..." : "Start"}
        </button>
        <ul className="request-list">
          {requests.map((request, index) => (
            <li key={index} className="request-item">
              Request: {request}
            </li>
          ))}
        </ul>
      </form>
    </>
  );
}

export default App;
