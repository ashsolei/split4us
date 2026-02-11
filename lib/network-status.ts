/**
 * Network Status Utility
 *
 * Provides network connectivity checking and subscription
 */

import NetInfo from '@react-native-community/netinfo';

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
