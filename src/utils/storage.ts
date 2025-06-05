import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

const storageLogger = logger.child('Storage');

// Web-compatible storage interface
interface StorageInterface {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  multiGet: (keys: string[]) => Promise<[string, string | null][]>;
  multiSet: (keyValuePairs: [string, string][]) => Promise<void>;
  multiRemove: (keys: string[]) => Promise<void>;
  getAllKeys: () => Promise<string[]>;
  clear: () => Promise<void>;
}

// Browser localStorage wrapper
class WebStorage implements StorageInterface {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      storageLogger.error('WebStorage getItem error', { key, error });
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      storageLogger.error('WebStorage setItem error', { key, error });
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      storageLogger.error('WebStorage removeItem error', { key, error });
    }
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    return keys.map(key => [key, localStorage.getItem(key)]);
  }

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    keyValuePairs.forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  }

  async multiRemove(keys: string[]): Promise<void> {
    keys.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  async getAllKeys(): Promise<string[]> {
    return Object.keys(localStorage);
  }

  async clear(): Promise<void> {
    localStorage.clear();
  }
}

// Storage factory based on platform
class StorageFactory {
  private static instance: StorageInterface | null = null;

  static getStorage(): StorageInterface {
    if (!this.instance) {
      if (typeof window !== 'undefined' && window.localStorage) {
        this.instance = new WebStorage();
      } else {
        this.instance = AsyncStorage as StorageInterface;
      }
    }
    return this.instance;
  }
}

// Unified storage utility with type safety and error handling
export class Storage {
  private static storage = StorageFactory.getStorage();

  // Generic methods with JSON serialization
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.storage.getItem(key);
      if (!value) return null;
      
      try {
        return JSON.parse(value) as T;
      } catch {
        // If not JSON, return as string
        return value as unknown as T;
      }
    } catch (error) {
      storageLogger.error('Storage get error', { key, error });
      return null;
    }
  }

  static async set<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      await this.storage.setItem(key, serialized);
    } catch (error) {
      storageLogger.error('Storage set error', { key, error });
      throw error;
    }
  }

  static async remove(key: string): Promise<void> {
    try {
      await this.storage.removeItem(key);
    } catch (error) {
      storageLogger.error('Storage remove error', { key, error });
    }
  }

  // Batch operations
  static async multiGet<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const pairs = await this.storage.multiGet(keys);
      const result: Record<string, T | null> = {};
      
      pairs.forEach(([key, value]) => {
        if (value) {
          try {
            result[key] = JSON.parse(value) as T;
          } catch {
            result[key] = value as unknown as T;
          }
        } else {
          result[key] = null;
        }
      });
      
      return result;
    } catch (error) {
      storageLogger.error('Storage multiGet error', { keys, error });
      return {};
    }
  }

  static async multiSet<T>(items: Record<string, T>): Promise<void> {
    try {
      const pairs: [string, string][] = Object.entries(items).map(([key, value]) => [
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
      ]);
      
      await this.storage.multiSet(pairs);
    } catch (error) {
      storageLogger.error('Storage multiSet error', { error });
      throw error;
    }
  }

  static async multiRemove(keys: string[]): Promise<void> {
    try {
      await this.storage.multiRemove(keys);
    } catch (error) {
      storageLogger.error('Storage multiRemove error', { keys, error });
    }
  }

  // Utility methods
  static async getAllKeys(): Promise<string[]> {
    try {
      return await this.storage.getAllKeys();
    } catch (error) {
      storageLogger.error('Storage getAllKeys error', { error });
      return [];
    }
  }

  static async clear(): Promise<void> {
    try {
      await this.storage.clear();
    } catch (error) {
      storageLogger.error('Storage clear error', { error });
    }
  }

  static async has(key: string): Promise<boolean> {
    const value = await this.storage.getItem(key);
    return value !== null;
  }

  // Specialized storage methods for common use cases
  static async getSecure(key: string): Promise<string | null> {
    // For sensitive data, could implement encryption here
    return this.get<string>(key);
  }

  static async setSecure(key: string, value: string): Promise<void> {
    // For sensitive data, could implement encryption here
    return this.set(key, value);
  }

  // Token management helpers
  static async getTokens(): Promise<{ accessToken?: string; refreshToken?: string }> {
    const tokens = await this.multiGet<string>(['accessToken', 'refreshToken']);
    return {
      accessToken: tokens.accessToken || undefined,
      refreshToken: tokens.refreshToken || undefined,
    };
  }

  static async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await this.multiSet({
      accessToken,
      refreshToken,
    });
  }

  static async clearTokens(): Promise<void> {
    await this.multiRemove(['accessToken', 'refreshToken']);
  }

  // User preferences helpers
  static async getUserPreferences(): Promise<Record<string, any>> {
    return await this.get('userPreferences') || {};
  }

  static async setUserPreferences(preferences: Record<string, any>): Promise<void> {
    await this.set('userPreferences', preferences);
  }

  static async updateUserPreferences(updates: Record<string, any>): Promise<void> {
    const current = await this.getUserPreferences();
    await this.set('userPreferences', { ...current, ...updates });
  }
}

// Export storage instance for backward compatibility
export const storage = Storage;

// Export convenience functions
export const getStorageItem = <T>(key: string) => Storage.get<T>(key);
export const setStorageItem = <T>(key: string, value: T) => Storage.set(key, value);
export const removeStorageItem = (key: string) => Storage.remove(key);
export const clearStorage = () => Storage.clear();

// Export storage interface for zustand
export const getStorageInterface = () => {
  const storageInstance = StorageFactory.getStorage();
  return {
    getItem: async (key: string) => {
      const value = await storageInstance.getItem(key);
      return value;
    },
    setItem: async (key: string, value: string) => {
      await storageInstance.setItem(key, value);
    },
    removeItem: async (key: string) => {
      await storageInstance.removeItem(key);
    },
  };
};