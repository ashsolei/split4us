import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  company: string;
  phone: string;
  created_at: string;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
        setCompany(data.company || '');
        setPhone(data.phone || '');
      } else {
        // Create profile if doesn't exist
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user?.id,
            email: user?.email,
            full_name: '',
            company: '',
            phone: '',
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setProfile(newProfile);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          company: company,
          phone: phone,
        })
        .eq('id', user?.id);

      if (error) throw error;

      Alert.alert('Klart', 'Profilen har uppdaterats');
      loadProfile();
    } catch (error: any) {
      Alert.alert('Fel', 'Kunde inte uppdatera profilen');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Återställ lösenord',
      'Vi skickar en återställningslänk till din e-post',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Skicka',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.resetPasswordForEmail(
                user?.email || ''
              );
              if (error) throw error;
              Alert.alert('Klart', 'Kontrollera din e-post för återställningslänk');
            } catch (error: any) {
              Alert.alert('Fel', error.message);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Ta bort konto',
      'Är du säker på att du vill ta bort ditt konto? Detta kan inte ångras och all din data kommer att raderas permanent.',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Bekräfta',
              'Skriv "RADERA" för att bekräfta kontoborttagning',
              [
                { text: 'Avbryt', style: 'cancel' },
                {
                  text: 'Fortsätt',
                  style: 'destructive',
                  onPress: async () => {
                    // This would need backend implementation
                    Alert.alert(
                      'Information',
                      'Kontakta support för att ta bort ditt konto'
                    );
                  },
                },
              ]
            );
          },
        },
      ]
    );
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
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color="#3b82f6" />
        </View>
        <Text style={styles.email}>{user?.email}</Text>
        {profile?.created_at && (
          <Text style={styles.memberSince}>
            Medlem sedan {new Date(profile.created_at).toLocaleDateString('sv-SE')}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profilinformation</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fullständigt namn</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Ditt namn"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Företag</Text>
          <TextInput
            style={styles.input}
            value={company}
            onChangeText={setCompany}
            placeholder="Företagsnamn (valfritt)"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Telefon</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Telefonnummer"
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Spara ändringar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Säkerhet</Text>

        <TouchableOpacity style={styles.actionRow} onPress={handleChangePassword}>
          <View style={styles.actionIcon}>
            <Ionicons name="key-outline" size={20} color="#3b82f6" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Ändra lösenord</Text>
            <Text style={styles.actionSubtitle}>Skicka återställningslänk till e-post</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistik</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Aktiva avtal</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>0 kr</Text>
            <Text style={styles.statLabel}>Total månadskostnad</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>Farlig zon</Text>

        <TouchableOpacity
          style={[styles.actionRow, styles.dangerRow]}
          onPress={handleDeleteAccount}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#fee2e2' }]}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: '#ef4444' }]}>
              Ta bort konto
            </Text>
            <Text style={styles.actionSubtitle}>
              Radera permanent ditt konto och all data
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Konto-ID: {user?.id?.slice(0, 8)}...</Text>
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
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: '#6b7280',
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
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionRow: {
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
  dangerRow: {
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    padding: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
