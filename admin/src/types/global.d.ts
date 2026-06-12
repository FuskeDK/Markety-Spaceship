export {};

declare global {
  interface Window {
    requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => void;
    __revealAll?: () => void;
  }
}
