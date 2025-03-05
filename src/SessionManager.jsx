import React, { useState } from "react";
import { Card, Button, Input, Select, Typography, DatePicker, Space, message } from "antd";
import axios from "axios";
import dayjs from "dayjs";

const { Option } = Select;
const { Title, Text } = Typography;

const SessionManager = () => {
  const [ticker, setTicker] = useState("AAPL");
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [interval, setInterval] = useState("1d");
  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

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


  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <Card title={<Title level={4}>Stock Data Viewer</Title>} bordered>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text strong>Balance: </Text>
          <Input type="number" value={balance} onChange={(e) => setBalance(Number(e.target.value))} />
          <Text strong>Shares: </Text>
          <Input type="number" value={shares} onChange={(e) => setShares(Number(e.target.value))} />
          <Text strong>Ticker:</Text>
          <Input placeholder="Enter Ticker" value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} />
          <Text strong>Start Date:</Text>
          <DatePicker format="YYYY-MM-DD" value={dayjs(startDate)} onChange={(date) => setStartDate(date.format("YYYY-MM-DD"))} />
          <Text strong>End Date:</Text>
          <DatePicker format="YYYY-MM-DD" value={dayjs(endDate)} onChange={(date) => setEndDate(date.format("YYYY-MM-DD"))} />
          <Button type="primary" onClick={fetchData}>Start</Button>
        </Space>
      </Card>
    </div>
  );
};

export default SessionManager;