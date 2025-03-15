import Globe from "./Globe";
import TopBar from "./TopBar";
import { useEffect } from "react";
import { atom, useAtom } from "jotai";

export const flightStateGlobal = atom<FlightState>({
  init: false,
  lat: 0,
  lng: 0,
  altitude: 0,
  positions: [],
});

function TelemetryView() {
  const [flightState, setFlightState] = useAtom<FlightState>(flightStateGlobal);

  async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const readSimFlightPath = async () => {
    const filePath = "./simflightpath.json";
    const fileData = await window.system.readFile(filePath);

    await sleep(3000);

    const updatedFlightState = { ...flightState };
    updatedFlightState.init = true;
    updatedFlightState.positions = JSON.parse(fileData);
    updatedFlightState.lat = updatedFlightState.positions[0].lat;
    updatedFlightState.lng = updatedFlightState.positions[0].lng;
    updatedFlightState.altitude = updatedFlightState.positions[0].alt;

    setFlightState(updatedFlightState);
  };

  const simulateFlight = async () => {
    if (!flightState.init) return;

    for (let i = 1; i < flightState.positions.length; i++) {
      const updatedFlightState = { ...flightState };
      updatedFlightState.lat = updatedFlightState.positions[i].lat;
      updatedFlightState.lng = updatedFlightState.positions[i].lng;
      updatedFlightState.altitude = updatedFlightState.positions[i].alt;

      setFlightState(updatedFlightState);

      await sleep(100);
    }
  };

  useEffect(() => {
    readSimFlightPath();
  }, []);

  return (
    <div className="relative overflow-hidden pb-0 pt-[--topBarHeight]">
      <TopBar />

      <div className="flex w-full overflow-hidden">
        <main className="relative flex h-[calc(100vh-var(--topBarHeight))] max-h-full w-full">
          {/* Left half is live video or graphs/misc telemetry */}
          <div className="h-full w-1/2">
            <button
              className="rounded-md border-[1px] border-solid border-white p-4"
              onClick={simulateFlight}
              disabled={!flightState.init}
            >
              Simulate trajectory
            </button>
          </div>

          {/* Right half is globe/trajectory */}
          <div className="h-full w-1/2">
            <Globe />
          </div>
        </main>
      </div>
    </div>
  );
}

export default TelemetryView;
