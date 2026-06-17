import { io } from 'socket.io-client';

// Connects to the host of the current page automatically (same origin & port)
const socket = io();
const localListeners = new Set();

socket.on('chat-event', (event) => {
  // Dispatch network events to local subscribers
  localListeners.forEach(listener => {
    try {
      listener(event);
    } catch (err) {
      console.error("Error in local listener on incoming socket event:", err);
    }
  });
});

socket.on('connect', () => {
  console.log('--- Socket.io connected to network sync host ---');
});

socket.on('connect_error', (error) => {
  console.warn('Socket connection error. Local sync will fallback:', error);
});

export const chatSync = {
  /**
   * Subscribe to chat network sync events.
   * @param {Function} listener - Callback function for received events.
   * @returns {Function} Unsubscribe function.
   */
  subscribe(listener) {
    localListeners.add(listener);
    return () => {
      localListeners.delete(listener);
    };
  },

  /**
   * Publish an event to the WebSocket server and local subscribers.
   * @param {Object} event - Event object with { type, payload }.
   */
  publish(event) {
    // 1. Emit to WebSocket server (broadcasts to other tabs/devices)
    if (socket && socket.connected) {
      socket.emit('chat-event', event);
    }

    // 2. Dispatch to local listeners immediately (for split-screen sandbox & immediate UI updates)
    setTimeout(() => {
      localListeners.forEach(listener => {
        try {
          listener(event);
        } catch (err) {
          console.error("Error in local listener during publish:", err);
        }
      });
    }, 50);
  }
};
