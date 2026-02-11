/**
 * Split4Us Utils - Unit Tests
 *
 * Tests for split calculations, formatting, and validation
 */

import {
  calculateEqualSplit,
  validateExactSplits,
  calculatePercentageSplit,
  calculateShareSplit,
  formatAmount,
  formatCompactAmount,
  formatDate,
  formatRelativeTime,
  getUserInitials,
  getUserDisplayName,
  validateAmount,
  validateGroupName,
  validateEmail,
  getCategoryById,
  stringToColor,
  getBalanceColor,
} from '../lib/split4us/utils';

// ==================== SPLIT CALCULATIONS ====================

describe('calculateEqualSplit', () => {
  it('should split equally among participants', () => {
    const result = calculateEqualSplit(100, ['user1', 'user2']);
    expect(result.isValid).toBe(true);
    expect(result.splits).toHaveLength(2);
    expect(result.splits[0].amount + result.splits[1].amount).toBeCloseTo(100);
  });

  it('should handle remainder correctly for 3-way split', () => {
    const result = calculateEqualSplit(100, ['u1', 'u2', 'u3']);
    expect(result.isValid).toBe(true);
    const total = result.splits.reduce((sum, s) => sum + s.amount, 0);
    expect(total).toBeCloseTo(100, 2);
  });

  it('should return error for empty participants', () => {
    const result = calculateEqualSplit(100, []);
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should handle single participant', () => {
    const result = calculateEqualSplit(50, ['user1']);
    expect(result.isValid).toBe(true);
    expect(result.splits[0].amount).toBe(50);
  });
});

describe('validateExactSplits', () => {
  it('should validate when splits match amount', () => {
    const result = validateExactSplits(100, [
      { user_id: 'u1', amount: 60 },
      { user_id: 'u2', amount: 40 },
    ]);
    expect(result.isValid).toBe(true);
  });

  it('should reject when splits dont match', () => {
    const result = validateExactSplits(100, [
      { user_id: 'u1', amount: 60 },
      { user_id: 'u2', amount: 30 },
    ]);
    expect(result.isValid).toBe(false);
  });
});

describe('calculatePercentageSplit', () => {
  it('should split by percentage', () => {
    const result = calculatePercentageSplit(200, [
      { user_id: 'u1', percentage: 60 },
      { user_id: 'u2', percentage: 40 },
    ]);
    expect(result.isValid).toBe(true);
    const total = result.splits.reduce((sum, s) => sum + s.amount, 0);
    expect(total).toBeCloseTo(200, 2);
  });

  it('should reject when percentages dont total 100', () => {
    const result = calculatePercentageSplit(100, [
      { user_id: 'u1', percentage: 50 },
      { user_id: 'u2', percentage: 30 },
    ]);
    expect(result.isValid).toBe(false);
  });
});

describe('calculateShareSplit', () => {
  it('should split by shares', () => {
    const result = calculateShareSplit(300, [
      { user_id: 'u1', shares: 2 },
      { user_id: 'u2', shares: 1 },
    ]);
    expect(result.isValid).toBe(true);
    const total = result.splits.reduce((sum, s) => sum + s.amount, 0);
    expect(total).toBeCloseTo(300, 2);
  });

  it('should reject zero total shares', () => {
    const result = calculateShareSplit(100, [
      { user_id: 'u1', shares: 0 },
      { user_id: 'u2', shares: 0 },
    ]);
    expect(result.isValid).toBe(false);
  });
});

// ==================== FORMATTING ====================

describe('formatAmount', () => {
  it('should format SEK amount', () => {
    const result = formatAmount(100);
    expect(result).toContain('100');
  });

  it('should handle negative amounts', () => {
    const result = formatAmount(-50);
    expect(result).toContain('50');
  });
});

describe('formatCompactAmount', () => {
  it('should format large amounts compactly', () => {
    expect(formatCompactAmount(1500000)).toContain('1.5M');
    expect(formatCompactAmount(1500)).toContain('1.5k');
  });
});

describe('getUserInitials', () => {
  it('should return initials from full name', () => {
    expect(getUserInitials('John Doe')).toBe('JD');
  });

  it('should handle single name', () => {
    expect(getUserInitials('John')).toBe('JO');
  });

  it('should fallback to email', () => {
    expect(getUserInitials(undefined, 'john@test.com')).toBe('JO');
  });

  it('should return ?? for no input', () => {
    expect(getUserInitials()).toBe('??');
  });
});

