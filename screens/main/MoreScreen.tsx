import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';

type MoreNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
}

export default function MoreScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<MoreNavigationProp>();

  const handleSignOut = () => {
    Alert.alert('Logga ut', 'Är du säker på att du vill logga ut?', [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Logga ut',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const accountMenuItems: MenuItem[] = [
    {
      icon: 'person-outline',
      title: 'Profil',
      subtitle: user?.email || '',
      onPress: () => navigation.navigate('Profile'),
    },
  ];

  const integrationMenuItems: MenuItem[] = [
    {
      icon: 'notifications-outline',
      title: 'Notifieringar',
      subtitle: 'Hantera påminnelser och meddelanden',
      onPress: () => navigation.navigate('NotificationSettings'),
    },
    {
      icon: 'calendar-outline',
      title: 'Kalendersynk',
      subtitle: 'Google Calendar & Outlook',
      onPress: () => navigation.navigate('CalendarSync'),
    },
    {
      icon: 'git-network-outline',
      title: 'Webhooks',
      subtitle: 'Integrationer med externa system',
      onPress: () => navigation.navigate('WebhookSettings'),
    },
  ];

  const appMenuItems: MenuItem[] = [
    {
      icon: 'information-circle-outline',
      title: 'Om appen',
      subtitle: 'Version 1.0.0',
      onPress: () => {
        Alert.alert(
          'HomeAuto',
          'Avtalshanteringssystem\nVersion 1.0.0\n\nUtvecklat för att förenkla hantering av dina avtal och prenumerationer.',
          [{ text: 'OK' }]
        );
      },
    },
    {
      icon: 'help-circle-outline',
      title: 'Hjälp & Support',
      subtitle: 'Få hjälp med appen',
      onPress: () => {
        Alert.alert(
          'Hjälp & Support',
          'För support, kontakta oss på support@homeauto.se',
          [{ text: 'OK' }]
        );
      },
    },
  ];

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.title}
      style={styles.menuItem}
      onPress={item.onPress}
    >
      <View style={[styles.iconContainer, item.color && { backgroundColor: item.color }]}>
        <Ionicons
          name={item.icon}
          size={24}
          color={item.color ? '#fff' : '#3b82f6'}
        />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        {item.subtitle && <Text style={styles.menuSubtitle}>{item.subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Konto</Text>
        {accountMenuItems.map(renderMenuItem)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Integrationer</Text>
        {integrationMenuItems.map(renderMenuItem)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        {appMenuItems.map(renderMenuItem)}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={styles.signOutText}>Logga ut</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>HomeAuto Mobile v1.0.0</Text>
        <Text style={styles.footerSubtext}>© 2025 HomeAuto. Alla rättigheter förbehållna.</Text>
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
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#d1d5db',
  },
});
