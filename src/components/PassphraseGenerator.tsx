import { useState } from 'react';
import { generatePassphrase, generateRandomPassword, calculatePasswordStrength } from '@/lib/hibp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Copy, RefreshCw, Wand2 } from 'lucide-react';
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

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Wand2 className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Password Generator</h2>
      </div>

      {/* Type Toggle */}
      <div className="flex items-center justify-center gap-4 mb-6 p-2 bg-secondary/50 rounded-lg">
        <Button
          variant={!isPassphrase ? 'default' : 'ghost'}
          onClick={() => setIsPassphrase(false)}
          className="flex-1"
        >
          Random Password
        </Button>
        <Button
          variant={isPassphrase ? 'default' : 'ghost'}
          onClick={() => setIsPassphrase(true)}
          className="flex-1"
        >
          Passphrase
        </Button>
      </div>

      {/* Options */}
      <div className="space-y-4 mb-6">
        {isPassphrase ? (
          <>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Number of Words</Label>
                <span className="text-sm text-muted-foreground">{wordCount}</span>
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

            <div className="space-y-2">
              <Label htmlFor="separator">Separator</Label>
              <div className="flex gap-2">
                {['-', '_', '.', ' '].map((sep) => (
                  <Button
                    key={sep}
                    variant={separator === sep ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSeparator(sep)}
                    className="flex-1"
                  >
                    {sep === ' ' ? 'space' : sep}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include-number">Include Number</Label>
              <Switch
                id="include-number"
                checked={includeNumber}
                onCheckedChange={setIncludeNumber}
              />
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Password Length</Label>
              <span className="text-sm text-muted-foreground">{length} characters</span>
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
      <Button onClick={generate} className="w-full mb-4 glow-primary">
        <RefreshCw className="w-4 h-4 mr-2" />
        Generate {isPassphrase ? 'Passphrase' : 'Password'}
      </Button>

      {/* Result */}
      {generatedPassword && (
        <div className="space-y-3 animate-scale-in">
          <div className="relative">
            <Input
              value={generatedPassword}
              readOnly
              className="font-mono text-lg pr-12 bg-secondary/50"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={copyToClipboard}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          {strength && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${getStrengthColor()}`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
                <span className={`text-sm font-medium ${
                  strength.score >= 70 ? 'text-success' :
                  strength.score >= 40 ? 'text-warning' : 'text-destructive'
                }`}>
                  {strength.score}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Strength: {strength.label}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
