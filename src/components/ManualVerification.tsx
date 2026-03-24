import { useState } from 'react';
import { UserCheck, Shield, KeyRound, CheckSquare, FileText, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';

interface Props {
  onComplete: (token: string) => void;
  onCancel: () => void;
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

export function ManualVerification({ onComplete, onCancel }: Props) {
  const { t } = useLanguage();
  const [voterId, setVoterId] = useState('');
  const [selectedIdType, setSelectedIdType] = useState<IdType>('voter_id');
  const [idNumber, setIdNumber] = useState('');
  const [photoMatched, setPhotoMatched] = useState(false);
  const [detailsVerified, setDetailsVerified] = useState(false);
  const [approved, setApproved] = useState(false);
  const [processing, setProcessing] = useState(false);

  const selectedIdLabel = t(ID_TYPE_KEYS.find(x => x.value === selectedIdType)!.labelKey as any);

  const handleApprove = () => {
    setProcessing(true);
    setTimeout(() => {
      setApproved(true);
      const token = 'M-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      setTimeout(() => onComplete(token), 1000);
    }, 1500);
  };

  const canApprove = idNumber && photoMatched && detailsVerified;

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
            <FileText className="w-4 h-4 text-primary" /> {t('selectIdType')}
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between h-11 text-base font-medium" disabled={approved}>
                <span className="flex items-center gap-2">{selectedIdLabel}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-64 overflow-y-auto">
              {ID_TYPE_KEYS.map((type) => (
                <DropdownMenuItem key={type.value} onClick={() => setSelectedIdType(type.value)}
                  className={`cursor-pointer ${selectedIdType === type.value ? 'bg-primary/10 text-primary font-medium' : ''}`}>
                  {t(type.labelKey as any)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" /> {selectedIdLabel} {t('number')}
          </label>
          <Input placeholder="Enter ID number" value={idNumber}
            onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
            className="font-mono h-11 uppercase" disabled={approved} />
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
