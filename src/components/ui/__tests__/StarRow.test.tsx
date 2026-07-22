import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import StarRow from "../StarRow";

describe("StarRow", () => {
  it("should render 5 star buttons", () => {
    const onChange = vi.fn();
    render(<StarRow value={3} onChange={onChange} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(5);
  });

  it("should call onChange with the correct star value when clicked", () => {
    const onChange = vi.fn();
    render(<StarRow value={0} onChange={onChange} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[2]); // click 3rd star → value = 3
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("should not call onChange when disabled", () => {
    const onChange = vi.fn();
    render(<StarRow value={3} onChange={onChange} disabled />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("should apply filled class for stars <= value", () => {
    const { container } = render(<StarRow value={3} onChange={vi.fn()} />);
    const stars = container.querySelectorAll("button svg");
    // Stars 1, 2, 3 should have fill-amber-400 class
    expect(stars[0].classList.toString()).toContain("fill-amber-400");
    expect(stars[2].classList.toString()).toContain("fill-amber-400");
    // Star 4 should NOT
    expect(stars[3].classList.toString()).not.toContain("fill-amber-400");
  });
});
