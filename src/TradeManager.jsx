import React, { useState, useEffect } from "react";
import { Card, Button, Input, Select, Typography, DatePicker, Space, message } from "antd";
import axios from "axios";
import dayjs from "dayjs";


const { Option } = Select;
const { Title, Text } = Typography;

const TradeManager = ({ data, currentIndex, balance, setBalance, shares, setShares, orders, setOrders }) => {
  const [orderType, setOrderType] = useState("buy_market");
  const [orderPrice, setOrderPrice] = useState(0);
  const [orderQuantity, setOrderQuantity] = useState(0);
  const [orderExpiration, minor setOrderExpiration] = useState("gfd");
 
  useEffect(() => {
    if (data.length > 0) {
        for (const order of orders) {
            if (order.status === 'open' && order.created != data[currentIndex]['Date']) {
                let msg = ""
                console.log("Order Quantity:", order.quantity);
                console.log("Shares Before Update:", shares.length);
                if (order.type === 'buy_market'){
                    const price = parseFloat(data[currentIndex]['Open'])
                    let tradeTotal = parseInt(order.quantity) * price
                    if (tradeTotal > balance) {
                        msg = "Trade could not be fulfiled";
                        order.status = "cancelled"
                        order.completed = data[currentIndex]['Date']
                    }
                    if (tradeTotal <= balance){
                        msg = "Trade completed";
                        let s = [];
                        for (let i = 0; i < order.quantity; i++) {
                            s.push({
                                orderId: order.id,
                                date: data[currentIndex]['Date'],
                                price: price
                            })
                        }
                        setShares([...shares, ...s]);
                        setBalance(balance - tradeTotal);
                        order.status = "filled"
                        order.completed = data[currentIndex]['Date']      
                        order.price = price;                  
                    }
                }                     
                if (order.type === 'buy_stop'){
                    const open_price = parseFloat(data[currentIndex]['Open'])
                    const high_price = parseFloat(data[currentIndex]['High'])
                    let tradeTotal = parseInt(order.quantity) * order.price

                    if (open_price <= order.price && high_price >= order.price){
                        if (tradeTotal > balance) {
                            msg = "Trade could not be fulfiled";
                            order.status = "cancelled"
                            order.completed = data[currentIndex]['Date']
                        }
                        if (tradeTotal <= balance){
                            msg = "Trade completed";
                            let s = [];
                            for (let i = 0; i < order.quantity; i++) {
                                s.push({
                                    orderId: order.id,
                                    date: data[currentIndex]['Date'],
                                    price: order.price
                                })
                            }
                            setShares([...shares, ...s]);
                            setBalance(balance - tradeTotal);
                            order.status = "filled"
                            order.completed = data[currentIndex]['Date']                    
                        }
                    }
                }              
                if (order.type === 'buy_limit'){
                    const open_price = parseFloat(data[currentIndex]['Open'])
                    const low_price = parseFloat(data[currentIndex]['Low'])
                    let tradeTotal = parseInt(order.quantity) * order.price

                    if (open_price >= order.price && low_price <= order.price){
                        if (tradeTotal > balance) {
                            msg = "Trade could not be fulfiled";
                            order.status = "cancelled"
                            order.completed = data[currentIndex]['Date']
                        }
                        if (tradeTotal <= balance){
                            msg = "Trade completed";
                            let s = [];
                            for (let i = 0; i < order.quantity; i++) {
                                s.push({
                                    orderId: order.id,
                                    date: data[currentIndex]['Date'],
                                    price: order.price
                                })
                            }
                            setShares([...shares, ...s]);
                            setBalance(balance - tradeTotal);
                            order.status = "filled"
                            order.completed = data[currentIndex]['Date']                    
                        }
                    }
                }           
                if (order.type === 'sell_market'){
                    const price = parseFloat(data[currentIndex]['Open']);
                    msg = "Trade completed";
                
                    let tradeTotal = order.quantity * price;

                
                    setShares(shares.length === order.quantity ? [] : shares.slice(order.quantity));

                    setBalance(balance + tradeTotal);
                    order.status = "filled";
                    order.completed = data[currentIndex]['Date'];
                    order.price = price;
                }                
                if (order.type === 'sell_stop'){
                    if (shares.length < order.quantity) {
                        message.error("Not enough shares to sell stop order. Todo: only create new orders sell orders that match shares. also need to be able to update an order to accoodate.")
                        order.status = "cancelled";
                        order.completed = data[currentIndex]['Date'];       
                        return;                     
                    }
                    const open_price = parseFloat(data[currentIndex]['Open']);
                    const low_price = parseFloat(data[currentIndex]['Low']);

                    if (open_price >= order.price && low_price <= order.price) {
                        // stop has been hit
                        msg = "Trade completed";               
                        let tradeTotal = order.quantity * order.price;              
                        setShares(shares.length === order.quantity ? [] : shares.slice(order.quantity));    
                        setBalance(balance + tradeTotal);
                        order.status = "filled";
                        order.completed = data[currentIndex]['Date'];
                    }
                }                
                if (order.type === 'sell_limit'){
                    if (shares.length < order.quantity) {
                        message.error("Not enough shares to sell limit order. Todo: only create new orders sell orders that match shares. also need to be able to update an order to accoodate.")
                        order.status = "cancelled";
                        order.completed = data[currentIndex]['Date'];       
                        return;                     
                    }
                    const open_price = parseFloat(data[currentIndex]['Open']);
                    const high_price = parseFloat(data[currentIndex]['High']);

                    if (open_price <= order.price && high_price >= order.price) {
                        // limit has been hit
                        msg = "Trade completed";               
                        let tradeTotal = order.quantity * order.price;              
                        setShares(shares.length === order.quantity ? [] : shares.slice(order.quantity));    
                        setBalance(balance + tradeTotal);
                        order.status = "filled";
                        order.completed = data[currentIndex]['Date'];
                    }
                }
            }
        }
        console.log("Shares After Update:", shares.length);
        console.log(shares);          
    }
  }, [currentIndex]);
 
  const placeOrder = () => {
    if (orderQuantity <= 0) {
      message.error("Quantity must be greater than zero.");
      return;
    }
    if ((orderType !== "buy_market" && orderType !== "sell_market") && orderPrice <= 0) {
      message.error("Price must be greater than zero for limit/stop orders.");
      return;
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
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <Card style={{ marginTop: 20 }}>
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

      {orders.length > 0 ? 
        <Card title="Open Orders" style={{ marginTop: 20 }}>
        {orders.length > 0 ? (
            orders.map((order, index) => (
            <Card key={index} style={{ marginBottom: "10px" }}>
                <Text strong>Created:</Text> {order.created} <br />
                <Text strong>Type:</Text> {order.type} <br />
                <Text strong>Price:</Text> ${order.price.toFixed(2)} <br />
                <Text strong>Quantity:</Text> {order.quantity} <br />
                <Text strong>Expiration:</Text> {order.expiration} <br />                
                <Text strong>Status:</Text> {order.status} <br />
                <Text strong>Completed:</Text> {order.completed} <br />
            </Card>
            ))
        ) : (
            <Text>No open orders</Text>
        )}
        </Card>

        
        : 
        "No Orders"}
    </div>
  );
};

export default TradeManager;