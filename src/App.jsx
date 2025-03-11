import React, { useEffect, useState } from "react";
import { Card, Table, Button, Input, Select, Typography, DatePicker, Switch, Space, message } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import StockDataViewer from "./components/StockDataViewer";
import TradeManager from "./components/TradeManager";
import CandlestickChart from "./components/CandlestickChart";
import PointFigure from "./components/PointFigure";
import "./styles.css"


const { Option } = Select;
const { Title, Text } = Typography;

const App = () => {
  const [ticker, setTicker] = useState("AAPL");
  const [startDate, setStartDate] = useState(dayjs().subtract(1, "year").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [currentDate, setCurrentDate] = useState(startDate);
  const [interval, setInterval] = useState("1d");
  const [period, setPeriod] = useState("1mo");
  const [numMonths, setNumMonths] = useState(1);
  const [balance, setBalance] = useState(1000);
  const [startBalance, setStartBalance] = useState(1000);
  const [shares, setShares] = useState([]);
  const [cost, setCost] = useState(0.0)
  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [running, setRunning] = useState(false);
  const [orders, setOrders] = useState([]); // Move orders state here
  const [report, setReport] = useState("");
  const [chartVisable, setChartVisable] = useState(false);

  useEffect(() => {
    let n = 0.0;
    for (let i = 0; i < shares.length; i++){
      n += shares[i].price;
    }
    setCost(n)
    console.log("currentIndex", currentIndex);
    if (data.length > 0) {
      setCurrentDate(dayjs(data[currentIndex]["Date"]).format("YYYY-MM-DD"));

    }

  }, [balance, shares, currentIndex, orders]);

  useEffect(() => {
    if (interval === "1d"){
      setPeriod("1mo");
      setNumMonths(1);
    }
    if(interval === "1wk"){
      setPeriod("6mo");
      setNumMonths(6);
    }
    if(interval === "1mo"){
      setPeriod("2y");
      setNumMonths(24);
    }
  }, [interval]);

  const startSession = () => {
    setRunning(true);
    // setStartBalance(balance);
    setBalance(startBalance);
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
    let num_days = dayjs(currentDate).diff(dayjs(startDate), "day");
    let val = (parseFloat(data[currentIndex]['Close']) * shares.length).toFixed(2);
    let total = ((parseFloat(data[currentIndex]['Close']) * shares.length) + balance).toFixed(2);
    let pl =(((val - cost)/cost) * 100).toFixed(2);
    let str = `${data[currentIndex]['Date']} Total: ${total} | Days: ${num_days} | Bal: ${balance} Val: ${val} P/L: %${pl}\n`;
    setReport(report + str);
    if (currentIndex < data.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      message.info("Test is over. No more data available.");
      console.log(report);
    }
  };

  const handleReset = () => {
    setCurrentIndex(data.length - 1);
    setBalance(1000);
    setStartBalance(1000);
    setShares([]);
    setOrders([]);
    setRunning(false);
    setReport("");
  };

  const handleCancelOrder = (orderId) => {
    const updatedOrders = orders.filter(order => order.id !== orderId);
    setOrders(updatedOrders);
    message.success("Order canceled successfully!");
  };

  const handleChartToggle = (checked) => {
    setChartVisable(checked);
  };
  
  const columns = [
    { title: "Created", dataIndex: "created", key: "created" },
    { title: "Type", dataIndex: "type", key: "type" },
    { title: "Price", dataIndex: "price", key: "price", render: (price) => `$${price.toFixed(2)}` },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Expiration", dataIndex: "expiration", key: "expiration" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Completed", dataIndex: "completed", key: "completed" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button 
          type="link" 
          danger 
          onClick={() => handleCancelOrder(record.id)}
        >
          Cancel
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", padding: "20px" }}>
      
      {/* Left Sidebar */}
      <div style={{ width: "180px", background: "#f0f0f0", padding: "20px" }}>

          <Card title={<Title level={4}>Settings</Title>} bordered>
           <Space direction="vertical" style={{ width: "100%" }}>
              <Text strong>Balance: </Text>
              <Input type="number" value={startBalance} onChange={(e) => setStartBalance(Number(e.target.value))} />
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
      <div style={{ flex: 1, padding: "20px", background: "#fff", width: "700px" }}>
        <h2>{ticker.toUpperCase()}</h2>
        {data.length > 0 ? 
          <div className="flex-container">
            <Card >
              <Text>
                Total: ${((parseFloat(data[currentIndex]['Close']) * shares.length) + balance).toFixed(2)} <br />
                Bal: ${balance.toFixed(2)} <br />
                Begining Bal: ${startBalance} <br />
                Num Days: {dayjs(currentDate).diff(dayjs(startDate), "day")} <br />
                P/L ${((((parseFloat(data[currentIndex]['Close']) * shares.length) + balance))-startBalance).toFixed(2)}
              </Text>
            </Card>
            <Card >
              <Text>
                Shares: {shares.length} ${(parseFloat(data[currentIndex]['Close']) * shares.length).toFixed(2)} <br />
                Cost: ${cost.toFixed(2)}<br />
                P/L: ${((parseFloat(data[currentIndex]['Close']) * shares.length) - cost).toFixed(2)} <br />
                % {shares.length > 0 ? ((((parseFloat(data[currentIndex]['Close']) * shares.length) - cost) / cost) * 100).toFixed(2) : "N/A"} 
              </Text>
            </Card>


          <StockDataViewer 
            data={data} 
            currentIndex={currentIndex} 
            ticker={ticker}
          />
    

                <TradeManager 
                data={data} 
                currentIndex={currentIndex} 
                balance={balance} 
                setBalance={setBalance} 
                shares={shares} 
                setShares={setShares}
                orders={orders}
                setOrders={setOrders}
                interval={interval}
                report={report}
                setReport={setReport}
              />   

          </div>
          :
          ""
        }

        <div>
          <PointFigure 
            data={data} 
            currentIndex={currentIndex} 
            ticker={ticker}          
          />
        </div>

        <Card>
          <Text strong>Candle Chart: {chartVisable ? "ON" : "OFF"}</Text>
          <br />
          <Switch checked={chartVisable} onChange={handleChartToggle} />
        </Card>

        {chartVisable && (
          <CandlestickChart 
            ticker={ticker}
            interval={interval}
            period={period}
            end={currentDate}
            start={dayjs(currentDate).subtract(numMonths, "month").format("YYYY-MM-DD")}
          />
        )}


  
        {orders.length > 0 ? (
                <Card title="Orders" style={{ marginTop: 20 }}>
                  <Table
                    columns={columns}
                    dataSource={orders}
                    rowKey="id"
                    pagination={false}
                  />
                </Card>
              ) : (
                <Card title="Orders" style={{ marginTop: 20 }}>
                  No open orders
                </Card>
              )}

      </div>
 
    </div>
  );

};

export default App;