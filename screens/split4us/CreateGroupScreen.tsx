/**
 * Create Group Screen
 * 
 * Formulär för att skapa ny grupp
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { groupsApi, CreateGroupRequest } from '../../lib/split4us/api';
import { validateGroupName } from '../../lib/split4us/utils';

const CURRENCIES = [
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CreateGroupScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('SEK');

  const handleSubmit = async () => {
    // Validation
    const nameValidation = validateGroupName(name);
    if (!nameValidation.isValid) {
      Alert.alert('Error', nameValidation.error);
      return;
    }

    setLoading(true);

    try {
      const groupData: CreateGroupRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        currency,
      };

      const result = await groupsApi.create(groupData);

      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        Alert.alert('Success', 'Group created successfully', [
          { 
            text: 'OK', 
            onPress: () => navigation.goBack()
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to create group:', err);
      Alert.alert('Error', 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Group Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Summer Trip 2025"
            value={name}
            onChangeText={setName}
            maxLength={100}
          />
          <Text style={styles.hint}>{name.length}/100</Text>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add details about this group..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
          <Text style={styles.hint}>{description.length}/500</Text>
        </View>

        {/* Currency */}
        <View style={styles.field}>
          <Text style={styles.label}>Currency</Text>
          <View style={styles.currencyGrid}>
            {CURRENCIES.map((curr) => (
              <TouchableOpacity
                key={curr.code}
                style={[
                  styles.currencyButton,
                  currency === curr.code && styles.currencyButtonActive,
                ]}
                onPress={() => setCurrency(curr.code)}
              >
                <Text style={[
                  styles.currencyCode,
                  currency === curr.code && styles.currencyCodeActive,
                ]}>
                  {curr.symbol}
                </Text>
                <Text style={[
                  styles.currencyName,
                  currency === curr.code && styles.currencyNameActive,
                ]}>
                  {curr.code}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Create Group</Text>
          )}
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            You can add members to your group after creating it.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  form: {
    padding: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'right',
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  currencyButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  currencyButtonActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  currencyCode: {
    fontSize: 24,
    marginBottom: 4,
  },
  currencyCodeActive: {
    color: '#3B82F6',
  },
  currencyName: {
    fontSize: 12,
    color: '#6B7280',
  },
  currencyNameActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
});
