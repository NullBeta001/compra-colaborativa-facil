import React, { useRef, useState, useEffect } from 'react';
import { Alert, Box, Button, CircularProgress, Typography, Slider } from '@mui/material';
import * as Quagga from 'quagga';

interface ScannerProps {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onDetected, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const scannerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
            width: 1280,
            height: 720,
            // Desativar aspectRatio para melhor qualidade
            advanced: [{ 
              zoom: zoom 
            }],
          },
          area: {
            // Definir uma área menor para o scanner focar no centro da tela
            top: "20%",
            right: "20%",
            left: "20%",
            bottom: "20%"
          },
        },
        locator: {
          patchSize: "medium",
          halfSample: false, // Desativa halfSample para melhor precisão
        },
        numOfWorkers: navigator.hardwareConcurrency || 2,
        frequency: 10, // Aumentar a frequência de leitura
        decoder: {
          readers: [
            'ean_reader',
            'ean_8_reader', 
            'code_128_reader',
            'code_39_reader',
            'code_93_reader'
          ],
          debug: {
            drawBoundingBox: true,
            showFrequency: false,
            drawScanline: true,
            showPattern: false,
          },
          multiple: false,
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

        // Salvar stream para ajuste de zoom
        if (scannerRef.current) {
          const videoElement = scannerRef.current.querySelector('video');
          if (videoElement && videoElement.srcObject instanceof MediaStream) {
            streamRef.current = videoElement.srcObject;
          }
        }

        Quagga.onDetected((result) => {
          if (result.codeResult && result.codeResult.code) {
            const code = result.codeResult.code;
            console.log('Código detectado:', code);
            stopScanner();
            onDetected(code);
          }
        });

        // Adicionar feedback visual de processamento para auxiliar o usuário
        Quagga.onProcessed((result) => {
          const drawingCtx = Quagga.canvas.ctx.overlay;
          const drawingCanvas = Quagga.canvas.dom.overlay;

          if (result) {
            if (result.boxes) {
              drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
              result.boxes.forEach((box) => {
                if (box !== result.box) {
                  drawingCtx.strokeStyle = "green";
                  drawingCtx.lineWidth = 2;
                  drawingCtx.strokeRect(box[0], box[1], box[2] - box[0], box[3] - box[1]);
                }
              });
            }

            if (result.box) {
              drawingCtx.strokeStyle = "blue";
              drawingCtx.lineWidth = 2;
              drawingCtx.strokeRect(
                result.box.x, 
                result.box.y, 
                result.box.width, 
                result.box.height
              );
            }

            if (result.codeResult && result.codeResult.code) {
              drawingCtx.font = "16px Arial";
              drawingCtx.fillStyle = "red";
              drawingCtx.fillText(result.codeResult.code, 10, 20);
            }
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
    
    // Limpar o stream de vídeo
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleZoomChange = (_event: Event, newValue: number | number[]) => {
    const zoomValue = newValue as number;
    setZoom(zoomValue);
    
    // Tentar aplicar zoom ao stream atual, se disponível
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack && videoTrack.getCapabilities && videoTrack.getCapabilities().zoom) {
        const capabilities = videoTrack.getCapabilities();
        if (capabilities.zoom) {
          const constraints = { advanced: [{ zoom: zoomValue }] };
          videoTrack.applyConstraints(constraints)
            .catch(e => console.error('Erro ao aplicar zoom:', e));
        }
      }
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
          height: 350, 
          position: 'relative',
          overflow: 'hidden',
          mb: 2,
          border: '1px solid #ccc',
          borderRadius: 1,
          display: scanning ? 'block' : 'none'
        }}
      />

      {scanning && (
        <Box sx={{ width: '80%', mb: 2 }}>
          <Typography>Ajuste o zoom para melhorar o foco:</Typography>
          <Slider
            value={zoom}
            min={1}
            max={5}
            step={0.1}
            onChange={handleZoomChange}
            aria-labelledby="zoom-slider"
          />
        </Box>
      )}

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
        <>
          <Typography sx={{ mb: 1, textAlign: 'center', color: 'text.secondary' }}>
            Posicione o código de barras no centro da tela e mantenha o aparelho estável.
            Ajuste a distância para melhorar o foco.
          </Typography>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={stopScanner} 
            sx={{ mb: 2 }}
          >
            Cancelar
          </Button>
        </>
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
