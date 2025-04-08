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
        advanced?: Array<{
          zoom?: number;
          [key: string]: any;
        }>;
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

  interface QuaggaBox {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  interface QuaggaProcessedResult {
    boxes?: number[][];
    box?: QuaggaBox;
    codeResult?: {
      code?: string;
      format?: string;
    };
  }

  interface QuaggaResult {
    codeResult?: {
      code?: string;
      format?: string;
    };
  }

  interface QuaggaCanvasContext {
    ctx: {
      overlay: CanvasRenderingContext2D;
      image: CanvasRenderingContext2D;
    };
    dom: {
      overlay: HTMLCanvasElement;
      image: HTMLCanvasElement;
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
    onProcessed(callback: (result: QuaggaProcessedResult) => void): void;
    decodeSingle(
      config: QuaggaConfig,
      callback?: (result: QuaggaResult) => void
    ): void;
    canvas: QuaggaCanvasContext;
  }

  const Quagga: Quagga;
  export = Quagga;
} 