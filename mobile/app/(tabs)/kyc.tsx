import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { KYCUpload } from '../components/KYCUpload';

export default function KYCScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync('authToken').then(t => {
      setToken(t);
      setLoading(false);
    });
  }, []);

  return (
    <GradientBackground>
      <View glass style={{ marginTop: 64, padding: 32, borderRadius: 24, minWidth: 320, alignItems: 'center' }}>
        <Text style={{ fontSize: 28, fontFamily: 'SpaceGrotesk_700Bold', marginBottom: 24 }} accentColor="teal">KYC</Text>
        {loading ? <ActivityIndicator color="#00e1ff" /> : token ? <KYCUpload token={token} /> : <Text>Нет токена</Text>}
      </View>
    </GradientBackground>
  );
} 