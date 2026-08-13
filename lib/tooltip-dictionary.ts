export type NarrativeMode = "recruiter" | "developer";

export interface TooltipTranslation {
  recruiter: string;
  developer: string;
}

export const tooltipDictionary: Record<string, TooltipTranslation> = {
  clinicalIntegrations: {
    recruiter: "Making sure healthcare professionals get the right data to save lives safely.",
    developer: "Fighting SOAP XML APIs and CDISC schemas so doctors don't see raw stack traces."
  },
  layoutPhysics: {
    recruiter: "Crafting buttery-smooth animations that feel completely natural to the user.",
    developer: "Writing custom 60fps canvas math to escape the slow, layout-thrashing DOM."
  },
  serverlessScaling: {
    recruiter: "Ensuring the app stays fast even when thousands of people use it at once.",
    developer: "Dodging cold starts and stopping Neon database connection pools from melting."
  },
  architecturalNarratives: {
    recruiter: "The human story behind the code—why this was built and who it helps.",
    developer: "Reading between the lines of git commit history, hotfixes, and cold coffee."
  },
  systemsRigor: {
    recruiter: "Ensuring reliability for users so the platform never goes down when they need it most.",
    developer: "Dodging 3 AM pager duties by over-engineering recovery flows and tracing race conditions."
  }
};

export type TooltipKey = keyof typeof tooltipDictionary;
