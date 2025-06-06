import React, { useState, useEffect } from "react";
import { Card, Button, Switch, Input, Select, Typography, DatePicker, Space, message } from "antd";
import axios from "axios";
import dayjs from "dayjs";

const { Option } = Select;
const { Title, Text } = Typography;

const StockDataViewer = ({ data, currentIndex, ticker }) => {
    const [loading, setLoading] = useState(false);
    const [pfData, setPfData] = useState(undefined);
    const [pfLink, setPfLink] = useState("");
    const [viewPF, setViewPF] = useState(false);

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
        if (viewPF) fetchPointFigure();
        let str = `O:${data[currentIndex]['Open']} C:${data[currentIndex]['Close']} H:${data[currentIndex]['High']} L:${data[currentIndex]['Low']}`
        console.log(str)
      }, [currentIndex, viewPF]); 

      const handlePFToggle = (checked) => {
        setViewPF(checked);
      };

  return (
    <div>
      <div>
        <Card>
            {data.length > 0 && (
            <>
                <Text strong>Date:</Text> {dayjs(data[currentIndex]['Date']).format("YYYY-MM-DD")}<br />
                <Text strong>O:</Text> {parseFloat(data[currentIndex]['Open']).toFixed(2)}<br />
                <Text strong>C:</Text> {parseFloat(data[currentIndex]['Close']).toFixed(2)}<br />
                <Text strong>H:</Text> {parseFloat(data[currentIndex]['High']).toFixed(2)}<br />
                <Text strong>L:</Text> {parseFloat(data[currentIndex]['Low']).toFixed(2)}<br />
                <Text strong>Vol:</Text> {parseFloat(data[currentIndex]['Volume']).toFixed(2)}<br />
                {/* <Button type="default" onClick={handleNext}>Next</Button> */}
            </>
            )}
        </Card>
      </div>


    </div>
  );
};

export default StockDataViewer;