import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createHmac } from 'crypto';
import { RulesManagerService } from '../services/rules-manager.service.js';

export async function webhookRoutes(
  server: FastifyInstance,
  rulesManager: RulesManagerService
) {
  /**
   * Verify GitHub webhook signature
   */
  function verifySignature(payload: string, signature: string, secret: string): boolean {
    const hmac = createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return digest === signature;
  }

  /**
   * GitHub webhook endpoint
   */
  server.post('/webhook/github', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const signatureHeader = request.headers['x-hub-signature-256'];
      const eventHeader = request.headers['x-github-event'];

      // Handle string | string[] | undefined
      const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
      const event = Array.isArray(eventHeader) ? eventHeader[0] : eventHeader;

      if (!signature) {
        server.log.warn('Webhook request missing signature');
        return reply.code(401).send({ error: 'Missing signature' });
      }

      // Verify signature
      const payload = JSON.stringify(request.body);
      const isValid = verifySignature(
        payload,
        signature,
        server.config.GITHUB_WEBHOOK_SECRET
      );

      if (!isValid) {
        server.log.warn('Invalid webhook signature');
        return reply.code(401).send({ error: 'Invalid signature' });
      }

      server.log.info({ event }, 'Received GitHub webhook');

      // Handle different webhook events
      switch (event) {
        case 'push':
          await handlePushEvent(request.body, rulesManager, server);
          break;

        case 'ping':
          server.log.info('Received ping event');
          return reply.send({ message: 'pong' });

        default:
          server.log.info({ event }, 'Unhandled webhook event');
      }

      return reply.send({ message: 'Webhook processed' });
    } catch (error: any) {
      server.log.error(error, 'Error processing webhook');
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
}

/**
 * Handle push events to trigger updates
 */
async function handlePushEvent(
  payload: any,
  rulesManager: RulesManagerService,
  server: FastifyInstance
) {
  const ref = payload.ref;
  const branch = server.config.DEFAULT_BRANCH;

  // Only process pushes to the default branch
  if (ref === `refs/heads/${branch}`) {
    server.log.info('Push to main branch detected, triggering update check');

    // Trigger update in background
    rulesManager
      .checkAndUpdateRules()
      .then((result) => {
        server.log.info({ result }, 'Update check completed');
      })
      .catch((error) => {
        server.log.error(error, 'Update check failed');
      });
  }
}
