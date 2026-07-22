import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MoodPicker from "../MoodPicker";

describe("MoodPicker", () => {
  it("should render the current mood button", () => {
    const onChange = vi.fn();
    render(<MoodPicker value="excited" onChange={onChange} />);
    expect(screen.getByText("很期待")).toBeDefined();
  });

  it("should show dropdown when clicked", () => {
    const onChange = vi.fn();
    render(<MoodPicker value="casual" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    // All moods should be visible
    expect(screen.getByText("超想去")).toBeDefined();
    expect(screen.getByText("很期待")).toBeDefined();
    expect(screen.getByText("想试试")).toBeDefined();
    expect(screen.getAllByText("随便啦").length).toBeGreaterThanOrEqual(1);
  });

  it("should call onChange when a mood is selected from dropdown", () => {
    const onChange = vi.fn();
    render(<MoodPicker value="casual" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("超想去"));
    expect(onChange).toHaveBeenCalledWith("must");
  });

  it("should close dropdown after selection", () => {
    const onChange = vi.fn();
    render(<MoodPicker value="casual" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("超想去"));
    // Dropdown should be gone
    expect(screen.queryByText("想试试")).toBeNull();
  });

  it("should not open dropdown when disabled", () => {
    const onChange = vi.fn();
    render(<MoodPicker value="curious" onChange={onChange} disabled />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByText("超想去")).toBeNull();
  });
});
