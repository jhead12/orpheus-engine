import { BrowserWindow } from "electron";

class MainWindow {
  private window: BrowserWindow | null = null;

  create() {
    this.window = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    // Handle macOS window state
    // Note: app.delegate is not available in Electron; use appropriate Electron APIs
    // if (process.platform === "darwin") {
    //   // Handle macOS-specific behaviors here if needed
    // }

    // Handle window close
    this.window.on("close", (event) => {
      if (process.platform === "darwin") {
        event.preventDefault();
        this.window?.hide();
      }
    });

    // Load your app
    if (process.env.NODE_ENV === "development") {
      this.window.loadURL("http://localhost:5174");
    } else {
      this.window.loadFile("dist/index.html");
    }
  }
}

export const mainWindow = new MainWindow();
