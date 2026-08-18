"use client";

import { useState, useEffect } from "react";
import {
  inspectClientCapabilities,
  type ClientDeviceCapabilities,
} from "@/lib/adaptive-resource";

/**
 * React hook exposing real-time adaptive device tier, network connection,
 * and 3D asset deferral state.
 */
export function useAdaptiveResource(): ClientDeviceCapabilities {
  const [capabilities, setCapabilities] = useState<ClientDeviceCapabilities>(() =>
    inspectClientCapabilities()
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateCapabilities = () => {
      setCapabilities(inspectClientCapabilities());
    };

    window.addEventListener("resize", updateCapabilities);

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const navConn =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;
    /* eslint-enable @typescript-eslint/no-explicit-any */

    if (navConn && typeof navConn.addEventListener === "function") {
      navConn.addEventListener("change", updateCapabilities);
    }

    return () => {
      window.removeEventListener("resize", updateCapabilities);
      if (navConn && typeof navConn.removeEventListener === "function") {
        navConn.removeEventListener("change", updateCapabilities);
      }
    };
  }, []);

  return capabilities;
}
