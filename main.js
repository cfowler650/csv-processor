const { BrowserWindow, app, ipcMain, dialog } = require("electron");
const path = require("path");

const csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");

let win;
let indexPath = "index.html";
function createWindow() {
  win = new BrowserWindow({
    width: 400,
    height: 546,
    show: false,
    backgroundColor: "white",
    webPreferences: {
      nodeIntegration: false,
      worldSafeExecuteJavaScript: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    resizable: true,
  });

  win.loadFile(indexPath);
  win.once("ready-to-show", () => {
    win.show();
  });

  // Emitted when the window is closed.
  win.on("closed", function () {
    win = null;
  });
}

ipcMain.handle("uploadFile", () => {
  return dialog.showOpenDialog({
    filters: [{ name: "CSV", extensions: ["csv"] }],
  });
});

ipcMain.handle("saveFile", () => {
  return dialog.showSaveDialog({
    filters: [{ name: "CSV", extensions: ["csv"] }],
  });
});

ipcMain.handle("processFile", (_, inFilePath, outFile) => {
  const { filePath: outFilePath } = outFile;

  const csvWriter = createCsvWriter({
    path: outFilePath,
    header: [
      { id: "name", title: "Name" },
      { id: "value", title: "Value" },
    ],
  });

  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(inFilePath)
      .on("error", () => {
        reject({ error: "error stuff" });
      })
      .pipe(csv())
      .on("data", (row) => {
        results.push({ ...row, value: row.value * 2 });
      })
      .on("end", () => {
        csvWriter.writeRecords(results).then(() => {
          console.log("The CSV file was written successfully");
          resolve(true);
        });
      });
  });
});

app.whenReady().then(createWindow);
