import type { KaitenApi } from '../kaiten/api/index.js';
import type { TimeLog } from '../kaiten/interfaces/timelog.js';
import type { AccessGuard } from './guard.js';

export class TimeLogService {
  constructor(
    private readonly api: KaitenApi,
    private readonly guard: AccessGuard
  ) {}

  async getTimeLogs(cardId: number): Promise<TimeLog[]> {
    await this.guard.validateCardId(cardId);
    return this.api.timeLogs.getTimeLogs(cardId);
  }

  async addTimeLog(cardId: number, timeSpent: number, forDate: string, roleId: number, comment?: string): Promise<TimeLog> {
    await this.guard.validateCardId(cardId);
    return this.api.timeLogs.addTimeLog(cardId, timeSpent, forDate, roleId, comment);
  }
}
