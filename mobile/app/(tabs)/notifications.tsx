import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity, Switch, RefreshControl } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { getNotifications, markNotificationRead, setNotificationSettings } from '../api';
import EmptyOrError from '@/components/EmptyOrError';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>({ email: true, push: true });
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      const data = await getNotifications(token);
      setNotifications(data.notifications || []);
      setSettings(data.settings || { email: true, push: true });
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки уведомлений');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string | number) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      await markNotificationRead(token, id);
      setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Ошибка отметки уведомления');
    }
  };

  const handleSettingChange = async (key: string, value: boolean) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
    setSaving(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      await setNotificationSettings(token, { ...settings, [key]: value });
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Ошибка сохранения настроек');
    } finally {
      setSaving(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={styles.outer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#00e1ff", "#a259ff"]}
            tintColor="#00e1ff"
          />
        }
      >
        <View glass style={styles.glassPanel}>
          <Text style={styles.title} accentColor="violet">Уведомления</Text>
          {loading ? (
            <ActivityIndicator color="#00e1ff" />
          ) : error ? (
            <EmptyOrError
              icon="alert-circle-outline"
              title="Ошибка"
              description={error}
              actionText="Повторить"
              onAction={fetchData}
              accent="violet"
            />
          ) : notifications.length === 0 ? (
            <EmptyOrError
              icon="notifications-outline"
              title="Нет уведомлений"
              description="Пока нет новых уведомлений."
              accent="teal"
            />
          ) : (
            <>
              {notifications.map((n, i) => (
                <TouchableOpacity key={n.id || i} style={[styles.notifCard, n.read && styles.notifRead]} onPress={() => !n.read && handleMarkRead(n.id)}>
                  <Text style={styles.notifTitle} accentColor={n.read ? undefined : 'teal'}>{n.title}</Text>
                  <Text style={styles.notifText}>{n.body}</Text>
                  <Text style={styles.notifDate}>{n.date || n.created_at}</Text>
                  {!n.read && <Text style={styles.markRead}>Отметить как прочитано</Text>}
                </TouchableOpacity>
              ))}
              <Text style={styles.sectionTitle} accentColor="teal">Настройки уведомлений</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Email</Text>
                <Switch
                  value={settings.email}
                  onValueChange={v => handleSettingChange('email', v)}
                  thumbColor={settings.email ? '#00e1ff' : '#b0b8d1'}
                  trackColor={{ true: '#00e1ff', false: '#b0b8d1' }}
                  disabled={saving}
                />
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Push</Text>
                <Switch
                  value={settings.push}
                  onValueChange={v => handleSettingChange('push', v)}
                  thumbColor={settings.push ? '#00e1ff' : '#b0b8d1'}
                  trackColor={{ true: '#00e1ff', false: '#b0b8d1' }}
                  disabled={saving}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  outer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181820',
    paddingVertical: 32,
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
    marginBottom: 16,
  },
  empty: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#b0b8d1',
    marginTop: 16,
  },
  notifCard: {
    width: 260,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#00e1ff',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  notifRead: {
    backgroundColor: 'rgba(0,225,255,0.08)',
    opacity: 0.7,
  },
  notifTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  notifText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#b0b8d1',
    marginBottom: 4,
  },
  notifDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#b0b8d1',
    textAlign: 'right',
  },
  markRead: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#00e1ff',
    marginTop: 4,
    textAlign: 'right',
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
    marginBottom: 12,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#b0b8d1',
    marginRight: 12,
  },
}); 