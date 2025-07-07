/**
 * SCORPIUS Electron Preload Script - Secure IPC Bridge
 * Provides secure communication between main process and renderer
 */
import { contextBridge, ipcRenderer } from "electron";

// Define the API interface
interface ScorpiusElectronAPI {
  // Security operations
  secureStore: {
    set: (key: string, value: any) => Promise<boolean>;
    get: (key: string) => Promise<any>;
  };

  // System information
  system: {
    getInfo: () => Promise<any>;
    checkPermissions: () => Promise<any>;
  };

  // Application events
  events: {
    onLockApplication: (callback: () => void) => void;
    onSystemResume: (callback: () => void) => void;
    onOpenPreferences: (callback: () => void) => void;
    onTriggerSecurityScan: (callback: () => void) => void;
    removeAllListeners: () => void;
  };

  // Window operations
  window: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    isMaximized: () => boolean;
  };
}

// Secure API implementation
const scorpiusAPI: ScorpiusElectronAPI = {
  secureStore: {
    set: (key: string, value: any) =>
      ipcRenderer.invoke("secure-store-set", key, value),
    get: (key: string) => ipcRenderer.invoke("secure-store-get", key),
  },

  system: {
    getInfo: () => ipcRenderer.invoke("get-system-info"),
    checkPermissions: () => ipcRenderer.invoke("check-permissions"),
  },

  events: {
    onLockApplication: (callback: () => void) => {
      ipcRenderer.on("lock-application", callback);
    },
    onSystemResume: (callback: () => void) => {
      ipcRenderer.on("system-resumed", callback);
    },
    onOpenPreferences: (callback: () => void) => {
      ipcRenderer.on("open-preferences", callback);
    },
    onTriggerSecurityScan: (callback: () => void) => {
      ipcRenderer.on("trigger-security-scan", callback);
    },
    removeAllListeners: () => {
      ipcRenderer.removeAllListeners("lock-application");
      ipcRenderer.removeAllListeners("system-resumed");
      ipcRenderer.removeAllListeners("open-preferences");
      ipcRenderer.removeAllListeners("trigger-security-scan");
    },
  },

  window: {
    minimize: () => ipcRenderer.send("window-minimize"),
    maximize: () => ipcRenderer.send("window-maximize"),
    close: () => ipcRenderer.send("window-close"),
    isMaximized: () => ipcRenderer.sendSync("window-is-maximized"),
  },
};

// Expose secure API to renderer
contextBridge.exposeInMainWorld("scorpiusElectron", scorpiusAPI);

// Security hardening
window.addEventListener("DOMContentLoaded", () => {
  // Remove any potential Node.js globals
  delete (window as any).require;
  delete (window as any).exports;
  delete (window as any).module;
  delete (window as any).global;

  // Freeze the API to prevent tampering
  Object.freeze(scorpiusAPI);
});

// Export type for TypeScript
export type ScorpiusElectronAPI = typeof scorpiusAPI;
