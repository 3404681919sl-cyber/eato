import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CategoryPicker from "../CategoryPicker";

describe("CategoryPicker", () => {
  it("should render the current category button", () => {
    const onChange = vi.fn();
    render(<CategoryPicker value="hotpot" onChange={onChange} />);
    expect(screen.getByText("火锅")).toBeDefined();
  });

  it("should show dropdown when clicked", () => {
    const onChange = vi.fn();
    render(<CategoryPicker value="other" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("火锅")).toBeDefined();
    expect(screen.getByText("日韩")).toBeDefined();
    expect(screen.getByText("西餐")).toBeDefined();
  });

  it("should call onChange when a category is selected", () => {
    const onChange = vi.fn();
    render(<CategoryPicker value="other" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("火锅"));
    expect(onChange).toHaveBeenCalledWith("hotpot");
  });

  it("should close dropdown after selection", () => {
    const onChange = vi.fn();
    render(<CategoryPicker value="other" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("火锅"));
    expect(screen.queryByText("日韩")).toBeNull();
  });

  it("should not open dropdown when disabled", () => {
    const onChange = vi.fn();
    render(<CategoryPicker value="dessert" onChange={onChange} disabled />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByText("火锅")).toBeNull();
  });
});
