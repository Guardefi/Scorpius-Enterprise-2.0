/**
 * SCORPIUS Electron Main Process - Enterprise Security Desktop Application
 * Ultra-secure desktop client with hardware acceleration and native OS integration
 */
import {
  app,
  BrowserWindow,
  Menu,
  shell,
  ipcMain,
  dialog,
  powerMonitor,
  systemPreferences,
} from "electron";
import { autoUpdater } from "electron-updater";
import * as path from "path";
import * as fs from "fs";
import * as crypto from "crypto";
import { spawn } from "child_process";
import windowStateKeeper from "electron-window-state";

// Enterprise security configuration
const SECURITY_CONFIG = {
  csp: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws: wss: https:; img-src 'self' data: https:;",
  enableRemoteModule: false,
  contextIsolation: true,
  nodeIntegration: false,
  webSecurity: true,
  allowRunningInsecureContent: false,
  experimentalFeatures: false,
};

class ScorpiusDesktop {
  private mainWindow: BrowserWindow | null = null;
  private splashWindow: BrowserWindow | null = null;
  private isQuitting = false;
  private encryptionKey: string;
  private sessionData: Map<string, any> = new Map();

  constructor() {
    this.encryptionKey = this.generateEncryptionKey();
    this.setupApp();
  }

  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  private setupApp(): void {
    // Enable live reload for development
    if (process.env.NODE_ENV === "development") {
      require("electron-reload")(__dirname, {
        electron: require(`${__dirname}/../node_modules/.bin/electron`),
        hardResetMethod: "exit",
      });
    }

    // App event handlers
    app.whenReady().then(() => this.createMainWindow());
    app.on("window-all-closed", this.onWindowAllClosed.bind(this));
    app.on("activate", this.onActivate.bind(this));
    app.on("before-quit", this.onBeforeQuit.bind(this));
    app.on("web-contents-created", this.onWebContentsCreated.bind(this));

    // Security event handlers
    app.on("session-created", this.onSessionCreated.bind(this));
    powerMonitor.on("suspend", this.onSystemSuspend.bind(this));
    powerMonitor.on("resume", this.onSystemResume.bind(this));

    // Auto-updater
    this.setupAutoUpdater();

    // IPC handlers
    this.setupIPC();
  }

