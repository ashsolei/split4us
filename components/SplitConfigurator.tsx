import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';

export interface SplitParticipant {
  user_id: string;
  name: string;
  amount?: number;
  percentage?: number;
}

interface SplitConfiguratorProps {
  participants: SplitParticipant[];
  totalAmount: number;
  currency: string;
  onSplitChange: (participants: SplitParticipant[], splitType: string) => void;
}

export const SplitConfigurator: React.FC<SplitConfiguratorProps> = ({
  participants,
  totalAmount,
  currency,
  onSplitChange,
}) => {
  const [splitType, setSplitType] = useState<'equal' | 'percentage' | 'custom'>('equal');
  const [splits, setSplits] = useState<SplitParticipant[]>(participants);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const calculateEqualSplit = () => {
    const amount = totalAmount / participants.length;
    const newSplits = participants.map((p) => ({
      ...p,
      amount: amount,
      percentage: 100 / participants.length,
    }));
    setSplits(newSplits);
    onSplitChange(newSplits, 'equal');
  };

  const updateCustomAmount = (userId: string, value: string) => {
    const amount = parseFloat(value) || 0;
    const newSplits = splits.map((p) =>
      p.user_id === userId
        ? { ...p, amount, percentage: (amount / totalAmount) * 100 }
        : p
    );
    setSplits(newSplits);
    onSplitChange(newSplits, 'custom');
  };

  const updatePercentage = (userId: string, value: string) => {
    const percentage = parseFloat(value) || 0;
    const amount = (totalAmount * percentage) / 100;
    const newSplits = splits.map((p) =>
      p.user_id === userId ? { ...p, percentage, amount } : p
    );
    setSplits(newSplits);
    onSplitChange(newSplits, 'percentage');
  };

  const handleSplitTypeChange = (type: 'equal' | 'percentage' | 'custom') => {
    setSplitType(type);
    if (type === 'equal') {
      calculateEqualSplit();
    }
  };

  const getTotalAllocated = () => {
    return splits.reduce((sum, p) => sum + (p.amount || 0), 0);
  };

  const getTotalPercentage = () => {
    return splits.reduce((sum, p) => sum + (p.percentage || 0), 0);
  };

  const isValid = () => {
    const total = getTotalAllocated();
    return Math.abs(total - totalAmount) < 0.01;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Split Configuration</Text>

      {/* Split Type Selector */}
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            splitType === 'equal' && styles.typeButtonActive,
          ]}
          onPress={() => handleSplitTypeChange('equal')}
        >
          <Text
            style={[
              styles.typeButtonText,
              splitType === 'equal' && styles.typeButtonTextActive,
            ]}
          >
            ⚖️ Equal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            splitType === 'percentage' && styles.typeButtonActive,
          ]}
          onPress={() => handleSplitTypeChange('percentage')}
        >
          <Text
            style={[
              styles.typeButtonText,
              splitType === 'percentage' && styles.typeButtonTextActive,
            ]}
          >
            📊 Percentage
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            splitType === 'custom' && styles.typeButtonActive,
          ]}
          onPress={() => handleSplitTypeChange('custom')}
        >
          <Text
            style={[
              styles.typeButtonText,
              splitType === 'custom' && styles.typeButtonTextActive,
            ]}
          >
            ✏️ Custom
          </Text>
        </TouchableOpacity>
      </View>

      {/* Total Amount Display */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Amount:</Text>
        <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
      </View>

      {/* Participants List */}
      <ScrollView style={styles.participantsList}>
        {splits.map((participant) => (
          <View key={participant.user_id} style={styles.participantCard}>
            <Text style={styles.participantName}>{participant.name}</Text>

            <View style={styles.participantInputs}>
              {splitType === 'equal' ? (
                <View style={styles.equalSplit}>
                  <Text style={styles.equalAmount}>
                    {formatCurrency(participant.amount || 0)}
                  </Text>
                  <Text style={styles.equalPercentage}>
                    ({participant.percentage?.toFixed(1)}%)
                  </Text>
                </View>
              ) : splitType === 'percentage' ? (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    value={participant.percentage?.toString() || '0'}
                    onChangeText={(value) =>
                      updatePercentage(participant.user_id, value)
                    }
                    placeholder="0"
                  />
                  <Text style={styles.inputSuffix}>%</Text>
                  <Text style={styles.calculatedAmount}>
                    = {formatCurrency(participant.amount || 0)}
                  </Text>
                </View>
              ) : (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    value={participant.amount?.toString() || '0'}
                    onChangeText={(value) =>
                      updateCustomAmount(participant.user_id, value)
                    }
                    placeholder="0.00"
                  />
                  <Text style={styles.inputSuffix}>{currency}</Text>
                  <Text style={styles.calculatedAmount}>
                    ({participant.percentage?.toFixed(1)}%)
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Allocated:</Text>
          <Text
            style={[
              styles.summaryValue,
              !isValid() && styles.summaryValueError,
            ]}
          >
            {formatCurrency(getTotalAllocated())}
          </Text>
        </View>

        {splitType !== 'equal' && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Percentage:</Text>
            <Text
              style={[
                styles.summaryValue,
                Math.abs(getTotalPercentage() - 100) > 0.1 &&
                  styles.summaryValueError,
              ]}
            >
              {getTotalPercentage().toFixed(1)}%
            </Text>
          </View>
        )}

        {!isValid() && (
          <Text style={styles.errorText}>
            ⚠️ Total must equal {formatCurrency(totalAmount)}
          </Text>
        )}

        {isValid() && (
          <View style={styles.validBadge}>
            <Text style={styles.validText}>✓ Split is valid</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#3b82f6',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  participantsList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  participantCard: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  participantName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  participantInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  equalSplit: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  equalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  equalPercentage: {
    fontSize: 14,
    color: '#6b7280',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  inputSuffix: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  calculatedAmount: {
    fontSize: 13,
    color: '#9ca3af',
  },
  summary: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  summaryValueError: {
    color: '#ef4444',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 8,
  },
  validBadge: {
    backgroundColor: '#f0fdf4',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  validText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
  },
});
