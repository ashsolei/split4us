import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Balance {
  user_id: string;
  user_name: string;
  amount: number;
  currency: string;
}

interface BalanceCardProps {
  balance: Balance;
  onPress?: () => void;
  showSettleButton?: boolean;
  onSettle?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  onPress,
  showSettleButton = false,
  onSettle,
}) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: currency,
    }).format(Math.abs(amount));
  };

  const isOwed = balance.amount > 0;
  const isOwing = balance.amount < 0;
  const isSettled = balance.amount === 0;

  const getStatusColor = () => {
    if (isOwed) return '#10b981'; // Green
    if (isOwing) return '#ef4444'; // Red
    return '#6b7280'; // Gray
  };

  const getStatusText = () => {
    if (isOwed) return 'owes you';
    if (isOwing) return 'you owe';
    return 'settled';
  };

  const getStatusIcon = () => {
    if (isOwed) return '💰';
    if (isOwing) return '💸';
    return '✅';
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: getStatusColor() + '20' },
              ]}
            >
              <Text style={styles.avatar}>
                {balance.user_name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{balance.user_name}</Text>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusIcon()} {getStatusText()}
              </Text>
            </View>
          </View>

          <View style={styles.amountContainer}>
            <Text style={[styles.amount, { color: getStatusColor() }]}>
              {formatCurrency(balance.amount, balance.currency)}
            </Text>
            <Text style={styles.currency}>{balance.currency}</Text>
          </View>
        </View>

        {showSettleButton && !isSettled && (
          <TouchableOpacity
            style={[
              styles.settleButton,
              { backgroundColor: getStatusColor() },
            ]}
            onPress={onSettle}
            activeOpacity={0.8}
          >
            <Text style={styles.settleButtonText}>
              {isOwing ? 'Settle Up' : 'Request Payment'}
            </Text>
          </TouchableOpacity>
        )}

        {isSettled && (
          <View style={styles.settledBadge}>
            <Text style={styles.settledText}>✓ All settled up!</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  currency: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  settleButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  settleButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  settledBadge: {
    backgroundColor: '#f0fdf4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  settledText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500',
  },
});
