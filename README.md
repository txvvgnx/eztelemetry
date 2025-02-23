## Targets:
- [x] Setup Cesium
- [x] Make Cesium offline compatible (kinda?)
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

### Offline maps notes:
Main goal is to come up with a offline compatible satellite map solution. 

15m-resolution open satellite images such as `Sentinel-2` exist, however processing these images takes time and effort and hence working tilesets are not free.

Final option was using NASA's `Blue Marble NextGen`, which is a 500m resolution image set. The MBTiles tileset is generated using [this guide by the creator of MapTiler](https://gist.github.com/klokan/b654b18367f372d58c58). `tileserver-gl` hosts the tileset using an XYZ style server `http://localhost:8080/data/world/{z}/{x}/{y}.png`. Make sure to use `WebMercatorTilingScheme` in Cesium to avoid overlay issues.

Unfortunately 500m resolution is simply not enough to make a detailed enough satellite view from low altitudes/high zoom levels (5km and below). Sentinel-2 does a decent job, however still lacks the details that a **cm**-level satellite map (like Bing Maps Aerial) can provide.