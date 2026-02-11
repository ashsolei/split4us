/**
 * Settings Screen
 * 
 * App settings och preferenser:
 * - Profile info
 * - Notification settings
 * - Currency preferences
 * - About/help
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark, setMode } = useTheme();
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: Record<string, string> } | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            // Navigation will be handled by auth state change
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile Section */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Profile</Text>
        
        <View style={[styles.profileCard, { borderBottomColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {user?.email?.substring(0, 2).toUpperCase() || '??'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {user?.user_metadata?.full_name || 'User'}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email || 'No email'}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.settingRow, { borderBottomColor: colors.border }]}
          onPress={() => Alert.alert('Coming Soon', 'Edit profile coming soon!')}
        >
          <Text style={[styles.settingLabel, { color: colors.text }]}>Edit Profile</Text>
          <Text style={[styles.settingArrow, { color: colors.textTertiary }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications Section */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Notifications</Text>

        <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Email Notifications</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Receive email updates about expenses and settlements
            </Text>
          </View>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            trackColor={{ false: colors.border, true: '#93C5FD' }}
            thumbColor={emailNotifications ? colors.primary : colors.inputBg}
          />
        </View>

        <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Push Notifications</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Get instant alerts on your device
            </Text>
          </View>
          <Switch
            value={pushNotifications}
            onValueChange={setPushNotifications}
            trackColor={{ false: colors.border, true: '#93C5FD' }}
            thumbColor={pushNotifications ? colors.primary : colors.inputBg}
          />
        </View>
      </View>

      {/* Preferences Section */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferences</Text>

        <TouchableOpacity
          style={[styles.settingRow, { borderBottomColor: colors.border }]}
          onPress={() => Alert.alert('Coming Soon', 'Currency settings coming soon!')}
        >
          <Text style={[styles.settingLabel, { color: colors.text }]}>Default Currency</Text>
          <View style={styles.settingValue}>
            <Text style={[styles.settingValueText, { color: colors.textSecondary }]}>SEK</Text>
            <Text style={[styles.settingArrow, { color: colors.textTertiary }]}>›</Text>
          </View>
        </TouchableOpacity>

        <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Use dark theme throughout the app
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={(val) => setMode(val ? 'dark' : 'light')}
            trackColor={{ false: colors.border, true: '#93C5FD' }}
            thumbColor={isDark ? colors.primary : colors.inputBg}
          />
        </View>
      </View>

      {/* About Section */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About</Text>

        <TouchableOpacity
          style={[styles.settingRow, { borderBottomColor: colors.border }]}
          onPress={() => Alert.alert('Split4Us', 'Version 1.3.0\n\nExpense sharing made easy!')}
        >
          <Text style={[styles.settingLabel, { color: colors.text }]}>App Version</Text>
          <Text style={[styles.settingValueText, { color: colors.textSecondary }]}>1.3.0</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingRow, { borderBottomColor: colors.border }]}
          onPress={() => Alert.alert('Coming Soon', 'Help center coming soon!')}
        >
          <Text style={[styles.settingLabel, { color: colors.text }]}>Help & Support</Text>
          <Text style={[styles.settingArrow, { color: colors.textTertiary }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingRow, { borderBottomColor: colors.border }]}
          onPress={() => Alert.alert('Coming Soon', 'Terms of service coming soon!')}
        >
          <Text style={[styles.settingLabel, { color: colors.text }]}>Terms of Service</Text>
          <Text style={[styles.settingArrow, { color: colors.textTertiary }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingRow, { borderBottomColor: colors.border }]}
          onPress={() => Alert.alert('Coming Soon', 'Privacy policy coming soon!')}
        >
          <Text style={[styles.settingLabel, { color: colors.text }]}>Privacy Policy</Text>
          <Text style={[styles.settingArrow, { color: colors.textTertiary }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.signOutButton, { borderColor: colors.error }]}
          onPress={handleSignOut}
        >
          <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          Made with ❤️ for expense sharing
        </Text>
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          © 2026 Split4Us
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: 16,
    marginRight: 4,
  },
  settingArrow: {
    fontSize: 24,
    fontWeight: '300',
  },
  signOutButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 12,
    borderWidth: 1,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    marginBottom: 4,
  },
});