  private async createSplashWindow(): Promise<void> {
    this.splashWindow = new BrowserWindow({
      width: 400,
      height: 300,
      frame: false,
      alwaysOnTop: true,
      transparent: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    await this.splashWindow.loadFile(
      path.join(__dirname, "../assets/splash.html"),
    );
  }

  private async createMainWindow(): Promise<void> {
    await this.createSplashWindow();

    // Restore window state
    const mainWindowState = windowStateKeeper({
      defaultWidth: 1400,
      defaultHeight: 900,
    });

    this.mainWindow = new BrowserWindow({
      ...mainWindowState,
      minWidth: 1200,
      minHeight: 800,
      show: false, // Don't show until ready
      titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
      frame: process.platform !== "win32",
      icon: path.join(__dirname, "../assets/icon.png"),
      webPreferences: {
        ...SECURITY_CONFIG,
        preload: path.join(__dirname, "preload.js"),
        additionalArguments: [`--security-key=${this.encryptionKey}`],
      },
    });

    // Manage window state
    mainWindowState.manage(this.mainWindow);

    // Load application
    const isDev = process.env.NODE_ENV === "development";
    const url = isDev
      ? "http://localhost:3004"
      : `file://${path.join(__dirname, "../dist/index.html")}`;

    await this.mainWindow.loadURL(url);

    // Setup window events
    this.setupWindowEvents();

    // Security hardening
    this.hardenSecurity();

    // Show main window and hide splash
    this.mainWindow.once("ready-to-show", () => {
      if (this.splashWindow) {
        this.splashWindow.close();
        this.splashWindow = null;
      }
      this.mainWindow?.show();

      if (isDev) {
        this.mainWindow?.webContents.openDevTools();
      }
    });

    // Setup menu
    this.createMenu();
  }

  private setupWindowEvents(): void {
    if (!this.mainWindow) return;

    this.mainWindow.on("closed", () => {
      this.mainWindow = null;
    });

    this.mainWindow.on("minimize", () => {
      // Hide to tray on minimize for enterprise security
      if (process.platform === "win32") {
        this.mainWindow?.hide();
      }
    });

    // Prevent navigation to external sites
    this.mainWindow.webContents.on("will-navigate", (event, url) => {
      if (!url.startsWith("http://localhost") && !url.startsWith("file://")) {
        event.preventDefault();
        shell.openExternal(url);
      }
    });

    // Block new window creation
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: "deny" };
    });
  }

  private hardenSecurity(): void {
    if (!this.mainWindow) return;

    // Set Content Security Policy
    this.mainWindow.webContents.session.webRequest.onHeadersReceived(
      (details, callback) => {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            "Content-Security-Policy": [SECURITY_CONFIG.csp],
          },
        });
      },
    );

    // Block access to Node.js APIs from renderer
    this.mainWindow.webContents.on("dom-ready", () => {
      this.mainWindow?.webContents.executeJavaScript(`
        delete window.require;
        delete window.exports;
        delete window.module;
      `);
    });
  }

  private createMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: "SCORPIUS",
        submenu: [
          {
            label: "About SCORPIUS",
            click: () => this.showAbout(),
          },
          { type: "separator" },
          {
            label: "Preferences",
            accelerator: "CmdOrCtrl+,",
            click: () => this.openPreferences(),
          },
          { type: "separator" },
          {
            label: "Quit",
            accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
            click: () => {
              this.isQuitting = true;
              app.quit();
            },
          },
        ],
      },
      {
        label: "Security",
        submenu: [
          {
            label: "Lock Application",
            accelerator: "CmdOrCtrl+L",
            click: () => this.lockApplication(),
          },
          {
            label: "Clear Cache",
            click: () => this.clearCache(),
          },
          {
            label: "Export Logs",
            click: () => this.exportLogs(),
          },
        ],
      },
      {
        label: "Tools",
        submenu: [
          {
            label: "Security Scan",
            accelerator: "CmdOrCtrl+S",
            click: () => this.triggerSecurityScan(),
          },
          {
            label: "System Diagnostics",
            click: () => this.runDiagnostics(),
          },
          { type: "separator" },
          {
            label: "Developer Tools",
            accelerator:
              process.platform === "darwin" ? "Alt+Cmd+I" : "Ctrl+Shift+I",
            click: () => this.mainWindow?.webContents.toggleDevTools(),
          },
        ],
      },
      {
        label: "Help",
        submenu: [
          {
            label: "Documentation",
            click: () => shell.openExternal("https://docs.scorpius.security"),
          },
          {
            label: "Report Issue",
            click: () =>
              shell.openExternal("https://github.com/scorpius/security/issues"),
          },
        ],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  private setupAutoUpdater(): void {
    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on("update-available", () => {
      dialog.showMessageBox(this.mainWindow!, {
        type: "info",
        title: "Update available",
        message:
          "A new version of SCORPIUS is available. It will be downloaded in the background.",
        buttons: ["OK"],
      });
    });

    autoUpdater.on("update-downloaded", () => {
      dialog
        .showMessageBox(this.mainWindow!, {
          type: "info",
          title: "Update ready",
          message:
            "Update downloaded. The application will restart to apply the update.",
          buttons: ["Restart Now", "Later"],
        })
        .then((result) => {
          if (result.response === 0) {
            autoUpdater.quitAndInstall();
          }
        });
    });
  }

  private setupIPC(): void {
    // Secure storage operations
    ipcMain.handle(
      "secure-store-set",
      async (event, key: string, value: any) => {
        const encrypted = this.encrypt(JSON.stringify(value));
        this.sessionData.set(key, encrypted);
        return true;
      },
    );

    ipcMain.handle("secure-store-get", async (event, key: string) => {
      const encrypted = this.sessionData.get(key);
      if (!encrypted) return null;

      try {
        const decrypted = this.decrypt(encrypted);
        return JSON.parse(decrypted);
      } catch {
        return null;
      }
    });

    // System information
    ipcMain.handle("get-system-info", async () => ({
      platform: process.platform,
      arch: process.arch,
      version: process.getSystemVersion(),
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
    }));

    // Security operations
    ipcMain.handle("check-permissions", async () => {
      const permissions = {
        camera: await systemPreferences.getMediaAccessStatus("camera"),
        microphone: await systemPreferences.getMediaAccessStatus("microphone"),
        screen: await systemPreferences.getMediaAccessStatus("screen"),
      };
      return permissions;
    });
  }

  private encrypt(text: string): string {
    const cipher = crypto.createCipher("aes-256-cbc", this.encryptionKey);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  }

  private decrypt(encryptedText: string): string {
    const decipher = crypto.createDecipher("aes-256-cbc", this.encryptionKey);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  // Event handlers
  private onWindowAllClosed(): void {
    if (process.platform !== "darwin") {
      app.quit();
    }
  }

  private onActivate(): void {
    if (BrowserWindow.getAllWindows().length === 0) {
      this.createMainWindow();
    }
  }

  private onBeforeQuit(): void {
    this.isQuitting = true;
    // Clear sensitive data
    this.sessionData.clear();
  }

  private onWebContentsCreated(
    event: Event,
    contents: Electron.WebContents,
  ): void {
    // Security hardening for all web contents
    contents.on("new-window", (event, navigationUrl) => {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    });
  }

  private onSessionCreated(session: Electron.Session): void {
    // Clear HTTP cache on session creation
    session.clearCache();
  }

  private onSystemSuspend(): void {
    // Lock application on system suspend
    this.lockApplication();
  }

  private onSystemResume(): void {
    // Require re-authentication on system resume
    this.mainWindow?.webContents.send("system-resumed");
  }

  // Menu action handlers
  private showAbout(): void {
    dialog.showMessageBox(this.mainWindow!, {
      type: "info",
      title: "About SCORPIUS",
      message: "SCORPIUS Quantum Security Platform",
      detail: `Version: ${app.getVersion()}\nElectron: ${process.versions.electron}\nNode: ${process.versions.node}`,
      buttons: ["OK"],
    });
  }

  private openPreferences(): void {
    this.mainWindow?.webContents.send("open-preferences");
  }

  private lockApplication(): void {
    this.mainWindow?.webContents.send("lock-application");
  }

  private async clearCache(): Promise<void> {
    if (this.mainWindow) {
      await this.mainWindow.webContents.session.clearCache();
      await this.mainWindow.webContents.session.clearStorageData();
    }
  }

  private async exportLogs(): Promise<void> {
    const result = await dialog.showSaveDialog(this.mainWindow!, {
      title: "Export Security Logs",
      defaultPath: `scorpius-logs-${Date.now()}.json`,
      filters: [{ name: "JSON Files", extensions: ["json"] }],
    });

    if (!result.canceled && result.filePath) {
      // Export application logs
      const logs = {
        timestamp: new Date().toISOString(),
        version: app.getVersion(),
        platform: process.platform,
        logs: [], // Would contain actual log data
      };

      fs.writeFileSync(result.filePath, JSON.stringify(logs, null, 2));
    }
  }

  private triggerSecurityScan(): void {
    this.mainWindow?.webContents.send("trigger-security-scan");
  }

  private async runDiagnostics(): Promise<void> {
    const diagnostics = {
      memory: process.memoryUsage(),
      platform: process.platform,
      version: process.version,
      uptime: process.uptime(),
    };

    dialog.showMessageBox(this.mainWindow!, {
      type: "info",
      title: "System Diagnostics",
      message: "System Information",
      detail: JSON.stringify(diagnostics, null, 2),
      buttons: ["OK"],
    });
  }
}

// Initialize application
new ScorpiusDesktop();
