import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { EscrowPayment } from '../components/EscrowPayment';

export default function EscrowScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // TODO: заменить на выбор эскроу из списка задач/платежей
  const escrowId = 1;

  useEffect(() => {
    SecureStore.getItemAsync('authToken').then(t => {
      setToken(t);
      setLoading(false);
    });
  }, []);

  return (
    <GradientBackground>
      <View glass style={{ marginTop: 64, padding: 32, borderRadius: 24, minWidth: 320, alignItems: 'center' }}>
        <Text style={{ fontSize: 28, fontFamily: 'SpaceGrotesk_700Bold', marginBottom: 24 }} accentColor="cyan">Эскроу</Text>
        {loading ? <ActivityIndicator color="#00e1ff" /> : token ? <EscrowPayment token={token} escrowId={escrowId} /> : <Text>Нет токена</Text>}
      </View>
    </GradientBackground>
  );
} 