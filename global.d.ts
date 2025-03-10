interface Window {
    env: {
        getEnv: (key: string) => Promise<string | undefined>;
    },
    system: {
        readFile: (filePath: string) => Promise<string | undefined>;
    }
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
    positions: LatLngAlt[],
}