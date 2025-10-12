import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

interface Suggestion {
  type: 'category' | 'split' | 'reminder' | 'insight';
  title: string;
  description: string;
  action?: () => void;
  icon: string;
}

interface SmartSuggestionsProps {
  userId: string;
  groupId?: string;
  onApplySuggestion?: (suggestion: Suggestion) => void;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  userId,
  groupId,
  onApplySuggestion,
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, [userId, groupId]);

  const loadSuggestions = async () => {
    setIsLoading(true);
    
    try {
      // Simulate AI-generated suggestions
      // In production, this would call your AI API
      const mockSuggestions: Suggestion[] = [
        {
          type: 'category',
          icon: '🍕',
          title: 'Auto-categorize as "Food"',
          description: 'Based on "Lunch at restaurant" in description',
        },
        {
          type: 'split',
          icon: '⚖️',
          title: 'Suggest Equal Split',
          description: '3 people attended this lunch - split equally?',
        },
        {
          type: 'reminder',
          icon: '🔔',
          title: 'Payment Reminder',
          description: 'Anna owes you 150 SEK for 2 weeks',
        },
        {
          type: 'insight',
          icon: '📊',
          title: 'Spending Pattern',
          description: 'Your food expenses are 20% higher this month',
        },
        {
          type: 'category',
          icon: '🚗',
          title: 'Recurring Transport',
          description: 'Similar taxi expenses detected - create template?',
        },
      ];

      setTimeout(() => {
        setSuggestions(mockSuggestions);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      setIsLoading(false);
    }
  };

  const handleApply = (suggestion: Suggestion) => {
    if (onApplySuggestion) {
      onApplySuggestion(suggestion);
    }
    // Remove applied suggestion
    setSuggestions(suggestions.filter((s) => s !== suggestion));
  };

  const handleDismiss = (suggestion: Suggestion) => {
    setSuggestions(suggestions.filter((s) => s !== suggestion));
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'category':
        return '#3b82f6';
      case 'split':
        return '#10b981';
      case 'reminder':
        return '#f59e0b';
      case 'insight':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading AI suggestions...</Text>
      </View>
    );
  }

  if (suggestions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>💡</Text>
        <Text style={styles.emptyTitle}>No suggestions yet</Text>
        <Text style={styles.emptyText}>
          AI will analyze your expenses and provide smart suggestions
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🤖 AI Suggestions</Text>
        <Text style={styles.subtitle}>{suggestions.length} suggestions</Text>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {suggestions.map((suggestion, index) => (
          <View
            key={index}
            style={[
              styles.suggestionCard,
              { borderLeftColor: getSuggestionColor(suggestion.type) },
            ]}
          >
            <View style={styles.suggestionHeader}>
              <View style={styles.suggestionIcon}>
                <Text style={styles.icon}>{suggestion.icon}</Text>
              </View>
              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                <Text style={styles.suggestionDescription}>
                  {suggestion.description}
                </Text>
              </View>
            </View>

            <View style={styles.suggestionActions}>
              <TouchableOpacity
                style={styles.dismissButton}
                onPress={() => handleDismiss(suggestion)}
              >
                <Text style={styles.dismissButtonText}>Dismiss</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.applyButton,
                  { backgroundColor: getSuggestionColor(suggestion.type) },
                ]}
                onPress={() => handleApply(suggestion)}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.refreshButton} onPress={loadSuggestions}>
        <Text style={styles.refreshButtonText}>🔄 Refresh Suggestions</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f9fafb',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  suggestionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  suggestionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  dismissButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  dismissButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  refreshButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3b82f6',
  },
});
