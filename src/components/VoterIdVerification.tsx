import { useState } from 'react';
import { ShieldCheck, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Props {
  onSuccess: () => void;
  onFail: () => void;
  onSwitchManual: () => void;
}

export function VoterIdVerification({ onSuccess, onFail, onSwitchManual }: Props) {
  const [voterId, setVoterId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<'idle' | 'success' | 'fail'>('idle');

  const handleVerify = () => {
    if (!voterId || voterId.length < 10) return;
    setVerifying(true);
    setResult('idle');
    setTimeout(() => {
      setVerifying(false);
      if (voterId.toUpperCase().startsWith('ERR')) {
        setResult('fail');
        onFail();
      } else {
        setResult('success');
        setTimeout(onSuccess, 800);
      }
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
            <CardTitle className="text-lg">Stage 3: Voter ID Verification</CardTitle>
            <CardDescription>Enter or scan the voter's EPIC number</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Voter ID (EPIC Number)</label>
          <Input
            placeholder="e.g., ABC1234567"
            value={voterId}
            onChange={(e) => setVoterId(e.target.value.toUpperCase().slice(0, 10))}
            className="text-center text-lg tracking-widest font-mono h-12 uppercase"
            disabled={verifying || result === 'success'}
          />
        </div>

        <Button variant="booth-outline" className="w-full gap-2" disabled>
          <Upload className="w-4 h-4" /> Upload Voter ID Image
        </Button>

        {result === 'fail' && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium fade-in border border-destructive/20">
            ✗ Voter ID not found in electoral roll.
          </div>
        )}
        {result === 'success' && (
          <div className="p-3 rounded-lg bg-success/10 text-success text-sm font-medium fade-in border border-success/20">
            ✓ Voter ID matched. All verifications complete!
          </div>
        )}

        <Button
          variant="booth"
          className="w-full"
          onClick={handleVerify}
          disabled={voterId.length < 10 || verifying || result === 'success'}
        >
          {verifying ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Verifying...
            </span>
          ) : 'Verify Voter ID'}
        </Button>

        <div className="pt-2 border-t border-border">
          <button
            onClick={onSwitchManual}
            className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
          >
            👉 Switch to Manual Verification
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
