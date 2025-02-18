import "cesium/Build/Cesium/Widgets/widgets.css";
import {
  Cartesian3,
  Cesium3DTileset,
  createOsmBuildingsAsync,
  Ion,
  Math as CesiumMath,
  Terrain,
  Viewer,
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

    // Set location to San Francisco
    viewerRef.current.camera.flyTo({
      destination: Cartesian3.fromDegrees(-122.4175, 37.655, 400),
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
      <p>{cesiumKey}</p>
      <div id="globeView"></div>
    </>
  );
}

export default Globe;
