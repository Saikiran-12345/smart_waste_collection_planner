import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import {
  notificationService,
  type NotificationRule,
  type NotificationEvent,
  type NotificationPriority,
} from '../services/notificationService';
import './NotificationPage.css';

const NotificationPage: React.FC = () => {
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'events' | 'rules'>('events');
  const [stats, setStats] = useState<{
    totalEvents: number;
    unreadCount: number;
    byPriority: Record<NotificationPriority, number>;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [r, e, s] = await Promise.all([
      notificationService.getAllRules(),
      notificationService.getAllEvents(),
      notificationService.getNotificationStats(),
    ]);
    setRules(r);
    setEvents(e);
    setStats(s);
  };

  const handleMarkRead = async (eventId: string) => {
    await notificationService.markAsRead(eventId);
    loadData();
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    loadData();
  };

  const handleToggleRule = async (ruleId: string) => {
    await notificationService.toggleRule(ruleId);
    loadData();
  };

  const handleDeleteEvent = async (eventId: string) => {
    await notificationService.deleteEvent(eventId);
    loadData();
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    const colors: Record<NotificationPriority, string> = {
      LOW: '#22c55e',
      MEDIUM: '#eab308',
      HIGH: '#f97316',
      CRITICAL: '#ef4444',
    };
    return (
      <span className="priority-badge" style={{ backgroundColor: colors[priority] }}>
        {priority}
      </span>
    );
  };

  return (
    <MainLayout>
      <div className="notification-page">
        <div className="page-header">
          <h1>Notification Center</h1>
          {stats && (
            <div className="notification-summary">
              <span className="summary-item">Total: {stats.totalEvents}</span>
              <span className="summary-item unread">Unread: {stats.unreadCount}</span>
            </div>
          )}
        </div>

        <div className="tab-bar">
          <button
            className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            Events ({events.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            Alert Rules ({rules.length})
          </button>
          {activeTab === 'events' && events.some(e => e.status !== 'READ') && (
            <button className="mark-all-btn" onClick={handleMarkAllRead}>
              Mark All Read
            </button>
          )}
        </div>

        {activeTab === 'events' && (
          <div className="events-list">
            {events.length === 0 ? (
              <div className="empty-state">No notification events yet.</div>
            ) : (
              events.map(event => (
                <div
                  key={event.id}
                  className={`event-card ${event.status === 'READ' ? 'read' : 'unread'}`}
                >
                  <div className="event-header">
                    <h3>{event.title}</h3>
                    {getPriorityBadge(event.priority)}
                  </div>
                  <p className="event-message">{event.message}</p>
                  <div className="event-meta">
                    <span>Status: {event.status}</span>
                    <span>Channels: {event.channels.join(', ')}</span>
                    <span>{new Date(event.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="event-actions">
                    {event.status !== 'READ' && (
                      <button className="btn-sm" onClick={() => handleMarkRead(event.id)}>
                        Mark Read
                      </button>
                    )}
                    <button className="btn-sm btn-danger" onClick={() => handleDeleteEvent(event.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="rules-list">
            {rules.length === 0 ? (
              <div className="empty-state">No alert rules configured.</div>
            ) : (
              <table className="rules-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Trigger</th>
                    <th>Priority</th>
                    <th>Channels</th>
                    <th>Cooldown</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map(rule => (
                    <tr key={rule.id}>
                      <td>{rule.name}</td>
                      <td>{rule.triggerCondition}</td>
                      <td>{getPriorityBadge(rule.priority)}</td>
                      <td>{rule.channels.join(', ')}</td>
                      <td>{rule.cooldownMinutes} min</td>
                      <td>
                        <span className={`status-dot ${rule.isActive ? 'active' : 'inactive'}`}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button className="btn-sm" onClick={() => handleToggleRule(rule.id)}>
                          {rule.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default NotificationPage;
