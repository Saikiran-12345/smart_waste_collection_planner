import { create, readAll, readOne, update, remove } from '../repository/repository';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH';

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  triggerCondition: 'BIN_OVERFLOW' | 'MISSED_COLLECTION' | 'VEHICLE_BREAKDOWN' | 'SCHEDULE_CHANGE' | 'COMPLAINT_FILED';
  thresholdValue: number;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  recipientRoles: string[];
  isActive: boolean;
  cooldownMinutes: number;
  createdDate: string;
}

export interface NotificationEvent {
  id: string;
  ruleId: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  recipients: string[];
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  createdAt: string;
  sentAt?: string;
  readAt?: string;
  metadata: Record<string, string>;
}

const RULE_TYPE = 'NotificationRule';
const EVENT_TYPE = 'NotificationEvent';

/**
 * NotificationService manages alert rules, dispatching, and event tracking
 * for the waste collection monitoring system.
 */
export const notificationService = {
  // ── Rule Management ──────────────────────────────────────────────

  async createRule(rule: Omit<NotificationRule, 'id' | 'createdDate'>): Promise<NotificationRule> {
    const newRule: NotificationRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
    };
    create(RULE_TYPE, newRule);
    return newRule;
  },

  async getAllRules(): Promise<NotificationRule[]> {
    return readAll<NotificationRule>(RULE_TYPE);
  },

  async getRuleById(id: string): Promise<NotificationRule | undefined> {
    return readOne<NotificationRule>(RULE_TYPE, id);
  },

  async updateRule(id: string, updates: Partial<NotificationRule>): Promise<NotificationRule> {
    return update<NotificationRule & { id: string }>(RULE_TYPE, id, updates);
  },

  async toggleRule(id: string): Promise<NotificationRule> {
    const existing = readOne<NotificationRule>(RULE_TYPE, id);
    if (!existing) throw new Error(`Notification rule not found: ${id}`);
    return update<NotificationRule & { id: string }>(RULE_TYPE, id, { isActive: !existing.isActive });
  },

  async deleteRule(id: string): Promise<void> {
    remove(RULE_TYPE, id);
  },

  // ── Event Dispatching ────────────────────────────────────────────

  async dispatchNotification(
    ruleId: string,
    title: string,
    message: string,
    metadata: Record<string, string> = {}
  ): Promise<NotificationEvent | null> {
    const rule = readOne<NotificationRule>(RULE_TYPE, ruleId);
    if (!rule || !rule.isActive) return null;

    // Check cooldown: find the most recent event for this rule
    const allEvents = readAll<NotificationEvent>(EVENT_TYPE);
    const ruleEvents = allEvents
      .filter(e => e.ruleId === ruleId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (ruleEvents.length > 0) {
      const lastEvent = ruleEvents[0];
      const elapsedMs = Date.now() - new Date(lastEvent.createdAt).getTime();
      const cooldownMs = rule.cooldownMinutes * 60 * 1000;
      if (elapsedMs < cooldownMs) {
        return null; // Still in cooldown period
      }
    }

    const event: NotificationEvent = {
      id: `event-${Date.now()}`,
      ruleId,
      title,
      message,
      priority: rule.priority,
      channels: rule.channels,
      recipients: rule.recipientRoles,
      status: 'SENT',
      createdAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
      metadata,
    };

    create(EVENT_TYPE, event);
    return event;
  },

  // ── Event Queries ────────────────────────────────────────────────

  async getAllEvents(): Promise<NotificationEvent[]> {
    const all = readAll<NotificationEvent>(EVENT_TYPE);
    return all.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async getEventsByRule(ruleId: string): Promise<NotificationEvent[]> {
    const all = await this.getAllEvents();
    return all.filter(e => e.ruleId === ruleId);
  },

  async getUnreadEvents(): Promise<NotificationEvent[]> {
    const all = await this.getAllEvents();
    return all.filter(e => e.status !== 'READ');
  },

  async markAsRead(eventId: string): Promise<NotificationEvent> {
    return update<NotificationEvent & { id: string }>(EVENT_TYPE, eventId, {
      status: 'READ',
      readAt: new Date().toISOString(),
    });
  },

  async markAllAsRead(): Promise<number> {
    const unread = await this.getUnreadEvents();
    let count = 0;
    for (const event of unread) {
      update<NotificationEvent & { id: string }>(EVENT_TYPE, event.id, {
        status: 'READ',
        readAt: new Date().toISOString(),
      });
      count++;
    }
    return count;
  },

  async deleteEvent(eventId: string): Promise<void> {
    remove(EVENT_TYPE, eventId);
  },

  // ── Analytics ────────────────────────────────────────────────────

  async getNotificationStats(): Promise<{
    totalEvents: number;
    unreadCount: number;
    byPriority: Record<NotificationPriority, number>;
    byChannel: Record<NotificationChannel, number>;
    byStatus: Record<string, number>;
  }> {
    const all = await this.getAllEvents();
    const unread = all.filter(e => e.status !== 'READ');

    const byPriority: Record<NotificationPriority, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    const byChannel: Record<NotificationChannel, number> = { IN_APP: 0, EMAIL: 0, SMS: 0, PUSH: 0 };
    const byStatus: Record<string, number> = {};

    for (const event of all) {
      byPriority[event.priority] = (byPriority[event.priority] || 0) + 1;
      for (const ch of event.channels) {
        byChannel[ch] = (byChannel[ch] || 0) + 1;
      }
      byStatus[event.status] = (byStatus[event.status] || 0) + 1;
    }

    return {
      totalEvents: all.length,
      unreadCount: unread.length,
      byPriority,
      byChannel,
      byStatus,
    };
  },
};
