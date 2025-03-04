import {
  Cartesian3,
  EllipsoidTerrainProvider,
  ImageryProvider,
  Ion,
  IonImageryProvider,
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
  const layerProvidersRef = useRef<(ImageryProvider | number)[] | null>(null);
  const layerIndexRef = useRef<number>(0);

  const switchLayers = async () => {
    if (!layerProvidersRef.current) return; // Do not continue if layerProviders array is undefined
    viewerRef.current.imageryLayers.removeAll();

    const provider = layerProvidersRef.current[layerIndexRef.current];

    if (typeof provider == "number")
      viewerRef.current.imageryLayers.addImageryProvider(await IonImageryProvider.fromAssetId(provider));
    else viewerRef.current.imageryLayers.addImageryProvider(provider);

    layerIndexRef.current = (layerIndexRef.current + 1) % layerProvidersRef.current.length;
  };

  const cesiumViewerSetup = async () => {
    Ion.defaultAccessToken = cesiumKey;

    viewerRef.current = new Viewer("globeView", {
      terrainProvider: new EllipsoidTerrainProvider(),
      // terrain: Terrain.fromWorldTerrain(),
      geocoder: false,
      timeline: false,
      animation: false,
      homeButton: false,
      sceneModePicker: false,
      // baseLayerPicker: false,
      fullscreenButton: false,
      navigationHelpButton: false,
    });

    layerProvidersRef.current = [
      new UrlTemplateImageryProvider({
        url: "http://localhost:8080/{z}/{x}/{y}.png",
        tilingScheme: new WebMercatorTilingScheme(),
        maximumLevel: 13,
      }), // Sentinel-2 selfhost
      3954, // Sentinel-2 asset ID
      2, // Bing Maps Aerial asset ID
    ];
    await switchLayers();

    const latlng = [-31.569074650981225, 116.77287568271946];
    viewerRef.current.camera.flyTo({
      destination: Cartesian3.fromDegrees(latlng[1], latlng[0], 400),
      orientation: {
        heading: CesiumMath.toRadians(0.0),
        pitch: CesiumMath.toRadians(-15.0),
      },
    });
  };

  useEffect(() => {
    window.env.getEnv("CESIUM_API_KEY").then((key: string) => {
      if (key) setCesiumKey(key);
    });
  }, []);

  useEffect(() => {
    if (cesiumKey) cesiumViewerSetup();
  }, [cesiumKey]);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.key == "L" && event.shiftKey) await switchLayers();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="h-full w-full">
      <div id="globeView" className="h-full"></div>
    </div>
  );
}

export default Globe;
