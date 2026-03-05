import cron from 'node-cron';
import type { FastifyBaseLogger } from 'fastify';
import { RulesManagerService } from './rules-manager.service.js';

export class SchedulerService {
  private task: cron.ScheduledTask | null = null;
  private rulesManager: RulesManagerService;
  private logger: FastifyBaseLogger;
  private schedule: string;

  constructor(
    rulesManager: RulesManagerService,
    logger: FastifyBaseLogger,
    schedule: string
  ) {
    this.rulesManager = rulesManager;
    this.logger = logger;
    this.schedule = schedule;
  }

  /**
   * Start the scheduled task
   */
  start(): void {
    if (this.task) {
      this.logger.warn('Scheduler already running');
      return;
    }

    if (!cron.validate(this.schedule)) {
      throw new Error(`Invalid cron schedule: ${this.schedule}`);
    }

    this.logger.info({ schedule: this.schedule }, 'Starting scheduler');

    this.task = cron.schedule(this.schedule, async () => {
      this.logger.info('Running scheduled documentation update');

      try {
        const result = await this.rulesManager.checkAndUpdateRules();

        if (result.success) {
          this.logger.info(
            { filesUpdated: result.filesUpdated },
            'Scheduled update completed successfully'
          );
        } else {
          this.logger.error(
            { errors: result.errors },
            'Scheduled update completed with errors'
          );
        }
      } catch (error) {
        this.logger.error(error, 'Scheduled update failed');
      }
    });

    this.task.start();
    this.logger.info('Scheduler started successfully');
  }

  /**
   * Stop the scheduled task
   */
  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      this.logger.info('Scheduler stopped');
    }
  }

  /**
   * Get the current schedule
   */
  getSchedule(): string {
    return this.schedule;
  }

  /**
   * Check if scheduler is running
   */
  isRunning(): boolean {
    return this.task !== null;
  }
}
