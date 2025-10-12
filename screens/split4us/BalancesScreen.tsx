/**
 * Balances Screen
 * 
 * Visar balances och settlement suggestions
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { balancesApi, UserBalance, SettlementSuggestion } from '../../lib/split4us/api';
import { formatAmount, getBalanceColor, getUserDisplayName } from '../../lib/split4us/utils';

type RouteType = RouteProp<RootStackParamList, 'BalancesScreen'>;

export default function BalancesScreen() {
  const route = useRoute<RouteType>();
  const { groupId } = route.params;

  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [settlements, setSettlements] = useState<SettlementSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingSettlement, setProcessingSettlement] = useState<string | null>(null);

  useEffect(() => {
    if (groupId) {
      loadData();
    }
  }, [groupId]);

  const loadData = async () => {
    try {
      const [balancesResult, settlementsResult] = await Promise.all([
        balancesApi.getAll(groupId),
        balancesApi.getSettlementSuggestions(groupId),
      ]);

      if (balancesResult.data) {
        setBalances(balancesResult.data);
      }
      if (settlementsResult.data) {
        setSettlements(settlementsResult.data);
      }
    } catch (err) {
      console.error('Failed to load balances:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleMarkPaid = async (settlement: SettlementSuggestion) => {
    const key = `${settlement.from_user_id}-${settlement.to_user_id}`;
    
    Alert.alert(
      'Mark as Paid',
      `Mark ${formatAmount(settlement.amount)} payment from ${getUserDisplayName(settlement.from_user)} to ${getUserDisplayName(settlement.to_user)} as complete?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Paid',
          onPress: async () => {
            setProcessingSettlement(key);
            try {
              await balancesApi.recordSettlement(
                groupId,
                settlement.from_user_id,
                settlement.to_user_id,
                settlement.amount
              );
              await loadData();
              Alert.alert('Success', 'Settlement recorded');
            } catch (err) {
              console.error('Failed to record settlement:', err);
              Alert.alert('Error', 'Failed to record settlement');
            } finally {
              setProcessingSettlement(null);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const sortedBalances = [...balances].sort((a, b) => b.balance - a.balance);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Balances */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Balances</Text>
        {sortedBalances.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={styles.emptyText}>No balances yet</Text>
          </View>
        ) : (
          sortedBalances.map((balance) => (
            <View key={balance.user_id} style={styles.balanceCard}>
              <View style={styles.balanceInfo}>
                <Text style={styles.userName}>
                  {getUserDisplayName(balance.user)}
                </Text>
                <View style={styles.balanceDetails}>
                  <Text style={styles.balanceLabel}>
                    Paid: {formatAmount(balance.total_paid, balance.currency)}
                  </Text>
                  <Text style={styles.balanceLabel}>
                    Owed: {formatAmount(balance.total_owed, balance.currency)}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.balanceAmount,
                  { color: getBalanceColor(balance.balance) },
                ]}
              >
                {balance.balance > 0 ? '+' : ''}
                {formatAmount(balance.balance, balance.currency)}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Settlement Suggestions */}
      {settlements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested Settlements</Text>
          <Text style={styles.sectionSubtitle}>
            Optimized to minimize transactions
          </Text>
          {settlements.map((settlement) => {
            const key = `${settlement.from_user_id}-${settlement.to_user_id}`;
            const isProcessing = processingSettlement === key;
            
            return (
              <View key={key} style={styles.settlementCard}>
                <View style={styles.settlementInfo}>
                  <Text style={styles.settlementText}>
                    <Text style={styles.settlementFrom}>
                      {getUserDisplayName(settlement.from_user)}
                    </Text>
                    {' pays '}
                    <Text style={styles.settlementTo}>
                      {getUserDisplayName(settlement.to_user)}
                    </Text>
                  </Text>
                  <Text style={styles.settlementAmount}>
                    {formatAmount(settlement.amount)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.markPaidButton,
                    isProcessing && styles.markPaidButtonDisabled,
                  ]}
                  onPress={() => handleMarkPaid(settlement)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.markPaidButtonText}>Mark Paid</Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  balanceInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  balanceDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  settlementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settlementInfo: {
    marginBottom: 12,
  },
  settlementText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  settlementFrom: {
    fontWeight: '600',
    color: '#EF4444',
  },
  settlementTo: {
    fontWeight: '600',
    color: '#10B981',
  },
  settlementAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  markPaidButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  markPaidButtonDisabled: {
    opacity: 0.6,
  },
  markPaidButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
