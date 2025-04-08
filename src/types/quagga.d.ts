declare module 'quagga' {
  interface QuaggaConfig {
    inputStream?: {
      name?: string;
      type?: string;
      target?: HTMLElement | string;
      constraints?: {
        width?: number;
        height?: number;
        facingMode?: string;
      };
      area?: {
        top?: string;
        right?: string;
        left?: string;
        bottom?: string;
      };
      singleChannel?: boolean;
    };
    locate?: boolean;
    numOfWorkers?: number;
    decoder?: {
      readers?: string[];
      debug?: {
        drawBoundingBox?: boolean;
        showFrequency?: boolean;
        drawScanline?: boolean;
        showPattern?: boolean;
        showCanvas?: boolean;
        showPatches?: boolean;
        showFoundPatches?: boolean;
        showSkeleton?: boolean;
        showLabels?: boolean;
        showPatchLabels?: boolean;
        showRemainingPatchLabels?: boolean;
        boxFromPatches?: {
          showTransformed?: boolean;
          showTransformedBox?: boolean;
          showBB?: boolean;
        };
      };
      multiple?: boolean;
    };
    locator?: {
      patchSize?: string;
      halfSample?: boolean;
    };
    debug?: boolean;
    frequency?: number;
  }

  interface QuaggaResult {
    codeResult?: {
      code?: string;
      format?: string;
    };
  }

  interface QuaggaError {
    name: string;
    message: string;
    stack?: string;
  }

  interface Quagga {
    init(
      config: QuaggaConfig,
      callback?: (err: QuaggaError | null) => void
    ): void;
    start(): void;
    stop(): void;
    onDetected(callback: (result: QuaggaResult) => void): void;
    offDetected(callback: (result: QuaggaResult) => void): void;
    onProcessed(callback: (result: unknown) => void): void;
    decodeSingle(
      config: QuaggaConfig,
      callback?: (result: QuaggaResult) => void
    ): void;
  }

  const Quagga: Quagga;
  export = Quagga;
} 