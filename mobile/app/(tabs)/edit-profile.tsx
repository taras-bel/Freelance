import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, Pressable, ActivityIndicator, Alert, Image } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { getProfile, updateProfile } from '../api';

export default function EditProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        if (!token) throw new Error('Нет токена');
        const data = await getProfile(token);
        setProfile(data);
        setName(data.name || '');
        setEmail(data.email || '');
        setAvatar(data.avatar_url || '');
      } catch (e: any) {
        Alert.alert('Ошибка', e.message || 'Ошибка загрузки профиля');
        router.replace('/(tabs)/auth');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      await updateProfile(token, { name, email, avatar_url: avatar });
      Alert.alert('Успех', 'Профиль обновлён');
      router.replace('/(tabs)/profile');
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <GradientBackground>
      <View style={styles.outer}>
        <View glass style={styles.glassPanel}>
          <Text style={styles.title} accentColor="violet">Редактировать профиль</Text>
          {loading ? (
            <ActivityIndicator color="#00e1ff" />
          ) : (
            <>
              {avatar ? <Image source={{ uri: avatar }} style={styles.avatar} /> : null}
              <TextInput
                style={styles.input}
                placeholder="Имя"
                placeholderTextColor="#b0b8d1"
                value={name}
                onChangeText={setName}
              />
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
                placeholder="URL аватара"
                placeholderTextColor="#b0b8d1"
                value={avatar}
                onChangeText={setAvatar}
              />
              <Pressable style={styles.button} onPress={handleSave} disabled={saving}>
                <Text style={styles.buttonText} accentColor="cyan">Сохранить</Text>
              </Pressable>
              {saving && <ActivityIndicator style={{ marginTop: 16 }} color="#00e1ff" />}
            </>
          )}
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    backgroundColor: '#b0b8d1',
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
  button: {
    backgroundColor: 'rgba(0,225,255,0.12)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#00e1ff',
  },
  buttonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
}); 