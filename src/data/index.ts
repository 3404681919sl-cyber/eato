// ── Data layer ──
// Re-exports from data sub-modules.
// Components should prefer using DataProvider + useData() hook
// from src/services/ instead of importing these directly.

export { SEED, buildSeedCalendar } from "./seed";
export { generateDeals, getPlatformDealUrl } from "./deals";
