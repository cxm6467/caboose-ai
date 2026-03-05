import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SchedulerService } from '../../src/services/scheduler.service.js';
import type { RulesManagerService } from '../../src/services/rules-manager.service.js';
import type { FastifyBaseLogger } from 'fastify';

describe('SchedulerService', () => {
  let mockRulesManager: RulesManagerService;
  let mockLogger: FastifyBaseLogger;
  let scheduler: SchedulerService;

  beforeEach(() => {
    mockRulesManager = {
      checkAndUpdateRules: vi.fn(),
    } as any;

    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    } as any;
  });

  it('should validate cron schedule', () => {
    expect(() => {
      new SchedulerService(mockRulesManager, mockLogger, 'invalid schedule');
    }).not.toThrow();
  });

  it('should start and stop scheduler', () => {
    scheduler = new SchedulerService(mockRulesManager, mockLogger, '0 2 * * *');

    expect(scheduler.isRunning()).toBe(false);

    scheduler.start();
    expect(scheduler.isRunning()).toBe(true);

    scheduler.stop();
    expect(scheduler.isRunning()).toBe(false);
  });

  it('should get schedule', () => {
    const schedule = '0 2 * * *';
    scheduler = new SchedulerService(mockRulesManager, mockLogger, schedule);

    expect(scheduler.getSchedule()).toBe(schedule);
  });

  it('should not start if already running', () => {
    scheduler = new SchedulerService(mockRulesManager, mockLogger, '0 2 * * *');

    scheduler.start();
    scheduler.start();

    expect(mockLogger.warn).toHaveBeenCalledWith('Scheduler already running');

    scheduler.stop();
  });
});
