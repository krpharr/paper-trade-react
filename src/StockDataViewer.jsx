import React, { useState, useEffect } from "react";
import { Card, Button, Input, Select, Typography, DatePicker, Space, message } from "antd";
import axios from "axios";
import dayjs from "dayjs";

const { Option } = Select;
const { Title, Text } = Typography;

const StockDataViewer = ({ data, currentIndex, ticker }) => {
    const [loading, setLoading] = useState(false);
    const [pfData, setPfData] = useState(undefined);

    useEffect(() => {
        if (data.length < 1 ) return;
        let d = data[currentIndex]['Date']; // Assuming this is a string
        let endDate = dayjs(d).format("YYYY-MM-DD");
        let startDate = dayjs(endDate).subtract(1, "year").format("YYYY-MM-DD"); 
        const fetchPointFigure = async () => {
          setLoading(true);
          try {
            const url = `http://34.48.110.245:8000/api/fin/hist/pf/${ticker}/1d/1y/3/${startDate}/${endDate}/`;
            const response = await axios.get(url);
            setPfData(response.data);
          } catch (error) {
            message.error("Failed to fetch point and figure.");
            console.error(error);
          } finally {
            setLoading(false);
            console.log("pfData", pfData);
          }
        };
    
        fetchPointFigure();
      }, [currentIndex]); 
    

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <div>
        <Card style={{ marginTop: 20 }}>
            <Title level={5}>Stock Data</Title>
            {data.length > 0 && (
            <>
                <Text strong>Date:</Text> {data[currentIndex]['Date']}<br />
                <Text strong>Open:</Text> {data[currentIndex]['Open']}<br />
                <Text strong>High:</Text> {data[currentIndex]['High']}<br />
                <Text strong>Low:</Text> {data[currentIndex]['Low']}<br />
                <Text strong>Close:</Text> {data[currentIndex]['Close']}<br />
                <Text strong>Volume:</Text> {data[currentIndex]['Volume']}<br />
                {/* <Button type="default" onClick={handleNext}>Next</Button> */}
            </>
            )}
        </Card>
      </div>
      <div>
      <div>
            <Card style={{ marginTop: 20 }}>
                <Title level={5}>Point & Figure Chart</Title>
                {pfData ? (
                    <pre style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                        {pfData}
                    </pre>
                ) : (
                    <Text>No data available</Text>
                )}
            </Card>
      </div>

      </div>

    </div>
  );
};

export default StockDataViewer;