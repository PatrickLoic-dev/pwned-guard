import { useState } from 'react';
import { generatePassphrase, generateRandomPassword, calculatePasswordStrength } from '@/lib/hibp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Copy, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function PassphraseGenerator() {
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [isPassphrase, setIsPassphrase] = useState(true);
  const [length, setLength] = useState(16);
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState('-');
  const [includeNumber, setIncludeNumber] = useState(true);

  const strength = generatedPassword ? calculatePasswordStrength(generatedPassword) : null;

  const generate = () => {
    if (isPassphrase) {
      setGeneratedPassword(generatePassphrase(wordCount, separator, includeNumber));
    } else {
      setGeneratedPassword(generateRandomPassword(length));
    }
  };

  const copyToClipboard = async () => {
    if (generatedPassword) {
      await navigator.clipboard.writeText(generatedPassword);
      toast.success('Copied to clipboard');
    }
  };

  const getStrengthColor = () => {
    if (!strength) return '';
    if (strength.score >= 70) return 'bg-success';
    if (strength.score >= 40) return 'bg-warning';
    return 'bg-destructive';
  };

  const getStrengthTextColor = () => {
    if (!strength) return '';
    if (strength.score >= 70) return 'text-success';
    if (strength.score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-primary/10">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Password Generator</h2>
          <p className="text-xs text-muted-foreground">Create strong, unique passwords</p>
        </div>
      </div>

      {/* Type Toggle */}
      <div className="flex items-center gap-2 mb-6 p-1 bg-secondary rounded-xl">
        <Button
          variant={!isPassphrase ? 'default' : 'ghost'}
          onClick={() => setIsPassphrase(false)}
          className="flex-1 h-10"
        >
          Random
        </Button>
        <Button
          variant={isPassphrase ? 'default' : 'ghost'}
          onClick={() => setIsPassphrase(true)}
          className="flex-1 h-10"
        >
          Passphrase
        </Button>
      </div>

      {/* Options */}
      <div className="space-y-5 mb-6">
        {isPassphrase ? (
          <>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-sm">Number of Words</Label>
                <span className="text-sm font-medium text-primary">{wordCount}</span>
              </div>
              <Slider
                value={[wordCount]}
                onValueChange={([v]) => setWordCount(v)}
                min={3}
                max={8}
                step={1}
                className="py-2"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm">Separator</Label>
              <div className="grid grid-cols-4 gap-2">
                {['-', '_', '.', ' '].map((sep) => (
                  <Button
                    key={sep}
                    variant={separator === sep ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSeparator(sep)}
                    className="h-10"
                  >
                    {sep === ' ' ? 'space' : sep}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
              <Label htmlFor="include-number" className="text-sm cursor-pointer">Include Number</Label>
              <Switch
                id="include-number"
                checked={includeNumber}
                onCheckedChange={setIncludeNumber}
              />
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-sm">Password Length</Label>
              <span className="text-sm font-medium text-primary">{length} characters</span>
            </div>
            <Slider
              value={[length]}
              onValueChange={([v]) => setLength(v)}
              min={8}
              max={64}
              step={1}
              className="py-2"
            />
          </div>
        )}
      </div>

      {/* Generate Button */}
      <Button onClick={generate} className="w-full h-12 text-base mb-5">
        <RefreshCw className="w-4 h-4 mr-2" />
        Generate {isPassphrase ? 'Passphrase' : 'Password'}
      </Button>

      {/* Result */}
      {generatedPassword && (
        <div className="space-y-4 animate-scale-in">
          <div className="relative">
            <Input
              value={generatedPassword}
              readOnly
              className="font-mono text-base pr-12 bg-secondary/50 h-12"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10"
              onClick={copyToClipboard}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          {strength && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${getStrengthColor()}`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
                <span className={`text-sm font-semibold ${getStrengthTextColor()}`}>
                  {strength.score}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Strength: <span className="font-medium">{strength.label}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