describe('getUserDisplayName', () => {
  it('should prefer full_name', () => {
    expect(getUserDisplayName({ full_name: 'John', email: 'j@t.com' })).toBe('John');
  });

  it('should fallback to email prefix', () => {
    expect(getUserDisplayName({ email: 'john@test.com' })).toBe('john');
  });

  it('should return Unknown for undefined', () => {
    expect(getUserDisplayName()).toBe('Unknown');
  });
});

// ==================== VALIDATION ====================

describe('validateAmount', () => {
  it('should accept valid amounts', () => {
    expect(validateAmount('100').isValid).toBe(true);
    expect(validateAmount('99.99').isValid).toBe(true);
    expect(validateAmount('0.01').isValid).toBe(true);
  });

  it('should handle Swedish comma decimal', () => {
    const result = validateAmount('100,50');
    expect(result.isValid).toBe(true);
    expect(result.value).toBe(100.50);
  });

  it('should reject invalid amounts', () => {
    expect(validateAmount('').isValid).toBe(false);
    expect(validateAmount('abc').isValid).toBe(false);
    expect(validateAmount('0').isValid).toBe(false);
    expect(validateAmount('-5').isValid).toBe(false);
    expect(validateAmount('9999999').isValid).toBe(false);
  });
});

describe('validateGroupName', () => {
  it('should accept valid group names', () => {
    expect(validateGroupName('Trip to Paris').isValid).toBe(true);
  });

  it('should reject too short names', () => {
    expect(validateGroupName('ab').isValid).toBe(false);
  });

  it('should reject empty names', () => {
    expect(validateGroupName('').isValid).toBe(false);
    expect(validateGroupName('   ').isValid).toBe(false);
  });
});

describe('validateEmail', () => {
  it('should accept valid emails', () => {
    expect(validateEmail('test@example.com').isValid).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(validateEmail('not-an-email').isValid).toBe(false);
    expect(validateEmail('@missing.com').isValid).toBe(false);
  });
});

// ==================== CATEGORIES ====================

describe('getCategoryById', () => {
  it('should find existing category', () => {
    const cat = getCategoryById('food');
    expect(cat.id).toBe('food');
    expect(cat.icon).toBe('🍕');
  });

  it('should default to other for unknown', () => {
    const cat = getCategoryById('nonexistent');
    expect(cat.id).toBe('other');
  });
});

// ==================== COLOR UTILS ====================

describe('getBalanceColor', () => {
  it('should return green for positive', () => {
    expect(getBalanceColor(10)).toBe('#10B981');
  });

  it('should return red for negative', () => {
    expect(getBalanceColor(-10)).toBe('#EF4444');
  });

  it('should return gray for zero', () => {
    expect(getBalanceColor(0)).toBe('#6B7280');
  });
});

describe('stringToColor', () => {
  it('should return consistent color for same string', () => {
    expect(stringToColor('test')).toBe(stringToColor('test'));
  });

  it('should return different colors for different strings', () => {
    expect(stringToColor('alice')).not.toBe(stringToColor('bob'));
  });
});

// ==================== DATE FORMATTING ====================

describe('formatDate', () => {
  it('should format ISO date string', () => {
    const result = formatDate('2026-02-11');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    // Should contain year
    expect(result).toContain('2026');
  });

  it('should format Date object', () => {
    const result = formatDate(new Date(2026, 1, 11));
    expect(result).toContain('2026');
  });

  it('should handle ISO datetime strings', () => {
    const result = formatDate('2025-12-31T23:59:59Z');
    // Locale-dependent; may show Dec 31 2025 or Jan 1 2026 depending on TZ
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});

describe('formatRelativeTime', () => {
  it('should return "just now" for recent dates', () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe('just now');
  });

  it('should return minutes for recent past', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinAgo)).toBe('5m ago');
  });

  it('should return hours for same day', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeHoursAgo)).toBe('3h ago');
  });

  it('should return days for recent past', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoDaysAgo)).toBe('2d ago');
  });

  it('should return formatted date for old dates', () => {
    const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(oldDate);
    // Should not contain "ago" since it's over a week
    expect(result).not.toContain('ago');
  });

  it('should accept string dates', () => {
    const result = formatRelativeTime(new Date().toISOString());
    expect(result).toBe('just now');
  });
});
