/**
 * Split4Us Utility Functions
 * Mobile-optimized versions of web utils
 */

import { ExpenseSplit, SplitType } from './api';

// ==================== SPLIT CALCULATIONS ====================

export interface SplitCalculationResult {
  splits: ExpenseSplit[];
  isValid: boolean;
  error?: string;
}

/**
 * Calculate equal split among participants
 */
export function calculateEqualSplit(
  amount: number,
  participants: string[]
): SplitCalculationResult {
  if (participants.length === 0) {
    return { splits: [], isValid: false, error: 'No participants selected' };
  }

  const perPerson = Math.round((amount / participants.length) * 100) / 100;
  const splits: ExpenseSplit[] = participants.map((userId, index) => ({
    user_id: userId,
    amount: index === 0 
      ? amount - (perPerson * (participants.length - 1)) // First person gets remainder
      : perPerson,
  }));

  return { splits, isValid: true };
}

/**
 * Validate exact amount splits
 */
export function validateExactSplits(
  amount: number,
  splits: ExpenseSplit[]
): SplitCalculationResult {
  const total = splits.reduce((sum, split) => sum + split.amount, 0);
  const diff = Math.abs(total - amount);

  if (diff > 0.01) {
    return {
      splits,
      isValid: false,
      error: `Splits total ${total.toFixed(2)} but expense is ${amount.toFixed(2)}`,
    };
  }

  return { splits, isValid: true };
}

/**
 * Calculate percentage-based splits
 */
export function calculatePercentageSplit(
  amount: number,
  percentages: { user_id: string; percentage: number }[]
): SplitCalculationResult {
  const totalPercentage = percentages.reduce((sum, p) => sum + p.percentage, 0);

  if (Math.abs(totalPercentage - 100) > 0.01) {
    return {
      splits: [],
      isValid: false,
      error: `Percentages must total 100% (currently ${totalPercentage}%)`,
    };
  }

  const splits: ExpenseSplit[] = percentages.map((p, index) => ({
    user_id: p.user_id,
    amount: index === 0
      ? amount - percentages.slice(1).reduce((sum, pp) => sum + (amount * pp.percentage / 100), 0)
      : Math.round((amount * p.percentage / 100) * 100) / 100,
    percentage: p.percentage,
  }));

  return { splits, isValid: true };
}

/**
 * Calculate share-based splits
 */
export function calculateShareSplit(
  amount: number,
  shares: { user_id: string; shares: number }[]
): SplitCalculationResult {
  const totalShares = shares.reduce((sum, s) => sum + s.shares, 0);

  if (totalShares === 0) {
    return { splits: [], isValid: false, error: 'Total shares must be greater than 0' };
  }

  const splits: ExpenseSplit[] = shares.map((s, index) => ({
    user_id: s.user_id,
    amount: index === 0
      ? amount - shares.slice(1).reduce((sum, ss) => sum + (amount * ss.shares / totalShares), 0)
      : Math.round((amount * s.shares / totalShares) * 100) / 100,
    shares: s.shares,
  }));

  return { splits, isValid: true };
}

// ==================== FORMATTING ====================

/**
 * Format amount with currency
 */
export function formatAmount(amount: number, currency: string = 'SEK'): string {
  const formatted = new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return formatted;
}

/**
 * Format compact amount (for lists)
 */
export function formatCompactAmount(amount: number, currency: string = 'SEK'): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  if (abs >= 1000000) {
    return `${sign}${(abs / 1000000).toFixed(1)}M ${currency}`;
  }
  if (abs >= 1000) {
    return `${sign}${(abs / 1000).toFixed(1)}k ${currency}`;
  }
  return formatAmount(amount, currency);
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(d);
}

/**
 * Get user initials from name or email
 */
export function getUserInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return '??';
}

/**
 * Get user display name
 */
export function getUserDisplayName(user?: { full_name?: string; email: string }): string {
  if (!user) return 'Unknown';
  return user.full_name || user.email.split('@')[0];
}

// ==================== CATEGORIES ====================

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Mat & Dryck', icon: '🍕', color: '#FF6B6B' },
  { id: 'transport', name: 'Transport', icon: '🚗', color: '#4ECDC4' },
  { id: 'accommodation', name: 'Boende', icon: '🏠', color: '#45B7D1' },
  { id: 'entertainment', name: 'Nöje', icon: '🎬', color: '#96CEB4' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#FFEAA7' },
  { id: 'utilities', name: 'Räkningar', icon: '💡', color: '#DFE6E9' },
  { id: 'groceries', name: 'Matvaror', icon: '🛒', color: '#74B9FF' },
  { id: 'health', name: 'Hälsa', icon: '💊', color: '#FD79A8' },
  { id: 'other', name: 'Övrigt', icon: '📦', color: '#A29BFE' },
];

export function getCategoryById(id: string): Category {
  return EXPENSE_CATEGORIES.find(c => c.id === id) || EXPENSE_CATEGORIES[8]; // Default to 'other'
}

// ==================== VALIDATION ====================

/**
 * Validate expense amount
 */
export function validateAmount(amount: string): { isValid: boolean; error?: string; value?: number } {
  const cleaned = amount.replace(/[^\d,.-]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);

  if (isNaN(num)) {
    return { isValid: false, error: 'Invalid amount' };
  }
  if (num <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }
  if (num > 1000000) {
    return { isValid: false, error: 'Amount too large' };
  }

  return { isValid: true, value: Math.round(num * 100) / 100 };
}

/**
 * Validate group name
 */
export function validateGroupName(name: string): { isValid: boolean; error?: string } {
  const trimmed = name.trim();
  
  if (trimmed.length === 0) {
    return { isValid: false, error: 'Group name is required' };
  }
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Group name must be at least 3 characters' };
  }
  if (trimmed.length > 100) {
    return { isValid: false, error: 'Group name is too long' };
  }

  return { isValid: true };
}

/**
 * Validate email
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email address' };
  }

  return { isValid: true };
}

// ==================== COLOR UTILS ====================

/**
 * Generate consistent color from string (for avatars)
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 50%)`;
}

/**
 * Get balance color (red for negative, green for positive)
 */
export function getBalanceColor(balance: number): string {
  if (balance > 0.01) return '#10B981'; // Green
  if (balance < -0.01) return '#EF4444'; // Red
  return '#6B7280'; // Gray (balanced)
}
