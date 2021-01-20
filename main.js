const { BrowserWindow, app, ipcMain, dialog } = require("electron");
const path = require("path");
const chokidar = require("chokidar");
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
ipcMain.handle("selectWatcherDirectory", async () => {
  const { filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  return filePaths;
});
ipcMain.handle("startWatcher", async (_, filePath) => {
  function startWatcher(path) {
    const watcher = chokidar.watch(path, {
      ignored: /[\/\\]\./,
      persistent: true,
    });

    function onWatcherReady() {
      console.info("from here check realchange, initai scan completed");
    }

    watcher
      .on("add", function (path) {
        console.log("File", path, "has been added");
      })
      .on("addDir", function (path) {
        console.log("Directory", path, "has been added");
      })
      .on("change", function (path) {
        console.log("File", path, "has been changed");
      })
      .on("unlink", function (path) {
        console.log("File", path, "has been removed");
      })
      .on("unlinkDir", function (path) {
        console.log("Directory", path, "has been removed");
      })
      .on("error", function (error) {
        console.log("Error happened", error);
      })
      .on("ready", onWatcherReady)
      .on("raw", function (event, path, details) {
        // This event should be triggered everytime something happens.
        console.log("Raw event info:", event, path, details);
      });
  }

  //opens select direction for tracker dialogue
  // const { filePaths } = await dialog.showOpenDialog({
  //   properties: ["openDirectory"],
  // });

  //if file paths array exists grab first one

  if (filePath) {
    console.log("starting watcher with", filePath);
    startWatcher(filePath);
  } else {
    console.log("No path selected");
  }

  // return function test(path) {
  //   if (path) {
  //     // Start to watch the selected path
  //     startWatcher(path[0]);
  //   } else {
  //     console.log("No path selected");
  //   }
  // };
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
