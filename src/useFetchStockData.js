import { useEffect, useState } from "react";
import axios from "axios";

const useFetchStockData = (ticker, currentDate, interval = "1d") => {
  const [stockData, setStockData] = useState([]);

  // Calculate `startDate` as 1 month before `currentDate`
  const getOneMonthBefore = (dateStr) => {
    const date = new Date(dateStr);
    date.setMonth(date.getMonth() - 1); // Subtract 1 month
    return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };

  // Add one extra day to `endDate`
  const getNextDay = (dateStr) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1); // Add 1 day
    return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };

  const startDate = getOneMonthBefore(currentDate);
  const endDate = getNextDay(currentDate); // Fetch up to one day after current trading day

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://34.48.110.245:8000/api/fin/hist/${ticker}/${startDate}/${endDate}/${interval}/`
        );
        setStockData(response.data);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchData();
  }, [ticker, startDate, endDate, interval]);

  return stockData;
};

export default useFetchStockData;
