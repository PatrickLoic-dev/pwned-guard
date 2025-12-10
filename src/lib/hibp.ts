// Have I Been Pwned API using k-anonymity
// Only first 5 chars of SHA-1 hash are sent to API

export async function checkPasswordBreach(password: string): Promise<number> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  
  const prefix = hashHex.slice(0, 5);
  const suffix = hashHex.slice(5);
  
  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) {
      throw new Error('HIBP API error');
    }
    
    const text = await response.text();
    const lines = text.split('\n');
    
    for (const line of lines) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix.trim() === suffix) {
        return parseInt(count.trim(), 10);
      }
    }
    
    return 0;
  } catch (error) {
    console.error('Error checking HIBP:', error);
    return -1; // Error state
  }
}

export function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: 'destructive' | 'warning' | 'success';
  suggestions: string[];
} {
  let score = 0;
  const suggestions: string[] = [];
  
  // Length checks
  if (password.length >= 8) score += 20;
  else suggestions.push('Use at least 8 characters');
  
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  
  // Character type checks
  if (/[a-z]/.test(password)) score += 10;
  else suggestions.push('Add lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 10;
  else suggestions.push('Add uppercase letters');
  
  if (/[0-9]/.test(password)) score += 15;
  else suggestions.push('Add numbers');
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  else suggestions.push('Add special characters (!@#$%^&*)');
  
  // Bonus for variety
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) score += 10;
  
  // Penalty for common patterns
  if (/^[a-zA-Z]+$/.test(password)) {
    score -= 10;
    suggestions.push('Avoid using only letters');
  }
  if (/^[0-9]+$/.test(password)) {
    score -= 20;
    suggestions.push('Avoid using only numbers');
  }
  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    suggestions.push('Avoid repeated characters');
  }
  
  score = Math.max(0, Math.min(100, score));
  
  let label: string;
  let color: 'destructive' | 'warning' | 'success';
  
  if (score < 40) {
    label = 'Weak';
    color = 'destructive';
  } else if (score < 70) {
    label = 'Moderate';
    color = 'warning';
  } else {
    label = 'Strong';
    color = 'success';
  }
  
  return { score, label, color, suggestions };
}

// Passphrase generator using word lists
const wordList = [
  'apple', 'brave', 'cloud', 'dance', 'eagle', 'flame', 'grape', 'heart',
  'ivory', 'jewel', 'karma', 'lemon', 'magic', 'noble', 'ocean', 'peace',
  'queen', 'river', 'solar', 'tiger', 'urban', 'violet', 'whale', 'xenon',
  'youth', 'zebra', 'anchor', 'beacon', 'canyon', 'dragon', 'ember', 'forest',
  'garden', 'harbor', 'island', 'jungle', 'knight', 'lantern', 'meadow', 'nexus',
  'oracle', 'phoenix', 'quartz', 'radiant', 'shadow', 'thunder', 'unity', 'vertex',
  'winter', 'aurora', 'blaze', 'cipher', 'delta', 'echo', 'falcon', 'glacier',
  'horizon', 'inferno', 'jasper', 'kinetic', 'lunar', 'matrix', 'nova', 'omega'
];

export function generatePassphrase(wordCount: number = 4, separator: string = '-', includeNumber: boolean = true): string {
  const words: string[] = [];
  const usedIndices = new Set<number>();
  
  while (words.length < wordCount) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      let word = wordList[randomIndex];
      // Capitalize first letter randomly
      if (Math.random() > 0.5) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      words.push(word);
    }
  }
  
  let passphrase = words.join(separator);
  
  if (includeNumber) {
    const randomNum = Math.floor(Math.random() * 100);
    passphrase += separator + randomNum;
  }
  
  return passphrase;
}

export function generateRandomPassword(length: number = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  
  let password = '';
  
  // Ensure at least one of each type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill rest with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
