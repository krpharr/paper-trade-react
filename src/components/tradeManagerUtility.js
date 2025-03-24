export const updateReport = (order, setReport) => {
    let reportStr = `${order.completed}, ${order.status}, ${order.type}, ${order.quantity}, ${order.price}\n`;
    setReport((prevReport) => prevReport + reportStr);
};

export const processOrders = (orders, data, currentIndex, balance, setBalance, shares, setShares, setReport) => {
    if (data.length === 0) return;

    orders.forEach((order) => {
        if (order.status !== "open") return;

        const currentDate = data[currentIndex]['Date'];
        const price = parseFloat(data[currentIndex]['Close']);
        let msg = "";

        if (order.created === currentDate) {
            if (order.type === 'buy_market') {
                handleBuyMarket(order, price, balance, setBalance, shares, setShares, currentDate, setReport);
            } else if (order.type === 'sell_market') {
                handleSellMarket(order, price, balance, setBalance, shares, setShares, currentDate, setReport);
            }
        } else {
            if (order.type === 'buy_stop' && parseFloat(data[currentIndex]['High']) >= order.price) {
                executeBuyOrder(order, balance, setBalance, shares, setShares, currentDate, setReport);
            }
            if (order.type === 'buy_limit' && parseFloat(data[currentIndex]['Low']) <= order.price) {
                executeBuyOrder(order, balance, setBalance, shares, setShares, currentDate, setReport);
            }
            if (order.type === 'sell_stop' && parseFloat(data[currentIndex]['Low']) <= order.price) {
                executeSellOrder(order, balance, setBalance, shares, setShares, currentDate, setReport);
            }
            if (order.type === 'sell_limit' && parseFloat(data[currentIndex]['High']) >= order.price) {
                executeSellOrder(order, balance, setBalance, shares, setShares, currentDate, setReport);
            }
        }
    });
};

const handleBuyMarket = (order, price, balance, setBalance, shares, setShares, currentDate, setReport) => {
    const tradeTotal = order.quantity * price;

    if (tradeTotal > balance) {
        order.status = "cancelled";
        order.completed = currentDate;
        order.price = price;
        updateReport(order, setReport);
        return;
    }

    let newShares = Array.from({ length: order.quantity }, () => ({ orderId: order.id, date: currentDate, price }));
    setShares((prevShares) => [...prevShares, ...newShares]);
    setBalance(balance - tradeTotal);
    
    order.status = "filled";
    order.completed = currentDate;
    order.price = price;
    updateReport(order, setReport);
};

const handleSellMarket = (order, price, balance, setBalance, shares, setShares, currentDate, setReport) => {
    if (shares.length < order.quantity) {
        order.status = "cancelled";
        order.completed = currentDate;
        updateReport(order, setReport);
        return;
    }

    let tradeTotal = order.quantity * price;
    setShares((prevShares) => prevShares.slice(order.quantity));
    setBalance(balance + tradeTotal);
    
    order.status = "filled";
    order.completed = currentDate;
    order.price = price;
    updateReport(order, setReport);
};

const executeBuyOrder = (order, balance, setBalance, shares, setShares, currentDate, setReport) => {
    const tradeTotal = order.quantity * order.price;

    if (tradeTotal > balance) {
        order.status = "cancelled";
        order.completed = currentDate;
        updateReport(order, setReport);
        return;
    }

    let newShares = Array.from({ length: order.quantity }, () => ({ orderId: order.id, date: currentDate, price: order.price }));
    setShares((prevShares) => [...prevShares, ...newShares]);
    setBalance(balance - tradeTotal);
    
    order.status = "filled";
    order.completed = currentDate;
    updateReport(order, setReport);
};

const executeSellOrder = (order, balance, setBalance, shares, setShares, currentDate, setReport) => {
    if (shares.length < order.quantity) {
        order.status = "cancelled";
        order.completed = currentDate;
        updateReport(order, setReport);
        return;
    }

    let tradeTotal = order.quantity * order.price;
    setShares((prevShares) => prevShares.slice(order.quantity));
    setBalance(balance + tradeTotal);
    
    order.status = "filled";
    order.completed = currentDate;
    updateReport(order, setReport);
};
