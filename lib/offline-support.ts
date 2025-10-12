/**
 * Offline Support Library
 * Provides AsyncStorage caching, sync queue, and conflict resolution for Split4Us Mobile
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const CACHE_KEYS = {
  GROUPS: 'split4us_groups',
  EXPENSES: 'split4us_expenses',
  BALANCES: 'split4us_balances',
  SYNC_QUEUE: 'split4us_sync_queue',
  LAST_SYNC: 'split4us_last_sync',
};

export interface SyncAction {
  id: string;
  type: 'create_expense' | 'update_expense' | 'delete_expense' | 'create_group' | 'update_group';
  data: any;
  timestamp: number;
  retryCount: number;
}

export class OfflineStorage {
  /**
   * Cache data locally
   */
  static async cacheData(key: string, data: any): Promise<void> {
    try {
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonData);
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  /**
   * Get cached data
   */
  static async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const jsonData = await AsyncStorage.getItem(key);
      return jsonData ? JSON.parse(jsonData) : null;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }

  /**
   * Clear specific cache
   */
  static async clearCache(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Clear all caches
   */
  static async clearAllCaches(): Promise<void> {
    try {
      const keys = Object.values(CACHE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Failed to clear all caches:', error);
    }
  }

  /**
   * Get groups from cache
   */
  static async getCachedGroups(): Promise<any[]> {
    return (await this.getCachedData(CACHE_KEYS.GROUPS)) || [];
  }

  /**
   * Cache groups
   */
  static async cacheGroups(groups: any[]): Promise<void> {
    await this.cacheData(CACHE_KEYS.GROUPS, groups);
  }

  /**
   * Get expenses from cache
   */
  static async getCachedExpenses(): Promise<any[]> {
    return (await this.getCachedData(CACHE_KEYS.EXPENSES)) || [];
  }

  /**
   * Cache expenses
   */
  static async cacheExpenses(expenses: any[]): Promise<void> {
    await this.cacheData(CACHE_KEYS.EXPENSES, expenses);
  }

  /**
   * Get balances from cache
   */
  static async getCachedBalances(): Promise<any[]> {
    return (await this.getCachedData(CACHE_KEYS.BALANCES)) || [];
  }

  /**
   * Cache balances
   */
  static async cacheBalances(balances: any[]): Promise<void> {
    await this.cacheData(CACHE_KEYS.BALANCES, balances);
  }
}

export class SyncQueue {
  /**
   * Add action to sync queue
   */
  static async addToQueue(action: Omit<SyncAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    try {
      const queue = await this.getQueue();
      const newAction: SyncAction = {
        ...action,
        id: `sync_${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
        retryCount: 0,
      };
      queue.push(newAction);
      await AsyncStorage.setItem(CACHE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
    }
  }

  /**
   * Get sync queue
   */
  static async getQueue(): Promise<SyncAction[]> {
    try {
      const jsonData = await AsyncStorage.getItem(CACHE_KEYS.SYNC_QUEUE);
      return jsonData ? JSON.parse(jsonData) : [];
    } catch (error) {
      console.error('Failed to get sync queue:', error);
      return [];
    }
  }

  /**
   * Remove action from queue
   */
  static async removeFromQueue(actionId: string): Promise<void> {
    try {
      const queue = await this.getQueue();
      const updatedQueue = queue.filter((action) => action.id !== actionId);
      await AsyncStorage.setItem(CACHE_KEYS.SYNC_QUEUE, JSON.stringify(updatedQueue));
    } catch (error) {
      console.error('Failed to remove from sync queue:', error);
    }
  }

  /**
   * Clear sync queue
   */
  static async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CACHE_KEYS.SYNC_QUEUE);
    } catch (error) {
      console.error('Failed to clear sync queue:', error);
    }
  }

  /**
   * Increment retry count
   */
  static async incrementRetryCount(actionId: string): Promise<void> {
    try {
      const queue = await this.getQueue();
      const updatedQueue = queue.map((action) =>
        action.id === actionId
          ? { ...action, retryCount: action.retryCount + 1 }
          : action
      );
      await AsyncStorage.setItem(CACHE_KEYS.SYNC_QUEUE, JSON.stringify(updatedQueue));
    } catch (error) {
      console.error('Failed to increment retry count:', error);
    }
  }

  /**
   * Process sync queue (when online)
   */
  static async processQueue(apiClient: any): Promise<void> {
    const queue = await this.getQueue();
    
    for (const action of queue) {
      try {
        // Process based on action type
        switch (action.type) {
          case 'create_expense':
            await apiClient.createExpense(action.data);
            break;
          case 'update_expense':
            await apiClient.updateExpense(action.data.id, action.data);
            break;
          case 'delete_expense':
            await apiClient.deleteExpense(action.data.id);
            break;
          case 'create_group':
            await apiClient.createGroup(action.data);
            break;
          case 'update_group':
            await apiClient.updateGroup(action.data.id, action.data);
            break;
        }

        // Success - remove from queue
        await this.removeFromQueue(action.id);
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
        
        // Increment retry count
        await this.incrementRetryCount(action.id);
        
        // If max retries exceeded, remove from queue
        if (action.retryCount >= 3) {
          await this.removeFromQueue(action.id);
        }
      }
    }
  }
}

export class ConflictResolver {
  /**
   * Resolve conflicts using Last-Write-Wins strategy
   */
  static resolveLastWriteWins(local: any, remote: any): any {
    const localTime = new Date(local.updated_at || local.created_at).getTime();
    const remoteTime = new Date(remote.updated_at || remote.created_at).getTime();
    
    return remoteTime > localTime ? remote : local;
  }

  /**
   * Resolve conflicts using Server-Wins strategy
   */
  static resolveServerWins(local: any, remote: any): any {
    return remote;
  }

  /**
   * Resolve conflicts using Client-Wins strategy
   */
  static resolveClientWins(local: any, remote: any): any {
    return local;
  }

  /**
   * Merge conflicts (combine changes)
   */
  static resolveMerge(local: any, remote: any): any {
    return {
      ...remote,
      ...local,
      // Keep newer timestamp
      updated_at: new Date(
        Math.max(
          new Date(local.updated_at || local.created_at).getTime(),
          new Date(remote.updated_at || remote.created_at).getTime()
        )
      ).toISOString(),
    };
  }
}

export class NetworkStatus {
  /**
   * Check if online
   */
  static async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected === true;
  }

  /**
   * Subscribe to network status changes
   */
  static subscribe(callback: (isOnline: boolean) => void): () => void {
    const unsubscribe = NetInfo.addEventListener((state) => {
      callback(state.isConnected === true);
    });
    return unsubscribe;
  }

  /**
   * Get network type
   */
  static async getNetworkType(): Promise<string | null> {
    const state = await NetInfo.fetch();
    return state.type;
  }
}

export class LastSync {
  /**
   * Update last sync timestamp
   */
  static async updateLastSync(): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (error) {
      console.error('Failed to update last sync:', error);
    }
  }

  /**
   * Get last sync timestamp
   */
  static async getLastSync(): Promise<Date | null> {
    try {
      const timestamp = await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
      return timestamp ? new Date(timestamp) : null;
    } catch (error) {
      console.error('Failed to get last sync:', error);
      return null;
    }
  }

  /**
   * Get time since last sync (in minutes)
   */
  static async getTimeSinceLastSync(): Promise<number | null> {
    const lastSync = await this.getLastSync();
    if (!lastSync) return null;
    
    const now = new Date();
    const diff = now.getTime() - lastSync.getTime();
    return Math.floor(diff / 60000); // Convert to minutes
  }
}
