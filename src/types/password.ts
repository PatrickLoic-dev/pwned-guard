export interface PasswordEntry {
  id: string;
  name: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
  strength: number;
  isCompromised: boolean;
  breachCount: number;
  lastChecked?: Date;
}

export interface SecurityScore {
  overall: number;
  strongPasswords: number;
  weakPasswords: number;
  compromisedPasswords: number;
  duplicatePasswords: number;
  reusedPasswords: number;
  oldPasswords: number;
}

export type PasswordCategory = 
  | 'social'
  | 'finance'
  | 'work'
  | 'shopping'
  | 'entertainment'
  | 'other';

export const categoryLabels: Record<PasswordCategory, string> = {
  social: 'Social Media',
  finance: 'Finance & Banking',
  work: 'Work & Business',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  other: 'Other',
};

export const categoryIcons: Record<PasswordCategory, string> = {
  social: '👥',
  finance: '💳',
  work: '💼',
  shopping: '🛒',
  entertainment: '🎮',
  other: '📁',
};
