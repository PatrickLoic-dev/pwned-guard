import { Shield, RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onAddPassword: () => void;
  onCheckAll: () => void;
  isChecking: boolean;
}

export function Header({ onAddPassword, onCheckAll, isChecking }: HeaderProps) {
  return (
    <header className="glass-card px-6 py-4 mb-6 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 glow-primary">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">VaultGuard</h1>
            <p className="text-xs text-muted-foreground">Secure Password Manager</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCheckAll}
            disabled={isChecking}
            className="hidden sm:flex"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Check All'}
          </Button>
          <Button onClick={onAddPassword} className="glow-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Password
          </Button>
        </div>
      </div>
    </header>
  );
}
