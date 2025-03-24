import { updateReport, processOrders } from "../components/tradeManagerUtility";

describe("Trade Manager Utility", () => {
    let setBalance, setShares, setOrders, setReport;
    let balance, shares, orders, data;

    beforeEach(() => {
        setBalance = jest.fn();
        setShares = jest.fn();
        setOrders = jest.fn();
        setReport = jest.fn();

        balance = 10000;  // $10,000 starting balance
        shares = [];
        orders = [];
        data = [
            { Date: "2024-03-01", Open: "100", High: "110", Low: "95", Close: "105" },
            { Date: "2024-03-02", Open: "106", High: "115", Low: "100", Close: "110" },
        ];
    });

    test("executes buy_market order and updates balance/shares", () => {
        orders.push({ id: "1", created: "2024-03-01", type: "buy_market", quantity: 10, price: 0, status: "open", completed: "" });

        processOrders(orders, data, 0, balance, setBalance, shares, setShares, setReport);

        expect(setBalance).toHaveBeenCalledWith(10000 - 10 * 105); // Deducted balance

        // Capture the function call and manually execute it
        const setSharesCallback = setShares.mock.calls[0][0];
        const updatedShares = setSharesCallback([]); // Simulate React state update
        expect(updatedShares.length).toBe(10);
    });

    test("executes sell_market order and updates balance", () => {
        shares = Array(10).fill({ orderId: "1", date: "2024-03-01", price: 100 });
        orders.push({ id: "3", created: "2024-03-01", type: "sell_market", quantity: 5, price: 0, status: "open", completed: "" });

        processOrders(orders, data, 0, balance, setBalance, shares, setShares, setReport);

        expect(setBalance).toHaveBeenCalledWith(10000 + 5 * 105); // Balance increased

        // Capture the function call and manually execute it
        const setSharesCallback = setShares.mock.calls[0][0];
        const updatedShares = setSharesCallback(shares); // Simulate React state update
        expect(updatedShares.length).toBe(5);
    });

    test("buy_limit executes when price is reached", () => {
        orders.push({ id: "5", created: "2024-03-01", type: "buy_limit", quantity: 10, price: 100, status: "open", completed: "" });

        processOrders(orders, data, 1, balance, setBalance, shares, setShares, setReport);

        expect(setBalance).toHaveBeenCalledWith(10000 - 10 * 100); // Deducted balance

        const setSharesCallback = setShares.mock.calls[0][0];
        const updatedShares = setSharesCallback(shares);
        expect(updatedShares.length).toBe(10);
    });

    test("sell_stop executes when price drops below stop price", () => {
        shares = Array(10).fill({ orderId: "1", date: "2024-03-01", price: 100 });
        orders.push({ id: "6", created: "2024-03-01", type: "sell_stop", quantity: 5, price: 100, status: "open", completed: "" });

        processOrders(orders, data, 1, balance, setBalance, shares, setShares, setReport);

        expect(setBalance).toHaveBeenCalledWith(10000 + 5 * 100); // Balance increased

        const setSharesCallback = setShares.mock.calls[0][0];
        const updatedShares = setSharesCallback(shares);
        expect(updatedShares.length).toBe(5);
    });

    test("sell_limit executes when price is reached", () => {
        shares = Array(10).fill({ orderId: "1", date: "2024-03-01", price: 100 });
        orders.push({ id: "7", created: "2024-03-01", type: "sell_limit", quantity: 5, price: 110, status: "open", completed: "" });

        processOrders(orders, data, 1, balance, setBalance, shares, setShares, setReport);

        expect(setBalance).toHaveBeenCalledWith(10000 + 5 * 110); // Balance increased

        const setSharesCallback = setShares.mock.calls[0][0];
        const updatedShares = setSharesCallback(shares);
        expect(updatedShares.length).toBe(5);
    });
});
