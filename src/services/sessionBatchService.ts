// Session batch service for optimizing multiple session operations
import { sessionService } from './supabaseService';

class SessionBatchService {
  private batchQueue: any[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 5000; // 5 seconds

  addSessionToBatch(sessionData: any) {
    this.batchQueue.push(sessionData);
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    this.batchTimer = setTimeout(() => {
      this.processBatch();
    }, this.BATCH_DELAY);
  }

  private async processBatch() {
    if (this.batchQueue.length === 0) return;

    const batch = [...this.batchQueue];
    this.batchQueue = [];

    try {
      // Process all sessions in the batch
      for (const sessionData of batch) {
        await sessionService.createSession(sessionData);
      }
      console.log(`Processed ${batch.length} sessions in batch`);
    } catch (error) {
      console.error('Batch processing error:', error);
      // Re-queue failed sessions
      this.batchQueue.unshift(...batch);
    }
  }

  async flush() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    await this.processBatch();
  }

  async flushAll() {
    await this.flush();
  }
}

export default new SessionBatchService();