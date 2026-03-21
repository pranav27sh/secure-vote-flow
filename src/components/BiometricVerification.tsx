import { useState } from 'react';
import { Fingerprint, ScanEye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  onSuccess: () => void;
  onFail: () => void;
  onSwitchManual: () => void;
}

export function BiometricVerification({ onSuccess, onFail, onSwitchManual }: Props) {
  const { t } = useLanguage();
  const [scanning, setScanning] = useState(false);
  const [scanType, setScanType] = useState<'fingerprint' | 'iris'>('fingerprint');
  const [result, setResult] = useState<'idle' | 'success' | 'fail'>('idle');

  const handleScan = () => {
    setScanning(true);
    setResult('idle');
    setTimeout(() => {
      setScanning(false);
      const success = Math.random() > 0.15;
      if (success) { setResult('success'); setTimeout(onSuccess, 800); }
      else { setResult('fail'); onFail(); }
    }, 3000);
  };

  return (
    <Card className="fade-in border-primary/20 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Fingerprint className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{t('stage2Title')}</CardTitle>
            <CardDescription>{t('stage2Desc')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button variant={scanType === 'fingerprint' ? 'default' : 'outline'} onClick={() => setScanType('fingerprint')}
            className="flex-1 gap-2" disabled={scanning || result === 'success'}>
            <Fingerprint className="w-4 h-4" /> {t('fingerprint')}
          </Button>
          <Button variant={scanType === 'iris' ? 'default' : 'outline'} onClick={() => setScanType('iris')}
            className="flex-1 gap-2" disabled={scanning || result === 'success'}>
            <ScanEye className="w-4 h-4" /> {t('irisScan')}
          </Button>
        </div>

        <div className="relative w-32 h-32 mx-auto">
          <div className={cn('w-full h-full rounded-full border-4 flex items-center justify-center transition-all duration-300',
            scanning && 'border-primary', result === 'success' && 'border-success bg-success/10',
            result === 'fail' && 'border-destructive bg-destructive/10', result === 'idle' && !scanning && 'border-border')}>
            {scanType === 'fingerprint' ? (
              <Fingerprint className={cn('w-16 h-16 transition-colors', scanning ? 'text-primary' : 'text-muted-foreground/40')} />
            ) : (
              <ScanEye className={cn('w-16 h-16 transition-colors', scanning ? 'text-primary' : 'text-muted-foreground/40')} />
            )}
          </div>
          {scanning && (
            <>
              <div className="absolute inset-0 rounded-full border-4 border-primary/50 pulse-ring" />
              <div className="absolute inset-0 overflow-hidden rounded-full"><div className="w-full h-1 bg-primary/60 scan-line" /></div>
            </>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {scanning ? t('scanningHoldStill') : result === 'idle' ? `${t('pressScanBegin')} ${scanType === 'fingerprint' ? t('fingerprint') : t('irisScan')} ${t('capture')}` : ''}
        </p>

        {result === 'fail' && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium fade-in border border-destructive/20">{t('biometricFailed')}</div>
        )}
        {result === 'success' && (
          <div className="p-3 rounded-lg bg-success/10 text-success text-sm font-medium fade-in border border-success/20">{t('biometricSuccess')}</div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="booth" className="flex-1" onClick={handleScan} disabled={scanning || result === 'success'}>
            {scanning ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                {t('scanning')}
              </span>
            ) : result === 'fail' ? t('retryScan') : t('verifyBiometric')}
          </Button>
        </div>

        <div className="pt-2 border-t border-border">
          <button onClick={onSwitchManual} className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2">
            {t('biometricUnavailable')}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
