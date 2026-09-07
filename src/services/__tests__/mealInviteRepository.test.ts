import { describe, expect, it } from "vitest";
import {
  MealInviteRepository,
  type MealInviteDataPort,
} from "../mealInviteRepository";

describe("MealInviteRepository", () => {
  it("turns a creator token into a fragment-only share URL", async () => {
    const dataPort: MealInviteDataPort = {
      createOrRotate: async () => "opaque-token",
      join: async () => "event-id",
    };
    const repository = new MealInviteRepository(dataPort);

    await expect(repository.createShareUrl("event-id", "https://eato.example/eato/app")).resolves.toBe(
      "https://eato.example/eato/app#invite=opaque-token",
    );
  });

  it("joins with the token and normalized nickname without accepting a caller-selected user id", async () => {
    const calls: Array<[string, string]> = [];
    const dataPort: MealInviteDataPort = {
      createOrRotate: async () => "opaque-token",
      join: async (token, displayName) => {
        calls.push([token, displayName]);
        return "event-id";
      },
    };
    const repository = new MealInviteRepository(dataPort);

    await expect(repository.join("https://eato.example/eato/app#invite=opaque-token", "  小美  ")).resolves.toBe("event-id");
    expect(calls).toEqual([["opaque-token", "小美"]]);
  });

  it("rejects a link without an invite token before calling the cloud", async () => {
    const dataPort: MealInviteDataPort = {
      createOrRotate: async () => "opaque-token",
      join: async () => { throw new Error("should not call cloud"); },
    };
    const repository = new MealInviteRepository(dataPort);

    await expect(repository.join("https://eato.example/eato/app", "小美")).rejects.toThrow("邀请链接无效");
  });
});
