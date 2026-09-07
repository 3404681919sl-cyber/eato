import { describe, expect, it } from "vitest";
import {
  createMealInviteUrl,
  parseMealInviteToken,
  validateMealInviteJoin,
} from "../mealInviteService";

describe("meal invite links", () => {
  it("places an opaque invite token in the URL fragment without event data", () => {
    const inviteUrl = createMealInviteUrl("https://eato.example/eato/app", "opaque-token-123");
    const parsed = new URL(inviteUrl);

    expect(parsed.pathname).toBe("/eato/app");
    expect(parsed.search).toBe("");
    expect(parsed.hash).toBe("#invite=opaque-token-123");
  });

  it("reads a token only from the invite fragment", () => {
    expect(parseMealInviteToken("https://eato.example/eato/app#invite=opaque-token-123")).toBe("opaque-token-123");
    expect(parseMealInviteToken("https://eato.example/eato/app?invite=not-accepted")).toBeNull();
    expect(parseMealInviteToken("https://eato.example/eato/app#other=value")).toBeNull();
  });

  it("normalizes a joining member name and rejects blank names", () => {
    expect(validateMealInviteJoin("  小美  ")).toEqual({ displayName: "小美", issue: null });
    expect(validateMealInviteJoin("   ")).toEqual({ displayName: null, issue: "请填写加入饭局时使用的昵称" });
  });
});
