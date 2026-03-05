import 'dotenv/config';
import { buildServer } from './config/server.js';
import { GitHubService } from './services/github.service.js';
import { ScraperService } from './services/scraper.service.js';
import { RulesManagerService } from './services/rules-manager.service.js';
import { SchedulerService } from './services/scheduler.service.js';
import { apiRoutes } from './routes/api.routes.js';
import { webhookRoutes } from './routes/webhook.routes.js';

async function start() {
  try {
    const server = await buildServer();

    const { PORT, HOST } = server.config;

    // Initialize services
    const githubService = new GitHubService(server.config);
    const scraperService = new ScraperService();
    const rulesManager = new RulesManagerService(
      githubService,
      scraperService,
      server.log,
      server.config.DOC_SOURCES,
      server.config.RULES_FILE_PATHS
    );
    const scheduler = new SchedulerService(
      rulesManager,
      server.log,
      server.config.UPDATE_SCHEDULE
    );

    // Register routes
    await apiRoutes(server, rulesManager, scheduler);
    await webhookRoutes(server, rulesManager);

    // Start scheduler
    scheduler.start();

    // Start server
    await server.listen({ port: PORT, host: HOST });

    server.log.info(
      `Server running at http://${HOST}:${PORT} in ${server.config.NODE_ENV} mode`
    );

    // Cleanup on shutdown
    server.addHook('onClose', async () => {
      scheduler.stop();
      server.log.info('Scheduler stopped');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
