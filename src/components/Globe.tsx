import "cesium/Build/Cesium/Widgets/widgets.css";
import {
  Cartesian3,
  Cesium3DTileset,
  createOsmBuildingsAsync,
  Ion,
  Math as CesiumMath,
  Terrain,
  UrlTemplateImageryProvider,
  Viewer,
  WebMercatorTilingScheme,
} from "cesium";
import { useEffect, useRef, useState } from "react";

function Globe() {
  const [cesiumKey, setCesiumKey] = useState<string>("");

  const viewerRef = useRef<Viewer | null>(null);
  const tilesetRef = useRef<Cesium3DTileset | null>(null);

  const cesiumViewerSetup = async () => {
    Ion.defaultAccessToken = cesiumKey;

    viewerRef.current = new Viewer("globeView", {
      terrain: Terrain.fromWorldTerrain(),
      animation: false,
      timeline: false,
      homeButton: false,
      fullscreenButton: false,
      navigationHelpButton: false,
    });

    viewerRef.current.imageryLayers.removeAll();
    viewerRef.current.imageryLayers.addImageryProvider(
      new UrlTemplateImageryProvider({
        url: "http://localhost:8080/{z}/{x}/{y}.png",
        tilingScheme: new WebMercatorTilingScheme(),
        maximumLevel: 7,
      })
    );

    // Set location to San Francisco
    viewerRef.current.camera.flyTo({
      destination: Cartesian3.fromDegrees(
        -122.37380903635207,
        37.61943259091336,
        400
      ),
      orientation: {
        heading: CesiumMath.toRadians(0.0),
        pitch: CesiumMath.toRadians(-15.0),
      },
    });

    tilesetRef.current = await createOsmBuildingsAsync();
    viewerRef.current.scene.primitives.add(tilesetRef.current);
  };

  useEffect(() => {
    window.env.getEnv("CESIUM_API_KEY").then((key: string) => {
      if (key) setCesiumKey(key);
    });
  }, []);

  useEffect(() => {
    if (cesiumKey) cesiumViewerSetup();
  }, [cesiumKey]);

  return (
    <>
      <p className="font-mono text-red-300">{cesiumKey}</p>
      <div id="globeView"></div>
    </>
  );
}

export default Globe;
