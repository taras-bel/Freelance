import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, Linking } from 'react-native';
import { fundEscrowStripe, fundEscrowPayPal, fundEscrowQiwi, releaseEscrow, getEscrowStatus } from '../api';

export const EscrowPayment = ({ token, escrowId }: { token: string, escrowId: number }) => {
  const [escrow, setEscrow] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await getEscrowStatus(token, escrowId);
      setEscrow(data);
    } catch {
      setEscrow(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStripe = async () => {
    setLoading(true);
    try {
      const { client_secret } = await fundEscrowStripe(token, escrowId);
      Alert.alert('Stripe', 'Откройте Stripe Checkout в браузере');
      // Обычно здесь открывается Stripe SDK/Checkout, для MVP — просто alert
    } catch {
      Alert.alert('Ошибка', 'Не удалось создать Stripe платеж');
    } finally {
      setLoading(false);
    }
  };

  const handlePayPal = async () => {
    setLoading(true);
    try {
      const { payment_url } = await fundEscrowPayPal(token, escrowId);
      Linking.openURL(payment_url);
    } catch {
      Alert.alert('Ошибка', 'Не удалось создать PayPal платеж');
    } finally {
      setLoading(false);
    }
  };

  const handleQiwi = async () => {
    setLoading(true);
    try {
      const { payment_url } = await fundEscrowQiwi(token, escrowId);
      Linking.openURL(payment_url);
    } catch {
      Alert.alert('Ошибка', 'Не удалось создать Qiwi платеж');
    } finally {
      setLoading(false);
    }
  };

  const handleRelease = async () => {
    setLoading(true);
    try {
      await releaseEscrow(token, escrowId);
      Alert.alert('Escrow', 'Средства успешно переведены исполнителю!');
      fetchStatus();
    } catch {
      Alert.alert('Ошибка', 'Не удалось перевести средства');
    } finally {
      setLoading(false);
    }
  };

  if (!escrow) return <ActivityIndicator style={{ marginTop: 32 }} />;

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Эскроу-платёж</Text>
      <Text>Сумма: {escrow.amount} {escrow.currency || 'USD'}</Text>
      <Text>Статус: {escrow.status}</Text>
      <View style={{ marginVertical: 16 }}>
        <Button title="Пополнить через Stripe" onPress={handleStripe} disabled={loading || escrow.status !== 'pending'} />
        <View style={{ height: 8 }} />
        <Button title="Пополнить через PayPal" onPress={handlePayPal} disabled={loading || escrow.status !== 'pending'} />
        <View style={{ height: 8 }} />
        <Button title="Пополнить через Qiwi" onPress={handleQiwi} disabled={loading || escrow.status !== 'pending'} />
      </View>
      <Button title="Релиз средств исполнителю" onPress={handleRelease} color="#43a047" disabled={loading || escrow.status !== 'funded'} />
      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
    </View>
  );
}; 