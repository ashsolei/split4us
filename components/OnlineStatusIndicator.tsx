import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NetworkStatus } from '../lib/offline-support';

export const OnlineStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const wasOffline = useRef(false);

  useEffect(() => {
    NetworkStatus.isOnline().then((online) => {
      setIsOnline(online);
      if (!online) {
        wasOffline.current = true;
        setShowBanner(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    });

    const unsubscribe = NetworkStatus.subscribe((online) => {
      setIsOnline(online);

      if (!online) {
        // Going offline
        wasOffline.current = true;
        setShowBanner(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else if (wasOffline.current) {
        // Coming back online - show briefly then fade
        setShowBanner(true);
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(3000),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowBanner(false);
          wasOffline.current = false;
        });
      }
    });

    return unsubscribe;
  }, []);

  if (!showBanner) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          backgroundColor: isOnline ? '#10b981' : '#ef4444',
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{isOnline ? '✓' : '⚠️'}</Text>
        <Text style={styles.text}>
          {isOnline ? 'Back online' : 'Offline - Changes will sync when reconnected'}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  text: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
