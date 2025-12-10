import { useState, useEffect } from 'react';
import { PasswordEntry, categoryLabels, PasswordCategory } from '@/types/password';
import { calculatePasswordStrength, generatePassphrase, generateRandomPassword } from '@/lib/hibp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Eye, EyeOff, RefreshCw, Wand2, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PasswordFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt' | 'strength' | 'isCompromised' | 'breachCount' | 'lastChecked'>) => Promise<void>;
  editEntry?: PasswordEntry | null;
}

export function PasswordForm({ isOpen, onClose, onSubmit, editEntry }: PasswordFormProps) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<PasswordCategory>('other');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatorType, setGeneratorType] = useState<'random' | 'passphrase'>('random');
  const [passwordLength, setPasswordLength] = useState(16);
  const [wordCount, setWordCount] = useState(4);

  const strength = calculatePasswordStrength(password);

  useEffect(() => {
    if (editEntry) {
      setName(editEntry.name);
      setUsername(editEntry.username);
      setPassword(editEntry.password);
      setUrl(editEntry.url || '');
      setNotes(editEntry.notes || '');
      setCategory((editEntry.category as PasswordCategory) || 'other');
    } else {
      resetForm();
    }
  }, [editEntry, isOpen]);

  const resetForm = () => {
    setName('');
    setUsername('');
    setPassword('');
    setUrl('');
    setNotes('');
    setCategory('other');
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name, username, password, url: url || undefined, notes: notes || undefined, category });
      toast.success(editEntry ? 'Password updated' : 'Password added');
      onClose();
      resetForm();
    } catch (error) {
      toast.error('Failed to save password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGeneratePassword = () => {
    if (generatorType === 'random') {
      setPassword(generateRandomPassword(passwordLength));
    } else {
      setPassword(generatePassphrase(wordCount, '-', true));
    }
    setShowPassword(true);
  };

  const copyPassword = async () => {
    if (password) {
      await navigator.clipboard.writeText(password);
      toast.success('Password copied to clipboard');
    }
  };

  const getStrengthColor = () => {
    if (strength.score >= 70) return 'bg-success';
    if (strength.score >= 40) return 'bg-warning';
    return 'bg-destructive';
  };

  const getStrengthTextColor = () => {
    if (strength.score >= 70) return 'text-success';
    if (strength.score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl">{editEntry ? 'Edit Password' : 'Add New Password'}</DialogTitle>
          <DialogDescription>
            {editEntry ? 'Update your password details' : 'Securely store a new password in your vault'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Gmail"
                className="bg-secondary/50 h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as PasswordCategory)}>
                <SelectTrigger className="bg-secondary/50 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username / Email *</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your@email.com"
              className="bg-secondary/50 h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="bg-secondary/50 pr-20 font-mono h-11"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={copyPassword}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Strength Indicator */}
            {password && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${getStrengthColor()}`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${getStrengthTextColor()}`}>
                    {strength.label}
                  </span>
                </div>
                {strength.suggestions.length > 0 && (
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {strength.suggestions.slice(0, 2).map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Generator Section */}
            <div className="p-4 bg-secondary/30 rounded-xl space-y-3 border border-border">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Password Generator</span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={generatorType === 'random' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGeneratorType('random')}
                  className="flex-1"
                >
                  Random
                </Button>
                <Button
                  type="button"
                  variant={generatorType === 'passphrase' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGeneratorType('passphrase')}
                  className="flex-1"
                >
                  Passphrase
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Label className="text-xs shrink-0">
                  {generatorType === 'random' ? 'Length:' : 'Words:'}
                </Label>
                <Input
                  type="number"
                  min={generatorType === 'random' ? 8 : 3}
                  max={generatorType === 'random' ? 64 : 8}
                  value={generatorType === 'random' ? passwordLength : wordCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (generatorType === 'random') {
                      setPasswordLength(Math.max(8, Math.min(64, val)));
                    } else {
                      setWordCount(Math.max(3, Math.min(8, val)));
                    }
                  }}
                  className="w-20 h-9 bg-card"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleGeneratePassword}
                  className="ml-auto"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="bg-secondary/50 h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              className="bg-secondary/50 resize-none"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editEntry ? 'Update' : 'Add Password'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
