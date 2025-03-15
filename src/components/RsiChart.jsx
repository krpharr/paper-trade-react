import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, Button, Switch, Input, Select, Typography, DatePicker, Space, message } from "antd";
import axios from "axios";
import dayjs from "dayjs";

const { Option } = Select;
const { Title, Text } = Typography;

const RsiChart = ({ rsiMacdData, currentDate }) => {    
    const [viewRsi, setViewRsi] = useState(false);

    // Filter data based on the specified end date
    const sixMonthsBefore = dayjs(currentDate).subtract(6, 'month').format('YYYY-MM-DD');   
    const oneYearBefore = dayjs(currentDate).subtract(1, 'year').format('YYYY-MM-DD');
    const filteredData = rsiMacdData.filter(d => d.Date <= currentDate && d.Date >= sixMonthsBefore && d.RSI !== null);

    const handleRsiToggle = (checked) => {
        setViewRsi(checked);
    };
  
    return (
        <div>
                <div>
                    <Card>
                    <Text strong>RSI Chart: {viewRsi ? "ON" : "OFF"}</Text>
                    <br />
                    <Switch checked={viewRsi} onChange={handleRsiToggle} />
                    </Card>
                </div>
            {viewRsi && (
                <div>
                    <Card className="p-4">
                        <h2 className="text-xl font-semibold mb-4">RSI Chart</h2>
                        
                        <Input
                        type="date"
                        value={currentDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="mb-4"
                        />
                
                        <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={filteredData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="Date" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Line type="monotone" dataKey="RSI" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
            )}

        </div>

    );
};

export default RsiChart;