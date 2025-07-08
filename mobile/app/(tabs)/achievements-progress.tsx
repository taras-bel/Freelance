import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, Alert, ScrollView, View as RNView, RefreshControl } from 'react-native';
import GradientBackground from '@/components/GradientBackground';
import { Text, View } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';
import { getAchievements } from '../api';
import EmptyOrError from '@/components/EmptyOrError';

export default function AchievementsProgressScreen() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [level, setLevel] = useState<number | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Нет токена');
      const data = await getAchievements(token);
      setAchievements(data.achievements || []);
      setLevel(data.level || null);
      setProgress(data.progress || null);
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки достижений');
    } finally {
      setLoading(false);
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
          <Text style={styles.title} accentColor="violet">Прогресс по достижениям</Text>
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
          ) : achievements.length === 0 ? (
            <EmptyOrError
              icon="trophy-outline"
              title="Нет достижений"
              description="Выполняйте задачи, чтобы получать достижения!"
              accent="teal"
            />
          ) : (
            <>
              <RNView style={styles.levelRow}>
                <Text style={styles.levelLabel}>Уровень:</Text>
                <Text style={styles.levelValue}>{level ?? '-'}</Text>
              </RNView>
              <RNView style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress ?? 0}%` }]} />
              </RNView>
              <Text style={styles.progressText}>Прогресс: {progress ?? 0}%</Text>
              <Text style={styles.achTitle} accentColor="teal">Достижения</Text>
              {achievements.map((ach, i) => (
                <View key={ach.id || i} style={[styles.achCard, ach.completed && styles.achCompleted]} glass>
                  <Text style={styles.achName} accentColor={ach.completed ? 'teal' : 'cyan'}>{ach.name}</Text>
                  <Text style={styles.achDesc}>{ach.description}</Text>
                  <Text style={styles.achStatus}>{ach.completed ? 'Выполнено' : 'Не выполнено'}</Text>
                </View>
              ))}
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
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#b0b8d1',
    marginRight: 8,
  },
  levelValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#00e1ff',
  },
  progressBarBg: {
    width: 220,
    height: 12,
    backgroundColor: 'rgba(0,225,255,0.08)',
    borderRadius: 8,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 12,
    backgroundColor: '#00e1ff',
    borderRadius: 8,
  },
  progressText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#b0b8d1',
    marginBottom: 16,
  },
  achTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  achCard: {
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
  achCompleted: {
    backgroundColor: 'rgba(0,225,255,0.18)',
  },
  achName: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  achDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#b0b8d1',
    marginBottom: 4,
  },
  achStatus: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#00e1ff',
    textAlign: 'right',
  },
}); 