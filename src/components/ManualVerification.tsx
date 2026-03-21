import { useState } from 'react';
import { UserCheck, Shield, KeyRound, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  onComplete: (token: string) => void;
  onCancel: () => void;
}

export function ManualVerification({ onComplete, onCancel }: Props) {
  const { t } = useLanguage();
  const [voterId, setVoterId] = useState('');
  const [secondaryId, setSecondaryId] = useState('');
  const [photoMatched, setPhotoMatched] = useState(false);
  const [detailsVerified, setDetailsVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [approved, setApproved] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleSendOtp = () => setOtpSent(true);
  const handleVerifyOtp = () => { if (otp.length >= 4) setOtpVerified(true); };

  const handleApprove = () => {
    setProcessing(true);
    setTimeout(() => {
      setApproved(true);
      const token = 'M-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      setTimeout(() => onComplete(token), 1000);
    }, 1500);
  };

  const canApprove = voterId.length >= 10 && secondaryId && photoMatched && detailsVerified && otpVerified;

  return (
    <Card className="fade-in border-warning/30 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-warning" />
          </div>
          <div>
            <CardTitle className="text-lg">{t('manualVerifTitle')}</CardTitle>
            <CardDescription>{t('manualVerifDesc')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> {t('voterIdRequired')}
          </label>
          <Input placeholder="e.g., ABC1234567" value={voterId}
            onChange={(e) => setVoterId(e.target.value.toUpperCase().slice(0, 10))}
            className="font-mono h-11 uppercase" disabled={approved} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" /> {t('secondaryId')}
          </label>
          <Select value={secondaryId} onValueChange={setSecondaryId} disabled={approved}>
            <SelectTrigger className="h-11"><SelectValue placeholder={t('selectSecondary')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pan">{t('panCard')}</SelectItem>
              <SelectItem value="driving">{t('drivingLicense')}</SelectItem>
              <SelectItem value="passport">{t('passport')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm font-semibold flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-primary" /> {t('officerVerification')}
          </p>
          <div className="flex items-center gap-3">
            <Checkbox id="photo" checked={photoMatched} onCheckedChange={(v) => setPhotoMatched(!!v)} disabled={approved} />
            <label htmlFor="photo" className="text-sm cursor-pointer">{t('photoMatched')}</label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="details" checked={detailsVerified} onCheckedChange={(v) => setDetailsVerified(!!v)} disabled={approved} />
            <label htmlFor="details" className="text-sm cursor-pointer">{t('detailsVerified')}</label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t('otpVerification')}</label>
          <div className="flex gap-2">
            <Input placeholder={otpSent ? t('enterOtp') : t('sendOtpFirst')} value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="font-mono h-11" disabled={!otpSent || otpVerified || approved} />
            {!otpSent ? (
              <Button variant="booth-outline" onClick={handleSendOtp} className="shrink-0">{t('sendOtp')}</Button>
            ) : !otpVerified ? (
              <Button variant="booth" onClick={handleVerifyOtp} disabled={otp.length < 4} className="shrink-0">{t('verify')}</Button>
            ) : (
              <Button variant="booth-success" disabled className="shrink-0">{t('verified')}</Button>
            )}
          </div>
          {otpSent && !otpVerified && (
            <p className="text-xs text-muted-foreground">{t('mockOtpSent')}</p>
          )}
        </div>

        {approved ? (
          <div className="p-3 rounded-lg bg-success/10 text-success text-sm font-medium fade-in border border-success/20">{t('manualApproved')}</div>
        ) : (
          <div className="flex gap-2 pt-2">
            <Button variant="booth-outline" onClick={onCancel} className="flex-1">{t('cancel')}</Button>
            <Button variant="booth-success" onClick={handleApprove} disabled={!canApprove || processing} className="flex-1">
              {processing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-success-foreground/30 border-t-success-foreground rounded-full animate-spin" />
                  {t('approving')}
                </span>
              ) : t('supervisorApproval')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
