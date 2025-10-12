/**
 * Groups List Screen
 * 
 * Visar alla grupper användaren är med i
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { groupsApi, Split4UsGroup } from '../../lib/split4us/api';
import { formatAmount } from '../../lib/split4us/utils';
import type { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function GroupsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [groups, setGroups] = useState<Split4UsGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setError(null);
      const result = await groupsApi.getAll();
      
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        // Filter out archived groups
        const active = result.data.filter(g => !g.is_archived);
        setGroups(active);
      }
    } catch (err) {
      console.error('Failed to load groups:', err);
      setError('Failed to load groups');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadGroups();
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderGroupCard = ({ item }: { item: Split4UsGroup }) => (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
    >
      <View style={styles.groupHeader}>
        <View style={styles.groupIcon}>
          <Text style={styles.groupEmoji}>👥</Text>
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.groupDescription} numberOfLines={1}>
              {item.description}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.groupStats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Members</Text>
          <Text style={styles.statValue}>{item.member_count || 0}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Expenses</Text>
          <Text style={styles.statValue}>{item.total_expenses || 0}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Currency</Text>
          <Text style={styles.statValue}>{item.currency}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search groups..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Groups List */}
      {error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity onPress={loadGroups} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredGroups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? 'No groups found' : 'No groups yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'Try a different search' : 'Create your first group to get started'}
          </Text>
          {!searchQuery && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateGroup')}
            >
              <Text style={styles.createButtonText}>Create Group</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredGroups}
          renderItem={renderGroupCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Floating Action Button */}
      {groups.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateGroup')}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}
    </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupEmoji: {
    fontSize: 24,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  groupDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  groupStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
