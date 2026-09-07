export type MealInviteJoinValidation = {
  displayName: string | null;
  issue: string | null;
};

export function createMealInviteUrl(appUrl: string, token: string): string {
  const url = new URL(appUrl);
  url.hash = new URLSearchParams({ invite: token }).toString();
  return url.toString();
}

export function parseMealInviteToken(appUrl: string): string | null {
  const inviteToken = new URL(appUrl).hash.slice(1);
  return new URLSearchParams(inviteToken).get("invite");
}

export function validateMealInviteJoin(displayName: string): MealInviteJoinValidation {
  const normalizedName = displayName.trim();
  return normalizedName
    ? { displayName: normalizedName, issue: null }
    : { displayName: null, issue: "请填写加入饭局时使用的昵称" };
}
