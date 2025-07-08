import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, Alert, TextInput, TouchableOpacity, Image } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { getProfile, updateProfile } from '../api';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      await updateProfile(token, { name, email, avatar_url: avatar });
      setEditing(false);
      fetchData();
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Ошибка сохранения профиля');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <GradientBackground>
      <View glass style={styles.glassPanel}>
        <Text style={styles.title} accentColor="violet">Профиль</Text>
        {loading ? (
          <ActivityIndicator color="#00e1ff" />
        ) : (
          <>
            <View style={styles.avatarWrap}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder} />
              )}
            </View>
            {editing ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Имя"
                  placeholderTextColor="#b0b8d1"
                  value={name}
                  onChangeText={setName}
                  editable={!saving}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#b0b8d1"
                  value={email}
                  onChangeText={setEmail}
                  editable={!saving}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.input}
                  placeholder="URL аватара"
                  placeholderTextColor="#b0b8d1"
                  value={avatar}
                  onChangeText={setAvatar}
                  editable={!saving}
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                  <Text style={styles.saveBtnText}>{saving ? 'Сохранение...' : 'Сохранить'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)} disabled={saving}>
                  <Text style={styles.cancelBtnText}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.editBtn} onPress={() => (window as any).router?.push('/twofa')}>
                  <Text style={styles.editBtnText}>Управление 2FA</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.editBtn} onPress={() => (window as any).router?.push('/kyc')}>
                  <Text style={styles.editBtnText}>Верификация KYC</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.label}>Имя:</Text>
                <Text style={styles.value}>{profile?.name || '-'}</Text>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{profile?.email || '-'}</Text>
                <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
                  <Text style={styles.editBtnText}>Редактировать</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  glassPanel: {
    marginTop: 64,
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
  avatarWrap: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#222',
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,225,255,0.08)',
    marginBottom: 8,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#b0b8d1',
    marginTop: 8,
  },
  value: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 17,
    color: '#fff',
    marginBottom: 4,
  },
  input: {
    width: 220,
    backgroundColor: 'rgba(0,225,255,0.08)',
    borderRadius: 12,
    padding: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#fff',
    marginBottom: 8,
  },
  editBtn: {
    backgroundColor: '#00e1ff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginTop: 16,
    shadowColor: '#00e1ff',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  editBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#181820',
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: '#00e1ff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginTop: 8,
    shadowColor: '#00e1ff',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  saveBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#181820',
    textAlign: 'center',
  },
  cancelBtn: {
    backgroundColor: '#a259ff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginTop: 8,
    shadowColor: '#a259ff',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cancelBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
}); 