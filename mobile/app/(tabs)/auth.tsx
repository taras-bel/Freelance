import React, { useState } from 'react';
import { StyleSheet, TextInput, Pressable, View as RNView, ActivityIndicator, Alert } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import * as AuthSession from 'expo-auth-session';
import { useRouter } from 'expo-router';
import { login, register, oauth } from '../api';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await login(email, password);
      await SecureStore.setItemAsync('authToken', res.access_token);
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await register(email, password);
      await SecureStore.setItemAsync('authToken', res.access_token);
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  // OAuth через Google
  const handleGoogle = async () => {
    setLoading(true);
    try {
      // TODO: замените clientId на ваш
      const redirectUri = AuthSession.makeRedirectUri();
      const result = await AuthSession.startAsync({
        authUrl: `https://accounts.google.com/o/oauth2/v2/auth?client_id=GOOGLE_CLIENT_ID&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=profile email`,
      });
      if (result.type === 'success' && result.params.access_token) {
        const res = await oauth('google', result.params.access_token);
        await SecureStore.setItemAsync('authToken', res.access_token);
        router.replace('/');
      }
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Ошибка Google OAuth');
    } finally {
      setLoading(false);
    }
  };

  // OAuth через GitHub
  const handleGitHub = async () => {
    setLoading(true);
    try {
      // TODO: замените clientId на ваш
      const redirectUri = AuthSession.makeRedirectUri();
      const result = await AuthSession.startAsync({
        authUrl: `https://github.com/login/oauth/authorize?client_id=GITHUB_CLIENT_ID&scope=user:email&redirect_uri=${encodeURIComponent(redirectUri)}`,
      });
      if (result.type === 'success' && result.params.access_token) {
        const res = await oauth('github', result.params.access_token);
        await SecureStore.setItemAsync('authToken', res.access_token);
        router.replace('/');
      }
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Ошибка GitHub OAuth');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <View style={styles.outer}>
        <View glass style={styles.glassPanel}>
          <Text style={styles.title} accentColor="violet">
            Вход / Регистрация
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#b0b8d1"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Пароль"
            placeholderTextColor="#b0b8d1"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <RNView style={styles.buttonRow}>
            <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
              <Text style={styles.buttonText} accentColor="cyan">Войти</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={handleRegister} disabled={loading}>
              <Text style={styles.buttonText} accentColor="teal">Регистрация</Text>
            </Pressable>
          </RNView>
          <Text style={styles.or}>или</Text>
          <Pressable style={styles.oauthButton} onPress={handleGoogle} disabled={loading}>
            <Text style={styles.oauthText} accentColor="violet">Войти через Google</Text>
          </Pressable>
          <Pressable style={styles.oauthButton} onPress={handleGitHub} disabled={loading}>
            <Text style={styles.oauthText} accentColor="violet">Войти через GitHub</Text>
          </Pressable>
          {loading && <ActivityIndicator style={{ marginTop: 16 }} color="#00e1ff" />}
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181820',
  },
  glassPanel: {
    padding: 32,
    minWidth: 320,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#a259ff',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  title: {
    fontSize: 28,
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 24,
  },
  input: {
    width: 240,
    padding: 12,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: '#181820',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#b0b8d1',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: 'rgba(0,225,255,0.12)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#00e1ff',
  },
  buttonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  or: {
    marginVertical: 8,
    fontFamily: 'Inter_400Regular',
    color: '#b0b8d1',
  },
  oauthButton: {
    backgroundColor: 'rgba(162,89,255,0.10)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#a259ff',
  },
  oauthText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
}); 