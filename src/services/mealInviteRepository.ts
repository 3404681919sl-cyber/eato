import {
  createMealInviteUrl,
  parseMealInviteToken,
  validateMealInviteJoin,
} from "./mealInviteService";

export type MealInviteDataPort = {
  createOrRotate(eventId: string): Promise<string>;
  join(token: string, displayName: string): Promise<string>;
};

export class MealInviteRepository {
  constructor(private readonly dataPort: MealInviteDataPort) {}

  async createShareUrl(eventId: string, appUrl: string): Promise<string> {
    const token = await this.dataPort.createOrRotate(eventId);
    return createMealInviteUrl(appUrl, token);
  }

  async join(appUrl: string, displayName: string): Promise<string> {
    const token = parseMealInviteToken(appUrl);
    if (!token) throw new Error("邀请链接无效");

    const validation = validateMealInviteJoin(displayName);
    if (!validation.displayName) throw new Error(validation.issue ?? "请填写加入饭局时使用的昵称");
    return await this.dataPort.join(token, validation.displayName);
  }
}
