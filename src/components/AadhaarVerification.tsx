import { useState, useRef, useCallback } from 'react';
import { CreditCard, Keyboard, ChevronDown, FileText, TriangleAlert as AlertTriangle, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';

const MAX_ID_ATTEMPTS = 3;

interface Props {
  onSuccess: () => void;
  onFail: () => void;
  onSwitchManual: () => void;
}

const ID_TYPE_KEYS = [
  { value: 'voter_id', labelKey: 'voterId' },
  { value: 'aadhaar', labelKey: 'aadhaarCard' },
  { value: 'pan', labelKey: 'panCard' },
  { value: 'driving_license', labelKey: 'drivingLicense' },
  { value: 'passport', labelKey: 'passport' },
  { value: 'mgnrega', labelKey: 'mgnregaCard' },
  { value: 'smart_card', labelKey: 'smartCard' },
  { value: 'health_insurance', labelKey: 'healthInsurance' },
  { value: 'service_id', labelKey: 'serviceId' },
  { value: 'pension', labelKey: 'pensionDoc' },
  { value: 'passbook', labelKey: 'passbook' },
  { value: 'transgender_certificate', labelKey: 'transgenderCertificate' },
] as const;

type IdType = typeof ID_TYPE_KEYS[number]['value'];

function playAlarmBeep() {
  try {
    const ctx = new AudioContext();
    [0, 0.25, 0.5].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.value = 880;
      gain.gain.value = 0.3;
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.15);
    });
  } catch {
    // Audio not supported
  }
}

