import { useState, useRef, useEffect } from 'react';
import { CreditCard, QrCode, Camera, X, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Props {
  onSuccess: () => void;
  onFail: () => void;
  onSwitchManual: () => void;
}

export function AadhaarVerification({ onSuccess, onFail, onSwitchManual }: Props) {
  const [aadhaar, setAadhaar] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<'idle' | 'success' | 'fail'>('idle');
  const [mode, setMode] = useState<'scan' | 'manual'>('scan');
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const scannerRef = useRef<any>(null);
  const scannerContainerId = 'aadhaar-qr-reader';

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const startScanner = async () => {
    setScanError('');
    setScanning(true);

    // Small delay to ensure the container is rendered
    await new Promise(r => setTimeout(r, 100));

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode(scannerContainerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Extract 12-digit number from QR data
          const digits = decodedText.replace(/\D/g, '');
          if (digits.length >= 12) {
            const aadhaarNumber = digits.slice(0, 12);
            const formatted = aadhaarNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
            setAadhaar(formatted);
            stopScanner();
            // Auto-verify after scan
            handleVerifyWithValue(formatted);
          } else {
            // Try using raw text if it looks like an Aadhaar
            const raw = decodedText.replace(/\s/g, '');
            if (/^\d{12}$/.test(raw)) {
              const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
              setAadhaar(formatted);
              stopScanner();
              handleVerifyWithValue(formatted);
            }
          }
        },
        () => {
          // QR not found in frame - ignore
        }
      );
    } catch (err: any) {
      setScanning(false);
      if (err?.toString?.().includes('NotAllowedError') || err?.toString?.().includes('Permission')) {
        setScanError('Camera permission denied. Please allow camera access and try again.');
      } else if (err?.toString?.().includes('NotFoundError')) {
        setScanError('No camera found on this device.');
      } else {
        setScanError('Could not start camera. Try entering Aadhaar manually.');
      }
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const handleVerifyWithValue = (value: string) => {
    const digits = value.replace(/\s/g, '');
    if (digits.length < 12) return;
    setVerifying(true);
    setResult('idle');
    setTimeout(() => {
      setVerifying(false);
      if (digits.startsWith('0')) {
        setResult('fail');
        onFail();
      } else {
        setResult('success');
        setTimeout(onSuccess, 800);
      }
    }, 2000);
  };

  const handleVerify = () => {
    handleVerifyWithValue(aadhaar);
  };

  const formatAadhaar = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  return (
    <Card className="fade-in border-primary/20 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Stage 1: Aadhaar Verification</CardTitle>
            <CardDescription>Scan QR code from Aadhaar card or enter number manually</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary: QR Scanner */}
        {mode === 'scan' && (
          <div className="space-y-3">
            {!scanning && !aadhaar && result === 'idle' && (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-foreground">Scan Aadhaar QR Code</p>
                  <p className="text-xs text-muted-foreground">Position the QR code on the Aadhaar card in front of the camera</p>
                </div>
                <Button
                  variant="booth"
                  className="gap-2 w-full max-w-xs"
                  onClick={startScanner}
                  disabled={verifying}
                >
                  <Camera className="w-5 h-5" /> Start Camera Scan
                </Button>
              </div>
            )}

            {scanning && (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden border-2 border-primary/30 bg-black">
                  <div id={scannerContainerId} className="w-full" style={{ minHeight: 280 }} />
                  <Button
                    variant="booth-destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-8 px-3 z-10"
                    onClick={stopScanner}
                  >
                    <X className="w-4 h-4 mr-1" /> Stop
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center animate-pulse">
                  Scanning... Point camera at the QR code on the Aadhaar card
                </p>
              </div>
            )}

            {scanError && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium fade-in border border-destructive/20">
                {scanError}
              </div>
            )}
          </div>
        )}

        {/* Manual entry mode */}
        {mode === 'manual' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Aadhaar Number</label>
            <Input
              placeholder="XXXX XXXX XXXX"
              value={aadhaar}
              onChange={(e) => setAadhaar(formatAadhaar(e.target.value))}
              className="text-center text-lg tracking-widest font-mono h-12"
              maxLength={14}
              disabled={verifying || result === 'success'}
              autoFocus
            />
          </div>
        )}

        {/* Scanned Aadhaar display (in scan mode, after scan) */}
        {mode === 'scan' && aadhaar && !scanning && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Scanned Aadhaar Number</label>
            <div className="text-center text-lg tracking-widest font-mono h-12 flex items-center justify-center rounded-md border border-input bg-muted/50">
              {aadhaar}
            </div>
          </div>
        )}

        {result === 'fail' && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium fade-in border border-destructive/20">
            ✗ Aadhaar verification failed. Record not found.
          </div>
        )}
        {result === 'success' && (
          <div className="p-3 rounded-lg bg-success/10 text-success text-sm font-medium fade-in border border-success/20">
            ✓ Aadhaar verified successfully. Proceeding...
          </div>
        )}

        {(mode === 'manual' || (mode === 'scan' && aadhaar && !scanning)) && result === 'idle' && (
          <Button
            variant="booth"
            className="w-full"
            onClick={handleVerify}
            disabled={aadhaar.replace(/\s/g, '').length < 12 || verifying || result === 'success'}
          >
            {verifying ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Verifying...
              </span>
            ) : 'Verify Aadhaar'}
          </Button>
        )}

        {/* Mode switch */}
        {result === 'idle' && !verifying && (
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <button
              onClick={() => {
                stopScanner();
                setScanError('');
                setMode(mode === 'scan' ? 'manual' : 'scan');
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
            >
              {mode === 'scan' ? (
                <><Keyboard className="w-3.5 h-3.5" /> Enter Aadhaar manually</>
              ) : (
                <><QrCode className="w-3.5 h-3.5" /> Scan QR code instead</>
              )}
            </button>
            <button
              onClick={onSwitchManual}
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              Manual Verification
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
