import { Shield, RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onAddPassword: () => void;
  onCheckAll: () => void;
  isChecking: boolean;
}

export function Header({ onAddPassword, onCheckAll, isChecking }: HeaderProps) {
  return (
    <header className="glass-card-elevated px-6 py-4 mb-8 sticky top-4 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/25">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">VaultGuard</h1>
            <p className="text-xs text-muted-foreground">Secure Password Manager</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="default"
            onClick={onCheckAll}
            disabled={isChecking}
            className="hidden sm:flex h-10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Check Breaches'}
          </Button>
          <Button onClick={onAddPassword} className="h-10 shadow-lg shadow-primary/25">
            <Plus className="w-4 h-4 mr-2" />
            Add Password
          </Button>
        </div>
      </div>
    </header>
  );
}
