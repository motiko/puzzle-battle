export {};
declare global {
  interface Window {
    ground: any;
    send: (data: object) => void;
  }
}
