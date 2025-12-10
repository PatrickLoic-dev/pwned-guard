import { SecurityScore } from '@/types/password';
import { Shield, AlertTriangle, Copy, Clock, CheckCircle, XCircle } from 'lucide-react';

interface SecurityScoreCardProps {
  score: SecurityScore;
  totalPasswords: number;
}

export function SecurityScoreCard({ score, totalPasswords }: SecurityScoreCardProps) {
  const getScoreColor = (value: number) => {
    if (value >= 70) return 'text-success';
    if (value >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreGlow = (value: number) => {
    if (value >= 70) return 'glow-success';
    if (value >= 40) return '';
    return 'glow-destructive';
  };

  const getScoreLabel = (value: number) => {
    if (value >= 80) return 'Excellent';
    if (value >= 60) return 'Good';
    if (value >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-start gap-6">
        {/* Score Circle */}
        <div className="relative">
          <div 
            className={`w-32 h-32 rounded-full flex items-center justify-center ${getScoreGlow(score.overall)}`}
            style={{
              background: `conic-gradient(
                hsl(var(--${score.overall >= 70 ? 'success' : score.overall >= 40 ? 'warning' : 'destructive'})) ${score.overall * 3.6}deg,
                hsl(var(--muted)) ${score.overall * 3.6}deg
              )`,
              padding: '4px',
            }}
          >
            <div className="w-full h-full rounded-full bg-card flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${getScoreColor(score.overall)}`}>
                {score.overall}
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {getScoreLabel(score.overall)}
              </span>
            </div>
          </div>
          <Shield className={`absolute -bottom-1 -right-1 w-8 h-8 ${getScoreColor(score.overall)}`} />
        </div>

        {/* Stats Grid */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          <StatItem
            icon={<CheckCircle className="w-4 h-4 text-success" />}
            label="Strong"
            value={score.strongPasswords}
            total={totalPasswords}
            variant="success"
          />
          <StatItem
            icon={<XCircle className="w-4 h-4 text-destructive" />}
            label="Weak"
            value={score.weakPasswords}
            total={totalPasswords}
            variant="destructive"
          />
          <StatItem
            icon={<AlertTriangle className="w-4 h-4 text-destructive" />}
            label="Compromised"
            value={score.compromisedPasswords}
            total={totalPasswords}
            variant="destructive"
          />
          <StatItem
            icon={<Copy className="w-4 h-4 text-warning" />}
            label="Reused"
            value={score.reusedPasswords}
            total={totalPasswords}
            variant="warning"
          />
        </div>
      </div>

      {/* Recommendations */}
      {(score.compromisedPasswords > 0 || score.weakPasswords > 0 || score.reusedPasswords > 0) && (
        <div className="mt-6 pt-4 border-t border-border/50">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Recommendations</h4>
          <ul className="space-y-1">
            {score.compromisedPasswords > 0 && (
              <li className="text-sm text-destructive flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" />
                Change {score.compromisedPasswords} compromised password{score.compromisedPasswords > 1 ? 's' : ''} immediately
              </li>
            )}
            {score.weakPasswords > 0 && (
              <li className="text-sm text-warning flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" />
                Strengthen {score.weakPasswords} weak password{score.weakPasswords > 1 ? 's' : ''}
              </li>
            )}
            {score.reusedPasswords > 0 && (
              <li className="text-sm text-warning flex items-center gap-2">
                <Copy className="w-3 h-3" />
                {score.reusedPasswords} password{score.reusedPasswords > 1 ? 's are' : ' is'} reused across sites
              </li>
            )}
            {score.oldPasswords > 0 && (
              <li className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-3 h-3" />
                {score.oldPasswords} password{score.oldPasswords > 1 ? 's haven\'t' : ' hasn\'t'} been updated in 90+ days
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  total: number;
  variant: 'success' | 'warning' | 'destructive';
}

function StatItem({ icon, label, value, total }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
      {icon}
      <div>
        <p className="text-lg font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
