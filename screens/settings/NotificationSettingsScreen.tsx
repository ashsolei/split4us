import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface NotificationSetting {
  id: string;
  user_id: string;
  notify_expiring_contracts: boolean;
  notify_before_days: number;
  email_notifications: boolean;
  push_notifications: boolean;
  slack_notifications: boolean;
  teams_notifications: boolean;
}

export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState<NotificationSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      } else {
        // Create default settings
        const { data: newSettings, error: insertError } = await supabase
          .from('notification_settings')
          .insert({
            user_id: user?.id,
            notify_expiring_contracts: true,
            notify_before_days: 30,
            email_notifications: true,
            push_notifications: false,
            slack_notifications: false,
            teams_notifications: false,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newSettings);
      }
    } catch (error: any) {
      console.error('Error loading settings:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSetting = async (key: string, value: any) => {
    if (!settings) return;

    try {
      const { error } = await supabase
        .from('notification_settings')
        .update({ [key]: value })
        .eq('id', settings.id);

      if (error) throw error;

      setSettings({ ...settings, [key]: value });
      Alert.alert('Klart', 'Inställningen har sparats');
    } catch (error: any) {
      Alert.alert('Fel', 'Kunde inte spara inställningen');
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
        <Text style={styles.sectionTitle}>Notifieringskanaler</Text>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() =>
            updateSetting('email_notifications', !settings?.email_notifications)
          }
        >
          <View style={styles.settingIcon}>
            <Ionicons name="mail" size={24} color="#3b82f6" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>E-postnotifieringar</Text>
            <Text style={styles.settingSubtitle}>
              Få påminnelser via e-post
            </Text>
          </View>
          <View
            style={[
              styles.toggle,
              settings?.email_notifications && styles.toggleActive,
            ]}
          >
            {settings?.email_notifications && (
              <Ionicons name="checkmark" size={20} color="#fff" />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() =>
            updateSetting('push_notifications', !settings?.push_notifications)
          }
        >
          <View style={styles.settingIcon}>
            <Ionicons name="notifications" size={24} color="#3b82f6" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Push-notifieringar</Text>
            <Text style={styles.settingSubtitle}>
              Få påminnelser direkt i appen
            </Text>
          </View>
          <View
            style={[
              styles.toggle,
              settings?.push_notifications && styles.toggleActive,
            ]}
          >
            {settings?.push_notifications && (
              <Ionicons name="checkmark" size={20} color="#fff" />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() =>
            updateSetting('slack_notifications', !settings?.slack_notifications)
          }
        >
          <View style={styles.settingIcon}>
            <Ionicons name="logo-slack" size={24} color="#3b82f6" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Slack-notifieringar</Text>
            <Text style={styles.settingSubtitle}>
              Skicka meddelanden till Slack
            </Text>
          </View>
          <View
            style={[
              styles.toggle,
              settings?.slack_notifications && styles.toggleActive,
            ]}
          >
            {settings?.slack_notifications && (
              <Ionicons name="checkmark" size={20} color="#fff" />
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() =>
            updateSetting('teams_notifications', !settings?.teams_notifications)
          }
        >
          <View style={styles.settingIcon}>
            <Ionicons name="people" size={24} color="#3b82f6" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Teams-notifieringar</Text>
            <Text style={styles.settingSubtitle}>
              Skicka meddelanden till Microsoft Teams
            </Text>
          </View>
          <View
            style={[
              styles.toggle,
              settings?.teams_notifications && styles.toggleActive,
            ]}
          >
            {settings?.teams_notifications && (
              <Ionicons name="checkmark" size={20} color="#fff" />
            )}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Påminnelseinställningar</Text>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() =>
            updateSetting(
              'notify_expiring_contracts',
              !settings?.notify_expiring_contracts
            )
          }
        >
          <View style={styles.settingIcon}>
            <Ionicons name="time" size={24} color="#f59e0b" />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Utgående avtal</Text>
            <Text style={styles.settingSubtitle}>
              Påminnelser om avtal som snart utgår
            </Text>
          </View>
          <View
            style={[
              styles.toggle,
              settings?.notify_expiring_contracts && styles.toggleActive,
            ]}
          >
            {settings?.notify_expiring_contracts && (
              <Ionicons name="checkmark" size={20} color="#fff" />
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text style={styles.infoText}>
            Du kommer att få påminnelser{' '}
            <Text style={styles.infoTextBold}>
              {settings?.notify_before_days} dagar
            </Text>{' '}
            innan ett avtal utgår
          </Text>
        </View>

        <View style={styles.daysSelector}>
          {[7, 14, 30, 60, 90].map(days => (
            <TouchableOpacity
              key={days}
              style={[
                styles.dayButton,
                settings?.notify_before_days === days && styles.dayButtonActive,
              ]}
              onPress={() => updateSetting('notify_before_days', days)}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  settings?.notify_before_days === days &&
                    styles.dayButtonTextActive,
                ]}
              >
                {days} dagar
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="bulb-outline" size={24} color="#8b5cf6" />
        <View style={styles.infoBoxContent}>
          <Text style={styles.infoBoxTitle}>Tips</Text>
          <Text style={styles.infoBoxText}>
            Kombinera flera notifieringskanaler för att aldrig missa viktiga
            avtalsförnyelser. Vi rekommenderar e-post och push-notifieringar.
          </Text>
        </View>
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  toggle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#3b82f6',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  infoTextBold: {
    fontWeight: '600',
  },
  daysSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dayButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  dayButtonTextActive: {
    color: '#fff',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#faf5ff',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    gap: 12,
  },
  infoBoxContent: {
    flex: 1,
  },
  infoBoxTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7c3aed',
    marginBottom: 4,
  },
  infoBoxText: {
    fontSize: 14,
    color: '#6b21a8',
    lineHeight: 20,
  },
});
