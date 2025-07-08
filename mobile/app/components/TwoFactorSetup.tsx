import React, { useState } from 'react';
import { View, Text, Button, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { setup2FA, enable2FA, disable2FA } from '../api';

export const TwoFactorSetup = ({ token }: { token: string }) => {
  const [qr, setQr] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const blob = await setup2FA(token);
      const url = URL.createObjectURL(blob);
      setQr(url);
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось сгенерировать QR-код');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    setLoading(true);
    try {
      await enable2FA(token, code);
      setEnabled(true);
      Alert.alert('2FA', 'Двухфакторная аутентификация включена!');
    } catch (e) {
      Alert.alert('Ошибка', 'Неверный код 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      await disable2FA(token);
      setEnabled(false);
      setQr(null);
      setCode('');
      Alert.alert('2FA', '2FA отключена');
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось отключить 2FA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>Двухфакторная аутентификация</Text>
      {!qr && !enabled && (
        <Button title="Сгенерировать QR для 2FA" onPress={handleSetup} disabled={loading} />
      )}
      {qr && !enabled && (
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
          <Image source={{ uri: qr }} style={{ width: 200, height: 200 }} />
          <Text style={{ marginTop: 8 }}>Отсканируйте QR-код в Google Authenticator или 1Password</Text>
          <TextInput
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginTop: 16, padding: 8 }}
            placeholder="Введите код из приложения"
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
          />
          <Button title="Включить 2FA" onPress={handleEnable} disabled={loading || !code} />
        </View>
      )}
      {enabled && (
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
          <Text style={{ color: 'green', fontWeight: 'bold', marginBottom: 8 }}>2FA включена</Text>
          <Button title="Отключить 2FA" onPress={handleDisable} color="#e53935" disabled={loading} />
        </View>
      )}
      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
    </View>
  );
}; 