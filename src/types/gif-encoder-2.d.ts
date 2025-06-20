declare module 'gif-encoder-2' {
  export default class GIFEncoder {
    constructor(width: number, height: number);
    start(): void;
    setDelay(ms: number): void;
    setQuality(quality: number): void;
    addFrame(imageData: Buffer | Uint8Array): void;
    finish(): void;
    out: {
      getData(): Buffer;
    };
  }
}
