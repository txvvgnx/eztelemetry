import { contextBridge, ipcRenderer } from 'electron';

// Expose a safe API to the renderer process
contextBridge.exposeInMainWorld('env', {
  getEnv: (key: string) => ipcRenderer.invoke('get-env', key),
});
