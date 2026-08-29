import type { Notification } from '../types/Notification';
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

const NOTIFICATION_RULE_TYPE = 'NotificationRule';
const NOTIFICATION_EVENT_TYPE = 'NotificationEvent';

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
    create(NOTIFICATION_RULE_TYPE, newRule.id, newRule);
    return newRule;
  },

  async getAllRules(): Promise<NotificationRule[]> {
    const all = readAll(NOTIFICATION_RULE_TYPE) as Record<string, NotificationRule>;
    return Object.values(all);
  },

  async getRuleById(id: string): Promise<NotificationRule | null> {
    return (readOne(NOTIFICATION_RULE_TYPE, id) as NotificationRule) || null;
  },

  async updateRule(id: string, updates: Partial<NotificationRule>): Promise<NotificationRule> {
    const existing = readOne(NOTIFICATION_RULE_TYPE, id) as NotificationRule;
    if (!existing) throw new Error(`Notification rule not found: ${id}`);
    const updated = { ...existing, ...updates };
    update(NOTIFICATION_RULE_TYPE, id, updated);
    return updated;
  },

  async toggleRule(id: string): Promise<NotificationRule> {
    const existing = readOne(NOTIFICATION_RULE_TYPE, id) as NotificationRule;
    if (!existing) throw new Error(`Notification rule not found: ${id}`);
    existing.isActive = !existing.isActive;
    update(NOTIFICATION_RULE_TYPE, id, existing);
    return existing;
  },

  async deleteRule(id: string): Promise<void> {
    remove(NOTIFICATION_RULE_TYPE, id);
  },

  // ── Event Dispatching ────────────────────────────────────────────

  async dispatchNotification(
    ruleId: string,
    title: string,
    message: string,
    metadata: Record<string, string> = {}
  ): Promise<NotificationEvent | null> {
    const rule = readOne(NOTIFICATION_RULE_TYPE, ruleId) as NotificationRule;
    if (!rule || !rule.isActive) return null;

    // Check cooldown: find the most recent event for this rule
    const allEvents = readAll(NOTIFICATION_EVENT_TYPE) as Record<string, NotificationEvent>;
    const ruleEvents = Object.values(allEvents)
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
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      metadata,
    };

    create(NOTIFICATION_EVENT_TYPE, event.id, event);

    // Simulate sending (in a real app this would call external APIs)
    event.status = 'SENT';
    event.sentAt = new Date().toISOString();
    update(NOTIFICATION_EVENT_TYPE, event.id, event);

    return event;
  },

  // ── Event Queries ────────────────────────────────────────────────

  async getAllEvents(): Promise<NotificationEvent[]> {
    const all = readAll(NOTIFICATION_EVENT_TYPE) as Record<string, NotificationEvent>;
    return Object.values(all).sort(
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
    const event = readOne(NOTIFICATION_EVENT_TYPE, eventId) as NotificationEvent;
    if (!event) throw new Error(`Notification event not found: ${eventId}`);
    event.status = 'READ';
    event.readAt = new Date().toISOString();
    update(NOTIFICATION_EVENT_TYPE, eventId, event);
    return event;
  },

  async markAllAsRead(): Promise<number> {
    const unread = await this.getUnreadEvents();
    let count = 0;
    for (const event of unread) {
      event.status = 'READ';
      event.readAt = new Date().toISOString();
      update(NOTIFICATION_EVENT_TYPE, event.id, event);
      count++;
    }
    return count;
  },

  async deleteEvent(eventId: string): Promise<void> {
    remove(NOTIFICATION_EVENT_TYPE, eventId);
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
