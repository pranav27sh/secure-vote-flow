import { useState } from 'react';
import { ShieldCheck, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  onSuccess: () => void;
  onFail: () => void;
  onSwitchManual: () => void;
}

export function VoterIdVerification({ onSuccess, onFail, onSwitchManual }: Props) {
  const { t } = useLanguage();
  const [voterId, setVoterId] = useState('');
  const [isScanned, setIsScanned] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<'idle' | 'success' | 'fail'>('idle');

  const handleScanVoterId = () => {
    setVerifying(true);
    setResult('idle');
    // Simulate scanning the voter ID
    setTimeout(() => {
      setVerifying(false);
      // Generate a random voter ID on successful scan
      const scannedId = 'VID' + Math.random().toString(36).substring(2, 9).toUpperCase();
      setVoterId(scannedId);
      setIsScanned(true);
    }, 2000);
  };

  const handleVerify = () => {
    if (!voterId || voterId.length < 10 || !isScanned) return;
    setVerifying(true);
    setResult('idle');
    setTimeout(() => {
      setVerifying(false);
      if (voterId.toUpperCase().startsWith('ERR')) { setResult('fail'); onFail(); }
      else { setResult('success'); setTimeout(onSuccess, 800); }
    }, 1800);
  };

  return (
    <Card className="fade-in border-primary/20 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{t('stage3Title')}</CardTitle>
            <CardDescription>{t('stage3Desc')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-info/10 border border-info/20 text-info text-sm">
          <p className="font-semibold mb-1">Scan Voter ID Required</p>
          <p className="text-xs">Please scan the voter ID using the scanner below to proceed.</p>
        </div>

        <Button
          variant="booth"
          className="w-full gap-2"
          onClick={handleScanVoterId}
          disabled={verifying || result === 'success' || isScanned}
        >
          {verifying ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Scanning...
            </span>
          ) : isScanned ? (
            <span className="flex items-center gap-2">
              ✓ ID Scanned
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Scan className="w-4 h-4" /> Scan Voter ID
            </span>
          )}
        </Button>

        {isScanned && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Scanned Voter ID</label>
            <Input
              placeholder="Scanned ID will appear here"
              value={voterId}
              onChange={(e) => setVoterId(e.target.value.toUpperCase())}
              className="text-center text-lg tracking-widest font-mono h-12 uppercase"
              disabled={verifying || result === 'success'}
              readOnly
            />
          </div>
        )}

        {result === 'fail' && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium fade-in border border-destructive/20">{t('voterIdNotFound')}</div>
        )}
        {result === 'success' && (
          <div className="p-3 rounded-lg bg-success/10 text-success text-sm font-medium fade-in border border-success/20">{t('voterIdMatched')}</div>
        )}

        <Button
          variant="booth"
          className="w-full"
          onClick={handleVerify}
          disabled={voterId.length < 10 || verifying || result === 'success' || !isScanned}
        >
          {verifying ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              {t('verifying')}
            </span>
          ) : t('verifyVoterId')}
        </Button>

        <div className="pt-2 border-t border-border">
          <button onClick={onSwitchManual} className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2">
            {t('switchManual')}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
