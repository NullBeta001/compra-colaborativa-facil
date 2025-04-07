
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface ScannerProps {
  onDetected: (barcode: string) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onDetected }) => {
  const [scanning, setScanning] = useState(false);

  // Em uma aplicação real, aqui seria integrada uma biblioteca de leitura de código de barras
  // Como QuaggaJS ou ZXing, mas para simplificar, vamos apenas simular a leitura
  const simulateScan = () => {
    setScanning(true);
    
    // Simular um delay de processamento
    setTimeout(() => {
      // Gerar um código de barras aleatório de 13 dígitos (padrão EAN-13)
      const randomBarcode = Array(13)
        .fill(0)
        .map(() => Math.floor(Math.random() * 10))
        .join("");
        
      onDetected(randomBarcode);
      setScanning(false);
    }, 2000);
  };

  return (
    <Card className="p-4 flex flex-col items-center">
      <div className="mb-4 w-full aspect-video bg-black/10 rounded-md flex items-center justify-center relative overflow-hidden">
        {scanning ? (
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-1 bg-primary w-3/4 rounded absolute top-1/2"></div>
            <p className="text-sm text-muted-foreground mt-8">Escaneando...</p>
          </div>
        ) : (
          <Camera className="h-12 w-12 text-muted-foreground" />
        )}
      </div>
      
      <p className="text-sm text-muted-foreground mb-4 text-center">
        Em uma aplicação real, aqui apareceria a imagem da câmera para escanear o código de barras.
      </p>
      
      <Button
        onClick={simulateScan}
        disabled={scanning}
        className="w-full"
      >
        {scanning ? "Processando..." : "Simular Escaneamento"}
      </Button>
    </Card>
  );
};

export default Scanner;
