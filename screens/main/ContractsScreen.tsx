import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

type ContractsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Contract {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  monthly_cost: number;
  category: string;
  status: string;
}

export default function ContractsScreen() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<ContractsNavigationProp>();

  const loadContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('end_date', { ascending: true });

      if (error) throw error;

      if (data) {
        setContracts(data);
        setFilteredContracts(data);
      }
    } catch (error: any) {
      console.error('Error loading contracts:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContracts(contracts);
    } else {
      const filtered = contracts.filter(
        contract =>
          contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contract.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredContracts(filtered);
    }
  }, [searchQuery, contracts]);

  const onRefresh = () => {
    setRefreshing(true);
    loadContracts();
  };

  const getStatusColor = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffMonths = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (diffMonths < 0) return '#ef4444'; // Expired - red
    if (diffMonths < 1) return '#f59e0b'; // Expiring soon - orange
    if (diffMonths < 3) return '#eab308'; // Warning - yellow
    return '#10b981'; // Active - green
  };

  const getStatusText = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffMonths = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (diffMonths < 0) return 'Utgånget';
    if (diffMonths < 1) return 'Utgår snart';
    if (diffMonths < 3) return 'Varning';
    return 'Aktivt';
  };

  const renderContract = ({ item }: { item: Contract }) => (
    <TouchableOpacity
      style={styles.contractCard}
      onPress={() => navigation.navigate('ContractDetail', { contractId: item.id })}
    >
      <View style={styles.contractHeader}>
        <View style={styles.contractTitleContainer}>
          <Text style={styles.contractTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.end_date) }]}>
            <Text style={styles.statusText}>{getStatusText(item.end_date)}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>

      <View style={styles.contractDetails}>
        {item.category && (
          <View style={styles.detailRow}>
            <Ionicons name="pricetag-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{item.category}</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            Utgår: {format(new Date(item.end_date), 'PPP', { locale: sv })}
          </Text>
        </View>
        {item.monthly_cost > 0 && (
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{item.monthly_cost} kr/mån</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Sök avtal..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredContracts}
        renderItem={renderContract}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'Inga avtal hittades' : 'Inga avtal än'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('CreateContract')}
              >
                <Text style={styles.addButtonText}>Skapa första avtalet</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateContract')}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
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
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  contractCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contractTitleContainer: {
    flex: 1,
  },
  contractTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  contractDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
