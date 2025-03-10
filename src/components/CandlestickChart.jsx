import React, { useState, useEffect } from "react";
import { VictoryChart, VictoryCandlestick, VictoryAxis, VictoryTheme, VictoryLabel } from "victory";
import dayjs from "dayjs";

const API_URL = "http://34.48.110.245:8000/api/fin/hist/"

const CandlestickChart = ({ ticker, interval, period, start, end }) => {
  const [formattedData, setFormattedData] = useState([]);
  const [chartWidth, setChartWidth] = useState(1200);
  const [hoveredCandle, setHoveredCandle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [news, setNews] = useState(null);

  const fetchCandlestickData = async () => {
    setLoading(true);
    try {
      let endDate = "";
      if (interval === "1d")endDate = dayjs(end).add(1, "day").format("YYYY-MM-DD");
      if (interval === "1wk")endDate = dayjs(end).add(1, "week").format("YYYY-MM-DD");
      if (interval === "1mo")endDate = dayjs(end).add(1, "month").format("YYYY-MM-DD");

      console.log(`end: ${end} endDate: ${endDate}`);
      
      const url = `${API_URL}candles/${ticker}/${interval}/${period}/${start}/${endDate}`;
      // const API_URL = `http://34.48.110.245:8000/api/fin/hist/candles/${ticker}/${interval}/${period}/${start}/${endDate}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch data");

      const jsonData = await response.json();
      const candleCount = jsonData.length;
      let newWidth = Math.max(1200, candleCount * 20);

      setChartWidth(newWidth);

      const transformedData = jsonData.map((item) => ({
        x: item.Date.slice(0, 10),
        open: item.Open,
        high: item.High,
        low: item.Low,
        close: item.Close,
        volume: item.Volume,
        patterns: item.Patterns || "",
      }));

      setFormattedData(transformedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandlestickData();
  }, [end]);

  // Update mouse position on movement
  const handleMouseMove = (event) => {
    setMousePosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{ width: `${chartWidth}px`, height: "450px", position: "relative", paddingBottom: "20px" }}
    >
      {/* Chart Title */}
      <h2 style={{ 
        textAlign: "center", 
        marginBottom: "10px", 
        fontFamily: "Arial, sans-serif",
        fontWeight: "bold"
      }}>
        {interval.toUpperCase()} - {period.toUpperCase()}
      </h2>

      {/* 🔥 Tooltip: Closer to Cursor and Higher Above */}
      {showTooltip && hoveredCandle && (
        <div
          style={{
            position: "fixed",
            top: `${mousePosition.y - 80}px`,   // Higher above cursor
            left: `${mousePosition.x - 150}px`, // Closer to cursor
            background: "#ffffff",
            padding: "8px",
            borderRadius: "5px",
            fontSize: "12px",
            fontFamily: "Arial, sans-serif",
            textAlign: "left",
            border: "1px solid #ccc",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
            maxWidth: "200px",
            zIndex: 9999,
            pointerEvents: "none", // Make tooltip ignore mouse events
          }}
        >
          <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
            <li><strong>Date:</strong> {hoveredCandle.x}</li>
            <li><strong>Open:</strong> ${hoveredCandle.open.toFixed(2)}</li>
            <li><strong>Close:</strong> ${hoveredCandle.close.toFixed(2)}</li>
            <li><strong>High:</strong> ${hoveredCandle.high.toFixed(2)}</li>
            <li><strong>Low:</strong> ${hoveredCandle.low.toFixed(2)}</li>
            <li><strong>Volume:</strong> {Math.round(hoveredCandle.volume / 1_000_000)}M</li>
            {hoveredCandle.patterns && hoveredCandle.patterns.length > 0 && (
              <>
                <li><strong>Patterns:</strong></li>
                {hoveredCandle.patterns.split(",").map((pattern, index) => (
                  <li key={index} style={{ paddingLeft: "10px" }}>- {pattern.trim()}</li>
                ))}
              </>
            )}
          </ul>
        </div>
      )}

      {/* 🔄 Show Loading Spinner */}
      {loading && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "16px",
          fontWeight: "bold",
          color: "#555",
          background: "rgba(255, 255, 255, 0.8)",
          padding: "10px 15px",
          borderRadius: "5px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
          textAlign: "center",
        }}>
          🔄 Loading Data...
        </div>
      )}

      {/* 📊 Render Chart Only After Loading Completes */}
      {!loading && (
        <VictoryChart
          theme={VictoryTheme.material}
          domainPadding={{ x: 30 }}
          scale={{ x: "time" }}
          width={chartWidth}
          height={400}
        >
          <VictoryAxis
            tickFormat={(t) => t}
            style={{ tickLabels: { fontSize: 8, angle: -45, textAnchor: "end" } }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => `$${t}`}
            style={{ tickLabels: { fontSize: 7 } }}
          />
          <VictoryCandlestick
            candleColors={{ positive: "green", negative: "red" }}
            data={formattedData}
            events={[
              {
                target: "data",
                eventHandlers: {
                  onMouseOver: (_, props) => {
                    setHoveredCandle(props.datum);
                    setShowTooltip(true); // Show tooltip on hover
                  },
                  onMouseOut: () => {
                    setHoveredCandle(null);
                    setShowTooltip(false); // Hide tooltip when not hovering
                  },
                },
              },
            ]}
          />
        </VictoryChart>
      )}
    </div>
  );
};

export default CandlestickChart;
