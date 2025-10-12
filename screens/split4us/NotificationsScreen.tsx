import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../../lib/supabase/client';

interface Notification {
  id: string;
  type: 'expense_added' | 'payment_received' | 'settlement_requested' | 'group_invite';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  expense_id?: string;
  group_id?: string;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // Simulate loading notifications
      // In production, this would fetch from Supabase
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'expense_added',
          title: 'New Expense Added',
          message: 'Anna added "Lunch" for 250 SEK in Stockholm Trip',
          read: false,
          created_at: new Date().toISOString(),
          expense_id: 'exp-1',
          group_id: 'group-1',
        },
        {
          id: '2',
          type: 'payment_received',
          title: 'Payment Received',
          message: 'Erik paid you 150 SEK',
          read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '3',
          type: 'settlement_requested',
          title: 'Settlement Request',
          message: 'Maria requested settlement for Weekend Trip',
          read: true,
          created_at: new Date(Date.now() - 7200000).toISOString(),
          group_id: 'group-2',
        },
        {
          id: '4',
          type: 'group_invite',
          title: 'Group Invitation',
          message: 'John invited you to join "Summer Vacation 2024"',
          read: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          group_id: 'group-3',
        },
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadNotifications();
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = async () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications(notifications.filter((n) => n.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'expense_added':
        return '💰';
      case 'payment_received':
        return '✅';
      case 'settlement_requested':
        return '📊';
      case 'group_invite':
        return '👥';
      default:
        return '🔔';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('sv-SE');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
      onPress={() => markAsRead(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationIcon}>
        <Text style={styles.iconText}>{getNotificationIcon(item.type)}</Text>
        {!item.read && <View style={styles.unreadBadge} />}
      </View>

      <View style={styles.notificationContent}>
        <Text style={[styles.title, !item.read && styles.unreadTitle]}>
          {item.title}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.time}>{formatTime(item.created_at)}</Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNotification(item.id)}
      >
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllButtonText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadText}>
            🔔 {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyTitle}>No notifications</Text>
          <Text style={styles.emptyText}>
            You're all caught up! We'll notify you when something happens.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#3b82f6"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#dbeafe',
  },
  markAllButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3b82f6',
  },
  unreadBanner: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#93c5fd',
  },
  unreadText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e40af',
  },
  list: {
    padding: 16,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  iconText: {
    fontSize: 24,
  },
  unreadBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
