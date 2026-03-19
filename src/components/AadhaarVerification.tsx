import { useState } from 'react';
import { CreditCard, QrCode, Upload } from 'lucide-react';
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

  const handleVerify = () => {
    if (!aadhaar || aadhaar.replace(/\s/g, '').length < 12) return;
    setVerifying(true);
    setResult('idle');
    setTimeout(() => {
      setVerifying(false);
      // Simulate: any aadhaar starting with '0' fails
      if (aadhaar.startsWith('0')) {
        setResult('fail');
        onFail();
      } else {
        setResult('success');
        setTimeout(onSuccess, 800);
      }
    }, 2000);
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
            <CardDescription>Enter the voter's 12-digit Aadhaar number or scan QR code</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Aadhaar Number</label>
          <Input
            placeholder="XXXX XXXX XXXX"
            value={aadhaar}
            onChange={(e) => setAadhaar(formatAadhaar(e.target.value))}
            className="text-center text-lg tracking-widest font-mono h-12"
            maxLength={14}
            disabled={verifying || result === 'success'}
          />
        </div>

        <div className="flex gap-2">
          <Button variant="booth-outline" className="flex-1 gap-2" disabled>
            <QrCode className="w-4 h-4" /> Scan QR
          </Button>
          <Button variant="booth-outline" className="flex-1 gap-2" disabled>
            <Upload className="w-4 h-4" /> Upload
          </Button>
        </div>

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

        <div className="flex gap-2 pt-2">
          <Button
            variant="booth"
            className="flex-1"
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
        </div>

        <div className="pt-2 border-t border-border">
          <button
            onClick={onSwitchManual}
            className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
          >
            👉 Aadhaar unavailable? Switch to Manual Verification
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
