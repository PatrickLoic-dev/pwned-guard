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

  const getScoreRingColor = (value: number) => {
    if (value >= 70) return 'from-success to-emerald-400';
    if (value >= 40) return 'from-warning to-amber-400';
    return 'from-destructive to-red-400';
  };

  const getScoreLabel = (value: number) => {
    if (value >= 80) return 'Excellent';
    if (value >= 60) return 'Good';
    if (value >= 40) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div className="glass-card-elevated p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Score Circle */}
        <div className="relative shrink-0">
          <div className="w-36 h-36 rounded-full p-1 bg-gradient-to-br from-primary/20 to-blue-500/20">
            <div 
              className="w-full h-full rounded-full flex items-center justify-center relative"
              style={{
                background: `conic-gradient(
                  hsl(var(--${score.overall >= 70 ? 'success' : score.overall >= 40 ? 'warning' : 'destructive'})) ${score.overall * 3.6}deg,
                  hsl(var(--muted)) ${score.overall * 3.6}deg
                )`,
              }}
            >
              <div className="absolute inset-2 rounded-full bg-card flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${getScoreColor(score.overall)}`}>
                  {score.overall}
                </span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">
                  {getScoreLabel(score.overall)}
                </span>
              </div>
            </div>
          </div>
          <div className={`absolute -bottom-1 -right-1 p-2 rounded-full bg-card shadow-md ${getScoreColor(score.overall)}`}>
            <Shield className="w-5 h-5" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex-1 w-full grid grid-cols-2 gap-3">
          <StatItem
            icon={<CheckCircle className="w-5 h-5 text-success" />}
            label="Strong"
            value={score.strongPasswords}
            total={totalPasswords}
            bgColor="bg-success/10"
          />
          <StatItem
            icon={<XCircle className="w-5 h-5 text-destructive" />}
            label="Weak"
            value={score.weakPasswords}
            total={totalPasswords}
            bgColor="bg-destructive/10"
          />
          <StatItem
            icon={<AlertTriangle className="w-5 h-5 text-destructive" />}
            label="Compromised"
            value={score.compromisedPasswords}
            total={totalPasswords}
            bgColor="bg-destructive/10"
          />
          <StatItem
            icon={<Copy className="w-5 h-5 text-warning" />}
            label="Reused"
            value={score.reusedPasswords}
            total={totalPasswords}
            bgColor="bg-warning/10"
          />
        </div>
      </div>

      {/* Recommendations */}
      {(score.compromisedPasswords > 0 || score.weakPasswords > 0 || score.reusedPasswords > 0) && (
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground mb-3">Recommendations</h4>
          <div className="space-y-2">
            {score.compromisedPasswords > 0 && (
              <RecommendationItem
                icon={<AlertTriangle className="w-4 h-4" />}
                text={`Change ${score.compromisedPasswords} compromised password${score.compromisedPasswords > 1 ? 's' : ''} immediately`}
                variant="destructive"
              />
            )}
            {score.weakPasswords > 0 && (
              <RecommendationItem
                icon={<XCircle className="w-4 h-4" />}
                text={`Strengthen ${score.weakPasswords} weak password${score.weakPasswords > 1 ? 's' : ''}`}
                variant="warning"
              />
            )}
            {score.reusedPasswords > 0 && (
              <RecommendationItem
                icon={<Copy className="w-4 h-4" />}
                text={`${score.reusedPasswords} password${score.reusedPasswords > 1 ? 's are' : ' is'} reused across sites`}
                variant="warning"
              />
            )}
            {score.oldPasswords > 0 && (
              <RecommendationItem
                icon={<Clock className="w-4 h-4" />}
                text={`${score.oldPasswords} password${score.oldPasswords > 1 ? 's haven\'t' : ' hasn\'t'} been updated in 90+ days`}
                variant="muted"
              />
            )}
          </div>
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
  bgColor: string;
}

function StatItem({ icon, label, value, bgColor }: StatItemProps) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl ${bgColor} transition-all`}>
      <div className="p-2 rounded-lg bg-card shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

interface RecommendationItemProps {
  icon: React.ReactNode;
  text: string;
  variant: 'destructive' | 'warning' | 'muted';
}

function RecommendationItem({ icon, text, variant }: RecommendationItemProps) {
  const colors = {
    destructive: 'text-destructive bg-destructive/5',
    warning: 'text-warning bg-warning/5',
    muted: 'text-muted-foreground bg-muted',
  };

  return (
    <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${colors[variant]}`}>
      {icon}
      <span>{text}</span>
    </div>
  );
}
