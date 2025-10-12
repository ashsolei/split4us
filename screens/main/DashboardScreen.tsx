import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface DashboardStats {
  totalContracts: number;
  activeContracts: number;
  expiringContracts: number;
  totalValue: number;
}

interface UpcomingContract {
  id: string;
  title: string;
  end_date: string;
  monthly_cost: number;
}

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats>({
    totalContracts: 0,
    activeContracts: 0,
    expiringContracts: 0,
    totalValue: 0,
  });
  const [upcomingContracts, setUpcomingContracts] = useState<UpcomingContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<DashboardNavigationProp>();

  const loadDashboardData = async () => {
    try {
      // Get all contracts
      const { data: contracts, error } = await supabase
        .from('contracts')
        .select('*')
        .order('end_date', { ascending: true });

      if (error) throw error;

      if (contracts) {
        const now = new Date();
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

        const active = contracts.filter(c => new Date(c.end_date) > now);
        const expiring = contracts.filter(
          c => new Date(c.end_date) > now && new Date(c.end_date) <= threeMonthsFromNow
        );
        const totalValue = active.reduce((sum, c) => sum + (c.monthly_cost || 0), 0);

        setStats({
          totalContracts: contracts.length,
          activeContracts: active.length,
          expiringContracts: expiring.length,
          totalValue,
        });

        setUpcomingContracts(expiring.slice(0, 5));
      }
    } catch (error: any) {
      console.error('Error loading dashboard:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#3b82f6' }]}>
          <Ionicons name="document-text" size={24} color="#fff" />
          <Text style={styles.statValue}>{stats.totalContracts}</Text>
          <Text style={styles.statLabel}>Totalt avtal</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.statValue}>{stats.activeContracts}</Text>
          <Text style={styles.statLabel}>Aktiva</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#f59e0b' }]}>
          <Ionicons name="time" size={24} color="#fff" />
          <Text style={styles.statValue}>{stats.expiringContracts}</Text>
          <Text style={styles.statLabel}>Utgår snart</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#8b5cf6' }]}>
          <Ionicons name="cash" size={24} color="#fff" />
          <Text style={styles.statValue}>{stats.totalValue.toLocaleString('sv-SE')} kr</Text>
          <Text style={styles.statLabel}>Månadskostnad</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Utgående avtal (3 månader)</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Contracts' })}>
            <Text style={styles.seeAll}>Se alla</Text>
          </TouchableOpacity>
        </View>

        {upcomingContracts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>Inga avtal utgår inom 3 månader</Text>
          </View>
        ) : (
          upcomingContracts.map(contract => (
            <TouchableOpacity
              key={contract.id}
              style={styles.contractCard}
              onPress={() => navigation.navigate('ContractDetail', { contractId: contract.id })}
            >
              <View style={styles.contractInfo}>
                <Text style={styles.contractTitle}>{contract.title}</Text>
                <Text style={styles.contractDate}>
                  Utgår: {format(new Date(contract.end_date), 'PPP', { locale: sv })}
                </Text>
              </View>
              <View style={styles.contractCost}>
                <Text style={styles.costText}>{contract.monthly_cost} kr/mån</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Snabbåtgärder</Text>
        
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('CreateContract')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="add-circle" size={24} color="#3b82f6" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Skapa nytt avtal</Text>
            <Text style={styles.actionDescription}>Lägg till ett nytt avtal i systemet</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Main', { screen: 'Calendar' })}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="calendar" size={24} color="#3b82f6" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Visa kalender</Text>
            <Text style={styles.actionDescription}>Se alla avtalsrelaterade händelser</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  seeAll: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  contractCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
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
  contractInfo: {
    flex: 1,
  },
  contractTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  contractDate: {
    fontSize: 13,
    color: '#f59e0b',
  },
  contractCost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  costText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  actionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
});
