import React, { useState, useEffect } from "react";
import { Card, Button, Input, Select, Typography, message } from "antd";
import { updateReport, processOrders } from "./tradeManagerUtility";

const { Option } = Select;
const { Title } = Typography;

const TradeManager = ({ data, currentIndex, balance, setBalance, shares, setShares, orders, setOrders, setReport }) => {
  const [orderType, setOrderType] = useState("buy_market");
  const [orderPrice, setOrderPrice] = useState(0);
  const [orderQuantity, setOrderQuantity] = useState(0);
  const [orderExpiration, setOrderExpiration] = useState("gfd");

  useEffect(() => {
    processOrders(orders, data, currentIndex, balance, setBalance, shares, setShares, setReport);
  }, [currentIndex, orders]);

  const placeOrder = () => {
    if (orderQuantity <= 0) {
      message.error("Quantity must be greater than zero.");
      return;
    }

    if (["buy_stop", "sell_limit"].includes(orderType) && orderPrice < parseFloat(data[currentIndex]['Close'])) {
        message.error("Price must be higher than current price.");
        return;
    }

    if (["sell_stop", "buy_limit"].includes(orderType) && orderPrice > parseFloat(data[currentIndex]['Close'])) {
        message.error("Price must be lower than current price.");
        return;
    }

    if (!["buy_market", "sell_market"].includes(orderType) && orderPrice <= 0) {
      message.error("Price must be greater than zero for limit/stop orders.");
      return;
    }

    if (["sell_market", "sell_limit", "sell_stop"].includes(orderType) && orderQuantity > shares.length) {
        message.error("Not enough shares to sell.");
        return;
    }

    if (orderType === "sell_market") {
        if (shares.slice(0, orderQuantity).some(share => share.date === data[currentIndex]['Date'])) {
            message.error("Cannot sell shares bought on the same day.");
            return;
        }
    }

    setOrders([...orders, { 
        id: crypto.randomUUID(), 
        created: data[currentIndex]['Date'], 
        type: orderType, 
        price: orderPrice, 
        quantity: orderQuantity, 
        expiration: orderExpiration, 
        status: "open",
        completed: "",
    }]);
    message.success("Order placed successfully.");
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <Card>
        <Title level={5}>Place Order</Title>
        <Select value={orderType} onChange={setOrderType} style={{ width: "100%" }}>
          <Option value="buy_market">Buy Market</Option>
          <Option value="sell_market">Sell Market</Option>
          <Option value="buy_limit">Buy Limit</Option>
          <Option value="sell_limit">Sell Limit</Option>
          <Option value="buy_stop">Buy Stop</Option>
          <Option value="sell_stop">Sell Stop</Option>
        </Select>
        <Input type="number" value={orderPrice} onChange={(e) => setOrderPrice(Number(e.target.value))} placeholder="Enter Price" disabled={orderType.includes("market")} />
        <Input type="number" value={orderQuantity} onChange={(e) => setOrderQuantity(Number(e.target.value))} placeholder="Enter Quantity" />
        <Button type="primary" onClick={placeOrder} block>Place Order</Button>
      </Card>
    </div>
  );
};

export default TradeManager;
