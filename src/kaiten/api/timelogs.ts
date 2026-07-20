import type { HttpTransport } from '../interfaces/http.js';
import type { TimeLog } from '../interfaces/timelog.js';

export class TimeLogsApi {
  constructor(private readonly client: HttpTransport) {}

  getTimeLogs(cardId: number): Promise<TimeLog[]> {
    return this.client.get<TimeLog[]>(`/cards/${cardId}/time-logs`);
  }

  addTimeLog(cardId: number, timeSpent: number, forDate: string, roleId: number, comment?: string): Promise<TimeLog> {
    const body: Record<string, unknown> = { time_spent: timeSpent, for_date: forDate, role_id: roleId };
    if (comment !== undefined) body.comment = comment;
    return this.client.post<TimeLog>(`/cards/${cardId}/time-logs`, body);
  }
}
