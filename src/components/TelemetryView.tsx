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

    await sleep(500);

    const ufs = { ...flightState };
    ufs.init = true;
    ufs.positions = JSON.parse(fileData);
    ufs.lat = ufs.positions[83].lat;
    ufs.lng = ufs.positions[83].lng;
    ufs.altitude = ufs.positions[83].alt;
    setFlightState(ufs);

    await sleep(500);

    const ufs2 = { ...flightState };
    ufs2.init = true;
    ufs2.positions = JSON.parse(fileData);
    ufs2.lat = ufs2.positions[135].lat;
    ufs2.lng = ufs2.positions[135].lng;
    ufs2.altitude = ufs2.positions[135].alt;
    setFlightState(ufs2);
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
          <div className="h-full w-1/2"></div>

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
