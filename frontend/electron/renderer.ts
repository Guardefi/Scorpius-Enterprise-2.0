/**
 * SCORPIUS Electron Renderer Process
 * Desktop-specific enhancements and native OS integration
 */

// Desktop-specific styling and functionality
declare global {
  interface Window {
    electronAPI: {
      secureStore: {
        set: (key: string, value: any) => Promise<boolean>;
        get: (key: string) => Promise<any>;
      };
      system: {
        getInfo: () => Promise<any>;
        checkPermissions: () => Promise<any>;
      };
      ipcRenderer: {
        on: (channel: string, callback: Function) => void;
        send: (channel: string, ...args: any[]) => void;
      };
    };
  }
}

class ElectronDesktopEnhancer {
  private isDev: boolean;
  private originalFetch: typeof fetch;

  constructor() {
    this.isDev = process.env.NODE_ENV === "development";
    this.originalFetch = window.fetch;
    this.init();
  }

  private async init(): Promise<void> {
    // Apply desktop-specific styling
    this.applyDesktopStyling();

    // Setup desktop-specific event handlers
    this.setupDesktopEvents();

    // Enhance navigation for desktop
    this.enhanceNavigation();

    // Setup auto-updater notifications
    this.setupUpdaterNotifications();

    // Add desktop-specific features
    this.addDesktopFeatures();

    // Setup security enhancements
    this.setupSecurityEnhancements();

    console.log("🖥️ SCORPIUS Desktop initialized");
  }

