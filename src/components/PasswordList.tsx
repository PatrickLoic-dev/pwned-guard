import { useState } from 'react';
import { PasswordEntry, categoryLabels, categoryIcons, PasswordCategory } from '@/types/password';
import { calculatePasswordStrength } from '@/lib/hibp';
import { 
  Eye, EyeOff, Copy, Trash2, Edit2, ExternalLink, 
  AlertTriangle, Search, Globe
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
    <div className="space-y-5 animate-fade-in">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search passwords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border h-11"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="shrink-0 h-11"
            >
              {cat === 'all' ? 'All' : `${categoryIcons[cat]}`}
            </Button>
          ))}
        </div>
      </div>

      {/* Password List */}
      {filteredPasswords.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {passwords.length === 0 ? 'No passwords yet' : 'No matches found'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {passwords.length === 0 
              ? 'Add your first password to start building your secure vault'
              : 'Try adjusting your search or filters'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPasswords.map((entry, index) => (
            <PasswordCard
              key={entry.id}
              entry={entry}
              isVisible={visiblePasswords.has(entry.id)}
              onToggleVisibility={() => toggleVisibility(entry.id)}
              onCopy={copyToClipboard}
              onEdit={() => onEdit(entry)}
              onDelete={() => onDelete(entry.id)}
              style={{ animationDelay: `${index * 50}ms` }}
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
  style?: React.CSSProperties;
}

function PasswordCard({ entry, isVisible, onToggleVisibility, onCopy, onEdit, onDelete, style }: PasswordCardProps) {
  const strength = calculatePasswordStrength(entry.password);
  
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
    <div 
      className={`glass-card p-5 transition-all hover:shadow-md animate-fade-in ${entry.isCompromised ? 'ring-1 ring-destructive/30' : ''}`}
      style={style}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
          {entry.category ? categoryIcons[entry.category as PasswordCategory] : '📁'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">{entry.name}</h3>
            {entry.isCompromised && (
              <span className="flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3" />
                Leaked
              </span>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">{entry.username}</p>
          
          {/* Password Field */}
          <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-xl">
            <span className={`flex-1 font-mono text-sm truncate ${isVisible ? '' : 'password-mask'}`}>
              {isVisible ? entry.password : '••••••••••••••••'}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onToggleVisibility}>
              {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => onCopy(entry.password, 'Password')}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          {/* Strength Bar */}
          <div className="mt-3 flex items-center gap-3">
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

          {entry.breachCount > 0 && (
            <p className="mt-2 text-xs text-destructive flex items-center gap-1.5 bg-destructive/5 px-2 py-1.5 rounded-lg w-fit">
              <AlertTriangle className="w-3 h-3" />
              Found in {entry.breachCount.toLocaleString()} data breach{entry.breachCount > 1 ? 'es' : ''}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 shrink-0">
          {entry.url && (
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9"
              onClick={() => window.open(entry.url, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onEdit}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
