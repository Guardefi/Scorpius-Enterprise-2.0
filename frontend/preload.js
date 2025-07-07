const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke("window-minimize"),
  maximizeWindow: () => ipcRenderer.invoke("window-maximize"),
  closeWindow: () => ipcRenderer.invoke("window-close"),
  isWindowMaximized: () => ipcRenderer.invoke("window-is-maximized"),

  // Backend configuration
  getBackendConfig: () => ipcRenderer.invoke("get-backend-config"),

  // System info
  platform: process.platform,
  isElectron: true,

  // Version info
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },

  // Event listeners
  onWindowStateChanged: (callback) => {
    ipcRenderer.on("window-state-changed", callback);
  },
  onNavigateTo: (callback) => {
    ipcRenderer.on("navigate-to", callback);
  },
  onOpenPreferences: (callback) => {
    ipcRenderer.on("open-preferences", callback);
  },

  // Remove event listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
});

// Add electron-specific styling and functionality
window.addEventListener("DOMContentLoaded", () => {
  // Add electron class to body for styling
  document.body.classList.add("electron-app");

  // Add custom window controls
  addCustomWindowControls();

  // Add status bar
  addStatusBar();

  // Monitor window state
  monitorWindowState();
});

function addCustomWindowControls() {
  // Only add custom controls on Windows and Linux
  if (process.platform !== "darwin") {
    const windowControls = document.createElement("div");
    windowControls.id = "electron-window-controls";

    // Minimize button
    const minimizeBtn = createControlButton("─", async () => {
      await window.electronAPI.minimizeWindow();
    });

    // Maximize/Restore button
    const maximizeBtn = createControlButton("□", async () => {
      await window.electronAPI.maximizeWindow();
      updateMaximizeButton(maximizeBtn);
    });

    // Close button
    const closeBtn = createControlButton("×", async () => {
      await window.electronAPI.closeWindow();
    });
    closeBtn.classList.add("close");

    windowControls.appendChild(minimizeBtn);
    windowControls.appendChild(maximizeBtn);
    windowControls.appendChild(closeBtn);

    document.body.appendChild(windowControls);

    // Update maximize button state
    updateMaximizeButton(maximizeBtn);
  }
}

async function updateMaximizeButton(button) {
  const isMaximized = await window.electronAPI.isWindowMaximized();
  button.innerHTML = isMaximized ? "🗗" : "□";
  button.title = isMaximized ? "Restore" : "Maximize";
}

function createControlButton(text, onClick) {
  const button = document.createElement("button");
  button.innerHTML = text;
  button.onclick = onClick;
  button.className = "electron-window-control";
  return button;
}

function addStatusBar() {
  const statusBar = document.createElement("div");
  statusBar.id = "electron-status-bar";

  const leftSection = document.createElement("div");
  leftSection.innerHTML = `SCORPIUS v2.0.1 | Electron ${process.versions.electron}`;

  const rightSection = document.createElement("div");
  rightSection.innerHTML = `${process.platform.toUpperCase()} | Backend: Python`;

  statusBar.appendChild(leftSection);
  statusBar.appendChild(rightSection);

  document.body.appendChild(statusBar);

  // Update backend status periodically
  setInterval(updateBackendStatus, 5000);
}

async function updateBackendStatus() {
  try {
    const config = await window.electronAPI.getBackendConfig();
    const statusBar = document.getElementById("electron-status-bar");
    const rightSection = statusBar.querySelector("div:last-child");

    if (rightSection) {
      rightSection.innerHTML = `${process.platform.toUpperCase()} | Backend: ${config.mode.toUpperCase()} | ${config.baseUrl}`;
    }
  } catch (error) {
    console.warn("Failed to update backend status:", error);
  }
}

function monitorWindowState() {
  // Listen for window state changes
  window.electronAPI.onWindowStateChanged((_event, state) => {
    const maximizeBtn = document.querySelector(
      ".electron-window-control:nth-child(2)",
    );
    if (maximizeBtn) {
      maximizeBtn.innerHTML = state.maximized ? "🗗" : "□";
      maximizeBtn.title = state.maximized ? "Restore" : "Maximize";
    }
  });

  // Listen for navigation requests from menu
  window.electronAPI.onNavigateTo((_event, path) => {
    // If React Router is available, use it
    if (window.history && window.history.pushState) {
      window.history.pushState({}, "", path);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  });

  // Listen for preferences request
  window.electronAPI.onOpenPreferences(() => {
    // Dispatch custom event that the React app can listen for
    window.dispatchEvent(new CustomEvent("electron-open-preferences"));
  });
}

// Enhanced error handling
window.addEventListener("error", (event) => {
  console.error("Electron Renderer Error:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Electron Renderer Unhandled Promise Rejection:", event.reason);
});

// Keyboard shortcuts
document.addEventListener("keydown", (event) => {
  // Prevent refresh in production
  if (
    (event.ctrlKey || event.metaKey) &&
    event.key === "r" &&
    !process.env.NODE_ENV === "development"
  ) {
    event.preventDefault();
  }

  // Prevent opening dev tools in production
  if (event.key === "F12" && !process.env.NODE_ENV === "development") {
    event.preventDefault();
  }
});

// Cleanup on unload
window.addEventListener("beforeunload", () => {
  window.electronAPI.removeAllListeners("window-state-changed");
  window.electronAPI.removeAllListeners("navigate-to");
  window.electronAPI.removeAllListeners("open-preferences");
});

// Theme integration - ensure Electron uses the same dark theme
document.documentElement.classList.add("dark");
document.documentElement.style.colorScheme = "dark";

// Performance monitoring for Electron
if (process.env.NODE_ENV === "development") {
  const perfObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.duration > 100) {
        console.warn(
          `Slow operation detected: ${entry.name} took ${entry.duration.toFixed(2)}ms`,
        );
      }
    });
  });

  perfObserver.observe({ type: "measure", buffered: true });
  perfObserver.observe({ type: "navigation", buffered: true });
}
