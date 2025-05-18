export class Cache<T> {
  private cache: Map<string, { data: T; timestamp: number }>;
  private timeToLive: number;

  constructor(timeToLive: number = 1000 * 60 * 10) {
    this.cache = new Map();
    this.timeToLive = timeToLive;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > this.timeToLive;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
}
