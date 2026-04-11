import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders form builder heading", () => {
  render(<App />);
  const heading = screen.getByText(/product discovery intake/i);
  expect(heading).toBeInTheDocument();
});
