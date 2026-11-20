import { NexcodeAPI } from '../../preload';

declare global {
  interface Window {
    nexcode?: NexcodeAPI;
  }
}
