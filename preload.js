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
    async saveFile(inFile) {
      const outFile = await ipcRenderer.invoke("saveFile");
      const processFile = await ipcRenderer.invoke(
        "processFile",
        inFile,
        outFile
      );
    },
  },
});
