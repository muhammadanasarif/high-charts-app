import { useEffect, useRef } from 'react';

/**
 * Custom hook for managing BroadcastChannel API communication
 * Enables cross-tab/window communication for real-time data synchronization
 */
export const useBroadcastChannel = (channelName: string) => {
  const channelRef = useRef<BroadcastChannel | null>(null);

  /**
   * Initializes the broadcast channel when component mounts
   * Creates a new BroadcastChannel instance and handles cleanup on unmount
   */
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channelRef.current = new BroadcastChannel(channelName);
      
      return () => {
        channelRef.current?.close();
      };
    }
  }, [channelName]);

  /**
   * Sends a message to all other tabs/windows listening on the same channel
   * Used for broadcasting chart hover events and data updates
   */
  const sendMessage = (data: any) => {
    channelRef.current?.postMessage(data);
  };

  /**
   * Sets up a listener for messages from other tabs/windows
   * Returns a cleanup function to remove the event listener
   */
  const listen = (callback: (data: any) => void) => {
    if (channelRef.current) {
      const handler = (event: MessageEvent) => callback(event.data);
      channelRef.current.addEventListener('message', handler);
      return () => channelRef.current?.removeEventListener('message', handler);
    }
  };

  return { sendMessage, listen };
}; 