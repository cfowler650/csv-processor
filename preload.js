const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  notificationApi: {
    sendNotification(message) {
      ipcRenderer.send("notify", message);
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
