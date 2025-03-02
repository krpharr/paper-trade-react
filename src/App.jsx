import React, { useState } from "react";
import SessionManager from "./SessionManager";
import TradeComponent from "./TradeComponent";

const App = () => {
  const [currentSession, setCurrentSession] = useState(null);

  return (
    <div>
      {!currentSession ? (
        <SessionManager onLoadSession={setCurrentSession} />
      ) : (
        <TradeComponent session={currentSession} onExit={() => setCurrentSession(null)} />
      )}
    </div>
  );
};

export default App;
