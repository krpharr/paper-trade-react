import React, { useState, useEffect } from "react";
import { Card, Button, Input, Select, Typography, DatePicker, Space, message } from "antd";
import axios from "axios";
import dayjs from "dayjs";

const { Option } = Select;
const { Title, Text } = Typography;

const StockDataViewer = ({ data, currentIndex, ticker }) => {
    const [loading, setLoading] = useState(false);
    const [pfData, setPfData] = useState(undefined);
    const [pfLink, setPfLink] = useState("");

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
        let pfd = dayjs(d).format("YYYYMMDD");
        let pfUrl = `https://stockcharts.com/freecharts/pnf.php?c=${ticker},PWTADANRNO[PA][D${pfd}][F1!3!!!2!20][J,Y]`;
        setPfLink(pfUrl);
        // fetchPointFigure();
        let str = `O:${data[currentIndex]['Open']} C:${data[currentIndex]['Close']} H:${data[currentIndex]['High']} L:${data[currentIndex]['Low']}`
        console.log(str)
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

        <div><Button 
            type="primary" 
            onClick={() => window.open(pfLink, "pfchart")}
            >
            {ticker} Point & Figure
            </Button>
        </div>
        {/* <div>
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
        </div> */}

      </div>

    </div>
  );
};

export default StockDataViewer;