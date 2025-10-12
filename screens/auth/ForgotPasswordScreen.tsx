import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types/navigation';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Fel', 'Vänligen ange din e-postadress');
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      Alert.alert('Fel', error.message);
    } else {
      Alert.alert(
        'E-post skickad',
        'Kontrollera din e-post för instruktioner om hur du återställer ditt lösenord',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Återställ lösenord</Text>
        <Text style={styles.subtitle}>
          Ange din e-postadress så skickar vi instruktioner för att återställa ditt lösenord
        </Text>

        <TextInput
          style={styles.input}
          placeholder="E-post"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Skicka återställningslänk</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>Tillbaka till inloggning</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#3b82f6',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: '#3b82f6',
    fontSize: 14,
  },
});
