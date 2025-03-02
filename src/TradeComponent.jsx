import React, { useEffect, useState } from "react";
import { updateSession } from "./db";
import useFetchStockData from "./useFetchStockData";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const TradeComponent = ({ session, onExit }) => {
  const [trades, setTrades] = useState([]);
  const [balance, setBalance] = useState(session.startingBalance);
  const [sharesOwned, setSharesOwned] = useState(session.sharesOwned || 0);
  const [quantity, setQuantity] = useState(1);
  const [currentDate, setCurrentDate] = useState(session.currentDate);

  // Fetch stock price data
  const stockData = useFetchStockData(session.ticker, currentDate);

  // Find stock data for the current trading day
  const currentDayData = stockData.find((day) => day.Date.split("T")[0] === currentDate);

  // Calculate total value of shares owned
  const currentStockPrice = currentDayData ? currentDayData.Close : 0;
  const totalSharesValue = sharesOwned * currentStockPrice;

  useEffect(() => {
    setTrades(session.trades || []);
    setBalance(session.startingBalance);
    setSharesOwned(session.sharesOwned || 0);
    setCurrentDate(session.currentDate);
  }, [session]);

  const executeTrade = async (type) => {
    if (!currentDayData) {
      alert("Stock data not available for this date.");
      return;
    }

    if (type === "sell" && quantity > sharesOwned) {
      alert("Not enough shares to sell!");
      return;
    }

    const price = currentDayData.Close;
    const trade = { type, price, quantity, date: currentDate };
    const newTrades = [...trades, trade];
    setTrades(newTrades);

    if (type === "buy") {
      setBalance(balance - price * quantity);
      setSharesOwned(sharesOwned + quantity);
    } else {
      setBalance(balance + price * quantity);
      setSharesOwned(sharesOwned - quantity);
    }

    await updateSession(session.id, {
      ...session,
      trades: newTrades,
      sharesOwned: sharesOwned + (type === "buy" ? quantity : -quantity),
      balance,
    });
  };

  const advanceTradingDay = async () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    const nextDateString = newDate.toISOString().split("T")[0];
    setCurrentDate(nextDateString);

    await updateSession(session.id, {
      ...session,
      currentDate: nextDateString,
    });
  };

  return (
    <div>
      <h2>Session: {session.name}</h2>
      <p>Ticker: {session.ticker}</p>
      <p>Balance: ${balance.toFixed(2)}</p>
      <p>
        Shares Owned: {sharesOwned} 
        {sharesOwned > 0 && currentStockPrice > 0 && (
          <> (Value: ${totalSharesValue.toFixed(2)})</>
        )}
      </p>
      <p>Current Trading Day: {currentDate}</p>

      {currentDayData ? (
        <div>
          <h3>Stock Info for {currentDate}</h3>
          <p>Open: ${currentDayData.Open.toFixed(2)}</p>
          <p>High: ${currentDayData.High.toFixed(2)}</p>
          <p>Low: ${currentDayData.Low.toFixed(2)}</p>
          <p>Close: ${currentDayData.Close.toFixed(2)}</p>
          <p>Volume: {currentDayData.Volume.toLocaleString()}</p>
        </div>
      ) : (
        <p>No stock data available for this day.</p>
      )}

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={stockData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Date" tickFormatter={(date) => date.split("T")[0]} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="Close" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>

      <div>
        <label>Quantity: </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
        />
      </div>

      <button onClick={() => executeTrade("buy")}>Buy</button>
      <button onClick={() => executeTrade("sell")}>Sell</button>
      <button onClick={advanceTradingDay}>Next Trading Day</button>

      <h3>Trade History</h3>
      <ul>
        {trades.map((trade, index) => (
          <li key={index}>
            {trade.type} {trade.quantity} shares @ ${trade.price.toFixed(2)} - Date: {trade.date}
          </li>
        ))}
      </ul>

      <button onClick={onExit}>Back to Sessions</button>
    </div>
  );
};

export default TradeComponent;
