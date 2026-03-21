import { useState, useRef, useEffect } from 'react';
import { CreditCard, QrCode, Camera, X, Keyboard, ChevronDown, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Props {
  onSuccess: () => void;
  onFail: () => void;
  onSwitchManual: () => void;
}

const ID_TYPES = [
  { value: 'aadhaar', label: 'Aadhaar Card' },
  { value: 'pan', label: 'PAN Card' },
  { value: 'driving_license', label: 'Driving License' },
  { value: 'passport', label: 'Passport' },
  { value: 'mgnrega', label: 'MGNREGA Card' },
  { value: 'smart_card', label: 'Smart Card' },
  { value: 'health_insurance', label: 'Health Insurance Smart Card' },
  { value: 'service_id', label: 'Service Identity Card' },
  { value: 'pension', label: 'Pension Document' },
  { value: 'passbook', label: 'Passbook' },
  { value: 'official_id', label: 'Official Identity Card' },
] as const;

type IdType = typeof ID_TYPES[number]['value'];

export function AadhaarVerification({ onSuccess, onFail, onSwitchManual }: Props) {
  const [selectedIdType, setSelectedIdType] = useState<IdType>('aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<'idle' | 'success' | 'fail'>('idle');
  const [mode, setMode] = useState<'scan' | 'manual'>('scan');
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const scannerRef = useRef<any>(null);
  const scannerContainerId = 'id-qr-reader';

  const selectedLabel = ID_TYPES.find(t => t.value === selectedIdType)?.label ?? 'Aadhaar Card';

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch { /* ignore */ }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const startScanner = async () => {
    setScanError('');
    setScanning(true);
    await new Promise(r => setTimeout(r, 100));

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode(scannerContainerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Use scanned text as the ID value
          const cleaned = decodedText.trim();
          if (cleaned.length > 0) {
            setIdNumber(cleaned);
            stopScanner();
            handleVerifyWithValue(cleaned);
          }
        },
        () => { /* QR not found in frame */ }
      );
    } catch (err: any) {
      setScanning(false);
      if (err?.toString?.().includes('NotAllowedError') || err?.toString?.().includes('Permission')) {
        setScanError('Camera permission denied. Please allow camera access and try again.');
      } else if (err?.toString?.().includes('NotFoundError')) {
        setScanError('No camera found on this device.');
      } else {
        setScanError('Could not start camera. Try entering ID manually.');
      }
    }
  };

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  const handleVerifyWithValue = (value: string) => {
    if (value.trim().length < 4) return;
    setVerifying(true);
    setResult('idle');
    setTimeout(() => {
      setVerifying(false);
      // Simulate failure if value starts with '0'
      if (value.startsWith('0')) {
        setResult('fail');
        onFail();
      } else {
        setResult('success');
        setTimeout(onSuccess, 800);
      }
    }, 2000);
  };

  const handleVerify = () => {
    handleVerifyWithValue(idNumber);
  };

  const handleIdTypeChange = (type: IdType) => {
    setSelectedIdType(type);
    setIdNumber('');
    setResult('idle');
    setScanError('');
    stopScanner();
  };

  const placeholder = selectedIdType === 'aadhaar' ? 'XXXX XXXX XXXX' :
    selectedIdType === 'pan' ? 'ABCDE1234F' :
    selectedIdType === 'passport' ? 'A1234567' :
    selectedIdType === 'driving_license' ? 'DL-0420110012345' :
    'Enter ID number';

  const formatValue = (v: string) => {
    if (selectedIdType === 'aadhaar') {
      const digits = v.replace(/\D/g, '').slice(0, 12);
      return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    return v;
  };

  const isValidLength = selectedIdType === 'aadhaar'
    ? idNumber.replace(/\s/g, '').length >= 12
    : idNumber.trim().length >= 4;

  return (
    <Card className="fade-in border-primary/20 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Stage 1: Identity Verification</CardTitle>
            <CardDescription>Select ID type, then scan or enter details manually</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ID Type Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Select ID Type</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-12 text-base font-medium"
                disabled={verifying || result === 'success'}
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  {selectedLabel}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-64 overflow-y-auto">
              {ID_TYPES.map((type) => (
                <DropdownMenuItem
                  key={type.value}
                  onClick={() => handleIdTypeChange(type.value)}
                  className={`cursor-pointer ${selectedIdType === type.value ? 'bg-primary/10 text-primary font-medium' : ''}`}
                >
                  {type.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Primary: Camera Scan */}
        {mode === 'scan' && (
          <div className="space-y-3">
            {!scanning && !idNumber && result === 'idle' && (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-foreground">Scan {selectedLabel}</p>
                  <p className="text-xs text-muted-foreground">Position the ID card in front of the camera to scan and verify</p>
                </div>
                <Button
                  variant="booth"
                  className="gap-2 w-full max-w-xs"
                  onClick={startScanner}
                  disabled={verifying}
                >
                  <Camera className="w-5 h-5" /> Scan ID Card
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
                  Scanning... Point camera at the {selectedLabel}
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
            <label className="text-sm font-medium text-foreground">{selectedLabel} Number</label>
            <Input
              placeholder={placeholder}
              value={idNumber}
              onChange={(e) => setIdNumber(formatValue(e.target.value))}
              className="text-center text-lg tracking-widest font-mono h-12"
              maxLength={selectedIdType === 'aadhaar' ? 14 : 30}
              disabled={verifying || result === 'success'}
              autoFocus
            />
          </div>
        )}

        {/* Scanned ID display */}
        {mode === 'scan' && idNumber && !scanning && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Scanned {selectedLabel}</label>
            <div className="text-center text-lg tracking-widest font-mono h-12 flex items-center justify-center rounded-md border border-input bg-muted/50">
              {idNumber}
            </div>
          </div>
        )}

        {result === 'fail' && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium fade-in border border-destructive/20">
            ✗ {selectedLabel} verification failed. Record not found.
          </div>
        )}
        {result === 'success' && (
          <div className="p-3 rounded-lg bg-success/10 text-success text-sm font-medium fade-in border border-success/20">
            ✓ {selectedLabel} verified successfully. Proceeding...
          </div>
        )}

        {(mode === 'manual' || (mode === 'scan' && idNumber && !scanning)) && result === 'idle' && (
          <Button
            variant="booth"
            className="w-full"
            onClick={handleVerify}
            disabled={!isValidLength || verifying}
          >
            {verifying ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Verifying...
              </span>
            ) : `Verify ${selectedLabel}`}
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
                <><Keyboard className="w-3.5 h-3.5" /> Enter ID manually</>
              ) : (
                <><QrCode className="w-3.5 h-3.5" /> Scan ID instead</>
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
