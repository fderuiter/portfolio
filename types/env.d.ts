declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      GITHUB_TOKEN: string;
      NODE_ENV: "development" | "production" | "test";
    }
  }
}

export {};
