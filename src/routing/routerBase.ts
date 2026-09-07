export function routerBasename(viteBaseUrl: string): string {
  if (viteBaseUrl === "/") return "/";

  return viteBaseUrl.replace(/\/$/, "");
}
