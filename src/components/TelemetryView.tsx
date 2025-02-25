import Globe from "./Globe";
import TopBar from "./TopBar";

function TelemetryView() {
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
