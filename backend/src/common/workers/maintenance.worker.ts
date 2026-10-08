import { logger } from '../utils/logger';

export class MaintenanceWorker {
  private timer?: NodeJS.Timeout;
  private active?: Promise<void>;

  constructor(private readonly jobs: { name: string; run: () => Promise<unknown> }[], private readonly intervalMs = 60000) {}

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      if (this.active) return;
      this.active = this.runJobs().finally(() => { this.active = undefined; });
    }, this.intervalMs);
  }

  private async runJobs() {
    for (const job of this.jobs) {
      try { await job.run(); }
      catch (error) { logger.error(`Maintenance job ${job.name} failed`, { error }); }
    }
  }

  async stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    await this.active;
  }
}
