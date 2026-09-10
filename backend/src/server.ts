import app from './app';
import { config } from './common/config';
import { logger } from './common/utils/logger';
import { prisma } from './common/config/database';
import { seedAdmin } from './common/config/seedAdmin';
import { registerMarketplaceListeners } from './domains/marketplace/marketplace/marketplace.listeners';
import { registerVisitListeners } from './domains/care/visit/visit.listeners';
import { registerContractListeners } from './domains/marketplace/contracts/contract.listeners';
import { registerCareListeners } from './domains/care/requests/care.listeners';
import { outboxService } from './common/events/outbox.service';
import { ChatSocketService } from './domains/communication/chat/chat.socket';

// Initialize HTTP port listener
const server = app.listen(config.PORT, async () => {
  logger.info(`⚡ Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
  ChatSocketService.initialize(server);
  await seedAdmin();
  registerMarketplaceListeners();
  registerVisitListeners();
  registerContractListeners();
  registerCareListeners();
  outboxService.start();

  // Active expiration sweepers
  const { ContractService } = require('./domains/marketplace/contracts/contract.service');
  const { MarketplaceRepository } = require('./domains/marketplace/marketplace/marketplace.repository');
  const { SlaTimeoutWorker } = require('./domains/care/clinical/workers/sla-timeout.worker');
  
  setInterval(async () => {
    await ContractService.sweepExpiredContracts();
    await MarketplaceRepository.expireExpiredOffers();
    await SlaTimeoutWorker.processTimeouts();
  }, 60 * 1000); // run every 1 minute
});

/**
 * Handle process termination gracefully.
 * Closes the Express server listener and disconnects Prisma to avoid hanging database connections.
 */
const gracefulShutdown = async (signal: string) => {
  logger.warn(`Received ${signal}. Shutting down server gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    outboxService.stop();
    await prisma.$disconnect();
    logger.info('Database disconnected. exiting process.');
    process.exit(0);
  });
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Catch any unhandled exceptions at runtime
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message} \nStack: ${err.stack}`);
  process.exit(1);
});

// Catch any unhandled Promise rejections at runtime
process.on('unhandledRejection', (reason: any) => {
  logger.error(`Unhandled Rejection at Promise: ${reason.message || reason} \nStack: ${reason.stack}`);
  process.exit(1);
});
