declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DMENU_CMD: string;
      TERMEXEC: string;
      BW_CLI_API_URL: string;
    }
  }
}

export {}