  private applyDesktopStyling(): void {
    // Add desktop-specific CSS
    const desktopStyles = `
      /* Electron Desktop Specific Styles */
      body {
        -webkit-app-region: drag;
        user-select: none;
        overflow-x: hidden;
      }

      /* Make interactive elements non-draggable */
      button, input, textarea, select, a, 
      [role="button"], [data-radix-collection-item],
      .interactive, .clickable {
        -webkit-app-region: no-drag;
        user-select: auto;
      }

      /* Custom window controls spacing for different platforms */
      .electron-app header {
        padding-top: ${process.platform === "darwin" ? "35px" : "0"};
      }

      /* Enhanced scrollbars for desktop */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb {
        background: linear-gradient(90deg, #00ffff, #0099cc);
        border-radius: 4px;
        box-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
      }

      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(90deg, #33ffff, #00ccff);
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
      }

      /* Desktop-specific animations */
      .desktop-glow {
        animation: desktopGlow 3s ease-in-out infinite alternate;
      }

      @keyframes desktopGlow {
        0% {
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
        }
        100% {
          box-shadow: 0 0 30px rgba(0, 255, 255, 0.6);
        }
      }

      /* Native-like context menus */
      .context-menu {
        background: rgba(10, 10, 10, 0.95);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(0, 255, 255, 0.3);
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 255, 255, 0.2);
      }

      /* Enhanced focus states for keyboard navigation */
      *:focus-visible {
        outline: 2px solid #00ffff;
        outline-offset: 2px;
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.4);
      }

      /* Desktop notification styles */
      .desktop-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: rgba(10, 10, 10, 0.95);
        border: 1px solid rgba(0, 255, 255, 0.3);
        border-radius: 8px;
        padding: 16px;
        backdrop-filter: blur(20px);
        max-width: 350px;
        animation: slideInRight 0.3s ease-out;
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      /* Platform-specific adjustments */
      .platform-${process.platform} {
        /* Platform-specific styles applied */
      }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = desktopStyles;
    document.head.appendChild(styleSheet);

    // Add platform class to body
    document.body.classList.add(`platform-${process.platform}`);
    document.body.classList.add("electron-app");
  }

  private setupDesktopEvents(): void {
    // Listen for Electron IPC events
    if (window.electronAPI) {
      window.electronAPI.ipcRenderer.on("system-resumed", () => {
        this.showDesktopNotification({
          title: "System Resumed",
          message: "Please re-authenticate for security",
          type: "warning",
        });
      });

      window.electronAPI.ipcRenderer.on("lock-application", () => {
        this.lockApplication();
      });

      window.electronAPI.ipcRenderer.on("open-preferences", () => {
        this.openPreferences();
      });

      window.electronAPI.ipcRenderer.on("trigger-security-scan", () => {
        this.triggerSecurityScan();
      });
    }

    // Handle app focus/blur for security
    window.addEventListener("focus", this.onAppFocus.bind(this));
    window.addEventListener("blur", this.onAppBlur.bind(this));

    // Handle keyboard shortcuts
    this.setupKeyboardShortcuts();

    // Handle window resize for responsive layout
    window.addEventListener("resize", this.onWindowResize.bind(this));
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener("keydown", (event) => {
      // Global shortcuts
      if ((event.ctrlKey || event.metaKey) && event.key === "r") {
        event.preventDefault();
        this.refreshApplication();
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "f") {
        event.preventDefault();
        this.openSearch();
      }

      if (event.key === "F11") {
        event.preventDefault();
        this.toggleFullscreen();
      }

      // Security shortcuts
      if ((event.ctrlKey || event.metaKey) && event.key === "l") {
        event.preventDefault();
        this.lockApplication();
      }
    });
  }

  private enhanceNavigation(): void {
    // Intercept navigation to add desktop-specific behavior
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      (window as any).electronEnhancer?.onNavigationChange();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);
      (window as any).electronEnhancer?.onNavigationChange();
    };

    window.addEventListener("popstate", this.onNavigationChange.bind(this));
  }

  private setupUpdaterNotifications(): void {
    // Check for updates periodically
    setInterval(() => {
      this.checkForUpdates();
    }, 300000); // Every 5 minutes
  }

  private addDesktopFeatures(): void {
    // Add desktop-specific UI elements
    this.addTitleBarControls();
    this.addSystemTray();
    this.addMenuBar();
    this.addStatusBar();
  }

  private setupSecurityEnhancements(): void {
    // Enhanced security for desktop
    this.setupCSP();
    this.setupSecureStorage();
    this.setupNetworkMonitoring();
    this.setupFileSystemWatching();
  }

  // Desktop-specific feature implementations
  private addTitleBarControls(): void {
    const titleBar = document.createElement("div");
    titleBar.className = "desktop-title-bar";
    titleBar.innerHTML = `
      <div class="title-bar-content">
        <div class="title-bar-title">SCORPIUS Quantum Security Platform</div>
        <div class="title-bar-controls">
          <button class="title-bar-button minimize" title="Minimize">−</button>
          <button class="title-bar-button maximize" title="Maximize">⬜</button>
          <button class="title-bar-button close" title="Close">×</button>
        </div>
      </div>
    `;

    // Only add custom title bar on Windows/Linux
    if (process.platform !== "darwin") {
      document.body.insertBefore(titleBar, document.body.firstChild);
    }
  }

  private addSystemTray(): void {
    // System tray functionality would be handled by main process
    console.log("📌 System tray integration active");
  }

  private addMenuBar(): void {
    // Native menu bar is handled by main process
    console.log("📋 Native menu bar active");
  }

  private addStatusBar(): void {
    const statusBar = document.createElement("div");
    statusBar.className = "desktop-status-bar";
    statusBar.innerHTML = `
      <div class="status-item">
        <span class="status-indicator online"></span>
        Connected
      </div>
      <div class="status-item">
        <span id="desktop-memory-usage">Memory: --</span>
      </div>
      <div class="status-item">
        <span id="desktop-last-sync">Last sync: --</span>
      </div>
    `;

    document.body.appendChild(statusBar);

    // Update status bar periodically
    setInterval(() => {
      this.updateStatusBar();
    }, 5000);
  }

  private async updateStatusBar(): Promise<void> {
    try {
      if (window.electronAPI) {
        const systemInfo = await window.electronAPI.system.getInfo();
        const memoryElement = document.getElementById("desktop-memory-usage");
        const syncElement = document.getElementById("desktop-last-sync");

        if (memoryElement) {
          memoryElement.textContent = `Memory: ${Math.round(
            (systemInfo.memory?.rss || 0) / 1024 / 1024,
          )}MB`;
        }

        if (syncElement) {
          syncElement.textContent = `Last sync: ${new Date().toLocaleTimeString()}`;
        }
      }
    } catch (error) {
      console.error("Failed to update status bar:", error);
    }
  }

  // Security implementations
  private setupCSP(): void {
    const meta = document.createElement("meta");
    meta.httpEquiv = "Content-Security-Policy";
    meta.content =
      "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws: wss: https:; img-src 'self' data: https:;";
    document.head.appendChild(meta);
  }

  private setupSecureStorage(): void {
    // Wrap localStorage with encryption
    if (window.electronAPI) {
      const originalSetItem = localStorage.setItem;
      const originalGetItem = localStorage.getItem;

      localStorage.setItem = function (key: string, value: string) {
        window.electronAPI.secureStore.set(key, value);
      };

      localStorage.getItem = function (key: string) {
        return window.electronAPI.secureStore.get(key);
      };
    }
  }

  private setupNetworkMonitoring(): void {
    // Monitor network requests
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const response = await originalFetch.apply(this, args);
      console.log("🌐 Network request:", args[0]);
      return response;
    };
  }

  private setupFileSystemWatching(): void {
    // File system watching would be handled by main process
    console.log("📁 File system monitoring active");
  }

  // Event handlers
  private onAppFocus(): void {
    console.log("🎯 App focused");
    document.body.classList.add("app-focused");
  }

  private onAppBlur(): void {
    console.log("😴 App blurred");
    document.body.classList.remove("app-focused");
  }

  private onWindowResize(): void {
    // Adjust layout for window resize
    const width = window.innerWidth;
    const height = window.innerHeight;

    document.body.style.setProperty("--window-width", `${width}px`);
    document.body.style.setProperty("--window-height", `${height}px`);
  }

  private onNavigationChange(): void {
    console.log("🧭 Navigation changed:", location.pathname);
    this.updateWindowTitle();
  }

  // Feature methods
  private refreshApplication(): void {
    window.location.reload();
  }

  private openSearch(): void {
    // Trigger global search
    const searchInput = document.querySelector(
      'input[type="search"]',
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  }

  private toggleFullscreen(): void {
    if (window.electronAPI) {
      window.electronAPI.ipcRenderer.send("toggle-fullscreen");
    }
  }

  private lockApplication(): void {
    // Show lock screen overlay
    const lockOverlay = document.createElement("div");
    lockOverlay.className = "lock-overlay";
    lockOverlay.innerHTML = `
      <div class="lock-content">
        <div class="lock-icon">🔒</div>
        <h2>Application Locked</h2>
        <p>Enter your password to unlock</p>
        <input type="password" placeholder="Password" class="lock-password">
        <button class="unlock-button">Unlock</button>
      </div>
    `;
    document.body.appendChild(lockOverlay);
  }

  private openPreferences(): void {
    // Navigate to preferences or open modal
    console.log("⚙️ Opening preferences");
  }

  private triggerSecurityScan(): void {
    // Trigger security scan
    console.log("🔍 Triggering security scan");
  }

  private checkForUpdates(): void {
    console.log("🔄 Checking for updates");
  }

  private updateWindowTitle(): void {
    const path = location.pathname;
    const titles: Record<string, string> = {
      "/": "Dashboard - SCORPIUS",
      "/scanner": "Security Scanner - SCORPIUS",
      "/bytecode": "Bytecode Lab - SCORPIUS",
      "/simulation": "Simulation Engine - SCORPIUS",
      "/bridge": "Bridge Monitor - SCORPIUS",
      "/events": "Event Stream - SCORPIUS",
    };

    document.title = titles[path] || "SCORPIUS Quantum Security Platform";
  }

  // Utility methods
  private showDesktopNotification(options: {
    title: string;
    message: string;
    type: "info" | "warning" | "error" | "success";
  }): void {
    const notification = document.createElement("div");
    notification.className = `desktop-notification notification-${options.type}`;
    notification.innerHTML = `
      <div class="notification-header">
        <span class="notification-icon">${this.getNotificationIcon(options.type)}</span>
        <span class="notification-title">${options.title}</span>
        <button class="notification-close">×</button>
      </div>
      <div class="notification-message">${options.message}</div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);

    // Manual close button
    const closeButton = notification.querySelector(".notification-close");
    closeButton?.addEventListener("click", () => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    });
  }

  private getNotificationIcon(type: string): string {
    const icons = {
      info: "ℹ️",
      warning: "⚠️",
      error: "❌",
      success: "✅",
    };
    return icons[type as keyof typeof icons] || "ℹ️";
  }
}

// Initialize desktop enhancements when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    (window as any).electronEnhancer = new ElectronDesktopEnhancer();
  });
} else {
  (window as any).electronEnhancer = new ElectronDesktopEnhancer();
}

export { ElectronDesktopEnhancer };
