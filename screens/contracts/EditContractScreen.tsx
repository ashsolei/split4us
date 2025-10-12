import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../../lib/supabase';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../types/navigation';

type EditContractNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'EditContract'
>;
type EditContractRouteProp = RouteProp<RootStackParamList, 'EditContract'>;

export default function EditContractScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [supplier, setSupplier] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [monthlyCost, setMonthlyCost] = useState('');
  const [yearlyCost, setYearlyCost] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [noticePeriodDays, setNoticePeriodDays] = useState('');

  const navigation = useNavigation<EditContractNavigationProp>();
  const route = useRoute<EditContractRouteProp>();
  const { contractId } = route.params;

  const loadContract = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single();

      if (error) throw error;

      if (data) {
        setTitle(data.title || '');
        setDescription(data.description || '');
        setCategory(data.category || '');
        setSupplier(data.supplier || '');
        setContractNumber(data.contract_number || '');
        setStartDate(new Date(data.start_date));
        setEndDate(new Date(data.end_date));
        setMonthlyCost(data.monthly_cost?.toString() || '');
        setYearlyCost(data.yearly_cost?.toString() || '');
        setContactPerson(data.contact_person || '');
        setContactEmail(data.contact_email || '');
        setContactPhone(data.contact_phone || '');
        setPaymentMethod(data.payment_method || '');
        setAutoRenewal(data.auto_renewal || false);
        setNoticePeriodDays(data.notice_period_days?.toString() || '');
      }
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

  const handleSave = async () => {
    if (!title || !startDate || !endDate) {
      Alert.alert('Fel', 'Vänligen fyll i alla obligatoriska fält');
      return;
    }

    if (endDate <= startDate) {
      Alert.alert('Fel', 'Slutdatum måste vara efter startdatum');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('contracts')
        .update({
          title,
          description: description || null,
          category: category || null,
          supplier: supplier || null,
          contract_number: contractNumber || null,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          monthly_cost: monthlyCost ? parseFloat(monthlyCost) : null,
          yearly_cost: yearlyCost ? parseFloat(yearlyCost) : null,
          contact_person: contactPerson || null,
          contact_email: contactEmail || null,
          contact_phone: contactPhone || null,
          payment_method: paymentMethod || null,
          auto_renewal: autoRenewal,
          notice_period_days: noticePeriodDays ? parseInt(noticePeriodDays) : null,
        })
        .eq('id', contractId);

      if (error) throw error;

      Alert.alert('Klart', 'Avtalet har uppdaterats', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Error updating contract:', error.message);
      Alert.alert('Fel', 'Kunde inte uppdatera avtalet');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Grundläggande information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Titel <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="T.ex. Bredbandsavtal Telia"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Beskrivning</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Beskriv avtalet..."
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kategori</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="T.ex. Bredband, Telefoni, Försäkring"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Avtalsnummer</Text>
          <TextInput
            style={styles.input}
            value={contractNumber}
            onChangeText={setContractNumber}
            placeholder="Avtalsnummer eller referens"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datum</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Startdatum <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#6b7280" />
            <Text style={styles.dateText}>
              {startDate.toLocaleDateString('sv-SE')}
            </Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event: any, date?: Date) => {
                setShowStartPicker(Platform.OS === 'ios');
                if (date) setStartDate(date);
              }}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Slutdatum <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndPicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#6b7280" />
            <Text style={styles.dateText}>
              {endDate.toLocaleDateString('sv-SE')}
            </Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event: any, date?: Date) => {
                setShowEndPicker(Platform.OS === 'ios');
                if (date) setEndDate(date);
              }}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Uppsägningstid (dagar)</Text>
          <TextInput
            style={styles.input}
            value={noticePeriodDays}
            onChangeText={setNoticePeriodDays}
            placeholder="T.ex. 30, 60, 90"
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Automatisk förnyelse</Text>
          <Switch
            value={autoRenewal}
            onValueChange={setAutoRenewal}
            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
            thumbColor={autoRenewal ? '#3b82f6' : '#f3f4f6'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kostnad</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Månadskostnad (kr)</Text>
          <TextInput
            style={styles.input}
            value={monthlyCost}
            onChangeText={setMonthlyCost}
            placeholder="0"
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Årskostnad (kr)</Text>
          <TextInput
            style={styles.input}
            value={yearlyCost}
            onChangeText={setYearlyCost}
            placeholder="0"
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Betalningsmetod</Text>
          <TextInput
            style={styles.input}
            value={paymentMethod}
            onChangeText={setPaymentMethod}
            placeholder="T.ex. Autogiro, Faktura, Kort"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Leverantör & Kontakt</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Leverantör</Text>
          <TextInput
            style={styles.input}
            value={supplier}
            onChangeText={setSupplier}
            placeholder="Företagsnamn"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kontaktperson</Text>
          <TextInput
            style={styles.input}
            value={contactPerson}
            onChangeText={setContactPerson}
            placeholder="Namn på kontaktperson"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-post</Text>
          <TextInput
            style={styles.input}
            value={contactEmail}
            onChangeText={setContactEmail}
            placeholder="kontakt@foretagsnamn.se"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Telefon</Text>
          <TextInput
            style={styles.input}
            value={contactPhone}
            onChangeText={setContactPhone}
            placeholder="08-123 456 78"
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Avbryt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Spara ändringar</Text>
          )}
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#111827',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
