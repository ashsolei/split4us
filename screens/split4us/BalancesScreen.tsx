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
import type { RootStackParamList } from '../../types/navigation';
import { balancesApi, UserBalance, SettlementSuggestion } from '../../lib/split4us/api';
import { formatAmount, getBalanceColor, getUserDisplayName } from '../../lib/split4us/utils';
import { shareBalanceSummary } from '../../lib/split4us/export';
import { useTheme } from '../../contexts/ThemeContext';

type RouteType = RouteProp<RootStackParamList, 'BalancesScreen'>;

export default function BalancesScreen() {
  const route = useRoute<RouteType>();
  const { groupId } = route.params;

  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [settlements, setSettlements] = useState<SettlementSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingSettlement, setProcessingSettlement] = useState<string | null>(null);
  const { colors } = useTheme();

  useEffect(() => {
    if (groupId) {
      loadData();
    }
  }, [groupId]);

  const loadData = async () => {
    try {
      setError(null);
      const [balancesResult, settlementsResult] = await Promise.all([
        balancesApi.getAll(groupId),
        balancesApi.getSettlementSuggestions(groupId),
      ]);

      if (balancesResult.error) {
        setError(balancesResult.error);
        return;
      }
      if (balancesResult.data) {
        setBalances(balancesResult.data);
      }
      if (settlementsResult.data) {
        setSettlements(settlementsResult.data);
      }
    } catch {
      // Error handled via state
      setError('Failed to load balances');
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
            } catch {
              // Error handled via state
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
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const sortedBalances = [...balances].sort((a, b) => b.balance - a.balance);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Balances */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Balances</Text>
          {sortedBalances.length > 0 && (
            <TouchableOpacity
              onPress={() => shareBalanceSummary(
                balances.map(b => ({
                  name: b.user?.full_name || b.user?.email || b.user_id,
                  amount: b.balance,
                  currency: b.currency,
                })),
                groupId
              )}
              style={[styles.shareButton, { backgroundColor: colors.primaryLight }]}
            >
              <Text style={[styles.shareButtonText, { color: colors.primary }]}>📤 Share</Text>
            </TouchableOpacity>
          )}
        </View>
        {sortedBalances.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No balances yet</Text>
          </View>
        ) : (
          sortedBalances.map((balance) => (
            <View key={balance.user_id} style={[styles.balanceCard, { backgroundColor: colors.card }]}>
              <View style={styles.balanceInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>
                  {getUserDisplayName(balance.user)}
                </Text>
                <View style={styles.balanceDetails}>
                  <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
                    Paid: {formatAmount(balance.total_paid, balance.currency)}
                  </Text>
                  <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Suggested Settlements</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Optimized to minimize transactions
          </Text>
          {settlements.map((settlement) => {
            const key = `${settlement.from_user_id}-${settlement.to_user_id}`;
            const isProcessing = processingSettlement === key;
            
            return (
              <View key={key} style={[styles.settlementCard, { backgroundColor: colors.card }]}>
                <View style={styles.settlementInfo}>
                  <Text style={[styles.settlementText, { color: colors.textSecondary }]}>
                    <Text style={[styles.settlementFrom, { color: colors.error }]}>
                      {getUserDisplayName(settlement.from_user)}
                    </Text>
                    {' pays '}
                    <Text style={[styles.settlementTo, { color: colors.success }]}>
                      {getUserDisplayName(settlement.to_user)}
                    </Text>
                  </Text>
                  <Text style={[styles.settlementAmount, { color: colors.text }]}>
                    {formatAmount(settlement.amount)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.markPaidButton,
                    { backgroundColor: colors.success },
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
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  shareButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  balanceCard: {
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
    marginBottom: 4,
  },
  balanceDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  balanceLabel: {
    fontSize: 12,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  settlementCard: {
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
    marginBottom: 4,
  },
  settlementFrom: {
    fontWeight: '600',
  },
  settlementTo: {
    fontWeight: '600',
  },
  settlementAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  markPaidButton: {
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
  },
});
