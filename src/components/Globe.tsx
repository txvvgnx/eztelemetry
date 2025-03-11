import {
  Cartesian3,
  Color,
  Math as CesiumMath,
  Entity,
  ImageryProvider,
  IonImageryProvider,
  UrlTemplateImageryProvider,
  EllipsoidTerrainProvider,
  Viewer,
  Ion,
  WebMercatorTilingScheme,
  SampledPositionProperty,
  JulianDate,
  ExtrapolationType,
  ConstantProperty,
  TrackingReferenceFrame,
  HeadingPitchRange,
} from "cesium";
import { useEffect, useRef, useState } from "react";
import { flightStateGlobal } from "./TelemetryView";
import { useAtom } from "jotai";

const keyMappings: KeyMapping = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  Minus: "zoomout",
  Equal: "zoomin",
};

function Globe() {
  const [cesiumKey, setCesiumKey] = useState<string>("");
  const [cesiumReady, setCesiumReady] = useState<boolean>(false);
  const [flightState, setFlightState] = useAtom(flightStateGlobal);

  const viewerRef = useRef<Viewer | null>(null);

  const pointRef = useRef<Entity | null>(null);
  const positionRef = useRef<SampledPositionProperty>(new SampledPositionProperty());

  const polylineRef = useRef<Entity | null>(null);

  const pitchRef = useRef<number>(CesiumMath.toRadians(-45));
  const headingRef = useRef<number>(0);
  const radiusRef = useRef<number>(1000);
  const keyMatrixRef = useRef<KeyMatrix>({
    left: false,
    right: false,
    up: false,
    down: false,
    zoomin: false,
    zoomout: false,
  });

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

  const createTextBackground = (width: number, height: number, color: Color, radius: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = color.toCssColorString();
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(width - radius, 0);
    ctx.quadraticCurveTo(width, 0, width, radius);
    ctx.lineTo(width, height - radius);
    ctx.quadraticCurveTo(width, height, width - radius, height);
    ctx.lineTo(radius, height);
    ctx.quadraticCurveTo(0, height, 0, height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();

    return canvas.toDataURL();
  };

  const clamp = (val: number, min: number, max: number) => {
    return Math.min(Math.max(val, min), max);
  };

  const normalizeOrientation = (val: number, isHeading: boolean) => {
    if (isHeading) return ((val % CesiumMath.TWO_PI) + CesiumMath.TWO_PI) % CesiumMath.TWO_PI;
    else return clamp(val, CesiumMath.toRadians(-85), CesiumMath.toRadians(85));
  };

  const cesiumViewerSetup = async () => {
    Ion.defaultAccessToken = cesiumKey;

    viewerRef.current = new Viewer("globeView", {
      terrainProvider: new EllipsoidTerrainProvider(),
      // terrain: Terrain.fromWorldTerrain(),
      geocoder: false,
      timeline: true,
      animation: true,
      homeButton: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      navigationHelpButton: false,
    });

    layerProvidersRef.current = [
      3954, // Sentinel-2 asset ID
      2, // Bing Maps Aerial asset ID
      new UrlTemplateImageryProvider({
        url: "http://localhost:8080/{z}/{x}/{y}.png",
        tilingScheme: new WebMercatorTilingScheme(),
        maximumLevel: 13,
      }), // Sentinel-2 selfhost
    ];
    await switchLayers();

    const now = JulianDate.now();
    const startTime = JulianDate.addSeconds(now, -1, new JulianDate());

    viewerRef.current.clock.startTime = startTime.clone();
    viewerRef.current.clock.currentTime = startTime.clone();
    viewerRef.current.clock.shouldAnimate = true;

    const latlng = [40.88668442, -104.63798523];
    positionRef.current.forwardExtrapolationType = ExtrapolationType.HOLD;
    positionRef.current.addSample(JulianDate.now(), Cartesian3.fromDegrees(latlng[1], latlng[0]));

    pointRef.current = viewerRef.current.entities.add({
      position: positionRef.current,
      point: {
        pixelSize: 6,
        color: Color.RED,
      },
      trackingReferenceFrame: TrackingReferenceFrame.ENU, // Important so that camera doesn't move around
    });
    viewerRef.current.trackedEntity = pointRef.current;

    polylineRef.current = viewerRef.current.entities.add({
      polyline: {
        positions: [
          Cartesian3.fromDegrees(latlng[1], latlng[0]),
          Cartesian3.fromDegrees(latlng[1], latlng[0]),
        ],
        material: Color.RED,
        width: 1.0,
      },
    });

    setCesiumReady(true);
  };

  // Gets API key from env
  useEffect(() => {
    window.env.getEnv("CESIUM_API_KEY").then((key: string) => {
      if (key) setCesiumKey(key);
    });
  }, []);

  // Cesium setup
  useEffect(() => {
    if (cesiumKey) cesiumViewerSetup();
  }, [cesiumKey]);

  // Updates sim point position by listening to flight data
  useEffect(() => {
    if (!cesiumReady || !flightState.init) return;

    const newpos = Cartesian3.fromDegrees(flightState.lng, flightState.lat, flightState.altitude);
    positionRef.current.addSample(JulianDate.now(), newpos);

    const curPolylinePos = polylineRef.current.polyline.positions.getValue();
    const updPos = [...curPolylinePos, newpos];
    polylineRef.current.polyline.positions = new ConstantProperty(updPos);
  }, [flightState, cesiumReady]);

  const moveCamera = (heading: boolean, positive: boolean, radius = false) => {
    const rotationSpeed = 0.015;
    const radiusChangeSpeed = 100;

    if (radius)
      radiusRef.current = clamp(
        radiusRef.current + (positive ? radiusChangeSpeed : -radiusChangeSpeed),
        1,
        20000,
      );
    else {
      let valueToChange = heading ? headingRef.current : pitchRef.current;
      valueToChange = valueToChange + (positive ? rotationSpeed : -rotationSpeed);
      valueToChange = normalizeOrientation(valueToChange, heading);

      if (heading) headingRef.current = valueToChange;
      else pitchRef.current = valueToChange;
    }

    const time = viewerRef.current.clock.currentTime;
    const entityPosition = pointRef.current.position.getValue(time);
    if (entityPosition) {
      const offset = new HeadingPitchRange(headingRef.current, pitchRef.current, radiusRef.current);
      viewerRef.current.camera.lookAt(entityPosition, offset);
    }
  };

  // Keybind listener
  useEffect(() => {
    const movementInterval = setInterval(() => {
      if (keyMatrixRef.current.left) moveCamera(true, true);
      if (keyMatrixRef.current.right) moveCamera(true, false);
      if (keyMatrixRef.current.up) moveCamera(false, true);
      if (keyMatrixRef.current.down) moveCamera(false, false);
      if (keyMatrixRef.current.zoomin) moveCamera(false, false, true);
      if (keyMatrixRef.current.zoomout) moveCamera(false, true, true);
    }, 10);

    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.key == "L" && event.shiftKey) await switchLayers();

      const keyFunction = keyMappings[event.code as keyof KeyMapping];
      if (keyFunction) keyMatrixRef.current[keyFunction as keyof KeyMatrix] = true;
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const keyFunction = keyMappings[event.code as keyof KeyMapping];
      if (keyFunction) keyMatrixRef.current[keyFunction as keyof KeyMatrix] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(movementInterval);
    };
  }, []);

  return (
    <div className="h-full w-full">
      <div id="globeView" className="h-full"></div>
    </div>
  );
}

export default Globe;
