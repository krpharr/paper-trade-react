import React, { useEffect, useState } from "react";
import { Card, Button, Input, Select, Typography, DatePicker, Space, message } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import StockDataViewer from "./StockDataViewer";
import TradeManager from "./TradeManager";

const { Option } = Select;
const { Title, Text } = Typography;

const App = () => {
  const [ticker, setTicker] = useState("AAPL");
  const [startDate, setStartDate] = useState(dayjs().subtract(1, "year").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [interval, setInterval] = useState("1d");
  const [balance, setBalance] = useState(10000);
  const [shares, setShares] = useState([]);
  const [cost, setCost] = useState(0.0)
  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [running, setRunning] = useState(false);
  const [orders, setOrders] = useState([]); // Move orders state here

  useEffect(() => {
    let n = 0.0;
    for (let i = 0; i < shares.length; i++){
      n += shares[i].price;
    }
    setCost(n)
    console.log("currentIndex", currentIndex);
  }, [balance, shares, currentIndex]);

  const startSession = () => {
    setRunning(true);
    fetchData();
  };

  const fetchData = async () => {
    try {
      const url = `http://34.48.110.245:8000/api/fin/hist/${ticker}/${startDate}/${endDate}/${interval}/`;
      const response = await axios.get(url);
      
      if (response.data.length === 0) {
        message.error("No data available for the selected period.");
      } else {
        setData(response.data);
        setCurrentIndex(0);
      }
    } catch (error) {
      message.error("Failed to fetch data. Please check your inputs.");
    }
  };

  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      message.info("Test is over. No more data available.");
    }
  };

  const handleReset = () => {
    setCurrentIndex(data.length - 1);
    setBalance(10000);
    setShares([]);
    setOrders([]);
    setRunning(false);
  };
  

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* Left Sidebar */}
      <div style={{ width: "250px", background: "#f0f0f0", padding: "20px" }}>
        <h3>Left Sidebar</h3>
          <Card title={<Title level={4}>Stock Data Viewer</Title>} bordered>
           <Space direction="vertical" style={{ width: "100%" }}>
              <Text strong>Balance: </Text>
              <Input type="number" value={balance} onChange={(e) => setBalance(Number(e.target.value))} />
              {/* <Text strong>Shares: </Text>
              <Input type="number" value={shares} onChange={(e) => setShares(Number(e.target.value))} /> */}
              <Text strong>Ticker:</Text>
              <Input placeholder="Enter Ticker" value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} />
              <Text strong>Start Date:</Text>
              <DatePicker 
                format="YYYY-MM-DD" 
                value={dayjs(startDate)} 
                onChange={(date) => setStartDate(date.format("YYYY-MM-DD"))} />
              <Text strong>End Date:</Text>
              <DatePicker format="YYYY-MM-DD" value={dayjs(endDate)} onChange={(date) => setEndDate(date.format("YYYY-MM-DD"))} />
              <Select value={interval} onChange={setInterval}>
                <Option value="1d">1 Day</Option>
                <Option value="1wk">1 Week</Option>
                <Option value="1mo">1 Month</Option>
              </Select>              
              <Button 
                type="primary" 
                onClick={running === false ? startSession : handleNext}
              >
                {running === false ? "Start" : "Next"}
              </Button>
              {running === true ? <Button onClick={handleReset}>Reset</Button> : ""}

           </Space>
          </Card>
      </div>
  
      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px", background: "#fff" }}>
        <h2>Main Content</h2>
        {data.length > 0 ? 
          <div>
            <div>
              Total: ${((parseFloat(data[currentIndex]['Close']) * shares.length) + balance).toFixed(2)} |
              Bal: ${balance.toFixed(2)} 
            </div>
            <div>
              Shares: {shares.length} ${(parseFloat(data[currentIndex]['Close']) * shares.length).toFixed(2)} |
              Cost: ${cost.toFixed(2)}
            </div>
            <div>
              Gain/Loss: ${((parseFloat(data[currentIndex]['Close']) * shares.length) - cost).toFixed(2)} |
              % {((((parseFloat(data[currentIndex]['Close']) * shares.length) - cost) / cost) * 100).toFixed(2)}
            </div>
          </div>
          :
          ""
        }
        
        <StockDataViewer 
          data={data} 
          currentIndex={currentIndex} 
          ticker={ticker}
        />
      </div>
  
      {/* Right Sidebar */}
      <div style={{ width: "250px", background: "#f0f0f0", padding: "20px" }}>
        <h3>Right Sidebar</h3>
        <TradeManager 
          data={data} 
          currentIndex={currentIndex} 
          balance={balance} 
          setBalance={setBalance} 
          shares={shares} 
          setShares={setShares}
          orders={orders}
          setOrders={setOrders}
        />          
      </div>
  
    </div>
  );

};

export default App;