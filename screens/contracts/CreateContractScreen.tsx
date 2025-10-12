import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';

type CreateContractNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CreateContract'
>;

export default function CreateContractScreen() {
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
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<CreateContractNavigationProp>();

  const handleCreate = async () => {
    if (!title || !startDate || !endDate) {
      Alert.alert('Fel', 'Vänligen fyll i alla obligatoriska fält (titel, start- och slutdatum)');
      return;
    }

    if (endDate <= startDate) {
      Alert.alert('Fel', 'Slutdatum måste vara efter startdatum');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Inte inloggad');

      const { data, error } = await supabase.from('contracts').insert({
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
        user_id: user.id,
      }).select();

      if (error) throw error;

      Alert.alert('Klart', 'Avtalet har skapats', [
        {
          text: 'OK',
          onPress: () => {
            if (data && data[0]) {
              navigation.replace('ContractDetail', { contractId: data[0].id });
            } else {
              navigation.goBack();
            }
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error creating contract:', error.message);
      Alert.alert('Fel', 'Kunde inte skapa avtalet: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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
              onChange={(event, date) => {
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
              onChange={(event, date) => {
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
          style={styles.createButton}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Skapa avtal</Text>
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
  createButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
