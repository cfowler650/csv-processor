const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  notificationApi: {
    sendNotification(message) {
      ipcRenderer.send("notify", message);
    },
  },
  mainListenerApi: {
    async addFileEvent(addToastCB) {
      ipcRenderer.on("fileAdd", (event, filename) => {
        addToastCB("New CSV file detected, converting file....", {
          appearance: "success",
        });
        const test = new Promise((resolve) => setTimeout(resolve, 2000));
        test.then(() => {
          addToastCB("CSV File Converted Succesfully", {
            appearance: "success",
          });
        });
      });
    },
  },
  fileApi: {
    async uploadFile() {
      const filePath = await ipcRenderer.invoke("uploadFile");
      return filePath;
    },

    async selectWatcherDirectory() {
      const results = await ipcRenderer.invoke("selectWatcherDirectory");
      console.log(results);
      return results;
    },

    async startWatcher(folderToWatch, folderToSave) {
      if (folderToWatch === folderToSave)
        return { error: "input and output folders can't be the same." };
      if (!folderToWatch) return { error: "please select an input" };
      if (!folderToSave) return { error: "please select an output" };

      return ipcRenderer
        .invoke("startWatcher", folderToWatch, folderToSave)
        .then((res) => {
          return true;
        })
        .catch((err) => {
          return { error: "there was an error" };
        });
    },

    async saveFile(inFile, _setIsloading) {
      const outFile = await ipcRenderer.invoke("saveFile");
      const { canceled } = outFile;
      if (canceled) {
        return { error: "file selection canceled" };
      }

      if (!canceled) {
        _setIsloading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return ipcRenderer
          .invoke("processFile", inFile, outFile)
          .then((res) => {
            _setIsloading(false);
            return true;
          })
          .catch((err) => {
            _setIsloading(false);
            return { error: "there was an error" };
          });
      }
    },
  },
});
