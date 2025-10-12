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

export default function WebhookSettingsScreen() {
  const handleConfigureWebhook = (type: string) => {
    Alert.alert(
      'Konfigurera Webhook',
      `Webhook-konfiguration för ${type} kommer snart. Du kommer kunna:\n\n• Skapa nya webhooks\n• Hantera befintliga webhooks\n• Testa webhook-leverans\n• Visa webhook-historik`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Utgående Webhooks</Text>
        <Text style={styles.sectionDescription}>
          Skicka händelser till externa system när något händer med dina avtal
        </Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => handleConfigureWebhook('Utgående')}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="arrow-forward-circle" size={24} color="#3b82f6" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Konfigurera utgående webhooks</Text>
            <Text style={styles.cardSubtitle}>
              7 händelsetyper tillgängliga
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Inkommande Webhooks</Text>
        <Text style={styles.sectionDescription}>
          Ta emot data från externa system för att automatiskt uppdatera avtal
        </Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => handleConfigureWebhook('Inkommande')}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="arrow-back-circle" size={24} color="#10b981" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Konfigurera inkommande webhooks</Text>
            <Text style={styles.cardSubtitle}>
              6 åtgärdstyper tillgängliga
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="shield-checkmark" size={24} color="#10b981" />
        <View style={styles.infoBoxContent}>
          <Text style={styles.infoBoxTitle}>Säkerhet</Text>
          <Text style={styles.infoBoxText}>
            Alla webhooks använder HMAC-signaturverifiering för att säkerställa
            att data kommer från betrodda källor.
          </Text>
        </View>
      </View>

      <View style={styles.featureList}>
        <Text style={styles.featureListTitle}>Webhook-funktioner</Text>
        
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text style={styles.featureText}>Automatisk retry vid misslyckade leveranser</Text>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text style={styles.featureText}>Full händelseloggning och historik</Text>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text style={styles.featureText}>Anpassningsbara fältmappningar</Text>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          <Text style={styles.featureText}>HMAC-säkerhet</Text>
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
    color: '#6b7280',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
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
    color: '#059669',
    marginBottom: 4,
  },
  infoBoxText: {
    fontSize: 14,
    color: '#047857',
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
