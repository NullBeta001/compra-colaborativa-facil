declare module 'html5-qrcode' {
  export interface QrcodeSuccessCallback {
    (decodedText: string, decodedResult: unknown): void;
  }

  export interface QrcodeErrorCallback {
    (errorMessage: string, error: unknown): void;
  }

  export interface Html5QrcodeConfigs {
    fps?: number;
    qrbox?: { width: number; height: number } | number;
    aspectRatio?: number;
    disableFlip?: boolean;
    videoConstraints?: MediaTrackConstraints;
    formatsToSupport?: number[];
  }

  export interface CameraDevice {
    id: string;
    label: string;
  }

  export class Html5Qrcode {
    constructor(elementId: string);

    static getCameras(): Promise<CameraDevice[]>;

    start(
      cameraIdOrConfig: string,
      configuration: Html5QrcodeConfigs,
      qrCodeSuccessCallback: QrcodeSuccessCallback,
      qrCodeErrorCallback?: QrcodeErrorCallback
    ): Promise<void>;

    stop(): Promise<void>;

    clear(): void;

    static FORMATS: {
      EAN_13: number;
      EAN_8: number;
      CODE_39: number;
      CODE_128: number;
      UPC_A: number;
      UPC_E: number;
      QR_CODE: number;
      AZTEC: number;
      DATA_MATRIX: number;
      ITF: number;
      MAXICODE: number;
      PDF_417: number;
      RSS_14: number;
      RSS_EXPANDED: number;
      CODABAR: number;
    };
  }
} 