// 为 node 测试环境补充 localStorage 垫片（usePersistState 等依赖浏览器 API 的测试用）
class LocalStorageMock {
  private store = new Map<string, string>();
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
  get length(): number {
    return this.store.size;
  }
}

(globalThis as unknown as { localStorage: LocalStorageMock }).localStorage = new LocalStorageMock();
