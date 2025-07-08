import React, { useState } from 'react';
import { StyleSheet, Alert, Switch, TouchableOpacity } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { useColorScheme } from 'react-native';

export default function SettingsScreen() {
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [notifications, setNotifications] = useState(true);

  const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
    setTheme(value);
    // TODO: интеграция с контекстом темы
    Alert.alert('Тема', `Выбрана тема: ${value}`);
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('authToken');
    Alert.alert('Выход', 'Вы вышли из аккаунта.');
    // TODO: навигация на экран входа
  };

  return (
    <GradientBackground>
      <View glass style={styles.glassPanel}>
        <Text style={styles.title} accentColor="violet">Настройки</Text>
        <Text style={styles.sectionTitle} accentColor="teal">Тема</Text>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => handleThemeChange('light')} style={[styles.themeBtn, theme === 'light' && styles.themeBtnActive]}>
            <Text style={styles.themeBtnText}>Светлая</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleThemeChange('dark')} style={[styles.themeBtn, theme === 'dark' && styles.themeBtnActive]}>
            <Text style={styles.themeBtnText}>Тёмная</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleThemeChange('system')} style={[styles.themeBtn, theme === 'system' && styles.themeBtnActive]}>
            <Text style={styles.themeBtnText}>Системная</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle} accentColor="teal">Уведомления</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Push-уведомления</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            thumbColor={notifications ? '#00e1ff' : '#b0b8d1'}
            trackColor={{ true: '#00e1ff', false: '#b0b8d1' }}
          />
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Выйти из аккаунта</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => (window as any).router?.push('/twofa')}>
          <Text style={styles.actionBtnText}>Управление 2FA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => (window as any).router?.push('/kyc')}>
          <Text style={styles.actionBtnText}>Верификация KYC</Text>
        </TouchableOpacity>
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
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  themeBtn: {
    backgroundColor: 'rgba(0,225,255,0.08)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginHorizontal: 4,
  },
  themeBtnActive: {
    backgroundColor: '#00e1ff',
  },
  themeBtnText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#fff',
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#b0b8d1',
    marginRight: 12,
  },
  logoutBtn: {
    backgroundColor: '#a259ff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 32,
    shadowColor: '#a259ff',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  logoutBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  actionBtn: {
    backgroundColor: '#a259ff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 16,
    shadowColor: '#a259ff',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  actionBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
}); 