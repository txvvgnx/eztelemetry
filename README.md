## Targets:
- [x] Setup Cesium
- [ ] Make Cesium offline compatible
- [x] Clean up unnecessary Cesium UI
- [ ] Read from serial ports or BLE
- [ ] Flight trajectory visualization from Cesium
- [ ] Basic/essential telemetry from ground station
- [ ] Display video from RPi live video system

### Cesium+React+Electron+Vite setup steps and notes:
1. Install Electron and Vite through [electronforge](https://www.electronforge.io/templates/vite-+-typescript)
2. Install and configure [React](https://www.electronforge.io/guides/framework-integration/react-with-typescript)
3. Install Cesium and follow the [quickstart NPM guide](https://cesium.com/learn/cesiumjs-learn/cesiumjs-quickstart/)
4. Install `vite-plugin-cesium` and include it in `vite.renderer.config.ts` (anywhere else and it would not work)

Vite plugin is required because Cesium needs some static assets loaded in order to work

Other vite static loaders don't work because of ESM-CommonJS incompatibility issue (specific to Electron)

Webpack is really weird and crashes the app as soon as any Cesium-related function is called (seems to be also specific to Electron, works in the Cesium webpack demo)