export function AadhaarVerification({ onSuccess, onFail, onSwitchManual }: Props) {
  const { t } = useLanguage();
  const [selectedIdType, setSelectedIdType] = useState<IdType>('voter_id');
  const [idNumber, setIdNumber] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<'idle' | 'success' | 'fail'>('idle');
  const [mode, setMode] = useState<'scan' | 'manual'>('scan');
  const [scanning, setScanning] = useState(false);
  const [failAttempts, setFailAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const alarmPlayedRef = useRef(false);

  const selectedLabel = t(ID_TYPE_KEYS.find(x => x.value === selectedIdType)!.labelKey as any);

  const triggerLockout = useCallback(() => {
    setLocked(true);
    if (!alarmPlayedRef.current) {
      alarmPlayedRef.current = true;
      playAlarmBeep();
    }
  }, []);

  const startHardwareScan = () => {
    if (locked) return;
    setScanning(true);
    setResult('idle');

    setTimeout(() => {
      const randomSuccess = Math.random() > 0.3;
      const scannedId = randomSuccess
        ? 'ID' + Math.random().toString(36).substring(2, 9).toUpperCase()
        : '0' + Math.random().toString(36).substring(2, 8).toUpperCase();

      setIdNumber(scannedId);
      setScanning(false);
      handleVerifyWithValue(scannedId);
    }, 2000);
  };

  const handleVerifyWithValue = (value: string) => {
    if (value.trim().length < 4 || locked) return;
    setVerifying(true); setResult('idle');
    setTimeout(() => {
      setVerifying(false);
      if (value.startsWith('0')) {
        setResult('fail');
        const newAttempts = failAttempts + 1;
        setFailAttempts(newAttempts);
        if (newAttempts >= MAX_ID_ATTEMPTS) {
          triggerLockout();
        }
        onFail();
      } else {
        setResult('success');
        setTimeout(onSuccess, 800);
      }
    }, 2000);
  };

  const handleVerify = () => handleVerifyWithValue(idNumber);

  const handleIdTypeChange = (type: IdType) => {
    if (locked) return;
    setSelectedIdType(type); setIdNumber(''); setResult('idle');
  };

  const placeholder = selectedIdType === 'voter_id' ? 'VTRXXXXXX' :
    selectedIdType === 'aadhaar' ? 'XXXX XXXX XXXX' :
    selectedIdType === 'pan' ? 'ABCDE1234F' :
    selectedIdType === 'passport' ? 'A1234567' :
    selectedIdType === 'driving_license' ? 'DL-0420110012345' : 'Enter ID number';

  const formatValue = (v: string) => {
    if (selectedIdType === 'aadhaar') {
      const digits = v.replace(/\D/g, '').slice(0, 12);
      return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    return v;
  };

  const isValidLength = selectedIdType === 'voter_id'
    ? idNumber.trim().length >= 6
    : selectedIdType === 'aadhaar'
    ? idNumber.replace(/\s/g, '').length >= 12
    : idNumber.trim().length >= 4;

  if (locked) {
    return (
      <Card className="fade-in border-destructive/40 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-lg text-destructive">{t('stage1Title')}</CardTitle>
              <CardDescription>{t('stage1Desc')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 rounded-xl bg-destructive/10 border-2 border-destructive/30 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto animate-pulse">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <p className="text-destructive font-semibold text-lg">{t('idAttemptsExhausted')}</p>
            <Button variant="booth-destructive" className="gap-2" onClick={onSwitchManual}>
              {t('proceedToManualDesk')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fade-in border-primary/20 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{t('stage1Title')}</CardTitle>
            <CardDescription>{t('stage1Desc')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t('selectIdType')}</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between h-12 text-base font-medium" disabled={verifying || result === 'success'}>
                <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-muted-foreground" />{selectedLabel}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-64 overflow-y-auto">
              {ID_TYPE_KEYS.map((type) => (
                <DropdownMenuItem key={type.value} onClick={() => handleIdTypeChange(type.value)}
                  className={`cursor-pointer ${selectedIdType === type.value ? 'bg-primary/10 text-primary font-medium' : ''}`}>
                  {t(type.labelKey as any)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {mode === 'scan' && (
          <div className="space-y-3">
            {!scanning && !idNumber && result === 'idle' && (
              <div className="p-6 rounded-xl bg-primary/5 border-2 border-primary/20 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Scan className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-left space-y-1">
                    <p className="text-sm font-semibold text-foreground">Hardware Scanner Ready</p>
                    <p className="text-xs text-muted-foreground">Please scan your ID using the connected hardware scanner</p>
                  </div>
                </div>
                <Button variant="booth" className="gap-2 w-full" onClick={startHardwareScan} disabled={verifying}>
                  <Scan className="w-5 h-5" /> Initiate Hardware Scan
                </Button>
              </div>
            )}
            {scanning && (
              <div className="p-6 rounded-xl bg-primary/5 border-2 border-primary/30 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 animate-pulse">
                    <Scan className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-left space-y-1">
                    <p className="text-sm font-semibold text-foreground">Scanning in Progress...</p>
                    <p className="text-xs text-muted-foreground">Please wait while the hardware scanner processes your ID</p>
                  </div>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'manual' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{selectedLabel}</label>
            <Input placeholder={placeholder} value={idNumber} onChange={(e) => setIdNumber(formatValue(e.target.value))}
              className="text-center text-lg tracking-widest font-mono h-12"
              maxLength={selectedIdType === 'aadhaar' ? 14 : 30} disabled={verifying || result === 'success'} autoFocus />
          </div>
        )}

        {mode === 'scan' && idNumber && !scanning && result === 'idle' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Scanned {selectedLabel}</label>
            <div className="text-center text-lg tracking-widest font-mono h-12 flex items-center justify-center rounded-md border border-input bg-muted/50">{idNumber}</div>
          </div>
        )}

        {mode === 'scan' && idNumber && !scanning && result === 'success' && (
          <div className="p-4 rounded-xl bg-success/10 border-2 border-success/20 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                <Scan className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-semibold text-success">ID Scan Successful</p>
                <p className="text-xs text-muted-foreground">Valid ID detected and verified</p>
              </div>
            </div>
            <div className="text-center text-lg tracking-widest font-mono h-10 flex items-center justify-center rounded-md border border-success/30 bg-success/5">{idNumber}</div>
          </div>
        )}

        {mode === 'scan' && idNumber && !scanning && result === 'fail' && (
          <div className="p-4 rounded-xl bg-destructive/10 border-2 border-destructive/20 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-semibold text-destructive">Scan Failed. Please try again.</p>
                <p className="text-xs text-muted-foreground">Invalid or unreadable ID</p>
              </div>
            </div>
          </div>
        )}

        {/* Attempt counter */}
        {result === 'fail' && failAttempts > 0 && (
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-warning font-medium">
              {failAttempts}/{MAX_ID_ATTEMPTS}
            </span>
            <span className="text-muted-foreground">— {MAX_ID_ATTEMPTS - failAttempts} {t('attemptsRemaining')}</span>
          </div>
        )}

        {mode === 'manual' && result === 'fail' && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium fade-in border border-destructive/20">
            ✗ {selectedLabel} {t('verificationFailed')}
          </div>
        )}
        {mode === 'manual' && result === 'success' && (
          <div className="p-3 rounded-lg bg-success/10 text-success text-sm font-medium fade-in border border-success/20">
            ✓ {selectedLabel} {t('verifiedSuccess')}
          </div>
        )}

        {(mode === 'manual' || (mode === 'scan' && idNumber && !scanning)) && result === 'idle' && (
          <Button variant="booth" className="w-full" onClick={handleVerify} disabled={!isValidLength || verifying}>
            {verifying ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                {t('verifying')}
              </span>
            ) : `${t('verify')} ${selectedLabel}`}
          </Button>
        )}

        {result === 'idle' && !verifying && !scanning && (
          <div className="pt-2 border-t border-border">
            <button onClick={() => { setMode(mode === 'scan' ? 'manual' : 'scan'); setIdNumber(''); }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
              {mode === 'scan' ? (<><Keyboard className="w-3.5 h-3.5" /> {t('enterIdManually')}</>) : (<><Scan className="w-3.5 h-3.5" /> Use Hardware Scanner</>)}
            </button>
          </div>
        )}

        {result === 'fail' && !scanning && mode === 'scan' && (
          <div className="pt-2">
            <Button variant="booth-outline" className="w-full gap-2" onClick={() => { setIdNumber(''); setResult('idle'); }}>
              <Scan className="w-4 h-4" /> Retry Hardware Scan
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}