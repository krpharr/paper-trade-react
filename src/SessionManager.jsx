import React, { useEffect, useState } from "react";
import { createSession, getAllSessions, getSession, deleteSession } from "./db";

const SessionManager = ({ onLoadSession }) => {
  const [sessions, setSessions] = useState([]);
  const [sessionName, setSessionName] = useState("");
  const [ticker, setTicker] = useState("");
  const [startingBalance, setStartingBalance] = useState(10000);
  const [startDate, setStartDate] = useState(""); // User selects the start date
  const [error, setError] = useState("");

  // Load existing sessions on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const savedSessions = await getAllSessions();
        setSessions(savedSessions);
        console.log("Loaded sessions:", savedSessions);
      } catch (error) {
        console.error("Error loading sessions:", error);
      }
    };
    loadSessions();
  }, []);

  // Create a new session
  const handleCreateSession = async () => {
    if (!sessionName.trim() || !ticker.trim() || !startDate) {
      setError("Session name, ticker, and start date are required.");
      return;
    }

    const newSession = {
      name: sessionName.trim(),
      ticker: ticker.trim().toUpperCase(),
      startDate,
      currentDate: startDate, // Start from the selected date
      startingBalance,
      sharesOwned: 0,
      trades: [],
    };

    try {
      const sessionId = await createSession(newSession);
      console.log("Session created with ID:", sessionId);
      setSessions([...sessions, { ...newSession, id: sessionId }]);
      setSessionName("");
      setTicker("");
      setStartDate("");
      setError("");
    } catch (error) {
      console.error("Error creating session:", error);
      setError(error.message);
    }
  };

  return (
    <div>
      <h2>Manage Trading Sessions</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>
        <label>Session Name: </label>
        <input type="text" value={sessionName} onChange={(e) => setSessionName(e.target.value)} />
      </div>

      <div>
        <label>Ticker: </label>
        <input type="text" value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} />
      </div>

      <div>
        <label>Start Date: </label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </div>

      <div>
        <label>Starting Balance: </label>
        <input type="number" value={startingBalance} onChange={(e) => setStartingBalance(parseFloat(e.target.value))} />
      </div>

      <button onClick={handleCreateSession}>Create New Session</button>

      <h3>Saved Sessions</h3>
      <ul>
        {sessions.map((session) => (
          <li key={session.id}>
            <strong>{session.name}</strong> ({session.ticker}) - Start: {session.startDate}
            <button onClick={() => onLoadSession(session)}>Load</button>
            <button onClick={() => deleteSession(session.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SessionManager;
