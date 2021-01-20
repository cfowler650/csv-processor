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
    resizable: false,
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
  async (_, preloadWATCHPATH, preloadOUTPUTPATH) => {
    //this gets called by watcher.add function
    var processCSVFromWatcher = (pathToBeChangedIntoFileName) => {
      processCSVFile(_, pathToBeChangedIntoFileName, preloadOUTPUTPATH)
        .then((res) => win.webContents.send("fileAdd", "ky"))
        .catch((err) => console.log("PROCESSFILENOW", err));
    };

    function startWatcher(path) {
      const watcher = chokidar.watch(path, {
        ignored: /[\/\\]\./,
        persistent: true,
        ignoreInitial: true,
      });

      function onWatcherReady() {
        console.info("watcher is now ready");
      }

      watcher
        .on("add", function (path) {
          processCSVFromWatcher(path);
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

    if (preloadWATCHPATH) {
      startWatcher(preloadWATCHPATH);
    } else {
      return { error: "no input path selected" };
    }
  }
);

const processCSVFile = async (_, inFilePath, preloadOUTPUTPATH) => {
  //finalOutputPath  should be a final path with desired processed csv name appended
  //finalOutputPath variable is passed to createCSVWrtier function
  //i.e. "/desktop/processedFileName.csv"
  let finalOutputPath;

  //here we find out if preloadOUTPUTPATH is coming from someone creating a watcher or not..
  const currentPath = preloadOUTPUTPATH.filePath || preloadOUTPUTPATH;

  //if the path does not include .csv at the end,
  //then it is coming from someone creating a watcher and we need to append a file name to it
  //ELSE: we just assign the original preloadOUTPUTPATH to currentPath.
  if (!currentPath.includes(".csv")) {
    const arr = currentPath.split("/");
    const randomFileName =
      "/" +
      (arr[arr.length - 1] + Math.floor(Math.random() * 100) + 1) +
      ".csv";
    finalOutputPath = currentPath + randomFileName;
    console.log(finalOutputPath);
  } else {
    finalOutputPath = currentPath;
  }

  //we pass path which should look like "/desktop/nameOfOutputFile.csv"
  const csvWriter = createCsvWriter({
    path: finalOutputPath,
    header: [
      { id: "name", title: "Name" },
      { id: "value", title: "Value" },
    ],
  });

  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(inFilePath)
      .on("error", (e) => {
        reject({ message: "error creating read stream", error: e });
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

ipcMain.handle("processFile", processCSVFile);

app.whenReady().then(createWindow);
