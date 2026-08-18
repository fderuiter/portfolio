import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry } from "serwist";
import { CacheFirst, ExpirationPlugin, NetworkOnly, Serwist } from "serwist";

declare global {
  interface ServiceWorkerGlobalScope {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const coreAppShellRoutes: string[] = [
  "/",
  "/proof",
  "/simulator",
  "/schedule",
  "/stack",
  "/crf",
  "/neuro",
  "/arcade",
  "/case-studies",
  "/offline",
];

const precacheManifest = (self.__SW_MANIFEST || []).concat(
  coreAppShellRoutes.map((url) => ({
    url,
    revision: null,
  }))
);

const serwist = new Serwist({
  precacheEntries: precacheManifest,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Requirement 4: Enforce strictly Network-Only strategy for telemetry and Sentry error tracking
    {
      matcher: ({ url }) => {
        const { pathname, hostname } = url;
        return (
          pathname.startsWith("/api/telemetry") ||
          hostname.includes("sentry") ||
          pathname.includes("sentry")
        );
      },
      handler: new NetworkOnly(),
    },
    // Requirement 2: Apply Cache-First runtime strategy for 3D model files while preserving fallbacks
    {
      matcher: ({ url }) => {
        const { pathname } = url;
        return (
          /\.(?:glb|gltf|obj)$/i.test(pathname) ||
          pathname.startsWith("/models/")
        );
      },
      handler: new CacheFirst({
        cacheName: "3d-models-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
