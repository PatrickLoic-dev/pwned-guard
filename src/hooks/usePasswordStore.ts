import { useState, useEffect, useCallback } from 'react';
import { PasswordEntry, SecurityScore } from '@/types/password';
import { checkPasswordBreach, calculatePasswordStrength } from '@/lib/hibp';

const STORAGE_KEY = 'vault_passwords';

export function usePasswordStore() {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  // Load passwords from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPasswords(parsed.map((p: PasswordEntry) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
          lastChecked: p.lastChecked ? new Date(p.lastChecked) : undefined,
        })));
      } catch (e) {
        console.error('Failed to parse stored passwords:', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save passwords to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(passwords));
    }
  }, [passwords, isLoading]);

  const addPassword = useCallback(async (entry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt' | 'strength' | 'isCompromised' | 'breachCount' | 'lastChecked'>) => {
    const strength = calculatePasswordStrength(entry.password);
    const breachCount = await checkPasswordBreach(entry.password);
    
    const newEntry: PasswordEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      strength: strength.score,
      isCompromised: breachCount > 0,
      breachCount: breachCount >= 0 ? breachCount : 0,
      lastChecked: new Date(),
    };

    setPasswords(prev => [...prev, newEntry]);
    return newEntry;
  }, []);

  const updatePassword = useCallback(async (id: string, updates: Partial<PasswordEntry>) => {
    let strength = undefined;
    let breachCount = undefined;

    if (updates.password) {
      const strengthResult = calculatePasswordStrength(updates.password);
      strength = strengthResult.score;
      breachCount = await checkPasswordBreach(updates.password);
    }

    setPasswords(prev => prev.map(p => {
      if (p.id !== id) return p;
      
      return {
        ...p,
        ...updates,
        updatedAt: new Date(),
        ...(strength !== undefined && { strength }),
        ...(breachCount !== undefined && { 
          isCompromised: breachCount > 0,
          breachCount: breachCount >= 0 ? breachCount : 0,
          lastChecked: new Date(),
        }),
      };
    }));
  }, []);

  const deletePassword = useCallback((id: string) => {
    setPasswords(prev => prev.filter(p => p.id !== id));
  }, []);

  const checkAllPasswords = useCallback(async () => {
    setIsChecking(true);
    
    const updatedPasswords = await Promise.all(
      passwords.map(async (p) => {
        const breachCount = await checkPasswordBreach(p.password);
        return {
          ...p,
          isCompromised: breachCount > 0,
          breachCount: breachCount >= 0 ? breachCount : p.breachCount,
          lastChecked: new Date(),
        };
      })
    );

    setPasswords(updatedPasswords);
    setIsChecking(false);
  }, [passwords]);

  const calculateSecurityScore = useCallback((): SecurityScore => {
    if (passwords.length === 0) {
      return {
        overall: 100,
        strongPasswords: 0,
        weakPasswords: 0,
        compromisedPasswords: 0,
        duplicatePasswords: 0,
        reusedPasswords: 0,
        oldPasswords: 0,
      };
    }

    const strongPasswords = passwords.filter(p => p.strength >= 70).length;
    const weakPasswords = passwords.filter(p => p.strength < 40).length;
    const compromisedPasswords = passwords.filter(p => p.isCompromised).length;

    // Find duplicates
    const passwordCounts = new Map<string, number>();
    passwords.forEach(p => {
      passwordCounts.set(p.password, (passwordCounts.get(p.password) || 0) + 1);
    });
    const duplicatePasswords = Array.from(passwordCounts.values()).filter(c => c > 1).length;
    const reusedPasswords = passwords.filter(p => (passwordCounts.get(p.password) || 0) > 1).length;

    // Old passwords (more than 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const oldPasswords = passwords.filter(p => p.updatedAt < ninetyDaysAgo).length;

    // Calculate overall score
    let overall = 100;
    overall -= (weakPasswords / passwords.length) * 30;
    overall -= (compromisedPasswords / passwords.length) * 40;
    overall -= (reusedPasswords / passwords.length) * 20;
    overall -= (oldPasswords / passwords.length) * 10;
    overall = Math.max(0, Math.min(100, Math.round(overall)));

    return {
      overall,
      strongPasswords,
      weakPasswords,
      compromisedPasswords,
      duplicatePasswords,
      reusedPasswords,
      oldPasswords,
    };
  }, [passwords]);

  const getDuplicateGroups = useCallback((): Map<string, PasswordEntry[]> => {
    const groups = new Map<string, PasswordEntry[]>();
    
    passwords.forEach(p => {
      const existing = groups.get(p.password) || [];
      groups.set(p.password, [...existing, p]);
    });

    // Filter to only groups with duplicates
    const duplicates = new Map<string, PasswordEntry[]>();
    groups.forEach((entries, password) => {
      if (entries.length > 1) {
        duplicates.set(password, entries);
      }
    });

    return duplicates;
  }, [passwords]);

  return {
    passwords,
    isLoading,
    isChecking,
    addPassword,
    updatePassword,
    deletePassword,
    checkAllPasswords,
    calculateSecurityScore,
    getDuplicateGroups,
  };
}
