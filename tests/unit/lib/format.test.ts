import { describe, it, expect } from 'vitest';
import { formatDate } from '@/lib/format';

describe('Format Utilities', () => {
  describe('formatDate', () => {
    it('should format date correctly with default options', () => {
      const date = new Date('2025-01-15T10:30:00Z');
      const result = formatDate(date);
      expect(result).toMatch(/January 15, 2025/);
    });

    it('should handle string dates', () => {
      const result = formatDate('2025-01-15');
      expect(result).toBeDefined();
      expect(result).toMatch(/2025/);
    });

    it('should handle numeric timestamps', () => {
      const timestamp = new Date('2025-01-15').getTime();
      const result = formatDate(timestamp);
      expect(result).toBeDefined();
      expect(result).toMatch(/2025/);
    });

    it('should handle invalid dates gracefully', () => {
      const result = formatDate('invalid');
      expect(result).toBe('');
    });

    it('should handle undefined dates', () => {
      const result = formatDate(undefined);
      expect(result).toBe('');
    });

    it('should use custom format options', () => {
      const date = new Date('2025-01-15');
      const result = formatDate(date, {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });
      expect(result).toMatch(/Jan 15, 2025/);
    });

    it('should format with different month styles', () => {
      const date = new Date('2025-01-15');

      const longMonth = formatDate(date, { month: 'long' });
      expect(longMonth).toContain('January');

      const shortMonth = formatDate(date, { month: 'short' });
      expect(shortMonth).toContain('Jan');

      const numericMonth = formatDate(date, { month: 'numeric' });
      expect(numericMonth).toContain('1');
    });

    it('should format dates from different years', () => {
      const oldDate = new Date('2020-06-30');
      const futureDate = new Date('2030-12-31');

      expect(formatDate(oldDate)).toContain('2020');
      expect(formatDate(futureDate)).toContain('2030');
    });

    it('should handle edge cases', () => {
      const leapYear = new Date('2024-02-29');
      expect(formatDate(leapYear)).toMatch(/February 29, 2024/);

      const yearEnd = new Date('2025-12-31');
      expect(formatDate(yearEnd)).toMatch(/December 31, 2025/);

      const yearStart = new Date('2025-01-01');
      expect(formatDate(yearStart)).toMatch(/January 1, 2025/);
    });

    it('should format with time options', () => {
      const date = new Date('2025-01-15T14:30:00Z');
      const result = formatDate(date, {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
      });
      expect(result).toBeDefined();
    });
  });
});
