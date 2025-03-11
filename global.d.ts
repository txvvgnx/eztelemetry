interface Window {
  env: {
    getEnv: (key: string) => Promise<string | undefined>;
  };
  system: {
    readFile: (filePath: string) => Promise<string | undefined>;
  };
}

interface LatLngAlt {
  lat: number;
  lng: number;
  alt: number;
}

interface FlightState {
  init: boolean;
  lat: number;
  lng: number;
  altitude: number;
  positions: LatLngAlt[];
}

interface KeyMapping {
  ArrowLeft: string;
  ArrowRight: string;
  ArrowUp: string;
  ArrowDown: string;
  Minus: string;
  Equal: string;
}

interface KeyMatrix {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  zoomin: boolean;
  zoomout: boolean;
}
