import React, { useState, useEffect } from "react";
import { Card, Button, Switch, Input, Select, Typography, DatePicker, Space, message } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

import axios from "axios";
import dayjs from "dayjs";

const { Option } = Select;
const { Title, Text } = Typography;

const MacdChart = ({ rsiMacdData, currentDate }) => {
    const [viewMacd, setViewMacd] = useState(false);

    // Filter data based on the specified end date
    const sixMonthsBefore = dayjs(currentDate).subtract(6, 'month').format('YYYY-MM-DD');    
    const oneYearBefore = dayjs(currentDate).subtract(1, 'year').format('YYYY-MM-DD');
    const filteredData = rsiMacdData.filter(d => d.Date <= currentDate && d.Date >= sixMonthsBefore && d.MACD_3_10_16 !== null && d.MACDs_3_10_16 !== null);

    const handleMacdToggle = (checked) => {
        setViewMacd(checked);
    };
    return (
        <div>
                <div>
                    <Card>
                    <Text strong>MACD Chart: {viewMacd ? "ON" : "OFF"}</Text>
                    <br />
                    <Switch checked={viewMacd} onChange={handleMacdToggle} />
                    </Card>
                </div>
            {viewMacd && (
                <div className="p-4 bg-white rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-4">MACD Chart</h2>
                    <input
                    type="date"
                    value={currentDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mb-4 p-2 border rounded"
                    />
                    <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={filteredData}>
                        <XAxis dataKey="Date" tickFormatter={(tick) => dayjs(tick).format("MM/DD")} />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="MACD_3_10_16" stroke="#8884d8" strokeWidth={2} name="MACD Line" />
                        <Line type="monotone" dataKey="MACDs_3_10_16" stroke="#82ca9d" strokeWidth={2} name="Signal Line" />
                    </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

        </div>
    );
};

export default MacdChart;