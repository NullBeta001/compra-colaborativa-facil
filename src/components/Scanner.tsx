import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, StopCircle } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

interface ScannerProps {
  onDetected: (barcode: string) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onDetected }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  // Função para limpar o scanner ao desmontar o componente
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    setError(null);
    setScanning(true);

    if (!scannerContainerRef.current) {
      setError("Container de scanner não encontrado");
      setScanning(false);
      return;
    }

    try {
      // Inicializar o scanner
      const html5QrCode = new Html5Qrcode("scanner-container");
      scannerRef.current = html5QrCode;

      // Verificar se a câmera está disponível
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        const cameraId = devices[0].id;

        // Iniciar o scanner
        await html5QrCode.start(
          cameraId,
          {
            fps: 10,              // Frames por segundo
            qrbox: { width: 250, height: 250 },  // Tamanho da caixa de leitura
            aspectRatio: 1,       // Proporção da câmera
            formatsToSupport: [   // Formatos suportados (códigos de barras)
              Html5Qrcode.FORMATS.EAN_13,
              Html5Qrcode.FORMATS.EAN_8,
              Html5Qrcode.FORMATS.CODE_39,
              Html5Qrcode.FORMATS.CODE_128,
              Html5Qrcode.FORMATS.UPC_A,
              Html5Qrcode.FORMATS.UPC_E
            ],
          },
          (decodedText) => {
            // Sucesso na leitura
            console.log(`Código lido: ${decodedText}`);
            onDetected(decodedText);
            stopScanner();
          },
          (errorMessage) => {
            // Apenas para debug, não emitir erro para o usuário a cada frame
            console.log(`Erro na leitura: ${errorMessage}`);
          }
        );
      } else {
        setError("Nenhuma câmera encontrada no dispositivo");
        setScanning(false);
      }
    } catch (err) {
      console.error("Erro ao iniciar o scanner:", err);
      setError("Erro ao acessar a câmera. Verifique as permissões.");
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Erro ao parar o scanner:", err);
      }
    }
    setScanning(false);
  };

  // Função para simular a leitura (útil para testes)
  const simulateScan = () => {
    setScanning(true);
    
    // Simular um delay de processamento
    setTimeout(() => {
      // Gerar um código de barras brasileiro aleatório (começando com 789)
      const randomBarcode = "789" + Array(10)
        .fill(0)
        .map(() => Math.floor(Math.random() * 10))
        .join("");
        
      onDetected(randomBarcode);
      setScanning(false);
    }, 2000);
  };

  return (
    <Card className="p-4 flex flex-col items-center">
      <div 
        id="scanner-container"
        ref={scannerContainerRef}
        className="mb-4 w-full aspect-video bg-black/10 rounded-md flex items-center justify-center relative overflow-hidden"
      >
        {!scanning && (
          <Camera className="h-12 w-12 text-muted-foreground" />
        )}
      </div>
      
      {error && (
        <p className="text-sm text-destructive mb-4">
          {error}
        </p>
      )}
      
      {!scanning ? (
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button
            onClick={startScanner}
            className="w-full"
          >
            Escanear Código
          </Button>
          
          <Button
            onClick={simulateScan}
            variant="outline"
            className="w-full"
          >
            Simular Leitura
          </Button>
        </div>
      ) : (
        <Button
          onClick={stopScanner}
          variant="destructive"
          className="w-full"
        >
          <StopCircle className="mr-2 h-4 w-4" /> Parar Leitura
        </Button>
      )}
    </Card>
  );
};

export default Scanner;
