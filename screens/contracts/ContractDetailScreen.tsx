import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../types/navigation';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

type ContractDetailNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ContractDetail'
>;
type ContractDetailRouteProp = RouteProp<RootStackParamList, 'ContractDetail'>;

interface Contract {
  id: string;
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  monthly_cost: number;
  yearly_cost: number;
  contract_number: string;
  supplier: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  payment_method: string;
  auto_renewal: boolean;
  notice_period_days: number;
  file_url: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function ContractDetailScreen() {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<ContractDetailNavigationProp>();
  const route = useRoute<ContractDetailRouteProp>();
  const { contractId } = route.params;

  const loadContract = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (error) throw error;
      setContract(data);
    } catch (error: any) {
      console.error('Error loading contract:', error.message);
      Alert.alert('Fel', 'Kunde inte ladda avtalet');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContract();
  }, [contractId]);

  const handleDelete = () => {
    Alert.alert(
      'Ta bort avtal',
      'Är du säker på att du vill ta bort detta avtal? Detta kan inte ångras.',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('contracts')
                .delete()
                .eq('id', contractId);

              if (error) throw error;

              Alert.alert('Klart', 'Avtalet har tagits bort');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Fel', 'Kunde inte ta bort avtalet');
            }
          },
        },
      ]
    );
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const getDaysUntilExpiry = () => {
    if (!contract) return 0;
    const now = new Date();
    const end = new Date(contract.end_date);
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = () => {
    const days = getDaysUntilExpiry();
    if (days < 0) return '#ef4444';
    if (days < 30) return '#f59e0b';
    if (days < 90) return '#eab308';
    return '#10b981';
  };

  const getStatusText = () => {
    const days = getDaysUntilExpiry();
    if (days < 0) return 'Utgånget';
    if (days < 30) return `Utgår om ${days} dagar`;
    if (days < 90) return `Utgår om ${Math.ceil(days / 30)} månader`;
    return 'Aktivt';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!contract) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Avtalet kunde inte hittas</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.statusBanner, { backgroundColor: getStatusColor() }]}>
        <Ionicons name="information-circle" size={24} color="#fff" />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>{contract.title}</Text>
        {contract.description && (
          <Text style={styles.description}>{contract.description}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Avtalsinformation</Text>

        <View style={styles.infoCard}>
          {contract.contract_number && (
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={20} color="#6b7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Avtalsnummer</Text>
                <Text style={styles.infoValue}>{contract.contract_number}</Text>
              </View>
            </View>
          )}

          {contract.category && (
            <View style={styles.infoRow}>
              <Ionicons name="pricetag-outline" size={20} color="#6b7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Kategori</Text>
                <Text style={styles.infoValue}>{contract.category}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Startdatum</Text>
              <Text style={styles.infoValue}>
                {format(new Date(contract.start_date), 'PPP', { locale: sv })}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Slutdatum</Text>
              <Text style={styles.infoValue}>
                {format(new Date(contract.end_date), 'PPP', { locale: sv })}
              </Text>
            </View>
          </View>

          {contract.notice_period_days > 0 && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#6b7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Uppsägningstid</Text>
                <Text style={styles.infoValue}>{contract.notice_period_days} dagar</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="repeat-outline" size={20} color="#6b7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Automatisk förnyelse</Text>
              <Text style={styles.infoValue}>
                {contract.auto_renewal ? 'Ja' : 'Nej'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {(contract.monthly_cost > 0 || contract.yearly_cost > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kostnad</Text>

          <View style={styles.costCard}>
            {contract.monthly_cost > 0 && (
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Månadskostnad</Text>
                <Text style={styles.costValue}>
                  {contract.monthly_cost.toLocaleString('sv-SE')} kr
                </Text>
              </View>
            )}

            {contract.yearly_cost > 0 && (
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Årskostnad</Text>
                <Text style={styles.costValue}>
                  {contract.yearly_cost.toLocaleString('sv-SE')} kr
                </Text>
              </View>
            )}

            {contract.payment_method && (
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Betalningsmetod</Text>
                <Text style={styles.costValue}>{contract.payment_method}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {(contract.supplier || contract.contact_person) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kontaktinformation</Text>

          <View style={styles.infoCard}>
            {contract.supplier && (
              <View style={styles.infoRow}>
                <Ionicons name="business-outline" size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Leverantör</Text>
                  <Text style={styles.infoValue}>{contract.supplier}</Text>
                </View>
              </View>
            )}

            {contract.contact_person && (
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Kontaktperson</Text>
                  <Text style={styles.infoValue}>{contract.contact_person}</Text>
                </View>
              </View>
            )}

            {contract.contact_email && (
              <TouchableOpacity
                style={styles.infoRow}
                onPress={() => handleEmail(contract.contact_email)}
              >
                <Ionicons name="mail-outline" size={20} color="#3b82f6" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>E-post</Text>
                  <Text style={[styles.infoValue, styles.linkText]}>
                    {contract.contact_email}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {contract.contact_phone && (
              <TouchableOpacity
                style={styles.infoRow}
                onPress={() => handleCall(contract.contact_phone)}
              >
                <Ionicons name="call-outline" size={20} color="#3b82f6" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Telefon</Text>
                  <Text style={[styles.infoValue, styles.linkText]}>
                    {contract.contact_phone}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {contract.tags && contract.tags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Taggar</Text>
          <View style={styles.tagsContainer}>
            {contract.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Åtgärder</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditContract', { contractId })}
        >
          <Ionicons name="create-outline" size={24} color="#3b82f6" />
          <Text style={styles.actionButtonText}>Redigera avtal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={24} color="#ef4444" />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            Ta bort avtal
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metadata}>
        <Text style={styles.metadataText}>
          Skapad: {format(new Date(contract.created_at), 'PPP', { locale: sv })}
        </Text>
        <Text style={styles.metadataText}>
          Uppdaterad: {format(new Date(contract.updated_at), 'PPP', { locale: sv })}
        </Text>
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
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  linkText: {
    color: '#3b82f6',
  },
  costCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  costLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  costValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  deleteButton: {
    borderColor: '#fecaca',
  },
  deleteButtonText: {
    color: '#ef4444',
  },
  metadata: {
    padding: 16,
    alignItems: 'center',
    gap: 4,
    paddingBottom: 32,
  },
  metadataText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
