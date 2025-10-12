import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Speech from 'expo-speech';
// import Voice from '@react-native-voice/voice'; // Requires native modules

interface VoiceExpenseInputProps {
  onVoiceInput: (text: string) => void;
  onClose: () => void;
}

export const VoiceExpenseInput: React.FC<VoiceExpenseInputProps> = ({
  onVoiceInput,
  onClose,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulated voice input (replace with actual voice recognition)
  const startListening = async () => {
    setIsListening(true);
    
    // Play a sound to indicate listening
    Speech.speak('Listening for expense', { language: 'en' });

    // Simulate listening for 3 seconds
    setTimeout(() => {
      // Simulated transcription
      const simulatedTranscript = 'Lunch at restaurant 250 kronor';
      setTranscribedText(simulatedTranscript);
      setIsListening(false);
      
      Speech.speak('Processing expense', { language: 'en' });
      processTranscript(simulatedTranscript);
    }, 3000);
  };

  const processTranscript = async (text: string) => {
    setIsProcessing(true);
    
    try {
      // Here you would call your AI API to parse the voice input
      // For now, we'll just pass the raw text
      setTimeout(() => {
        onVoiceInput(text);
        setIsProcessing(false);
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to process voice input');
      setIsProcessing(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    Speech.stop();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.title}>🎤 Voice Expense Input</Text>
        <Text style={styles.subtitle}>
          Say something like: "Lunch at restaurant 250 kronor"
        </Text>

        {/* Listening Animation */}
        <View style={styles.micContainer}>
          {isListening ? (
            <View style={styles.listeningAnimation}>
              <View style={[styles.wave, styles.wave1]} />
              <View style={[styles.wave, styles.wave2]} />
              <View style={[styles.wave, styles.wave3]} />
            </View>
          ) : (
            <View style={styles.micIcon}>
              <Text style={styles.micEmoji}>🎤</Text>
            </View>
          )}
        </View>

        {/* Status Text */}
        {isListening && (
          <Text style={styles.statusText}>Listening...</Text>
        )}
        {isProcessing && (
          <Text style={styles.statusText}>Processing...</Text>
        )}
        {transcribedText && !isProcessing && (
          <View style={styles.transcriptContainer}>
            <Text style={styles.transcriptLabel}>Transcribed:</Text>
            <Text style={styles.transcriptText}>{transcribedText}</Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          {!isListening && !isProcessing && (
            <TouchableOpacity
              style={styles.startButton}
              onPress={startListening}
            >
              <Text style={styles.startButtonText}>Start Recording</Text>
            </TouchableOpacity>
          )}

          {isListening && (
            <TouchableOpacity
              style={styles.stopButton}
              onPress={stopListening}
            >
              <Text style={styles.stopButtonText}>Stop</Text>
            </TouchableOpacity>
          )}

          {isProcessing && (
            <ActivityIndicator size="large" color="#3b82f6" />
          )}
        </View>

        {/* Examples */}
        <View style={styles.examples}>
          <Text style={styles.examplesTitle}>Examples:</Text>
          <Text style={styles.exampleText}>
            • "Coffee at Starbucks 45 kronor"
          </Text>
          <Text style={styles.exampleText}>
            • "Taxi to airport 300 SEK"
          </Text>
          <Text style={styles.exampleText}>
            • "Dinner split equally 500 kronor"
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6b7280',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  micContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    marginBottom: 24,
  },
  micIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micEmoji: {
    fontSize: 50,
  },
  listeningAnimation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wave: {
    width: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  wave1: {
    height: 40,
  },
  wave2: {
    height: 60,
  },
  wave3: {
    height: 40,
  },
  statusText: {
    fontSize: 16,
    color: '#3b82f6',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  transcriptContainer: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  transcriptLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  transcriptText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  controls: {
    alignItems: 'center',
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  stopButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  examples: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
});
