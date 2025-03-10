import { contextBridge, ipcRenderer } from 'electron';

// expose getEnv to the renderer process
contextBridge.exposeInMainWorld('env', {
  getEnv: (key: string) => ipcRenderer.invoke('get-env', key),
});

contextBridge.exposeInMainWorld('system', {
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath)
});