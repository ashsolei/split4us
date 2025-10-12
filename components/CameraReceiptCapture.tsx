import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

interface CameraReceiptCaptureProps {
  onCapture: (imageUri: string) => void;
  onClose: () => void;
}

export const CameraReceiptCapture: React.FC<CameraReceiptCaptureProps> = ({
  onCapture,
  onClose,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<Camera>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      setIsProcessing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
          exif: false,
        });
        setCapturedImage(photo.uri);
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
        console.error(error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const retake = () => {
    setCapturedImage(null);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>📷 No access to camera</Text>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Choose from Library</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedImage }} style={styles.preview} />
        
        <View style={styles.previewControls}>
          <TouchableOpacity style={styles.retakeButton} onPress={retake}>
            <Text style={styles.retakeButtonText}>🔄 Retake</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.confirmButton} onPress={confirmCapture}>
            <Text style={styles.confirmButtonText}>✓ Use Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Scan Receipt</Text>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={() => {
                setType(
                  type === CameraType.back ? CameraType.front : CameraType.back
                );
              }}
            >
              <Text style={styles.flipButtonText}>🔄</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.guidebox}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            <Text style={styles.guideText}>
              Position receipt within frame
            </Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
              <Text style={styles.galleryButtonText}>📁</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>

            <View style={styles.placeholder} />
          </View>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  flipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButtonText: {
    fontSize: 20,
  },
  guidebox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 40,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#fff',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  guideText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButtonText: {
    fontSize: 24,
  },
  placeholder: {
    width: 50,
  },
  preview: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  retakeButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    backgroundColor: '#6b7280',
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    backgroundColor: '#10b981',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
