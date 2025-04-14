class APICache {
  constructor(options = {}) {
    this.cache = new Map();
    this.rateLimit = options.rateLimit || 1000; // 1 second between requests
    this.maxRetries = options.maxRetries || 3;
    this.cacheDuration = options.cacheDuration || 5 * 60 * 1000; // 5 minutes
    this.lastRequestTime = 0;
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async ensureRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimit) {
      await this.sleep(this.rateLimit - timeSinceLastRequest);
    }
    this.lastRequestTime = Date.now();
  }

  async fetchWithRetry(url, options, retryCount = 0) {
    try {
      await this.ensureRateLimit();
      const response = await fetch(url, options);

      if (!response.ok) {
        if (retryCount < this.maxRetries) {
          const backoffTime = Math.pow(2, retryCount) * 1000;
          await this.sleep(backoffTime);
          return this.fetchWithRetry(url, options, retryCount + 1);
        }
        throw new Error(
          `Failed after ${this.maxRetries} retries: ${response.status}`
        );
      }

      return response;
    } catch (error) {
      if (retryCount < this.maxRetries) {
        const backoffTime = Math.pow(2, retryCount) * 1000;
        await this.sleep(backoffTime);
        return this.fetchWithRetry(url, options, retryCount + 1);
      }
      throw error;
    }
  }

  getCacheKey(url, options) {
    return `${url}-${JSON.stringify(options)}`;
  }

  async getCachedResponse(url, options) {
    const cacheKey = this.getCacheKey(url, options);
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    const response = await this.fetchWithRetry(url, options);
    const data = await response.json();

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return data;
  }

  clearCache() {
    this.cache.clear();
  }

  invalidateCache(key) {
    this.cache.delete(key);
  }
}

export const apiCache = new APICache();
