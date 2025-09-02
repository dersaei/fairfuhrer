// utils/resourceManager.ts
export class ResourceManager {
  private static instance: ResourceManager;
  private loadingRequests = new Map<string, Promise<unknown>>();
  private maxConcurrentRequests = 6;
  private currentRequests = 0;
  private requestQueue: (() => void)[] = [];

  static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager();
    }
    return ResourceManager.instance;
  }

  async throttledLoad<T>(
    key: string,
    loadFunction: () => Promise<T>,
    fallback?: T
  ): Promise<T> {
    // Check if already loading
    const existingRequest = this.loadingRequests.get(key);
    if (existingRequest) {
      return existingRequest as Promise<T>;
    }

    // Create the throttled promise
    const promise = new Promise<T>((resolve, reject) => {
      const executeLoad = async () => {
        try {
          this.currentRequests++;
          const result = await loadFunction();
          resolve(result);
        } catch (error) {
          console.warn(`Resource load failed for ${key}:`, error);
          if (fallback !== undefined) {
            resolve(fallback);
          } else {
            reject(error);
          }
        } finally {
          this.currentRequests--;
          this.loadingRequests.delete(key);
          this.processQueue();
        }
      };

      if (this.currentRequests < this.maxConcurrentRequests) {
        executeLoad();
      } else {
        this.requestQueue.push(executeLoad);
      }
    });

    this.loadingRequests.set(key, promise);
    return promise;
  }

  private processQueue(): void {
    if (
      this.requestQueue.length > 0 &&
      this.currentRequests < this.maxConcurrentRequests
    ) {
      const nextRequest = this.requestQueue.shift();
      if (nextRequest) {
        nextRequest();
      }
    }
  }

  clearCache(): void {
    this.loadingRequests.clear();
  }

  // Get current status for debugging
  getStatus(): { loading: number; queued: number; cached: number } {
    return {
      loading: this.currentRequests,
      queued: this.requestQueue.length,
      cached: this.loadingRequests.size,
    };
  }
}
