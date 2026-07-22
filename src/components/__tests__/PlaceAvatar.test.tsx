import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PlaceAvatar from "../PlaceAvatar";

// Mock the avatar utility
vi.mock("@/utils/avatar", () => ({
  resolvePlaceImage: vi.fn((name: string) => `https://images.example.com/${name}.jpg`),
}));

describe("PlaceAvatar", () => {
  it("should render an image with the correct alt text", () => {
    render(<PlaceAvatar name="Test Place" category="chinese" />);
    const img = screen.getByAltText("Test Place");
    expect(img).toBeDefined();
    expect(img.getAttribute("src")).toBe("https://images.example.com/Test Place.jpg");
  });

  it("should apply grayscale class when checked is true", () => {
    const { container } = render(
      <PlaceAvatar name="Checked Place" category="hotpot" checked />,
    );
    const img = container.querySelector("img");
    expect(img?.classList.toString()).toContain("grayscale");
  });

  it("should not apply grayscale when checked is false/undefined", () => {
    const { container } = render(
      <PlaceAvatar name="Unchecked Place" category="dessert" />,
    );
    const img = container.querySelector("img");
    expect(img?.classList.toString()).not.toContain("grayscale");
  });

  it("should show visit badge when visitIndex > 0", () => {
    render(<PlaceAvatar name="Frequent" category="bbq" visitIndex={3} />);
    expect(screen.getByText("#4")).toBeDefined(); // visitIndex + 1
  });

  it("should not show visit badge when visitIndex is 0", () => {
    const { container } = render(
      <PlaceAvatar name="First Visit" category="asian" visitIndex={0} />,
    );
    expect(container.textContent).not.toContain("#");
  });

  it("should not show visit badge when visitIndex is undefined", () => {
    const { container } = render(
      <PlaceAvatar name="No Visits" category="western" />,
    );
    expect(container.textContent).not.toContain("#");
  });
});
