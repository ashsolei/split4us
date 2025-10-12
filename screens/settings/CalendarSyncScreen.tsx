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

export default function CalendarSyncScreen() {
  const handleConnectCalendar = (type: string) => {
    Alert.alert(
      `Anslut ${type}`,
      `Kalendersynkronisering med ${type} kommer snart. Du kommer kunna:\n\n• Synkronisera avtalsutgångsdatum\n• Skapa automatiska påminnelser\n• Dela kalenderhändelser med teamet\n• Anpassa notifieringstider`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kalenderintegrationer</Text>
        <Text style={styles.sectionDescription}>
          Synkronisera dina avtal med din kalender för att aldrig missa viktiga datum
        </Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => handleConnectCalendar('Google Calendar')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="logo-google" size={24} color="#f59e0b" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Google Calendar</Text>
            <Text style={styles.cardSubtitle}>Inte ansluten</Text>
          </View>
          <TouchableOpacity style={styles.connectButton}>
            <Text style={styles.connectButtonText}>Anslut</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => handleConnectCalendar('Outlook Calendar')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#dbeafe' }]}>
            <Ionicons name="calendar" size={24} color="#3b82f6" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Outlook Calendar</Text>
            <Text style={styles.cardSubtitle}>Inte ansluten</Text>
          </View>
          <TouchableOpacity style={styles.connectButton}>
            <Text style={styles.connectButtonText}>Anslut</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Synkroniseringsinställningar</Text>

        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Synkronisera utgångsdatum</Text>
            <View style={styles.toggleOff}>
              <Text style={styles.toggleText}>Av</Text>
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Synkronisera påminnelser</Text>
            <View style={styles.toggleOff}>
              <Text style={styles.toggleText}>Av</Text>
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Automatisk synkronisering</Text>
            <View style={styles.toggleOff}>
              <Text style={styles.toggleText}>Av</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={24} color="#3b82f6" />
        <View style={styles.infoBoxContent}>
          <Text style={styles.infoBoxTitle}>Om kalendersynk</Text>
          <Text style={styles.infoBoxText}>
            När du ansluter en kalender kommer avtalsrelaterade händelser automatiskt 
            skapas som kalenderhändelser. Du kan välja vilka typer av händelser som 
            ska synkroniseras.
          </Text>
        </View>
      </View>

      <View style={styles.featureList}>
        <Text style={styles.featureListTitle}>Vad synkroniseras?</Text>
        
        <View style={styles.featureItem}>
          <Ionicons name="calendar-outline" size={20} color="#6b7280" />
          <Text style={styles.featureText}>Avtals utgångsdatum</Text>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="alarm-outline" size={20} color="#6b7280" />
          <Text style={styles.featureText}>Påminnelser innan utgång</Text>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="repeat-outline" size={20} color="#6b7280" />
          <Text style={styles.featureText}>Förnyelsedatum</Text>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="time-outline" size={20} color="#6b7280" />
          <Text style={styles.featureText}>Uppsägningsdeadlines</Text>
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  card: {
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
  },
  connectButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  settingCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLabel: {
    fontSize: 15,
    color: '#374151',
  },
  toggleOff: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  toggleText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
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
    color: '#1e40af',
    marginBottom: 4,
  },
  infoBoxText: {
    fontSize: 14,
    color: '#1e3a8a',
    lineHeight: 20,
  },
  featureList: {
    padding: 16,
  },
  featureListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#374151',
  },
});
