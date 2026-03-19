import { useState } from 'react';
import { UserCheck, Shield, KeyRound, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  onComplete: (token: string) => void;
  onCancel: () => void;
}

export function ManualVerification({ onComplete, onCancel }: Props) {
  const [voterId, setVoterId] = useState('');
  const [secondaryId, setSecondaryId] = useState('');
  const [photoMatched, setPhotoMatched] = useState(false);
  const [detailsVerified, setDetailsVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [approved, setApproved] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleSendOtp = () => {
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (otp.length >= 4) setOtpVerified(true);
  };

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
            <CardTitle className="text-lg">Manual Verification</CardTitle>
            <CardDescription>Fallback verification when Aadhaar/biometric is unavailable</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Voter ID */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Voter ID (Required)
          </label>
          <Input
            placeholder="e.g., ABC1234567"
            value={voterId}
            onChange={(e) => setVoterId(e.target.value.toUpperCase().slice(0, 10))}
            className="font-mono h-11 uppercase"
            disabled={approved}
          />
        </div>

        {/* Secondary ID */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" /> Secondary ID
          </label>
          <Select value={secondaryId} onValueChange={setSecondaryId} disabled={approved}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select secondary identification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pan">PAN Card</SelectItem>
              <SelectItem value="driving">Driving License</SelectItem>
              <SelectItem value="passport">Passport</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Officer checks */}
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm font-semibold flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-primary" /> Officer Verification
          </p>
          <div className="flex items-center gap-3">
            <Checkbox id="photo" checked={photoMatched} onCheckedChange={(v) => setPhotoMatched(!!v)} disabled={approved} />
            <label htmlFor="photo" className="text-sm cursor-pointer">Photo matched with voter</label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="details" checked={detailsVerified} onCheckedChange={(v) => setDetailsVerified(!!v)} disabled={approved} />
            <label htmlFor="details" className="text-sm cursor-pointer">Personal details verified</label>
          </div>
        </div>

        {/* OTP */}
        <div className="space-y-2">
          <label className="text-sm font-medium">OTP Verification</label>
          <div className="flex gap-2">
            <Input
              placeholder={otpSent ? 'Enter OTP' : 'Send OTP first'}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="font-mono h-11"
              disabled={!otpSent || otpVerified || approved}
            />
            {!otpSent ? (
              <Button variant="booth-outline" onClick={handleSendOtp} className="shrink-0">Send OTP</Button>
            ) : !otpVerified ? (
              <Button variant="booth" onClick={handleVerifyOtp} disabled={otp.length < 4} className="shrink-0">Verify</Button>
            ) : (
              <Button variant="booth-success" disabled className="shrink-0">✓ Verified</Button>
            )}
          </div>
          {otpSent && !otpVerified && (
            <p className="text-xs text-muted-foreground">Mock OTP sent to registered mobile. Enter any 4+ digits.</p>
          )}
        </div>

        {/* Approve */}
        {approved ? (
          <div className="p-3 rounded-lg bg-success/10 text-success text-sm font-medium fade-in border border-success/20">
            ✓ Manual verification approved. Generating token...
          </div>
        ) : (
          <div className="flex gap-2 pt-2">
            <Button variant="booth-outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="booth-success"
              onClick={handleApprove}
              disabled={!canApprove || processing}
              className="flex-1"
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-success-foreground/30 border-t-success-foreground rounded-full animate-spin" />
                  Approving...
                </span>
              ) : '🛡 Supervisor Approval'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
