import Fastify from 'fastify';
import cors from '@fastify/cors';
import { validateEnv } from './env.js';
import { createLogger } from '../utils/logger.js';

export async function buildServer() {
  const config = validateEnv(process.env);

  const logger = createLogger(
    config.LOG_LEVEL,
    config.NODE_ENV === 'development'
  );

  const server = Fastify({
    logger,
    requestIdLogLabel: 'reqId',
    disableRequestLogging: false,
    requestIdHeader: 'x-request-id',
  });

  // Register CORS
  await server.register(cors, {
    origin: config.NODE_ENV === 'production' ? false : true,
    credentials: true,
  });

  // Add config to fastify instance
  server.decorate('config', config);

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      server.log.info(`Received ${signal}, closing server gracefully...`);
      await server.close();
      process.exit(0);
    });
  });

  return server;
}
