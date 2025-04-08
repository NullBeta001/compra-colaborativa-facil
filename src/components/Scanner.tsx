import React, { useRef, useState, useEffect } from 'react';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import * as Quagga from 'quagga';

interface ScannerProps {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onDetected, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const initQuagga = () => {
    if (!scannerRef.current) {
      setError('Erro ao inicializar scanner');
      return;
    }

    Quagga.init(
      {
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: scannerRef.current,
          constraints: {
            facingMode: 'environment', // Usar a câmera traseira
            width: 450,
            height: 300,
          },
        },
        locator: {
          patchSize: 'medium',
          halfSample: true,
        },
        numOfWorkers: navigator.hardwareConcurrency || 4,
        decoder: {
          readers: ['ean_reader', 'ean_8_reader', 'code_128_reader'],
          debug: {
            drawBoundingBox: true,
            showFrequency: false,
            drawScanline: true,
            showPattern: false,
          },
        },
        locate: true,
      },
      (err) => {
        if (err) {
          console.error('Erro ao inicializar Quagga:', err);
          setError('Não foi possível inicializar a câmera: ' + err.message);
          setInitializing(false);
          return;
        }

        Quagga.onDetected((result) => {
          if (result.codeResult && result.codeResult.code) {
            const code = result.codeResult.code;
            stopScanner();
            onDetected(code);
          }
        });

        setInitializing(false);
        setScanning(true);
        Quagga.start();
      }
    );
  };

  const startScanner = () => {
    setError(null);
    setInitializing(true);
    initQuagga();
  };

  const stopScanner = () => {
    if (scanning) {
      Quagga.stop();
      setScanning(false);
    }
  };

  const simulateScanner = () => {
    // Simulação para teste
    onDetected('7891234567890');
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
          {error}
        </Alert>
      )}

      <Box 
        ref={scannerRef} 
        sx={{ 
          width: '100%', 
          height: 300, 
          position: 'relative',
          overflow: 'hidden',
          mb: 2,
          border: '1px solid #ccc',
          borderRadius: 1,
          display: scanning ? 'block' : 'none'
        }}
      />

      {!scanning && !initializing && (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={startScanner} 
          sx={{ mb: 2 }}
        >
          Escanear Código
        </Button>
      )}

      {initializing && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
          <CircularProgress size={40} sx={{ mb: 1 }} />
          <Typography>Inicializando câmera...</Typography>
        </Box>
      )}

      {scanning && (
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={stopScanner} 
          sx={{ mb: 2 }}
        >
          Cancelar
        </Button>
      )}

      <Button 
        variant="text" 
        color="info" 
        onClick={simulateScanner} 
        sx={{ mb: 2 }}
      >
        Simular leitura
      </Button>

      <Button 
        variant="outlined" 
        color="error" 
        onClick={onClose}
      >
        Fechar
      </Button>
    </Box>
  );
};
