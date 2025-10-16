import { describe, it, expect } from 'vitest';
import { cn, formatBytes } from '@/lib/utils';

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      const result = cn('base-class', 'additional-class');
      expect(result).toContain('base-class');
      expect(result).toContain('additional-class');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base', isActive && 'active', !isActive && 'inactive');
      expect(result).toContain('base');
      expect(result).toContain('active');
      expect(result).not.toContain('inactive');
    });

    it('should handle undefined and null values', () => {
      const result = cn('base', undefined, null, 'other');
      expect(result).toContain('base');
      expect(result).toContain('other');
    });

    it('should merge tailwind classes correctly', () => {
      const result = cn('p-4', 'p-2'); // p-2 should override p-4
      expect(result).toBe('p-2');
    });

    it('should handle array of classes', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
      expect(result).toContain('class3');
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle object notation', () => {
      const result = cn({
        class1: true,
        class2: false,
        class3: true
      });
      expect(result).toContain('class1');
      expect(result).not.toContain('class2');
      expect(result).toContain('class3');
    });

    it('should merge conflicting tailwind classes', () => {
      const result = cn('text-red-500', 'text-blue-500');
      expect(result).toBe('text-blue-500');
      expect(result).not.toContain('text-red-500');
    });

    it('should handle multiple style modifiers', () => {
      const result = cn('p-4 m-2', 'hover:bg-blue-500', 'dark:text-white');
      expect(result).toContain('p-4');
      expect(result).toContain('hover:bg-blue-500');
      expect(result).toContain('dark:text-white');
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Byte');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should handle decimals', () => {
      expect(formatBytes(1536, { decimals: 2 })).toBe('1.50 KB');
      expect(formatBytes(1024 * 1.5, { decimals: 1 })).toBe('1.5 KB');
    });

    it('should handle accurate size type', () => {
      expect(formatBytes(1024, { sizeType: 'accurate' })).toBe('1 KiB');
      expect(formatBytes(1024 * 1024, { sizeType: 'accurate' })).toBe('1 MiB');
    });

    it('should handle normal size type', () => {
      expect(formatBytes(1024, { sizeType: 'normal' })).toBe('1 KB');
      expect(formatBytes(1024 * 1024, { sizeType: 'normal' })).toBe('1 MB');
    });

    it('should handle large file sizes', () => {
      const result = formatBytes(1024 * 1024 * 1024 * 1024); // 1 TB
      expect(result).toContain('TB');
    });

    it('should handle small byte values', () => {
      expect(formatBytes(512)).toBe('512 Bytes');
      expect(formatBytes(100)).toBe('100 Bytes');
    });

    it('should handle decimal precision', () => {
      const result = formatBytes(1234567, { decimals: 2 });
      expect(result).toMatch(/1\.\d{2} MB/);
    });
  });
});
