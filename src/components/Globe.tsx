import { useEffect, useState } from "react";

function Globe() {
  const [cesiumKey, setCesiumKey] = useState<string>("");

  useEffect(() => {
    window.env.getEnv("CESIUM_API_KEY").then((key: string) => {
      if (key) setCesiumKey(key);
    });
  });

  return <h1>{cesiumKey}</h1>;
}

export default Globe;
