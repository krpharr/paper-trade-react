import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TradeManager from "../components/TradeManager";

const mockOnTrade = jest.fn();

describe("TradeManager Component", () => {
  let shares;
  let orders;

  beforeEach(() => {
    shares = [
      { id: 1, symbol: "AAPL", quantity: 10 },
      { id: 2, symbol: "TSLA", quantity: 5 },
    ];

    orders = [
      { id: 1, symbol: "AAPL", type: "buy", quantity: 5, price: 150 },
    ];
  });

  test("Renders component correctly", () => {
    render(<TradeManager shares={shares} orders={orders} onTrade={mockOnTrade} />);
    expect(screen.getByText("Trade Manager")).toBeInTheDocument();
  });

  test("Prevents selling more shares than owned", async () => {
    render(<TradeManager shares={shares} orders={orders} onTrade={mockOnTrade} />);
    
    // Simulate user trying to sell more than owned
    fireEvent.change(screen.getByLabelText("Quantity"), { target: { value: "20" } });
    fireEvent.click(screen.getByText("Sell"));

    // Expect error message to appear
    await waitFor(() => {
      expect(screen.getByText("Not enough shares available to sell")).toBeInTheDocument();
    });
  });
});
