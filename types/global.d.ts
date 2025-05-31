declare global {
  interface Window {
    __POMOMATE_EMBEDDED__?: boolean;
    __POMOMATE_HIDE_LOADING__?: () => void;
  }
}

export {};