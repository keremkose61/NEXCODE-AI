import { NexcodeAPI } from '../../preload';

declare global {
  interface Window {
    nexcode?: NexcodeAPI;
  }
}

declare module '*?worker' {
  const workerConstructor: {
    new (): Worker;
  };
  export default workerConstructor;
}
