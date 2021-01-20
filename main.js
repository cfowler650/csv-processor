const {
  BrowserWindow,
  app,
  ipcMain,
  ipcRenderer,
  dialog,
} = require("electron");
const path = require("path");
const chokidar = require("chokidar");
const csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");
const { getProcessMemoryInfo } = require("process");

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

ipcMain.handle(
  "startWatcher",
  async (_, folderToBeWatched, folderToBeSaved) => {
    //this gets called by watcher.add function
    var processStuff = (filename) => {
      processFileNow(_, filename, folderToBeSaved)
        .then((res) => console.log(res))
        .catch((err) => console.log("BIG ERROR", err));
    };

    function startWatcher(path) {
      //pass folderToBeWatched, and FolderToBeSaved to add
      //says that watch takes arrays too? confused
      // const path = ["/", "/home"];
      const watcher = chokidar.watch(path, {
        ignored: /[\/\\]\./,
        persistent: true,
        ignoreInitial: true,
      });

      function onWatcherReady() {
        console.info("from here check realchange, initai scan completed");
      }

      watcher
        .on("add", function (path) {
          processStuff(path);
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

    if (folderToBeWatched) {
      startWatcher(folderToBeWatched);
    } else {
      console.log("No path selected");
    }
  }
);

const processFileNow = async (_, inFilePath, outFile) => {
  console.log("infilePath", inFilePath, "outfilepath", outFile);
  const outFilePath = outFile.filePath || `${outFile}/whatever.csv`;

  console.log({ outFilePath });
  const csvWriter = createCsvWriter({
    path: outFilePath,
    header: [
      { id: "name", title: "Name" },
      { id: "value", title: "Value" },
    ],
  });

  return new Promise((resolve, reject) => {
    const results = [];
    console.log(inFilePath, "infilePath");
    fs.createReadStream(inFilePath)
      .on("error", (e) => {
        reject({ error: e });
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
};

ipcMain.handle("processFile", processFileNow);

app.whenReady().then(createWindow);
