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

interface BiometricResult {
  status: 'idle' | 'success' | 'fail';
  completed: boolean;
}

export function BiometricVerification({ onSuccess, onFail, onSwitchManual }: Props) {
  const { t } = useLanguage();
  const [scanning, setScanning] = useState(false);
  const [fingerprintResult, setFingerprintResult] = useState<BiometricResult>({ status: 'idle', completed: false });
  const [irisResult, setIrisResult] = useState<BiometricResult>({ status: 'idle', completed: false });
  const [currentPhase, setCurrentPhase] = useState<'fingerprint' | 'iris'>('fingerprint');

  const handleScan = () => {
    setScanning(true);
    const currentResult = currentPhase === 'fingerprint' ? fingerprintResult : irisResult;
    const setCurrentResult = currentPhase === 'fingerprint' ? setFingerprintResult : setIrisResult;

    setCurrentResult({ status: 'idle', completed: false });

    setTimeout(() => {
      setScanning(false);
      const success = Math.random() > 0.15;
      if (success) {
        setCurrentResult({ status: 'success', completed: true });

        // If fingerprint was successful, move to iris
        if (currentPhase === 'fingerprint') {
          setTimeout(() => {
            setCurrentPhase('iris');
          }, 800);
        }
        // If iris was successful, complete biometric verification
        else {
          setTimeout(onSuccess, 800);
        }
      } else {
        setCurrentResult({ status: 'fail', completed: false });
        onFail();
      }
    }, 3000);
  };

  const isAllBiometricsComplete = fingerprintResult.completed && irisResult.completed;
  const currentResult = currentPhase === 'fingerprint' ? fingerprintResult : irisResult;

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
        {/* Biometric Progress Steps */}
        <div className="flex gap-2">
          <div className="flex-1">
            <div className={cn('p-3 rounded-lg border-2 transition-all',
              fingerprintResult.completed ? 'border-success bg-success/10' :
              currentPhase === 'fingerprint' ? 'border-primary bg-primary/10' : 'border-border')}>
              <div className="flex items-center gap-2 mb-1">
                <Fingerprint className="w-4 h-4" />
                <span className="text-sm font-semibold">{t('fingerprint')}</span>
                {fingerprintResult.completed && <span className="text-success ml-auto">✓</span>}
              </div>
              <p className="text-xs text-muted-foreground">
                {fingerprintResult.completed ? t('biometricSuccess') : currentPhase === 'fingerprint' ? t('currentPhase') : t('pending')}
              </p>
            </div>
          </div>
          <div className="flex-1">
            <div className={cn('p-3 rounded-lg border-2 transition-all',
              irisResult.completed ? 'border-success bg-success/10' :
              currentPhase === 'iris' ? 'border-primary bg-primary/10' : 'border-border')}>
              <div className="flex items-center gap-2 mb-1">
                <ScanEye className="w-4 h-4" />
                <span className="text-sm font-semibold">{t('irisScan')}</span>
                {irisResult.completed && <span className="text-success ml-auto">✓</span>}
              </div>
              <p className="text-xs text-muted-foreground">
                {irisResult.completed ? t('biometricSuccess') : currentPhase === 'iris' ? t('currentPhase') : t('pending')}
              </p>
            </div>
          </div>
        </div>

        <div className="relative w-32 h-32 mx-auto">
          <div className={cn('w-full h-full rounded-full border-4 flex items-center justify-center transition-all duration-300',
            scanning && 'border-primary', currentResult.status === 'success' && 'border-success bg-success/10',
            currentResult.status === 'fail' && 'border-destructive bg-destructive/10', currentResult.status === 'idle' && !scanning && 'border-border')}>
            {currentPhase === 'fingerprint' ? (
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
          {scanning ? t('scanningHoldStill') : currentResult.status === 'idle' ? `${t('pressScanBegin')} ${currentPhase === 'fingerprint' ? t('fingerprint') : t('irisScan')} ${t('capture')}` : ''}
        </p>

        {currentResult.status === 'fail' && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium fade-in border border-destructive/20">{t('biometricFailed')}</div>
        )}
        {currentResult.status === 'success' && currentPhase === 'fingerprint' && (
          <div className="p-3 rounded-lg bg-success/10 text-success text-sm font-medium fade-in border border-success/20">{t('fingerprint')} {t('biometricSuccess')} - {t('proceedingIris')}</div>
        )}
        {isAllBiometricsComplete && (
          <div className="p-3 rounded-lg bg-success/10 text-success text-sm font-medium fade-in border border-success/20">{t('allBiometricsSuccess')}</div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="booth" className="flex-1" onClick={handleScan} disabled={scanning || isAllBiometricsComplete}>
            {scanning ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                {t('scanning')}
              </span>
            ) : currentResult.status === 'fail' ? t('retryScan') : t('verifyBiometric')}
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
