import { useState } from 'react';
import { PasswordEntry, categoryLabels, categoryIcons, PasswordCategory } from '@/types/password';
import { calculatePasswordStrength } from '@/lib/hibp';
import { 
  Eye, EyeOff, Copy, Trash2, Edit2, ExternalLink, 
  AlertTriangle, CheckCircle, Shield, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface PasswordListProps {
  passwords: PasswordEntry[];
  onEdit: (password: PasswordEntry) => void;
  onDelete: (id: string) => void;
}

export function PasswordList({ passwords, onEdit, onDelete }: PasswordListProps) {
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PasswordCategory | 'all'>('all');

  const toggleVisibility = (id: string) => {
    setVisiblePasswords(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const filteredPasswords = passwords.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.url && p.url.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories: (PasswordCategory | 'all')[] = ['all', 'social', 'finance', 'work', 'shopping', 'entertainment', 'other'];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search passwords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50 border-border/50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="shrink-0"
            >
              {cat === 'all' ? '📋 All' : `${categoryIcons[cat]} ${categoryLabels[cat]}`}
            </Button>
          ))}
        </div>
      </div>

      {/* Password List */}
      {filteredPasswords.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {passwords.length === 0 ? 'No passwords yet' : 'No matches found'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {passwords.length === 0 
              ? 'Add your first password to get started'
              : 'Try adjusting your search or filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPasswords.map((entry) => (
            <PasswordCard
              key={entry.id}
              entry={entry}
              isVisible={visiblePasswords.has(entry.id)}
              onToggleVisibility={() => toggleVisibility(entry.id)}
              onCopy={copyToClipboard}
              onEdit={() => onEdit(entry)}
              onDelete={() => onDelete(entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface PasswordCardProps {
  entry: PasswordEntry;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onCopy: (text: string, label: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

function PasswordCard({ entry, isVisible, onToggleVisibility, onCopy, onEdit, onDelete }: PasswordCardProps) {
  const strength = calculatePasswordStrength(entry.password);
  
  const getStrengthColor = () => {
    if (strength.score >= 70) return 'bg-success';
    if (strength.score >= 40) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className={`glass-card p-4 transition-all hover:border-primary/30 ${entry.isCompromised ? 'border-destructive/50' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">
              {entry.category ? categoryIcons[entry.category as PasswordCategory] : '📁'}
            </span>
            <h3 className="font-medium text-foreground truncate">{entry.name}</h3>
            {entry.isCompromised && (
              <span className="flex items-center gap-1 text-xs text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3" />
                Compromised
              </span>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">{entry.username}</p>
          
          <div className="flex items-center gap-2">
            <div className="flex-1 font-mono text-sm bg-secondary/50 rounded px-3 py-2 flex items-center gap-2">
              <span className={isVisible ? '' : 'password-mask'}>
                {isVisible ? entry.password : '••••••••••••'}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={onToggleVisibility}>
              {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onCopy(entry.password, 'Password')}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          {/* Strength Bar */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${getStrengthColor()}`}
                style={{ width: `${strength.score}%` }}
              />
            </div>
            <span className={`text-xs font-medium ${
              strength.score >= 70 ? 'text-success' : 
              strength.score >= 40 ? 'text-warning' : 'text-destructive'
            }`}>
              {strength.label}
            </span>
          </div>

          {entry.breachCount > 0 && (
            <p className="mt-2 text-xs text-destructive flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Found in {entry.breachCount.toLocaleString()} data breach{entry.breachCount > 1 ? 'es' : ''}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          {entry.url && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => window.open(entry.url, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
