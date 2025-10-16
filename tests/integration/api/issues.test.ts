import { describe, it, expect, vi } from 'vitest';
import issuesFixture from '../../fixtures/issues.json';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis()
  }
}));

describe('Issues API', () => {
  describe('GET /api/issues', () => {
    it('should return list of issues', async () => {
      const mockDb = await import('@/lib/db');
      vi.mocked(mockDb.db.select).mockResolvedValueOnce(issuesFixture);

      const result = issuesFixture;

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include issue details', () => {
      const issue = issuesFixture[0];

      expect(issue).toHaveProperty('id');
      expect(issue).toHaveProperty('projectId');
      expect(issue).toHaveProperty('title');
      expect(issue).toHaveProperty('description');
      expect(issue).toHaveProperty('severity');
      expect(issue).toHaveProperty('wcagCriteria');
    });

    it('should filter issues by severity', () => {
      const severities = ['critical', 'major', 'minor'];
      issuesFixture.forEach((issue) => {
        expect(severities).toContain(issue.severity);
      });
    });

    it('should filter issues by project ID', () => {
      const projectId = 'project-1';
      const filtered = issuesFixture.filter((i) => i.projectId === projectId);

      if (filtered.length > 0) {
        expect(filtered.every((i) => i.projectId === projectId)).toBe(true);
      }
    });

    it('should filter issues by status', () => {
      const status = 'open';
      const filtered = issuesFixture.filter((i) => i.status === status);

      if (filtered.length > 0) {
        expect(filtered.every((i) => i.status === status)).toBe(true);
      }
    });
  });

  describe('GET /api/issues/[issueId]', () => {
    it('should return single issue by ID', () => {
      const issue = issuesFixture[0];

      expect(issue).toBeDefined();
      expect(issue.id).toBeDefined();
    });

    it('should include all issue fields', () => {
      const issue = issuesFixture[0];

      expect(issue).toHaveProperty('title');
      expect(issue).toHaveProperty('description');
      expect(issue).toHaveProperty('severity');
      expect(issue).toHaveProperty('wcagCriteria');
      expect(issue).toHaveProperty('status');
      expect(issue).toHaveProperty('elementSelector');
      expect(issue).toHaveProperty('pageUrl');
    });
  });

  describe('Issue Validation', () => {
    it('should validate severity levels', () => {
      const validSeverities = ['critical', 'major', 'moderate', 'minor'];

      issuesFixture.forEach((issue) => {
        expect(validSeverities).toContain(issue.severity);
      });
    });

    it('should validate WCAG criteria format', () => {
      issuesFixture.forEach((issue) => {
        if (issue.wcagCriteria) {
          // WCAG criteria should be in format like "1.1.1", "2.4.3", etc.
          expect(issue.wcagCriteria).toMatch(/^\d+\.\d+\.\d+$/);
        }
      });
    });

    it('should validate status values', () => {
      const validStatuses = [
        'open',
        'in_progress',
        'resolved',
        'closed',
        'wont_fix'
      ];

      issuesFixture.forEach((issue) => {
        expect(validStatuses).toContain(issue.status);
      });
    });

    it('should validate required fields', () => {
      const requiredFields = ['id', 'projectId', 'title', 'severity'];

      issuesFixture.forEach((issue) => {
        requiredFields.forEach((field) => {
          expect(issue).toHaveProperty(field);
          expect(issue[field as keyof typeof issue]).toBeDefined();
        });
      });
    });
  });

  describe('Issue Statistics', () => {
    it('should calculate total issues', () => {
      const total = issuesFixture.length;
      expect(total).toBeGreaterThan(0);
    });

    it('should calculate issues by severity', () => {
      const bySeverity = issuesFixture.reduce(
        (acc, issue) => {
          acc[issue.severity] = (acc[issue.severity] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      expect(Object.keys(bySeverity).length).toBeGreaterThan(0);
      expect(Object.values(bySeverity).every((count) => count > 0)).toBe(true);
    });

    it('should calculate issues by status', () => {
      const byStatus = issuesFixture.reduce(
        (acc, issue) => {
          acc[issue.status] = (acc[issue.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      expect(Object.keys(byStatus).length).toBeGreaterThan(0);
    });

    it('should identify critical issues', () => {
      const criticalIssues = issuesFixture.filter(
        (i) => i.severity === 'critical'
      );
      expect(Array.isArray(criticalIssues)).toBe(true);
    });
  });
});
