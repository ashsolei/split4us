import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { CameraReceiptCapture } from './CameraReceiptCapture';

interface ReceiptData {
  total?: number;
  currency?: string;
  merchant?: string;
  date?: string;
  items?: Array<{ name: string; price: number }>;
}

interface ReceiptScannerProps {
  onScanComplete: (data: ReceiptData) => void;
  onClose: () => void;
}

export const ReceiptScanner: React.FC<ReceiptScannerProps> = ({
  onScanComplete,
  onClose,
}) => {
  const [showCamera, setShowCamera] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedData, setScannedData] = useState<ReceiptData | null>(null);

  const handleCapture = async (imageUri: string) => {
    setCapturedImage(imageUri);
    setShowCamera(false);
    setIsProcessing(true);

    try {
      // Here you would call your OCR API
      // For now, we'll simulate the process
      const mockData: ReceiptData = await simulateOCR(imageUri);
      setScannedData(mockData);
    } catch (error) {
      Alert.alert('Error', 'Failed to scan receipt');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulate OCR processing
  const simulateOCR = (imageUri: string): Promise<ReceiptData> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          total: 289.50,
          currency: 'SEK',
          merchant: 'ICA Maxi',
          date: new Date().toISOString().split('T')[0],
          items: [
            { name: 'Milk', price: 15.90 },
            { name: 'Bread', price: 25.00 },
            { name: 'Cheese', price: 89.00 },
            { name: 'Coffee', price: 68.50 },
            { name: 'Fruits', price: 91.10 },
          ],
        });
      }, 2000);
    });
  };

  const handleConfirm = () => {
    if (scannedData) {
      onScanComplete(scannedData);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setScannedData(null);
    setShowCamera(true);
  };

  if (showCamera) {
    return (
      <CameraReceiptCapture
        onCapture={handleCapture}
        onClose={onClose}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.title}>📄 Receipt Scanner</Text>

        {/* Captured Image Preview */}
        {capturedImage && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: capturedImage }} style={styles.image} />
          </View>
        )}

        {/* Processing State */}
        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.processingText}>
              Scanning receipt with AI...
            </Text>
          </View>
        )}

        {/* Scanned Data */}
        {scannedData && !isProcessing && (
          <View style={styles.dataContainer}>
            <Text style={styles.dataTitle}>✓ Scanned Successfully</Text>

            <View style={styles.dataCard}>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Merchant:</Text>
                <Text style={styles.dataValue}>{scannedData.merchant}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Date:</Text>
                <Text style={styles.dataValue}>{scannedData.date}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Total:</Text>
                <Text style={styles.totalValue}>
                  {scannedData.total} {scannedData.currency}
                </Text>
              </View>
            </View>

            {scannedData.items && scannedData.items.length > 0 && (
              <View style={styles.itemsContainer}>
                <Text style={styles.itemsTitle}>Items Detected:</Text>
                {scannedData.items.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>
                      {item.price} {scannedData.currency}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          {scannedData && !isProcessing && (
            <>
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={handleRetake}
              >
                <Text style={styles.retakeButtonText}>🔄 Retake</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>✓ Use Data</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
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
    marginBottom: 20,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#f3f4f6',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  processingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  dataContainer: {
    marginBottom: 20,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10b981',
    textAlign: 'center',
    marginBottom: 16,
  },
  dataCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dataLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  dataValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  itemsContainer: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  itemName: {
    fontSize: 14,
    color: '#374151',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  retakeButton: {
    flex: 1,
    backgroundColor: '#6b7280',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
