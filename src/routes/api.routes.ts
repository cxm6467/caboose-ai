import type { FastifyInstance } from 'fastify';
import { RulesManagerService } from '../services/rules-manager.service.js';
import { SchedulerService } from '../services/scheduler.service.js';

export async function apiRoutes(
  server: FastifyInstance,
  rulesManager: RulesManagerService,
  scheduler: SchedulerService
) {
  /**
   * Health check endpoint
   */
  server.get('/health', async (_request, reply) => {
    return reply.send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      scheduler: {
        running: scheduler.isRunning(),
        schedule: scheduler.getSchedule(),
      },
    });
  });

  /**
   * Get service info
   */
  server.get('/api/info', async (_request, reply) => {
    return reply.send({
      name: 'caboose-ai',
      version: '1.0.0',
      description: 'Claude/Cursor rules manager with automated documentation update service',
      config: {
        docSources: server.config.DOC_SOURCES,
        ruleFiles: server.config.RULES_FILE_PATHS,
        updateSchedule: server.config.UPDATE_SCHEDULE,
      },
    });
  });

  /**
   * Manually trigger documentation update
   */
  server.post('/api/update', async (_request, reply) => {
    try {
      server.log.info('Manual update triggered');

      // Run update in background
      rulesManager
        .triggerUpdate()
        .then((result) => {
          server.log.info({ result }, 'Manual update completed');
        })
        .catch((error) => {
          server.log.error(error, 'Manual update failed');
        });

      return reply.send({
        message: 'Update triggered',
        status: 'processing',
      });
    } catch (error: any) {
      server.log.error(error, 'Failed to trigger update');
      return reply.code(500).send({
        error: 'Failed to trigger update',
        message: error.message,
      });
    }
  });

  /**
   * Get scheduler status
   */
  server.get('/api/scheduler/status', async (_request, reply) => {
    return reply.send({
      running: scheduler.isRunning(),
      schedule: scheduler.getSchedule(),
    });
  });
}
