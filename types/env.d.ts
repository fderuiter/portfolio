declare global {
  interface Window {
    /** Global command palette search trigger hook */
    __openSearch?: () => void;
    /** Interactive iMednet Python SDK terminal CLI API */
    terminal?: {
      run: (cmdText: string) => void;
      help: () => void;
    };
    /** Alias for iMednet Python SDK terminal CLI API */
    imednet?: {
      run: (cmdText: string) => void;
      help: () => void;
    };
  }

  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      DIRECT_URL?: string;
      GITHUB_TOKEN: string;
      NODE_ENV: "development" | "production" | "test";
    }
  }
}

export {};
