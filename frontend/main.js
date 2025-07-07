const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const path = require("path");
const isDev = process.env.NODE_ENV === "development";

let mainWindow;

function createWindow() {
  // Create the browser window with cyberpunk styling that matches the web version
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1400,
    minHeight: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
    titleBarStyle: "hidden",
    backgroundColor: "#000000",
    icon: path.join(__dirname, "public/icon.png"),
    show: false,
    frame: false,
    vibrancy: "ultra-dark", // macOS only
    visualEffectState: "active", // macOS only
    titleBarOverlay: {
      color: "rgba(0, 0, 0, 0.9)",
      symbolColor: "#00ffff",
      height: 40,
    },
    // Enable hardware acceleration for better performance
    webPreferences: {
      ...this?.webPreferences,
      hardwareAcceleration: true,
      backgroundThrottling: false,
    },
  });

  // Set environment variable for Python backend in Electron
  process.env.VITE_BACKEND_MODE = "python";
  process.env.VITE_PYTHON_API_URL = "http://localhost:8000";
  process.env.VITE_PYTHON_WS_URL = "ws://localhost:8000";

  // Load the app
  if (isDev) {
    mainWindow.loadURL("http://localhost:8080");
    // Open DevTools in development
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "dist/spa/index.html"));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    // Focus the window
    if (isDev) {
      mainWindow.focus();
    }

    // Maximize window on startup for dashboard experience
    mainWindow.maximize();
  });

  // Handle window state changes
  mainWindow.on("maximize", () => {
    mainWindow.webContents.send("window-state-changed", { maximized: true });
  });

  mainWindow.on("unmaximize", () => {
    mainWindow.webContents.send("window-state-changed", { maximized: false });
  });

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Prevent navigation to external websites
  mainWindow.webContents.on("will-navigate", (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    // Allow localhost navigation in development
    if (isDev && parsedUrl.hostname === "localhost") {
      return;
    }

    // Prevent all other navigation
    if (parsedUrl.origin !== mainWindow.webContents.getURL()) {
      event.preventDefault();
    }
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Create custom menu for cyberpunk theme
  createMenu();

  // Inject Electron-specific styling
  mainWindow.webContents.on("dom-ready", () => {
    // Inject custom CSS for Electron-specific styling
    mainWindow.webContents.insertCSS(`
      /* Electron-specific styling to match web dashboard exactly */
      body.electron-app {
        -webkit-app-region: drag;
        user-select: none;
      }
      
      /* Make interactive elements draggable */
      body.electron-app button,
      body.electron-app input,
      body.electron-app textarea,
      body.electron-app select,
      body.electron-app a,
      body.electron-app [role="button"],
      body.electron-app [data-radix-collection-item],
      body.electron-app [data-testid],
      body.electron-app .card-modern,
      body.electron-app .recharts-wrapper {
        -webkit-app-region: no-drag;
        user-select: auto;
      }
      
      /* Custom window controls styling */
      #electron-window-controls {
        position: fixed;
        top: 0;
        right: 0;
        z-index: 10000;
        display: flex;
        height: 40px;
        background: rgba(0, 0, 0, 0.95);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(0, 255, 255, 0.2);
        border-left: 1px solid rgba(0, 255, 255, 0.1);
        -webkit-app-region: no-drag;
      }
      
      .electron-window-control {
        width: 50px;
        height: 40px;
        border: none;
        background: transparent;
        color: #00ffff;
        font-family: 'JetBrains Mono', 'Consolas', monospace;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        text-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
      }
      
      .electron-window-control:hover {
        background: rgba(0, 255, 255, 0.1);
        box-shadow: inset 0 0 10px rgba(0, 255, 255, 0.2);
      }
      
      .electron-window-control.close:hover {
        background: rgba(255, 68, 68, 0.2);
        color: #ff4444;
        text-shadow: 0 0 5px rgba(255, 68, 68, 0.5);
      }
      
      /* Adjust main content to account for window controls */
      body.electron-app .min-h-screen {
        padding-top: 40px;
      }
      
      /* Status bar for Electron */
      #electron-status-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 24px;
        background: rgba(0, 0, 0, 0.95);
        border-top: 1px solid rgba(0, 255, 255, 0.2);
        color: rgba(0, 255, 255, 0.7);
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        z-index: 9999;
        -webkit-app-region: no-drag;
      }
    `);
  });
}

function createMenu() {
  const template = [
    {
      label: "SCORPIUS",
      submenu: [
        {
          label: "About SCORPIUS",
          click: () => {
            const aboutWindow = new BrowserWindow({
              width: 500,
              height: 400,
              parent: mainWindow,
              modal: true,
              show: false,
              resizable: false,
              backgroundColor: "#000000",
              webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
              },
            });

            aboutWindow.loadURL(`data:text/html;charset=utf-8,
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body {
                    background: #000000;
                    color: #00ffff;
                    font-family: 'JetBrains Mono', 'Consolas', monospace;
                    text-align: center;
                    padding: 50px 20px;
                    margin: 0;
                  }
                  h1 { 
                    font-size: 24px; 
                    margin-bottom: 20px;
                    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
                  }
                  p { 
                    font-size: 14px; 
                    line-height: 1.6;
                    margin-bottom: 10px;
                    opacity: 0.8;
                  }
                  .version {
                    color: #ffffff;
                    font-weight: bold;
                  }
                </style>
              </head>
              <body>
                <h1>SCORPIUS</h1>
                <p>Quantum Security Platform</p>
                <p class="version">Version 2.0.1</p>
                <p>Advanced blockchain security analysis suite</p>
                <p>Built with Electron and powered by Python</p>
                <p>© 2024 Quantum Security Systems</p>
              </body>
              </html>
            `);

            aboutWindow.once("ready-to-show", () => {
              aboutWindow.show();
            });
          },
        },
        { type: "separator" },
        {
          label: "Preferences",
          accelerator: "CmdOrCtrl+,",
          click: () => {
            // Send message to renderer to open preferences
            mainWindow.webContents.send("open-preferences");
          },
        },
        { type: "separator" },
        {
          label: "Quit SCORPIUS",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "View",
      submenu: [
        {
          label: "Reload",
          accelerator: "CmdOrCtrl+R",
          click: () => mainWindow.reload(),
        },
        {
          label: "Force Reload",
          accelerator: "CmdOrCtrl+Shift+R",
          click: () => mainWindow.webContents.reloadIgnoringCache(),
        },
        {
          label: "Toggle Developer Tools",
          accelerator: "F12",
          click: () => mainWindow.webContents.toggleDevTools(),
        },
        { type: "separator" },
        {
          label: "Actual Size",
          accelerator: "CmdOrCtrl+0",
          click: () => mainWindow.webContents.setZoomLevel(0),
        },
        {
          label: "Zoom In",
          accelerator: "CmdOrCtrl+Plus",
          click: () => {
            const currentZoom = mainWindow.webContents.getZoomLevel();
            mainWindow.webContents.setZoomLevel(currentZoom + 0.5);
          },
        },
        {
          label: "Zoom Out",
          accelerator: "CmdOrCtrl+-",
          click: () => {
            const currentZoom = mainWindow.webContents.getZoomLevel();
            mainWindow.webContents.setZoomLevel(currentZoom - 0.5);
          },
        },
        { type: "separator" },
        {
          label: "Toggle Fullscreen",
          accelerator: "F11",
          click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()),
        },
      ],
    },
    {
      label: "Window",
      submenu: [
        {
          label: "Minimize",
          accelerator: "CmdOrCtrl+M",
          click: () => mainWindow.minimize(),
        },
        {
          label: "Maximize/Restore",
          click: () => {
            if (mainWindow.isMaximized()) {
              mainWindow.unmaximize();
            } else {
              mainWindow.maximize();
            }
          },
        },
        { type: "separator" },
        {
          label: "Close",
          accelerator: "CmdOrCtrl+W",
          click: () => mainWindow.close(),
        },
      ],
    },
    {
      label: "Security",
      submenu: [
        {
          label: "Scan Contract",
          accelerator: "CmdOrCtrl+S",
          click: () => {
            mainWindow.webContents.send("navigate-to", "/scanner");
          },
        },
        {
          label: "Honeypot Analysis",
          accelerator: "CmdOrCtrl+H",
          click: () => {
            mainWindow.webContents.send("navigate-to", "/honeypot");
          },
        },
        {
          label: "Forensics",
          accelerator: "CmdOrCtrl+F",
          click: () => {
            mainWindow.webContents.send("navigate-to", "/forensics");
          },
        },
        { type: "separator" },
        {
          label: "Dashboard",
          accelerator: "CmdOrCtrl+D",
          click: () => {
            mainWindow.webContents.send("navigate-to", "/dashboard");
          },
        },
      ],
    },
  ];

  // macOS specific menu adjustments
  if (process.platform === "darwin") {
    template[0].label = app.getName();
    template[0].submenu.splice(1, 0, {
      label: "Services",
      role: "services",
      submenu: [],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// IPC handlers for custom window controls
ipcMain.handle("window-minimize", () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle("window-maximize", () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle("window-close", () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle("window-is-maximized", () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

// Backend configuration for Electron
ipcMain.handle("get-backend-config", () => {
  return {
    mode: "python",
    baseUrl: process.env.VITE_PYTHON_API_URL || "http://localhost:8000",
    wsUrl: process.env.VITE_PYTHON_WS_URL || "ws://localhost:8000",
    isElectron: true,
  };
});

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });

  contents.on("will-attach-webview", (event, webPreferences, params) => {
    // Strip away preload scripts if unused or verify their location is legitimate
    delete webPreferences.preload;
    delete webPreferences.preloadURL;

    // Disable Node.js integration
    webPreferences.nodeIntegration = false;
  });
});

// Handle certificate errors
app.on(
  "certificate-error",
  (event, webContents, url, error, certificate, callback) => {
    // In development, allow self-signed certificates for localhost
    if (isDev && url.startsWith("https://localhost")) {
      event.preventDefault();
      callback(true);
    } else {
      callback(false);
    }
  },
);

// Security: Set app security policies
app.on("web-contents-created", (event, contents) => {
  contents.on("will-navigate", (event, url) => {
    const parsedUrl = new URL(url);

    if (parsedUrl.origin !== "http://localhost:8080" && !isDev) {
      event.preventDefault();
    }
  });
});
